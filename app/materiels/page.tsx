"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Materiels from "@/pages/Materiels";

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={['chef_section']}>
      <AppLayout>
        <Materiels />
      </AppLayout>
    </ProtectedRoute>
  );
}
