"use client";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import { ShimmerButton } from "./ShimmerButton";
import { IoIosArrowDropdown } from "react-icons/io";
import { WalletSelector } from "./WalletSelector";

type Props ={
    className?: string
    title: string 
    icon: React.ReactNode
    position: string
    handleClick?: () => void
}

export function Navbar(props: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const openWalletDialog = () => {
      setIsDialogOpen(true);
    };
  
    const closeWalletDialog = () => {
      setIsDialogOpen(false);
    };
    return (
        <div
            className={cn("absolute top-3 inset-x-0 px-8 py-6 z-50 w-full flex items-center justify-center", props.className)}
        >
            <div className="flex justify-between items-center w-full">
                <img
                    src="/logo2.png"
                    alt="logo"
                    className="w-[180px] h-[30px]"
                />
                <ShimmerButton
                    title={props.title}
                    icon={props.icon}
                    position={props.position}
                    otherClasses="w-48"
                    openWalletDialog={openWalletDialog}
                />
                {/* <WalletSelector /> */}
                <WalletSelector
                    isDialogOpen={isDialogOpen}
                    closeDialog={closeWalletDialog} // Pass closeDialog function to WalletSelector
                />
            </div>
        </div>
    );
}
