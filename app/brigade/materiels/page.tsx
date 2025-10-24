import { BrigadeLayout } from "@/components/layout/BrigadeLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import BrigadeMaterials from "@/pages/BrigadeMaterials";

export default function BrigadeMaterialsPage() {
  return (
    <ProtectedRoute allowedRoles={['chef_brigade']}>
      <BrigadeLayout>
        <BrigadeMaterials />
      </BrigadeLayout>
    </ProtectedRoute>
  );
}
