import React, { useState } from 'react'
import { Spotlight } from './ui/Spotlight'
import { GridBackgroundDemo } from './ui/Grid'
import { TextGenerateEffect } from './ui/TextGenerateEffect'
import { ShimmerButton } from './ui/ShimmerButton'
import { PiHandDeposit } from 'react-icons/pi'
import { GiReceiveMoney } from 'react-icons/gi'
import { WalletSelector } from './ui/WalletSelector'

const Hero = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const openWalletDialog = () => {
      setIsDialogOpen(true);
    };
  
    const closeWalletDialog = () => {
      setIsDialogOpen(false);
    };

    return (
        <div className='pb-20 pt-36'>
            <div>
                <Spotlight className='-top-40 -left-10 md:-left-32 md:-top-20 h-screen' fill='white' />
                <Spotlight className='top-10 left-full h-[80vh] w-[50vw]' fill='purple' />
                <Spotlight className='top-28 left-80 h-[80vh] w-[50vw]' fill='blue' />
            </div>
            <GridBackgroundDemo />
            <div className='flex justify-center relative my-20 z-10'>
                <div className='max-w-[89vw] md:max-w-2xl lg:max-w-[60vw] flex flex-col items-center justify-center'>
                    <h2 className='uppercase tracking-widest text-xs text-center text-blue-100 max-w-100'>
                        Streamlining payroll with precision and ease.
                    </h2>
                    <TextGenerateEffect
                        className='text-center text-[40px] md:text-5xl lg:text-6xl'
                        words='Effortless Zero Knowledge Payroll for Happier, Thriving Teams!'
                    />
                    <p className='text-center md:tracking-wider mb-4 md:text-lg lg:text-xl '>
                        Transforming payroll processes for clarity and employee satisfaction!
                    </p>
                    <div className='flex flex-col md:flex-row gap-6' >
                        <ShimmerButton
                            title='Employee Login'
                            icon={<GiReceiveMoney />}
                            position='left'
                            openWalletDialog={openWalletDialog}
                        />
                        <WalletSelector
                            isDialogOpen={isDialogOpen}
                            closeDialog={closeWalletDialog}
                        />
                        <ShimmerButton
                            title='Employeer Login'
                            icon={<PiHandDeposit  />}
                            position='left'
                            openWalletDialog={openWalletDialog}
                        />
                        <WalletSelector
                            isDialogOpen={isDialogOpen}
                            closeDialog={closeWalletDialog}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Hero