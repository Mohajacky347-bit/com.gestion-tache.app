import { BrigadeLayout } from "@/components/layout/BrigadeLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import BrigadeTaskDetail from "@/pages/BrigadeTaskDetail";

export default function BrigadeTaskDetailPage() {
  return (
    <ProtectedRoute allowedRoles={['chef_brigade']}>
      <BrigadeLayout>
        <BrigadeTaskDetail />
      </BrigadeLayout>
    </ProtectedRoute>
  );
}

