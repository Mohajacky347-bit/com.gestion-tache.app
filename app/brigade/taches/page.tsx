import { BrigadeLayout } from "@/components/layout/BrigadeLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import BrigadeTasks from "@/pages/BrigadeTasks";

export default function BrigadeTasksPage() {
  return (
    <ProtectedRoute allowedRoles={['chef_brigade']}>
      <BrigadeLayout>
        <BrigadeTasks />
      </BrigadeLayout>
    </ProtectedRoute>
  );
}
