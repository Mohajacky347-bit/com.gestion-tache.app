"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Taches from "@/pages/Taches";

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={['chef_section']}>
      <AppLayout>
        <Taches />
      </AppLayout>
    </ProtectedRoute>
  );
}
