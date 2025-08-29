import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LayoutGrid } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="items-center text-center">
            <div className="mb-2 flex items-center gap-2">
                <div className="rounded-lg bg-primary p-2 text-primary-foreground">
                    <LayoutGrid className="h-6 w-6" />
                </div>
                <h1 className="text-2xl font-bold font-headline">AdminLink</h1>
            </div>
          <CardTitle className="text-3xl font-bold font-headline">Welcome Back</CardTitle>
          <CardDescription>
            Enter your credentials to access the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                required
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required  className="text-base"/>
            </div>
            <Link href="/" passHref>
              <Button type="submit" className="w-full text-base font-bold">
                Sign In
              </Button>
            </Link>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} AdminLink. All rights reserved.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
