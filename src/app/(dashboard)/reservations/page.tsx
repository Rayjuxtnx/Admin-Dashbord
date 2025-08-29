'use client'

import { useState, useEffect, useTransition } from "react"
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
import { MoreHorizontal, Trash2, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { getReservations, updateReservationStatus, deleteReservation } from "./actions"

export type Reservation = {
  id: string
  customer: string
  date: string
  time: string
  guests: number
  preorder: string
  requests: string
  status: 'Paid' | 'Pending' | 'Cancelled'
}

const statusStyles: { [key: string]: string } = {
  Paid: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
  Cancelled: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isPending, startTransition] = useTransition();

  const fetchReservations = async () => {
    const data = await getReservations();
    setReservations(data as Reservation[]);
  }

  useEffect(() => {
    fetchReservations();

    const channel = supabase
      .channel('realtime reservations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        (payload) => {
          fetchReservations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    }
  }, [])

  const handleUpdateStatus = (id: string, status: Reservation['status']) => {
    startTransition(async () => {
      await updateReservationStatus(id, status);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteReservation(id);
    });
  };

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

      <div className={cn("overflow-hidden rounded-lg border shadow-sm", isPending && "opacity-50")}>
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
                  <div>{new Date(reservation.date).toLocaleDateString()} at {reservation.time}</div>
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
                      <Button variant="ghost" size="icon" disabled={isPending}>
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleUpdateStatus(reservation.id, 'Paid')}><CheckCircle className="mr-2 h-4 w-4" />Mark as Paid</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateStatus(reservation.id, 'Pending')}><Clock className="mr-2 h-4 w-4" />Mark as Pending</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateStatus(reservation.id, 'Cancelled')}><XCircle className="mr-2 h-4 w-4" />Mark as Cancelled</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(reservation.id)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
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
