"use client"

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getReservations, updateReservationStatus, deleteReservation } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, MoreHorizontal, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

type PreOrderItem = {
    name: string;
    price: string;
}

type ReservationStatus = 'pending' | 'paid' | 'not_paid' | 'cancelled';

export type Reservation = {
  id: number;
  created_at: string;
  name: string;
  phone: string;
  guests: number;
  reservation_date: string;
  reservation_time: string;
  special_requests: string | null;
  pre_ordered_items: PreOrderItem[] | null;
  pre_order_total: number;
  payment_status: ReservationStatus;
  checkout_request_id: string | null;
};


const formatDate = (dateString: string) => {
    try {
        return format(new Date(dateString), "PP");
    } catch (e) {
        return "Invalid Date";
    }
}

const formatStatus = (status: Reservation['payment_status']) => {
    switch (status) {
        case 'paid':
            return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Paid</Badge>;
        case 'pending':
            return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">Pending</Badge>;
        case 'cancelled':
            return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">Cancelled</Badge>;
        case 'not_paid':
            return <Badge variant="outline">Not Paid</Badge>;
        default:
            return <Badge variant="outline">Unknown</Badge>;
    }
}

export default function ReservationsList() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
      setIsLoading(true);
      const data = await getReservations();
      setReservations(data as Reservation[]);
      setIsLoading(false);
  }

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('realtime reservations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        (payload) => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [])
  
  const handleStatusUpdate = async (id: number, status: ReservationStatus) => {
    try {
        await updateReservationStatus(id, status);
        toast({
            title: "Status Updated",
            description: `Reservation has been marked as ${status}.`
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not update the reservation status."
        });
    }
  }

  const handleDeleteClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsDeleteDialogOpen(true);
  }

  const handleDeleteConfirm = async () => {
    if (!selectedReservation) return;
    try {
        await deleteReservation(selectedReservation.id);
        toast({
            title: "Reservation Deleted",
            description: `The reservation for ${selectedReservation.name} has been deleted.`
        });
        setIsDeleteDialogOpen(false);
        setSelectedReservation(null);
    } catch (error) {
         toast({
            variant: "destructive",
            title: "Delete Failed",
            description: "Could not delete the reservation."
        });
    }
  }


  if(isLoading) {
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
        <Card>
            <CardHeader>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
            </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <>
       <div className="flex flex-col gap-8">
            <header>
                <h1 className="text-3xl font-bold font-headline tracking-tight">
                    Reservations
                </h1>
                <p className="text-muted-foreground">
                    Manage all customer reservations and pre-orders.
                </p>
            </header>
            <Card>
                <CardContent className="p-0">
                    {reservations.length === 0 ? (
                         <p className="text-muted-foreground text-center py-8">No reservations have been made yet.</p>
                    ) : (
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead className="text-center">Guests</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead className="text-center">Payment</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reservations.map((res) => (
                            <TableRow key={res.id}>
                                <TableCell className="font-medium">{res.name}</TableCell>
                                <TableCell>{res.phone}</TableCell>
                                <TableCell className="text-center">{res.guests}</TableCell>
                                <TableCell>
                                {formatDate(res.reservation_date)} @ {res.reservation_time}
                                </TableCell>
                                <TableCell className="text-center">{formatStatus(res.payment_status)}</TableCell>
                                <TableCell className="text-right">Ksh {res.pre_order_total.toLocaleString()}</TableCell>
                                <TableCell>
                                <Collapsible>
                                    <CollapsibleTrigger asChild>
                                        <Button variant="ghost" size="sm" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                                            View <ChevronDown className="h-4 w-4 ml-1" />
                                        </Button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                    <div className="p-2 mt-2 bg-muted rounded-md text-xs space-y-2">
                                        <p><strong>Requests:</strong> {res.special_requests || 'None'}</p>
                                        {res.pre_ordered_items && res.pre_ordered_items.length > 0 && (
                                            <div>
                                                <strong>Pre-orders:</strong>
                                                <ul className="list-disc pl-4">
                                                    {res.pre_ordered_items.map((item, index) => (
                                                        <li key={index}>{item.name} ({item.price})</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                    </CollapsibleContent>
                                </Collapsible>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onSelect={() => handleStatusUpdate(res.id, 'paid')}>
                                                <CheckCircle className="mr-2 h-4 w-4" /> Confirm Payment
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => handleStatusUpdate(res.id, 'cancelled')}>
                                                <XCircle className="mr-2 h-4 w-4" /> Cancel Reservation
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onSelect={() => handleDeleteClick(res)} className="text-destructive focus:text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete Permanently
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


        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you sure you want to delete this reservation?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the reservation for <span className="font-semibold text-foreground">{selectedReservation?.name}</span>.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button variant="destructive" onClick={handleDeleteConfirm}>Yes, Delete Reservation</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  )
}
