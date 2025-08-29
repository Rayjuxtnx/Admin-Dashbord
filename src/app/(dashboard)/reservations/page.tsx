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

const reservations = [
  { id: 'RES001', customer: 'Alice Johnson', date: '2024-08-15', time: '19:00', guests: 4, preorder: '2x Steak, 1x Salmon', requests: 'Window seat', status: 'Paid' },
  { id: 'RES002', customer: 'Bob Williams', date: '2024-08-16', time: '20:30', guests: 2, preorder: 'None', requests: 'Quiet table', status: 'Pending' },
  { id: 'RES003', customer: 'Charlie Brown', date: '2024-08-16', time: '18:00', guests: 5, preorder: '1x Vegan Pasta, 2x Chicken Salad', requests: 'High chair needed', status: 'Paid' },
  { id: 'RES004', customer: 'Diana Miller', date: '2024-08-17', time: '19:30', guests: 2, preorder: 'Bottle of Red Wine', requests: '', status: 'Cancelled' },
  { id: 'RES005', customer: 'Ethan Davis', date: '2024-08-18', time: '20:00', guests: 3, preorder: 'None', requests: 'Birthday celebration', status: 'Pending' },
]

const statusStyles: { [key: string]: string } = {
  Paid: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
  Cancelled: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
}

export default function ReservationsPage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Reservations
        </h1>
        <p className="text-muted-foreground">
          Manage all customer reservations and pre-orders.
        </p>
      </header>

      <div className="overflow-hidden rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Pre-order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.map((reservation) => (
              <TableRow key={reservation.id}>
                <TableCell className="font-medium">{reservation.customer}</TableCell>
                <TableCell>
                  <div>{reservation.date} at {reservation.time}</div>
                  <div className="text-sm text-muted-foreground">{reservation.guests} guests</div>
                  {reservation.requests && <div className="text-sm text-muted-foreground">Note: {reservation.requests}</div>}
                </TableCell>
                <TableCell className="max-w-xs truncate">{reservation.preorder}</TableCell>
                <TableCell>
                  <Badge className={cn("capitalize", statusStyles[reservation.status])}>{reservation.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><CheckCircle className="mr-2 h-4 w-4" />Mark as Paid</DropdownMenuItem>
                      <DropdownMenuItem><Clock className="mr-2 h-4 w-4" />Mark as Pending</DropdownMenuItem>
                      <DropdownMenuItem><XCircle className="mr-2 h-4 w-4" />Mark as Cancelled</DropdownMenuItem>
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
