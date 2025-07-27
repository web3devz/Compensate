"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

// import { toast } from "@/components/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { fundTreasuryMove } from "@/services/write-services"
import { useWallet } from "@aptos-labs/wallet-adapter-react"

const FormSchema = z.object({
  amount: z.coerce.number({
    invalid_type_error: "Amount must be a number.",
  }).min(1, {
    message: "Amount must be at least 1.",
  }),
})

type OrgProp = {
  orgName: string | undefined
}

export function AddOrgFunds({orgName}:OrgProp) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })
  const { signAndSubmitTransaction } = useWallet()

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const tx = await fundTreasuryMove(data.amount*10e7,signAndSubmitTransaction)
      console.log(tx)
      window.location.reload();
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col justify-center space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormDescription className="text-2xl font-bold dark:text-white mb-7">Org: <span className="text-purple">{orgName}</span></FormDescription>
              <FormLabel className="text-lg">Add fund to treasury</FormLabel>
              <FormControl>
                <Input placeholder="Amount" {...field} />
              </FormControl>
              <FormDescription>
                Amount to be added to the treasury of the organization
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" variant="purple">Submit</Button>
      </form>
    </Form>
  )
}
