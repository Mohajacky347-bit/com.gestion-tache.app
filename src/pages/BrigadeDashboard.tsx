import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  Wrench,
  Plus
} from "lucide-react";
import Link from "next/link";

// Données de démonstration pour les tâches de la brigade
const brigadeTasks = [
  {
    id: "T001",
    title: "Maintenance route principale",
    description: "Réparation des nids-de-poule sur la route nationale",
    status: "en_cours",
    priority: "haute",
    dateDebut: "2024-01-15",
    dateFin: "2024-01-20",
    materiels: ["Pelle mécanique", "Béton", "Compacteur"]
  },
  {
    id: "T002", 
    title: "Nettoyage caniveaux secteur A",
    description: "Nettoyage et débouchage des caniveaux du secteur A",
    status: "en_attente",
    priority: "moyenne",
    dateDebut: "2024-01-18",
    dateFin: "2024-01-22",
    materiels: ["Camion de nettoyage", "Débouchage haute pression"]
  },
  {
    id: "T003",
    title: "Installation éclairage public",
    description: "Remplacement des lampadaires défaillants",
    status: "terminee",
    priority: "basse",
    dateDebut: "2024-01-10",
    dateFin: "2024-01-12",
    materiels: ["Échafaudage", "Lampadaires", "Outils électriques"]
  }
];

const statusLabels = {
  en_attente: "En attente",
  en_cours: "En cours", 
  terminee: "Terminée"
};

const statusVariants = {
  en_attente: "pending",
  en_cours: "progress",
  terminee: "completed"
} as const;

const priorityLabels = {
  haute: "Haute",
  moyenne: "Moyenne",
  basse: "Basse"
};

const priorityVariants = {
  haute: "destructive",
  moyenne: "secondary", 
  basse: "outline"
} as const;

export default function BrigadeDashboard() {
  const stats = {
    total: brigadeTasks.length,
    enCours: brigadeTasks.filter(t => t.status === "en_cours").length,
    enAttente: brigadeTasks.filter(t => t.status === "en_attente").length,
    terminees: brigadeTasks.filter(t => t.status === "terminee").length
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Brigade</h1>
          <p className="text-muted-foreground mt-2">
            Vue d'ensemble des tâches assignées à votre brigade
          </p>
        </div>
        <Button asChild className="shadow-soft">
          <Link href="/brigade/rapports">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Rapport
          </Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tâches</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <ClipboardList className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-status-pending">{stats.enAttente}</p>
              </div>
              <Clock className="h-8 w-8 text-status-pending" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En cours</p>
                <p className="text-2xl font-bold text-status-progress">{stats.enCours}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-status-progress" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Terminées</p>
                <p className="text-2xl font-bold text-status-completed">{stats.terminees}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-status-completed" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tâches récentes */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Tâches Récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {brigadeTasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-smooth">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium">{task.title}</h3>
                    <Badge variant={statusVariants[task.status]}>
                      {statusLabels[task.status]}
                    </Badge>
                    <Badge variant={priorityVariants[task.priority]}>
                      {priorityLabels[task.priority]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Début: {new Date(task.dateDebut).toLocaleDateString()}</span>
                    <span>Fin: {new Date(task.dateFin).toLocaleDateString()}</span>
                    <span>Matériels: {task.materiels.length}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/brigade/taches/${task.id}`}>
                      Voir détails
                    </Link>
                  </Button>
                  {task.status === "en_cours" && (
                    <Button variant="default" size="sm" asChild>
                      <Link href="/brigade/rapports">
                        <FileText className="h-4 w-4 mr-1" />
                        Rapport
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <Button variant="ghost" asChild>
              <Link href="/brigade/taches">
                Voir toutes les tâches
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-soft hover:shadow-md transition-shadow cursor-pointer" asChild>
          <Link href="/brigade/taches">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <ClipboardList className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-medium">Mes Tâches</h3>
                  <p className="text-sm text-muted-foreground">Consulter les tâches assignées</p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
        
        <Card className="shadow-soft hover:shadow-md transition-shadow cursor-pointer" asChild>
          <Link href="/brigade/rapports">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-medium">Rapports</h3>
                  <p className="text-sm text-muted-foreground">Soumettre un rapport</p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
        
        <Card className="shadow-soft hover:shadow-md transition-shadow cursor-pointer" asChild>
          <Link href="/brigade/materiels">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Wrench className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-medium">Matériels</h3>
                  <p className="text-sm text-muted-foreground">Consulter les matériels</p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}

