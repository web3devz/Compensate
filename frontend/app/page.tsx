"use client";

import EmployeeHero from "@/components/EmployeeHero"
import EmployerHero from "@/components/EmployerHero";
import Footer from "@/components/Footer";
import Grid from "@/components/Grid";
import Hero from "@/components/Hero";
import { AddOrg } from "@/components/ui/AddOrg";
import { Navbar } from "@/components/ui/NavBar";
import { fetchOrganizationMove } from "@/services/read-services";
import { setOrganization } from "@/state/app";
import { useAppDispatch, useAppSelector } from "@/state/hooks";
import { selectOrganization, selectRole } from "@/state/selectors";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { IoIosArrowDropdown, IoMdLogOut } from "react-icons/io";


export default function Home() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { account, connected } = useWallet();
  const role = useAppSelector(selectRole);
  const org = useAppSelector(selectOrganization);
  const isEmployer = role === 'employer'

  useEffect(() => {
    async function fetchData() {
      if (!account?.address) return
      try {
        // if(role === 'employee'){
        //   //window.location.href = '/employee'
        //   router.push('/employee')
        // }
        const org = await fetchOrganizationMove(account?.address)
        dispatch(setOrganization(org))
        console.log(connected, account?.address)
      } catch (error) {
        console.error(error)
      }
      //setLoading(false)
    }
    fetchData()
  }, [account?.address, dispatch])

  console.log('org', org)


  return (
    <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-hidden mx-auto sm:px-10 px-5">
      <div className="max-w-7xl w-full">
        {!connected &&
          <div className=" w-full">
            <Navbar
              title="Connect"
              icon={<IoIosArrowDropdown />}
              position="left"
            />
            <Hero />
            <Grid />
            <Footer />
          </div>
        }
        {connected && role == 'employee' &&
          <div className=" w-full">
            <Navbar
              title='Disconnect'
              icon={<IoMdLogOut />}
              position='left'
            />
            <EmployeeHero />
          </div>
        }
        {connected && role == 'employer' && org && account &&
          <div className="w-full">
            <Navbar
              title='Disconnect'
              icon={<IoMdLogOut />}
              position='left'
            />
            <EmployerHero address={account.address}/>
          </div>
        }
        {
          connected && role == 'employer' && account && !org &&
          <div> 
            <AddOrg />
          </div>
        }
      </div>
    </main>
  );
}
