
import { Suspense } from 'react';
import AdminDashboard from "./AdminDashboard";
import Loading from '@/app/loading';

export default function AdminPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AdminDashboard />
    </Suspense>
  );
}
