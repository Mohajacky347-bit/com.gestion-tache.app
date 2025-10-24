"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Rapports from "@/pages/Rapports";

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={['chef_section']}>
      <AppLayout>
        <Rapports />
      </AppLayout>
    </ProtectedRoute>
  );
}
