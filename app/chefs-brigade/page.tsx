"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ChefsBrigade from "@/pages/ChefsBrigade";

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={["chef_section"]}>
      <AppLayout>
        <ChefsBrigade />
      </AppLayout>
    </ProtectedRoute>
  );
}


