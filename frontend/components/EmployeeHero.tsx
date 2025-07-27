import React, { useEffect, useMemo, useState } from 'react'
import { Spotlight } from './ui/Spotlight'
import { GridBackgroundDemo } from './ui/Grid'
import EmployeeCardDetails from './EmployeeCardDetails'
import Timeline from './ui/Timeline'
import { Employee } from '@/state/types'
import { fetchEmployeeIsVerified, fetchEmployeeMove } from '@/services/read-services'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { useToast } from '@/hooks/use-toast'
import { setRole } from '@/state/app'
import { useAppDispatch } from '@/state/hooks'
import { PAYOUT_RECEIVED } from '@/utils/graph-queries'
import { useQuery } from '@apollo/client'

const EmployeeHero = () => {
    const dispatch = useAppDispatch()
    const [employeeInfo, setEmployeeInfo] = useState<Employee | undefined>(undefined)
    const { account, wallets, disconnect } = useWallet()
    const {toast} = useToast()

    useEffect(() => {
        async function fetchData() {
            if (account) {
                try {
                    const isVerified= await fetchEmployeeIsVerified(account.address); 
                    fetchEmployeeMove(account.address).then((employee) => {
                        employee.verified=isVerified.verified as boolean;
                        setEmployeeInfo(employee)
                        console.log(employee)
                    })
                } catch (error) {
                    toast({
                        variant: "destructive",
                        title: "Employee Not Found",
                        description: "Your Address is not registered as an employee",
                        duration:3000
                    }) 
                    

                    const wallet = wallets?.[0];
                    if (wallet) {
                        setTimeout(() => {
                            dispatch(setRole('nill'));
                            disconnect();
                        }, 3000); 
                    }
                    console.error(error)
                }
            }
        }
        fetchData()
    }, [account])

    const { data: paymentMade } = useQuery(PAYOUT_RECEIVED, {
        variables: employeeInfo ? {
            companyAccount: employeeInfo.orgAddress,
            accountAddress: employeeInfo.address,
        } : undefined,
        skip: !employeeInfo, 
        fetchPolicy: 'no-cache'
    })
    console.log(paymentMade)

    const { events, totalAmount } = useMemo(() => {
        const results = [];
        let sum = 0;
        if (paymentMade && paymentMade.events?.length) {
            for (const payment of paymentMade.events) {
                results.push({
                    id: payment.id,
                    title: 'Payment Received',
                    amount: payment.salary,
                    time: payment.timestamp,
                    type: 'order4',
                })
                sum += parseFloat(payment.salary);
            }
        }
        return {
            events: results.sort((a, b) => b.time - a.time),
            totalAmount: sum
        };
    }, [paymentMade])

    if(!employeeInfo)
        return null

    return (
        <div className='pb-20 pt-10 w-full'>
            <div>
                <Spotlight className='-top-40 -left-10 md:-left-32 md:-top-20 h-screen' fill='white' />
                <Spotlight className='top-10 left-full h-[80vh] w-[50vw]' fill='purple' />
                <Spotlight className='top-28 left-80 h-[80vh] w-[50vw]' fill='blue' />
            </div>
            <GridBackgroundDemo />
            <EmployeeCardDetails employee={employeeInfo} totalPayment={totalAmount}/>
            <Timeline employeeInfo={employeeInfo} events={events} />
           
        </div>
    )
}

export default EmployeeHero