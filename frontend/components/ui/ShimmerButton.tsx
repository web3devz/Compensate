import { setOrganization, setRole } from '@/state/app'
import { useAppDispatch } from '@/state/hooks'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import React, { useState } from 'react'
import { GiReceiveMoney } from 'react-icons/gi'
import { PiHandDeposit } from 'react-icons/pi'

type Props = {
  title: string
  icon: React.ReactNode
  position: string
  handleClick?: () => void
  otherClasses?: string
  openWalletDialog?: () => void;
}
export const ShimmerButton = ({
  title, icon, position, handleClick, otherClasses, openWalletDialog
}: Props) => {
  const dispatch = useAppDispatch()
  const { wallets, connect, disconnect } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className='relative inline-block text-center'>
      <div>
        <button
          className={`inline-flex h-10 animate-shimmer items-center justify-center rounded-full border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 gap-3 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-1 focus:ring-slate-400  ${otherClasses}`}
          onClick={()=>{
            if(title == 'Connect'){
              toggleDropdown()
            }
            else if(title === 'Employee Login'){
              // const wallet = wallets?.[0]
              dispatch(setRole('employee'))
              // if (wallet) connect(wallet.name)
              if(openWalletDialog)
                openWalletDialog();
            }
            else if(title === 'Employeer Login'){
              // const wallet = wallets?.[0]
              dispatch(setRole('employer'))
              // if (wallet) connect(wallet.name)
              if(openWalletDialog)
                openWalletDialog();
            }
            else if(title === 'Disconnect'){
              dispatch(setRole('nill'))
              dispatch(setOrganization(undefined))
              // const wallet = wallets?.[0]
              // if (wallet) disconnect()
              disconnect()
            }

          }}
        >
          {position === 'left' && icon}
          {title}
          {position === 'right' && icon}
        </button>
      </div>

      {title === 'Connect' && isOpen && (
        <div className={`origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg ring-1 ring-black ring-opacity-5 gap-0`}>
          <div
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            <button
              className={`inline-flex h-10 w-full animate-shimmer items-center justify-around rounded-t-md border-x border-t border-slate-800 bg-black px-6 gap-3 font-light text-sm text-slate-400 focus:outline-none  ${otherClasses}`}
              onClick={() => {
                // const wallet = wallets?.[0]
                dispatch(setRole('employer'))
                // if (wallet) connect(wallet.name)
                if(openWalletDialog)
                  openWalletDialog();
              }}
            >
              <PiHandDeposit  />
              Employeer Login
            </button>
            <button
              className={`inline-flex h-10 w-full animate-shimmer items-center justify-around rounded-b-md border-x border-b border-slate-800 bg-black px-6 gap-3 font-light text-sm text-slate-400 focus:outline-none  ${otherClasses}`}
              onClick={() => {
                // const wallet = wallets?.[0]
                dispatch(setRole('employee'))
                // if (wallet) connect(wallet.name)
                if(openWalletDialog)
                  openWalletDialog();
              }}
            >
              <GiReceiveMoney />
              Employee Login
            </button>
          </div>
        </div>
      )}
    </div>

  )
}
