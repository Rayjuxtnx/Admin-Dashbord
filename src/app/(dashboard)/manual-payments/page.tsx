'use client'

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Trash2, CheckCircle, XCircle, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

type Payment = {
  id: string
  customer: string
  amount: string
  date: string
  status: 'Verified' | 'Pending' | 'Invalid'
}

const statusStyles: { [key: string]: string } = {
  Verified: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
  Invalid: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
}

export default function ManualPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])

  const fetchPayments = async () => {
    const { data, error } = await supabase.from('payments').select('*').order('date', { ascending: false });
    if (error) {
      console.error('Error fetching payments:', error)
    } else if (data) {
      setPayments(data as Payment[])
    }
  }

  useEffect(() => {
    fetchPayments()

    const channel = supabase
      .channel('realtime payments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        (payload) => {
          fetchPayments();
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const updatePaymentStatus = async (id: string, status: Payment['status']) => {
    const { error } = await supabase.from('payments').update({ status }).eq('id', id);
    if (error) {
      console.error('Error updating payment status:', error);
    }
  }

  const deletePayment = async (id: string) => {
    const { error } = await supabase.from('payments').delete().eq('id', id);
     if (error) {
      console.error('Error deleting payment:', error);
    }
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

      <div className="overflow-hidden rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-mono text-sm">{payment.id}</TableCell>
                <TableCell className="font-medium">{payment.customer}</TableCell>
                <TableCell>{payment.amount}</TableCell>
                <TableCell>{new Date(payment.date).toLocaleString()}</TableCell>
                <TableCell>
                  <Badge className={cn("capitalize", statusStyles[payment.status])}>{payment.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => updatePaymentStatus(payment.id, 'Verified')}><CheckCircle className="mr-2 h-4 w-4" />Mark as Verified</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updatePaymentStatus(payment.id, 'Pending')}><Clock className="mr-2 h-4 w-4" />Mark as Pending</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updatePaymentStatus(payment.id, 'Invalid')}><XCircle className="mr-2 h-4 w-4" />Mark as Invalid</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => deletePayment(payment.id)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
