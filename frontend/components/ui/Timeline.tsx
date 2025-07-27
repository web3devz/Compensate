import { Employee } from '@/state/types'
import { PAYOUT_RECEIVED } from '@/utils/graph-queries'
import { useQuery } from '@apollo/client'
import React, { useMemo } from 'react'
import moment from 'moment'

type Props = {
    employeeInfo: Employee
    events: {
        id: string,
        title: string,
        amount: number,
        time: number,
        type: string,
    }[]
}

const Timeline: React.FC<Props> = ({ employeeInfo, events }) => {

    

    if (events.length === 0) {
        return null; 
    }
    return (
        <div className='flex justify-center relative my-2 z-10'>
            <div className='w-[650px] max-w-[89vw] md:max-w-2xl lg:max-w-[60vw] flex flex-col bg-[#181522] border border-[#846b8a] rounded-lg p-5'>
                <h1 className='text-4xl font-extrabold mb-4 text-[#f9f871]'>
                    Payment History
                </h1>
                {events.map((item, index) => (
                    <div key={index} className={`relative  ${index != events.length - 1 && index != 0 && `border-gray-700 border-s`}`}>
                        <div className={`relative  ${index != events.length - 1 && index != 0 && `border-gray-700 border-s`}`}>
                            <div className="h-[100px] ms-4">
                                <div className="absolute w-4 h-4 bg-gray-200 rounded-full -start-2 border border-white dark:border-gray-900 dark:bg-yellow-500"></div>
                                <div className='flex flex-row justify-between'>
                                    <div className='flex flex-col'>
                                        <time className="mb-1 text-lg font-semibold leading-none text-gray-900 dark:text-white ">{item.title}</time>
                                        <h3 className="text-sm font-normal text-gray-400 dark:text-gray-500 ">{moment.unix(item.time).format('Do MMMM YYYY')}</h3>
                                    </div>
                                    <div className='flex font-bold text-lg'>
                                        +{item.amount} APT
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Timeline