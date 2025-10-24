import { StatsCard } from "@/components/dashboard/StatsCard";
import { TasksChart } from "@/components/dashboard/TasksChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Play, 
  Pause, 
  CheckCircle, 
  Users, 
  Wrench,
  AlertTriangle
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Vue d'ensemble des activités du service infrastructure
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Tâches en attente"
          value={12}
          description="Nécessitent une attribution"
          icon={Clock}
          variant="pending"
          trend={{ value: 5, isPositive: false }}
        />
        <StatsCard
          title="Tâches en pause"
          value={5}
          description="Temporairement arrêtées"
          icon={Pause}
          variant="paused"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Tâches en cours"
          value={8}
          description="Actuellement exécutées"
          icon={Play}
          variant="progress"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Tâches terminées"
          value={25}
          description="Complétées ce mois"
          icon={CheckCircle}
          variant="completed"
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      {/* Charts */}
      <TasksChart />

      {/* Additional Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Employés
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Disponibles</span>
              <Badge variant="completed">15</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Affectés</span>
              <Badge variant="progress">8</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Absents</span>
              <Badge variant="paused">3</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Matériels
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Disponibles</span>
              <Badge variant="completed">22</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">En utilisation</span>
              <Badge variant="progress">6</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">En maintenance</span>
              <Badge variant="paused">2</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-accent" />
              Alertes Récentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <p className="font-medium">Tâche #127</p>
              <p className="text-muted-foreground text-xs">Retard de 2 jours</p>
            </div>
            <div className="text-sm">
              <p className="font-medium">Matériel #45</p>
              <p className="text-muted-foreground text-xs">Maintenance requise</p>
            </div>
            <div className="text-sm">
              <p className="font-medium">Employé M. Rakoto</p>
              <p className="text-muted-foreground text-xs">Absence non planifiée</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}