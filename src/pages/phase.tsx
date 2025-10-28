import { useEffect, useState } from "react";
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
  Plus, 
  Search,
  ChevronDown,
  ChevronRight,
  Calendar,
  Clock,
  Edit,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Tache {
  id: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  statut: string;
}

interface Phase {
  id: string;
  idTache: string;
  nom: string;
  description?: string;
  dureePrevue: number;
  dateDebut: string;
  dateFin: string;
  statut: "En attente" | "En cours" | "Terminé";
  tache?: Tache;
}

const statutLabels = {
  "En attente": "En attente",
  "En cours": "En cours", 
  "Terminé": "Terminé"
};

const statutVariants = {
  "En attente": "pending",
  "En cours": "progress",
  "Terminé": "completed"
} as const;

type AlertType = "success" | "error" | null;
type DialogType = "add" | "edit" | "delete" | null;

interface TaskGroup {
  tache: Tache;
  phases: Phase[];
  isExpanded: boolean;
}

export default function Phases() {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [taches, setTaches] = useState<Tache[]>([]);
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [alert, setAlert] = useState<{ type: AlertType; message: string } | null>(null);
  const [dialog, setDialog] = useState<{ type: DialogType; phase?: Phase } | null>(null);
  const [formData, setFormData] = useState<Partial<Phase>>({
    idTache: "",
    nom: "",
    description: "",
    dureePrevue: 1,
    dateDebut: "",
    dateFin: "",
    statut: "En attente"
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  useEffect(() => {
    // Grouper les phases par tâche
    const grouped = taches.map(tache => ({
      tache,
      phases: phases.filter(phase => phase.idTache === tache.id),
      isExpanded: true
    })).filter(group => group.phases.length > 0); // Only show tasks that have phases
    
    setTaskGroups(grouped);
  }, [phases, taches]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les phases
      const phasesRes = await fetch("/api/phases", { cache: "no-store" });
      if (!phasesRes.ok) throw new Error("Erreur lors du chargement des phases");
      const phasesData = await phasesRes.json();

      // Récupérer les tâches
      const tachesRes = await fetch("/api/taches", { cache: "no-store" });
      if (!tachesRes.ok) throw new Error("Erreur lors du chargement des tâches");
      const tachesData = await tachesRes.json();

      // Associer les tâches aux phases
      const phasesWithTaches = phasesData.map((phase: Phase) => ({
        ...phase,
        tache: tachesData.find((t: Tache) => t.id === phase.idTache)
      }));

      setPhases(phasesWithTaches);
      setTaches(tachesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type: AlertType, message: string) => {
    setAlert({ type, message });
  };

  const openDialog = (type: DialogType, phase?: Phase) => {
    setDialog({ type, phase });
    if (type === "edit" && phase) {
      setFormData({
        idTache: phase.idTache,
        nom: phase.nom,
        description: phase.description,
        dureePrevue: phase.dureePrevue,
        dateDebut: phase.dateDebut,
        dateFin: phase.dateFin,
        statut: phase.statut
      });
    } else if (type === "add") {
      setFormData({
        idTache: "",
        nom: "",
        description: "",
        dureePrevue: 1,
        dateDebut: "",
        dateFin: "",
        statut: "En attente"
      });
    }
  };

  const closeDialog = () => {
    setDialog(null);
    setFormData({
      idTache: "",
      nom: "",
      description: "",
      dureePrevue: 1,
      dateDebut: "",
      dateFin: "",
      statut: "En attente"
    });
  };

  const handleSubmit = async () => {
    try {
      if (dialog?.type === "add") {
        const response = await fetch("/api/phases", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error("Erreur lors de l'ajout");
        
        await fetchData();
        showAlert("success", "Phase ajoutée avec succès");

      } else if (dialog?.type === "edit" && dialog.phase) {
        const response = await fetch(`/api/phases/${dialog.phase.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error("Erreur lors de la modification");
        
        await fetchData();
        showAlert("success", "Phase modifiée avec succès");

      } else if (dialog?.type === "delete" && dialog.phase) {
        const response = await fetch(`/api/phases/${dialog.phase.id}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Erreur lors de la suppression");
        
        await fetchData();
        showAlert("success", "Phase supprimée avec succès");
      }
      
      closeDialog();
    } catch (error) {
      showAlert("error", "Erreur lors de l'opération");
    }
  };

  const toggleTaskGroup = (tacheId: string) => {
    setTaskGroups(groups => 
      groups.map(group => 
        group.tache.id === tacheId 
          ? { ...group, isExpanded: !group.isExpanded }
          : group
      )
    );
  };

  const filteredTaskGroups = taskGroups.filter(group => {
  const searchLower = searchTerm.toLowerCase();
  
  // Vérifier si la tâche correspond
  const tacheMatch = group.tache.description?.toLowerCase().includes(searchLower) || false;
  
  // Vérifier si une phase correspond
  const phaseMatch = group.phases.some(phase => {
    const nomMatch = phase.nom?.toLowerCase().includes(searchLower) || false;
    const descMatch = phase.description ? phase.description.toLowerCase().includes(searchLower) : false;
    return nomMatch || descMatch;
  });
  
  return tacheMatch || phaseMatch;
});


  const calculateProgression = (phases: Phase[]) => {
    const total = phases.length;
    const completed = phases.filter(p => p.statut === "Terminé").length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Alerte */}
      {alert && (
        <Alert className={`fixed top-4 right-4 z-50 w-96 shadow-lg border-l-4 ${
          alert.type === "success" 
            ? "border-green-500 bg-green-50" 
            : "border-red-500 bg-red-50"
        }`}>
          <AlertDescription className={`font-medium ${
            alert.type === "success" ? "text-green-800" : "text-red-800"
          }`}>
            {alert.message}
          </AlertDescription>
        </Alert>
      )}

      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Gestion des Phases
          </h1>
          <p className="text-muted-foreground mt-2">
            Organisez et suivez les phases de vos tâches
          </p>
        </div>
        <Button 
          className="shadow-soft bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          onClick={() => openDialog("add")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une phase
        </Button>
      </div>

      {/* Search */}
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher par tâche, nom de phase ou description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Task Groups */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>
            Phases par Tâche ({filteredTaskGroups.reduce((total, group) => total + group.phases.length, 0)} phases)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-muted-foreground py-8">
              Chargement des phases...
            </div>
          ) : filteredTaskGroups.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Aucune phase trouvée
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTaskGroups.map((group) => (
                <div key={group.tache.id} className="border rounded-lg overflow-hidden">
                  {/* Task Header */}
                  <div 
                    className="bg-muted/50 p-4 cursor-pointer hover:bg-muted/70 transition-colors"
                    onClick={() => toggleTaskGroup(group.tache.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {group.isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <div className="font-semibold text-foreground">
                            {group.tache.id} - {group.tache.description}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(group.tache.dateDebut).toLocaleDateString()} - {new Date(group.tache.dateFin).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {group.phases.length} phase(s)
                            </span>
                            <Badge variant="outline">
                              {calculateProgression(group.phases)}% terminé
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Badge variant={
                        group.tache.statut === "Terminé" ? "completed" : 
                        group.tache.statut === "En cours" ? "progress" : "pending"
                      }>
                        {group.tache.statut}
                      </Badge>
                    </div>
                  </div>

                  {/* Phases List */}
                  {group.isExpanded && (
                    <div className="bg-background">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead>Phase</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Durée</TableHead>
                            <TableHead>Période</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.phases.map((phase) => (
                            <TableRow key={phase.id} className="hover:bg-muted/20 transition-smooth">
                              <TableCell className="font-medium">
                                <div className="font-medium text-foreground">
                                  {phase.nom}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {phase.id}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="max-w-xs truncate" title={phase.description}>
                                  {phase.description}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 text-sm">
                                  <Clock className="h-3 w-3" />
                                  {phase.dureePrevue} jour(s)
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div>{new Date(phase.dateDebut).toLocaleDateString()}</div>
                                  <div className="text-muted-foreground">
                                    au {new Date(phase.dateFin).toLocaleDateString()}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={statutVariants[phase.statut]}>
                                  {statutLabels[phase.statut]}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => openDialog("edit", phase)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => openDialog("delete", phase)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog d'ajout/modification */}
      <Dialog open={dialog?.type === "add" || dialog?.type === "edit"} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {dialog?.type === "add" ? "Ajouter une phase" : "Modifier la phase"}
            </DialogTitle>
            <DialogDescription>
              {dialog?.type === "add" 
                ? "Créez une nouvelle phase pour une tâche." 
                : "Modifiez les informations de la phase."
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="idTache">Tâche parente</Label>
              <Select 
                value={formData.idTache} 
                onValueChange={(value) => setFormData({ ...formData, idTache: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une tâche" />
                </SelectTrigger>
                <SelectContent>
                  {taches.map((tache) => (
                    <SelectItem key={tache.id} value={tache.id}>
                      {tache.id} - {tache.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="nom">Nom de la phase</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Ex: Phase 1 - Inspection"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description détaillée de la phase..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dureePrevue">Durée prévue (jours)</Label>
                <Input
                  id="dureePrevue"
                  type="number"
                  min="1"
                  value={formData.dureePrevue}
                  onChange={(e) => setFormData({ ...formData, dureePrevue: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="statut">Statut</Label>
                <Select 
                  value={formData.statut} 
                  onValueChange={(value: "En attente" | "En cours" | "Terminé") => 
                    setFormData({ ...formData, statut: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="En attente">En attente</SelectItem>
                    <SelectItem value="En cours">En cours</SelectItem>
                    <SelectItem value="Terminé">Terminé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dateDebut">Date de début</Label>
                <Input
                  id="dateDebut"
                  type="date"
                  value={formData.dateDebut}
                  onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dateFin">Date de fin</Label>
                <Input
                  id="dateFin"
                  type="date"
                  value={formData.dateFin}
                  onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {dialog?.type === "add" ? "Ajouter" : "Modifier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de suppression */}
      <AlertDialog open={dialog?.type === "delete"} onOpenChange={closeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Attention : Suppression en cascade</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <div>
                Cette action supprimera définitivement la phase{" "}
                <span className="font-semibold text-foreground">
                  {dialog?.phase?.nom}
                </span>.
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <span className="font-semibold">Conséquence importante :</span> 
                    {" "}Tous les rapports associés à cette phase seront également supprimés.
                  </div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Cette opération ne peut pas être annulée. Souhaitez-vous vraiment continuer ?
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSubmit}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
