
"use client"

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getManualConfirmations, updateConfirmationStatus } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { MoreHorizontal, CheckCircle, XCircle, Clock } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

type ConfirmationStatus = 'pending' | 'verified' | 'invalid';

type Confirmation = {
  id: number;
  created_at: string;
  mpesa_code: string;
  customer_name: string;
  customer_phone: string;
  amount: number;
  payment_time: string;
  status: ConfirmationStatus;
};

const formatDate = (dateString: string) => {
    try {
        return format(new Date(dateString), "PPpp");
    } catch (e) {
        return "Invalid Date";
    }
}

const formatStatus = (status: ConfirmationStatus) => {
    switch (status) {
        case 'verified':
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300">Verified</Badge>;
        case 'pending':
            return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300">Pending</Badge>;
        case 'invalid':
            return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300">Invalid</Badge>;
        default:
            return <Badge variant="outline">Unknown</Badge>;
    }
}

export default function ManualConfirmationsList() {
  const [confirmations, setConfirmations] = useState<Confirmation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getManualConfirmations();
        setConfirmations(data);
      } catch (error) {
         console.error("Failed to fetch manual confirmations", error);
         toast({
            variant: "destructive",
            title: "Load Failed",
            description: "Could not fetch manual payment confirmations.",
        });
      } finally {
         setIsLoading(false);
      }
  }

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('realtime manual_till_payments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'manual_till_payments' },
        (payload) => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [])
  
  const handleStatusUpdate = async (id: number, status: ConfirmationStatus) => {
    try {
        await updateConfirmationStatus(id, status);
        toast({
            title: "Status Updated",
            description: `Confirmation #${id} has been marked as ${status}.`
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not update the confirmation status."
        });
    }
  }

  if(isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Incoming Confirmations</CardTitle>
          <CardDescription>Review and verify payments submitted manually by customers using the M-Pesa Till.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
             <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="flex flex-col gap-8">
        <header>
            <h1 className="text-3xl font-bold font-headline tracking-tight">
                Manual Payments
            </h1>
            <p className="text-muted-foreground">
                Review and verify payments made via M-Pesa Till.
            </p>
        </header>

        <Card>
            <CardHeader>
                <CardTitle>Incoming Confirmations</CardTitle>
                <CardDescription>Review and verify payments submitted manually by customers.</CardDescription>
            </CardHeader>
            <CardContent>
                 {confirmations.length === 0 ? (
                     <p className="text-muted-foreground text-center py-8">No manual payment confirmations have been submitted yet.</p>
                 ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>M-Pesa Code</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Payment Time</TableHead>
                                <TableHead>Submitted At</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {confirmations.map((c) => (
                            <TableRow key={c.id}>
                                <TableCell className="font-mono font-semibold">{c.mpesa_code}</TableCell>
                                <TableCell className="font-medium">{c.customer_name}</TableCell>
                                <TableCell>{c.customer_phone}</TableCell>
                                <TableCell>Ksh {c.amount.toLocaleString()}</TableCell>
                                <TableCell>{c.payment_time ? format(new Date(c.payment_time), "PPp") : 'N/A'}</TableCell>
                                <TableCell>{formatDate(c.created_at)}</TableCell>
                                <TableCell className="text-center">{formatStatus(c.status)}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onSelect={() => handleStatusUpdate(c.id, 'verified')}>
                                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Mark as Verified
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => handleStatusUpdate(c.id, 'pending')}>
                                                <Clock className="mr-2 h-4 w-4 text-yellow-500" /> Mark as Pending
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => handleStatusUpdate(c.id, 'invalid')} className="text-destructive focus:text-destructive">
                                                <XCircle className="mr-2 h-4 w-4" /> Mark as Invalid
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 )}
            </CardContent>
        </Card>
    </div>
  )
}
