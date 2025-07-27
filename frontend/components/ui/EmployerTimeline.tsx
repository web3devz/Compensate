import React, { useMemo } from 'react'
import { DataTableDemo } from './EmployeeTable'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './dropdown-menu'
import { Button } from './button'
import { CheckIcon, DotsHorizontalIcon } from '@radix-ui/react-icons'
import { ColumnDef } from '@tanstack/react-table'
import { useQuery } from '@apollo/client'
import { EMPLOYEE_ADDED_MOVE, ORG_ADDED_MOVE, ORG_FUNDED_MOVE } from '@/utils/graph-queries'
import { Address } from '@/state/types'
import moment from 'moment'
import { getColorClass } from '@/utils/helper'


export type Event = {
    transactionId: string
    eventName: string
    eventTime: number
    status: string
    type: string
}

export const columns: ColumnDef<Event>[] = [
    {
        accessorKey: "transactionId",
        header: "Transaction Id",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("transactionId")}</div>
        ),
    },
    {
        accessorKey: "eventName",
        header: () => <div className="text-center">Name</div>,
        cell: ({ row }) => (
            <div className="capitalize text-center">{row.getValue("eventName")}</div>
        ),
    },
    {
        accessorKey: "status",
        header: () => <div className="text-center">Status</div>,
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            const eventName = row.getValue("eventName") as string
            const type = row.original.type 
            console.log(status,type,eventName, "Here")
            return (
                <div className="flex text-center w-full justify-center">
                    <CheckIcon className={`h-5 w-5 ${getColorClass(type)}`} />
                    <span className="ml-2 capitalize">
                        {status}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: "eventTime",
        header: () => <div className="text-center">Time</div>,
        cell: ({ row }) => {
            const eventTime = row.getValue("eventTime") as number
            return (
                <div className="flex text-center w-full justify-center">
                    <span className="ml-2 capitalize ">
                        {moment.unix(eventTime).format('Do MMMM YYYY')}
                    </span>
                </div>
            )
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const event = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <DotsHorizontalIcon className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => window.open(`https://explorer.aptoslabs.com/txn/${event.transactionId}?network=testnet`, '_blank')}
                        >
                            Show Transaction
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

type AddressProp = {
    address: Address
}


const EmployerTimeline = ({address}:AddressProp) => {
    const { data:employeesAdded } = useQuery(EMPLOYEE_ADDED_MOVE, {
        variables: {
          companyAccount: address,
          accountAddress: address,
        },
        fetchPolicy: 'no-cache'
      })
      const { data:orgAdded } = useQuery(ORG_ADDED_MOVE, {
        variables: {
          companyAccount: address,
          accountAddress: address,
        },
        fetchPolicy: 'no-cache'
      })
      const { data:orgFunded } = useQuery(ORG_FUNDED_MOVE, {
        variables: {
          companyAccount: address,
          accountAddress: address,
        },
        fetchPolicy: 'no-cache'
      })
    
      console.log(address,employeesAdded,orgAdded,orgFunded)
      const data = useMemo(() => {
        const results = []
        if (orgAdded && orgAdded.events?.length) {
          results.push({
            transactionId:orgAdded.events[0].transaction_version,
            eventName: 'Organization Created',
            eventTime: orgAdded.events[0].timestamp,
            status:"Success",
            type: "order1",
          })
        }
        if (orgFunded) {
          for (const funded of orgFunded.events) {
            results.push({
              transactionId:funded.transaction_version,
              eventName: `Organization Funded ${(funded.amount)/1e8} APT`,
              eventTime: funded.timestamp,
              status:"Success",
              type: "order2",
            })
          }
        }
        if (employeesAdded) {
          for (const employee of employeesAdded.events) {
            results.push({
              transactionId:employee.transaction_version,
              eventName: 'Employee Added',
              eventTime: employee.timestamp,
              status:"Success",
              type: "order3",
            })
          }
        }
        console.log(results)
        return results.sort((a, b) => b.eventTime - a.eventTime)
      }, [employeesAdded, orgAdded, orgFunded])
      
    return (
        <div>
            <div
                className="relative p-6 my-3 rounded-3xl overflow-hidden border border-[#846b8a] bg-[#181522] col-span-3"
            >
                <DataTableDemo data={data} columns={columns} />
            </div>
        </div>
    )
}

export default EmployerTimeline