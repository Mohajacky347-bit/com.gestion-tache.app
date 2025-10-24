"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Absences from "@/pages/Absences";

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={['chef_section']}>
      <AppLayout>
        <Absences />
      </AppLayout>
    </ProtectedRoute>
  );
}
