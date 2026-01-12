'use client'

import { useState, useEffect } from "react";
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
  AlertTriangle,
  Loader2,
  Package,
  Plus
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

interface BrigadeTask {
  id: string;
  title: string;
  employes: string[];
  materiels: { nom: string; quantite: number }[];
  dateDebut: string;
  dateFin: string;
  dateFinReel?: string;
  status: "pending" | "paused" | "progress" | "completed";
  phases: Array<{
    id?: string;
    nom: string;
    description: string;
    dureePrevue: number;
    dateDebut: string;
    dateFin: string;
    statut: "En attente" | "En cours" | "Terminé";
  }>;
}

const statusLabels = {
  pending: "En attente",
  progress: "En cours", 
  completed: "Terminée",
  paused: "En pause"
};

const statusVariants = {
  pending: "pending",
  progress: "progress",
  completed: "completed",
  paused: "outline"
} as const;

const mapStatusToFilter = (status: BrigadeTask["status"]): string => {
  switch (status) {
    case "pending": return "en_attente";
    case "progress": return "en_cours";
    case "completed": return "terminee";
    case "paused": return "en_attente";
    default: return "en_attente";
  }
};

export default function BrigadeTasks() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tasks, setTasks] = useState<BrigadeTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<BrigadeTask | null>(null);
  const [requestedMaterials, setRequestedMaterials] = useState<Array<{ nom: string; quantite: number }>>([]);
  const [availableMaterials, setAvailableMaterials] = useState<Array<{ id: string; nom: string; quantite: number }>>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.brigadeId) {
      // Charger les matériaux et tâches en parallèle avec cache
      Promise.all([
        fetchAvailableMaterials(),
        fetchTasks(user.brigadeId)
      ]).catch((error) => {
        console.error("Erreur lors du chargement initial:", error);
      });
    } else {
      setTasks([]);
      setIsLoading(false);
    }
  }, [user?.brigadeId]);

  const fetchTasks = async (brigadeId: number, useCache = true) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/taches?brigadeId=${brigadeId}`, {
        headers: useCache ? {} : { 'Cache-Control': 'no-cache' }
      });
      if (!response.ok) throw new Error("Erreur lors de la récupération des tâches");
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les tâches",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableMaterials = async () => {
    try {
      // Utiliser le cache navigateur par défaut (pas de no-store)
      const response = await fetch("/api/materiels");
      if (!response.ok) throw new Error("Erreur lors de la récupération des matériels");
      const data = await response.json();
      setAvailableMaterials(data.map((m: any) => ({ id: m.id, nom: m.nom, quantite: m.quantite })));
    } catch (error) {
      console.error("Erreur:", error);
      // Ne pas bloquer l'affichage si les matériaux ne peuvent pas être chargés
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const taskStatusFilter = mapStatusToFilter(task.status);
    const matchesStatus = statusFilter === "all" || taskStatusFilter === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: tasks.length,
    enAttente: tasks.filter(t => t.status === "pending").length,
    enCours: tasks.filter(t => t.status === "progress").length,
    terminees: tasks.filter(t => t.status === "completed").length
  };

  const handleRequestMaterials = (task: BrigadeTask) => {
    setSelectedTask(task);
    setRequestedMaterials([]);
    setIsRequestDialogOpen(true);
  };

  const addMaterialRequest = () => {
    setRequestedMaterials([...requestedMaterials, { nom: "", quantite: 1 }]);
  };

  const updateMaterialRequest = (index: number, field: "nom" | "quantite", value: string | number) => {
    const updated = [...requestedMaterials];
    updated[index] = { ...updated[index], [field]: value };
    setRequestedMaterials(updated);
  };

  const removeMaterialRequest = (index: number) => {
    setRequestedMaterials(requestedMaterials.filter((_, i) => i !== index));
  };

  const submitMaterialRequest = async () => {
    if (!selectedTask || requestedMaterials.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins un matériel",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/materiels/demandes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idTache: selectedTask.id,
          materiels: requestedMaterials,
        }),
      });

      if (!response.ok) throw new Error("Erreur lors de la demande");

      toast({
        title: "Succès",
        description: "Demande de matériel envoyée au chef de section",
      });

      setIsRequestDialogOpen(false);
      setRequestedMaterials([]);
      setSelectedTask(null);
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande de matériel",
        variant: "destructive",
      });
    }
  };

  if (!user?.brigadeId) {
    return (
      <div className="flex items-center justify-center py-10">
        <p className="text-muted-foreground">
          Aucune brigade n&apos;est associée à votre profil. Contactez votre administrateur.
        </p>
      </div>
    );
  }

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
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>ID</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Matériels</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Aucune tâche trouvée
                      </TableCell>
                    </TableRow>
                  ) : filteredTasks.map((task) => (
                    <TableRow key={task.id} className="hover:bg-muted/30 transition-smooth">
                      <TableCell className="font-medium">{task.id}</TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground">{task.title}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariants[task.status]}>
                          {statusLabels[task.status]}
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
                        <div className="text-sm">
                          <span className="text-muted-foreground">{task.materiels.length} matériel(s)</span>
                          <div className="text-xs text-muted-foreground mt-1">
                            {task.materiels.slice(0, 2).map(m => m.nom).join(", ")}
                            {task.materiels.length > 2 && "..."}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link 
                              href={`/brigade/taches/${task.id}`} 
                              prefetch={true}
                              className="transition-all duration-150"
                            >
                              Détails
                            </Link>
                          </Button>
                          {task.status === "progress" && (
                            <>
                              <Button 
                                variant="secondary" 
                                size="sm"
                                onClick={() => handleRequestMaterials(task)}
                              >
                                <Package className="h-4 w-4 mr-1" />
                                Demander matériel
                              </Button>
                              <Button variant="default" size="sm" asChild>
                                <Link href="/brigade/rapports">
                                  <FileText className="h-4 w-4 mr-1" />
                                  Rapport
                                </Link>
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Material Request Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Demander des matériels</DialogTitle>
            <DialogDescription>
              Demandez des matériels supplémentaires pour la tâche {selectedTask?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {requestedMaterials.map((material, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label>Matériel</Label>
                  <Select
                    value={material.nom}
                    onValueChange={(value) => updateMaterialRequest(index, "nom", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un matériel" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMaterials.map((m) => (
                        <SelectItem key={m.id} value={m.nom}>
                          {m.nom} (Disponible: {m.quantite})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-32">
                  <Label>Quantité</Label>
                  <Input
                    type="number"
                    min="1"
                    value={material.quantite}
                    onChange={(e) => updateMaterialRequest(index, "quantite", parseInt(e.target.value) || 1)}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMaterialRequest(index)}
                >
                  ×
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={addMaterialRequest}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un matériel
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={submitMaterialRequest}>
              Envoyer la demande
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

