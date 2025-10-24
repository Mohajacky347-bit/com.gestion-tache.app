import { BrigadeLayout } from "@/components/layout/BrigadeLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import BrigadeDashboard from "@/pages/BrigadeDashboard";

export default function BrigadePage() {
  return (
    <ProtectedRoute allowedRoles={['chef_brigade']}>
      <BrigadeLayout>
        <BrigadeDashboard />
      </BrigadeLayout>
    </ProtectedRoute>
  );
}
