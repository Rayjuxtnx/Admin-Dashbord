import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

const payments = [
  { name: "Liam Johnson", email: "liam@example.com", amount: "KES 2,500.00", avatar: "https://picsum.photos/40/40?random=1", dataAiHint: "person portrait" },
  { name: "Olivia Smith", email: "olivia@example.com", amount: "KES 1,250.00", avatar: "https://picsum.photos/40/40?random=2", dataAiHint: "person portrait" },
  { name: "Noah Williams", email: "noah@example.com", amount: "KES 800.00", avatar: "https://picsum.photos/40/40?random=3", dataAiHint: "person portrait" },
  { name: "Emma Brown", email: "emma@example.com", amount: "KES 3,500.00", avatar: "https://picsum.photos/40/40?random=4", dataAiHint: "person portrait" },
  { name: "James Jones", email: "james@example.com", amount: "KES 450.00", avatar: "https://picsum.photos/40/40?random=5", dataAiHint: "person portrait" },
];

export function RecentPayments() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="font-headline">Recent M-Pesa Payments</CardTitle>
        <CardDescription>Most recent successful STK push payments.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {payments.map((payment, index) => (
            <div key={index} className="flex items-center">
              <Avatar className="h-10 w-10">
                <Image src={payment.avatar} alt={payment.name} width={40} height={40} className="rounded-full" data-ai-hint={payment.dataAiHint}/>
                <AvatarFallback>{payment.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="ml-4 flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{payment.name}</p>
                <p className="text-sm text-muted-foreground">{payment.email}</p>
              </div>
              <div className="ml-auto font-medium">{payment.amount}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
