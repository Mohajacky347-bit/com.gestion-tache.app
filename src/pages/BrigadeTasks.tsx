'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ClipboardList, 
  Search,
  FileText,
  Wrench,
  Calendar,
  MapPin,
  AlertTriangle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface BrigadeTask {
  id: string;
  title: string;
  description: string;
  status: "en_attente" | "en_cours" | "terminee";
  priority: "haute" | "moyenne" | "basse";
  dateDebut: string;
  dateFin: string;
  lieu: string;
  materiels: string[];
  responsable: string;
  notes?: string;
}

// Données de démonstration
const brigadeTasks: BrigadeTask[] = [
  {
    id: "T001",
    title: "Maintenance route principale",
    description: "Réparation des nids-de-poule sur la route nationale RN1",
    status: "en_cours",
    priority: "haute",
    dateDebut: "2024-01-15",
    dateFin: "2024-01-20",
    lieu: "Route Nationale 1, Km 15-20",
    materiels: ["Pelle mécanique", "Béton", "Compacteur", "Camion"],
    responsable: "Chef de Brigade",
    notes: "Attention aux conditions météo"
  },
  {
    id: "T002", 
    title: "Nettoyage caniveaux secteur A",
    description: "Nettoyage et débouchage des caniveaux du secteur A",
    status: "en_attente",
    priority: "moyenne",
    dateDebut: "2024-01-18",
    dateFin: "2024-01-22",
    lieu: "Secteur A - Centre ville",
    materiels: ["Camion de nettoyage", "Débouchage haute pression", "Gants"],
    responsable: "Chef de Brigade"
  },
  {
    id: "T003",
    title: "Installation éclairage public",
    description: "Remplacement des lampadaires défaillants",
    status: "terminee",
    priority: "basse",
    dateDebut: "2024-01-10",
    dateFin: "2024-01-12",
    lieu: "Avenue de la République",
    materiels: ["Échafaudage", "Lampadaires", "Outils électriques"],
    responsable: "Chef de Brigade"
  },
  {
    id: "T004",
    title: "Réparation pont piétonnier",
    description: "Renforcement de la structure du pont piétonnier",
    status: "en_attente",
    priority: "haute",
    dateDebut: "2024-01-25",
    dateFin: "2024-01-30",
    lieu: "Pont piétonnier - Parc municipal",
    materiels: ["Béton armé", "Échafaudage", "Outils de construction"],
    responsable: "Chef de Brigade"
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

export default function BrigadeTasks() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredTasks = brigadeTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.lieu.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: brigadeTasks.length,
    enAttente: brigadeTasks.filter(t => t.status === "en_attente").length,
    enCours: brigadeTasks.filter(t => t.status === "en_cours").length,
    terminees: brigadeTasks.filter(t => t.status === "terminee").length
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mes Tâches</h1>
          <p className="text-muted-foreground mt-2">
            Tâches assignées à votre brigade
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
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
              <AlertTriangle className="h-8 w-8 text-status-pending" />
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
              <Wrench className="h-8 w-8 text-status-progress" />
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
              <ClipboardList className="h-8 w-8 text-status-completed" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher par titre, description ou lieu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="en_cours">En cours</option>
              <option value="terminee">Terminées</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Tâches ({filteredTasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>ID</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Lieu</TableHead>
                  <TableHead>Matériels</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      Aucune tâche trouvée
                    </TableCell>
                  </TableRow>
                ) : filteredTasks.map((task) => (
                  <TableRow key={task.id} className="hover:bg-muted/30 transition-smooth">
                    <TableCell className="font-medium">{task.id}</TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{task.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {task.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[task.status]}>
                        {statusLabels[task.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={priorityVariants[task.priority]}>
                        {priorityLabels[task.priority]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(task.dateDebut).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          au {new Date(task.dateFin).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {task.lieu}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="text-muted-foreground">{task.materiels.length} matériel(s)</span>
                        <div className="text-xs text-muted-foreground mt-1">
                          {task.materiels.slice(0, 2).join(", ")}
                          {task.materiels.length > 2 && "..."}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/brigade/taches/${task.id}`}>
                            Détails
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

