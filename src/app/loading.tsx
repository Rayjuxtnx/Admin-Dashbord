import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <DashboardLayout>
        <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-12 w-full" />
            <div className="space-y-4">
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
    </DashboardLayout>
  );
}
