'use client'

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

const payments = [
    { id: 'MPESA001', customer: 'Grace Kimani', amount: 'KES 2,500', date: '2024-08-14', status: 'Verified' },
    { id: 'MPESA002', customer: 'David Otieno', amount: 'KES 800', date: '2024-08-14', status: 'Pending' },
    { id: 'MPESA003', customer: 'Sophia Wanjiru', amount: 'KES 5,200', date: '2024-08-13', status: 'Invalid' },
    { id: 'MPESA004', customer: 'James Mwangi', amount: 'KES 1,500', date: '2024-08-13', status: 'Verified' },
    { id: 'MPESA005', customer: 'Mary Akinyi', amount: 'KES 3,000', date: '2024-08-12', status: 'Pending' },
]

const statusStyles: { [key: string]: string } = {
  Verified: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
  Invalid: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
}

export default function ManualPaymentsPage() {
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
                <TableCell>{payment.date}</TableCell>
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
                      <DropdownMenuItem><CheckCircle className="mr-2 h-4 w-4" />Mark as Verified</DropdownMenuItem>
                      <DropdownMenuItem><Clock className="mr-2 h-4 w-4" />Mark as Pending</DropdownMenuItem>
                      <DropdownMenuItem><XCircle className="mr-2 h-4 w-4" />Mark as Invalid</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
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
