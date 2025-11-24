"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Brigades from "@/pages/Brigades";

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={["chef_section"]}>
      <AppLayout>
        <Brigades />
      </AppLayout>
    </ProtectedRoute>
  );
}


