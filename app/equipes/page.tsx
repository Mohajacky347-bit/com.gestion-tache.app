"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Equipes from "@/pages/Equipes";

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={["chef_section"]}>
      <AppLayout>
        <Equipes />
      </AppLayout>
    </ProtectedRoute>
  );
}


