'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type Payment = {
  id: string;
  customer: string;
  amount: string;
  date: string;
  status: 'Verified' | 'Pending' | 'Invalid';
};

export function RecentPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('status', 'Verified')
        .order('date', { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching recent payments:", error.message);
        setError("Could not fetch recent payments. Please check your database permissions.");
        setPayments([]);
      } else {
        setPayments(data || []);
        setError(null);
      }
    };

    fetchPayments();

    const channel = supabase
      .channel('realtime recent-payments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        (payload) => {
          fetchPayments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "";
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };


  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="font-headline">Recent Verified Payments</CardTitle>
        <CardDescription>Most recent successful payments.</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
           <p className="text-sm text-destructive text-center py-8">{error}</p>
        ) : payments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No recent verified payments found.</p>
        ) : (
          <div className="space-y-6">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{getInitials(payment.customer)}</AvatarFallback>
                </Avatar>
                <div className="ml-4 flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{payment.customer}</p>
                  <p className="text-sm text-muted-foreground">Verified on {new Date(payment.date).toLocaleDateString()}</p>
                </div>
                <div className="ml-auto font-medium">{payment.amount}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
