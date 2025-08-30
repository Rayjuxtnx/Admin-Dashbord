import { Suspense } from 'react';
import AdminDashboardPage from "./admin/page";
import Loading from './loading';

export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <AdminDashboardPage />
    </Suspense>
  );
}
