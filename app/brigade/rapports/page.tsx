import { BrigadeLayout } from "@/components/layout/BrigadeLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
//import Rapports from "@/pages/Rapports";
import BrigadeReports from "@/pages/BrigadeReports";

export default function BrigadeReportsPage() {
  return (
    <ProtectedRoute allowedRoles={['chef_brigade']}>
      <BrigadeLayout>
        <BrigadeReports />
        {/* <Rapports /> */}
      </BrigadeLayout>
    </ProtectedRoute>
  );
}
