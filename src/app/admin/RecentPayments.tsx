
"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getRecentPayments } from "./actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Payment = {
  phone_number: string | null;
  amount: number | null;
  created_at: string;
};

// Helper to format phone number
const formatPhoneNumber = (phone: string | null) => {
  if (!phone) return "N/A";
  // Basic formatting for Kenyan numbers
  if (phone.startsWith("254")) {
    return `+${phone.slice(0, 3)}...${phone.slice(-4)}`;
  }
  return phone;
};

// Helper to format date
const formatDate = (dateString: string) => {
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    } catch (e) {
        return "Invalid Date";
    }
}

export function RecentPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      setIsLoading(true);
      try {
        const data = await getRecentPayments();
        setPayments(data);
      } catch (error) {
        console.error("Error fetching recent payments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Payments</CardTitle>
        <CardDescription>Most recent successful payments.</CardDescription>
      </CardHeader>
      <CardContent>
         {isLoading ? (
            <div className="space-y-8">
                {[...Array(5)].map((_, i) => (
                   <div key={i} className="flex items-center">
                     <Skeleton className="h-9 w-9 rounded-full" />
                     <div className="ml-4 space-y-2">
                       <Skeleton className="h-4 w-[100px]" />
                       <Skeleton className="h-4 w-[150px]" />
                     </div>
                     <Skeleton className="ml-auto h-4 w-[50px]" />
                   </div>
                ))}
            </div>
         ) : payments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
                No recent payments to display.
            </p>
         ) : (
            <div className="space-y-8">
            {payments.map((payment, index) => (
                <div key={index} className="flex items-center">
                <Avatar className="h-9 w-9">
                    <AvatarFallback>
                        {formatPhoneNumber(payment.phone_number)?.substring(1,3) || '??'}
                    </AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                    {formatPhoneNumber(payment.phone_number)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                    Paid on {formatDate(payment.created_at)}
                    </p>
                </div>
                <div className="ml-auto font-medium">
                    +Ksh {payment.amount?.toLocaleString() || 0}
                </div>
                </div>
            ))}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
