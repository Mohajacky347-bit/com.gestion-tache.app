"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Phases from "@/pages/phase";

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={['chef_section']}>
      <AppLayout>
        <Phases />
      </AppLayout>
    </ProtectedRoute>
  );
}
