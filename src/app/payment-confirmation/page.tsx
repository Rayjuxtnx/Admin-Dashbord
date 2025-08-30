
"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { submitManualPaymentConfirmation } from "@/app/admin/actions";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Your name is required."),
  phone: z.string().regex(/^(0|254|\+254)?[7-9]\d{8}$/, "Please enter a valid Kenyan phone number."),
  mpesaCode: z.string().min(10, "M-Pesa code must be at least 10 characters.").max(12, "M-Pesa code cannot be more than 12 characters.").transform(val => val.toUpperCase()),
  amount: z.coerce.number().min(1, "Amount must be greater than 0."),
  paymentTime: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Please select a valid date and time." }),
});

type FormValues = z.infer<typeof formSchema>;

export default function PaymentConfirmationPage() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            phone: "",
            mpesaCode: "",
            amount: 0,
            paymentTime: new Date().toISOString().slice(0, 16),
        },
    });

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        setIsSubmitting(true);
        try {
            await submitManualPaymentConfirmation(data);
            toast({
                title: "Submission Successful!",
                description: "Your payment details have been sent for verification.",
            });
            setIsSuccess(true);
            form.reset();
        } catch (e: any) {
            toast({
                variant: 'destructive',
                title: "Submission Failed",
                description: e.message || 'An error occurred. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
             <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
                 <Card className="w-full max-w-lg text-center shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl font-headline text-green-600">Thank You!</CardTitle>
                        <CardDescription>Your payment confirmation has been received. We will verify it shortly.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">You can now close this page.</p>
                        <Button onClick={() => setIsSuccess(false)} className="mt-6">Submit Another Payment</Button>
                    </CardContent>
                 </Card>
             </div>
        )
    }

    return (
         <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
             <Link href="/" className="mb-8 flex items-center gap-2 text-foreground">
                <div className="rounded-lg bg-primary p-2 text-primary-foreground">
                    <LayoutGrid className="h-6 w-6" />
                </div>
                <h1 className="text-2xl font-bold font-headline">Hidden Tasty Grill</h1>
            </Link>
            <Card className="w-full max-w-lg shadow-lg">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Confirm Your M-Pesa Till Payment</CardTitle>
                    <CardDescription>Paid using our Till Number? Fill out this form to help us verify your payment quickly.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                             <FormField
                                control={form.control}
                                name="mpesaCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>M-Pesa Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. SFI4321ABCD" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Amount Paid (Ksh)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g. 1200" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="paymentTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date & Time of Payment</FormLabel>
                                            <FormControl>
                                                <Input type="datetime-local" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                             <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Your Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Jane Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number Used</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. 0712345678" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                           
                            <Button type="submit" disabled={isSubmitting} className="w-full">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                                    </>
                                ) : (
                                    'Submit for Verification'
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};
