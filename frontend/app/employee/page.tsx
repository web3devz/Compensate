"use client"

import EmployeeHero from '@/components/EmployeeHero'
import { Navbar } from '@/components/ui/NavBar'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { selectRole } from '@/state/selectors'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import React, { useEffect } from 'react'
import { IoMdLogOut } from 'react-icons/io'

const Employee = () => {
  const dispatch = useAppDispatch()
  const {account, connected}=useWallet();
  const role = useAppSelector(selectRole);
  //const org = useAppSelector(selectOrganization);
  const isEmployer = role === 'employer'

  useEffect(() => {
    async function fetchData() {
      if (!connected){
        // window.location.href = '/'
        console.log(connected,account?.address)
      }
    }
    fetchData()
  }, [account?.address, dispatch])

  //console.log('org', org)
  return (
    <div className='w-full'>
        <Navbar 
          title='Disconnect' 
          icon={<IoMdLogOut />}
          position='left' 
        />
        <EmployeeHero />
    </div>
  )
}

export default Employee