"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { Provider as ReduxProvider } from 'react-redux'
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider as ApolloInterProvider,
  HttpLink,
} from '@apollo/client'
import store from '@/state/store'

import { PetraWallet } from "petra-plugin-wallet-adapter";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  return <ReduxProvider store={store}>{children}</ReduxProvider>
}

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://aptos-testnet.nodit.io/m13W7SYGq2gY81ycRh41YemCBzzzgdKy/v1/graphql',
  }),
  cache: new InMemoryCache(),
})

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  return <ApolloInterProvider client={client}>{children}</ApolloInterProvider>
}

const wallets = [new PetraWallet()];

export function PetraWalletProvider({children}:{children: React.ReactNode}) {
  return (
    <AptosWalletAdapterProvider 
      // plugins={wallets} 
      autoConnect={true}
      dappConfig={{
        network: Network.TESTNET,
        // aptosApiKey: process.env.NEXT_PUBLIC_APTOS_API_KEY,
        // aptosConnect: { dappId: "57fa42a9-29c6-4f1e-939c-4eefa36d9ff5" },
        mizuwallet: {
          manifestURL:
            "https://assets.mz.xyz/static/config/mizuwallet-connect-manifest.json",
        },
      }}
      // onError={(error) => {
      //   toast({
      //     variant: "destructive",
      //     title: "Error",
      //     description: error || "Unknown wallet error",
      //   });
      // }}
      >
      {children}
    </AptosWalletAdapterProvider>
  )
}