import { addEmployeeAPI } from "@/api/api";
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
import { addEmployeeMove, createOrgMove } from "@/services/write-services";
import { setRole } from "@/state/app";
import { useAppDispatch } from "@/state/hooks";
import { generateCommitment } from "@/utils/helper";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { InputTransactionData, useWallet } from "@aptos-labs/wallet-adapter-react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const FormSchema = z.object({
    orgName: z.string().min(1, {
        message: "Organization name is required",
    }),
});

export function AddOrg() {
    const dispatch = useAppDispatch()
    const { account, wallets, disconnect, signAndSubmitTransaction } = useWallet()
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
          orgName: "",
        },
      });
    
      // Handle form submission
    async function onSubmit(data: z.infer<typeof FormSchema>) {
        try {
            const result = await createOrgMove(data.orgName,signAndSubmitTransaction);
            console.log(result)
            window.location.reload();
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <Dialog open={true}>
            <DialogContent className="w-[900px] ">
                <DialogHeader>
                    <DialogTitle className="text-purple">Create New Organization</DialogTitle>
                    <DialogDescription>
                        After creating an organization, manage your employee payroll in a trustless manaer with the help of out ZK Verification.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* OrgName Input */}
                        <FormField
                            control={form.control}
                            name="orgName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder="Organization Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                <DialogFooter>
                    <Button variant="destructive" onClick={()=>{
                             dispatch(setRole('nill'))
                             const wallet = wallets?.[0]
                             if (wallet) disconnect()
                        }  
                    }>
                        Disconnect
                    </Button>
                    <Button type="submit" variant="purple" onClick={form.handleSubmit(onSubmit)}>Add</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
