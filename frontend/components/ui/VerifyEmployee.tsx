import { addEmployeeAPI, verifyUserCommitment } from "@/api/api";
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input"
import { verifyEmployee } from "@/services/write-services";
import { generateCommitment } from "@/utils/helper";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { InputTransactionData, useWallet } from "@aptos-labs/wallet-adapter-react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const FormSchema = z.object({
    employeeName: z.string().min(1, {
        message: "Employee Name is required.",
    }),
    walletAddress: z.string().min(1, {
      message: "Wallet Address is required.",
    }),
    jobTitle: z.string().min(2, {
      message: "Job Title must be at least 2 characters.",
    }),
    dailySalary: z.number({
        invalid_type_error: "Daily Salary must be a number.",
    }).min(1, {
        message: "Daily Salary must be at least 1.",
    }),
});

export function VerifyEmployee() {
    const { account,signAndSubmitTransaction } = useWallet()
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
          employeeName: "",
          walletAddress: "",
          jobTitle: "",
          dailySalary: 1,
        },
      });
    
      // Handle form submission
      async function onSubmit(data: z.infer<typeof FormSchema>) {
        const commitment = generateCommitment(data.employeeName, data.jobTitle, data.walletAddress);
        try {
            if(account){
                const result = await verifyUserCommitment(data.employeeName, data.jobTitle, data.walletAddress)
                console.log(result)
                const response = await verifyEmployee(data.walletAddress,result,signAndSubmitTransaction)
                console.log(response)
                window.location.reload();
            }
          } catch (error) {
            console.error(error)
          }
        }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="purple">Verify Employee</Button>
            </DialogTrigger>
            <DialogContent className="w-[900px] ">
                <DialogHeader>
                    <DialogTitle className="text-purple">Verify Employee</DialogTitle>
                    <DialogDescription>
                       After performing the ZK verification, your employer will me able to make the salary payments.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* EmployeeName Input */}
                        <FormField
                            control={form.control}
                            name="employeeName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder="Employee Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Job Title Input */}
                        <FormField
                            control={form.control}
                            name="jobTitle"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder="Job Title" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Wallet Address Input */}
                        <FormField
                            control={form.control}
                            name="walletAddress"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder="Wallet Address" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                <DialogFooter>
                    <Button type="submit" variant="purple" onClick={form.handleSubmit(onSubmit)}>Add</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
