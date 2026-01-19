'use client'

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  GitBranch,
  CheckCircle2,
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

const statutConfig = {
  "En attente": { className: "bg-warning/10 text-warning border-warning/20" },
  "En cours": { className: "bg-primary/10 text-primary border-primary/20" },
  "Terminé": { className: "bg-success/10 text-success border-success/20" }
};

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
    })).filter(group => group.phases.length > 0);
    
    setTaskGroups(grouped);
  }, [phases, taches]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const phasesRes = await fetch("/api/phases");
      if (!phasesRes.ok) throw new Error("Erreur lors du chargement des phases");
      const phasesData = await phasesRes.json();

      const tachesRes = await fetch("/api/taches");
      if (!tachesRes.ok) throw new Error("Erreur lors du chargement des tâches");
      const tachesData = await tachesRes.json();

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
    
    const tacheMatch = group.tache.description?.toLowerCase().includes(searchLower) || false;
    
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

  const getTacheStatutConfig = (statut: string) => {
    switch(statut) {
      case "En attente": return statutConfig["En attente"];
      case "En cours": return statutConfig["En cours"];
      case "Terminé": return statutConfig["Terminé"];
      default: return statutConfig["En attente"];
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Alerte */}
      {alert && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50 w-96 shadow-lg"
        >
          <Alert className={`border-l-4 ${
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
        </motion.div>
      )}

      {/* En-tête avec l'icône GitBranch */}
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow flex-shrink-0"
          >
            <GitBranch className="w-6 h-6 text-primary-foreground" />
          </motion.div>
          <div>
            <motion.div 
              className="flex items-center gap-3 mb-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="w-8 h-1.5 gradient-primary rounded-full" />
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Gestion</span>
            </motion.div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              Gestion des Phases
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Organisez et suivez les phases de vos tâches. Définissez les étapes clés, les durées et les statuts pour un suivi précis.
            </p>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button 
            className="gradient-primary text-primary-foreground shadow-glow hover:opacity-90 group"
            onClick={() => openDialog("add")}
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
            Nouvelle phase
          </Button>
        </motion.div>
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative max-w-md"
      >
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Rechercher par tâche ou phase..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
      </motion.div>

      {/* Task Groups */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-border/50 shadow-soft overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-4" />
                <p className="text-foreground font-medium">Chargement des phases...</p>
                <p className="text-sm text-muted-foreground mt-1">Veuillez patienter</p>
              </div>
            ) : filteredTaskGroups.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <GitBranch className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium text-foreground">Aucune phase trouvée</p>
                <p className="text-sm mt-1">Essayez de modifier vos critères de recherche</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {filteredTaskGroups.map((group, groupIndex) => (
                  <motion.div
                    key={group.tache.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: groupIndex * 0.05 }}
                    className="hover:bg-secondary/5 transition-colors"
                  >
                    {/* Task Header */}
                    <div 
                      className="p-6 cursor-pointer transition-all hover:bg-secondary/10"
                      onClick={() => toggleTaskGroup(group.tache.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            {group.isExpanded ? (
                              <ChevronDown className="h-5 w-5 text-muted-foreground mt-1" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-muted-foreground mt-1" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="font-mono text-sm font-medium bg-primary/10 text-primary px-2 py-0.5 rounded">
                                {group.tache.id}
                              </div>
                              <div className="font-semibold text-foreground text-lg">
                                {group.tache.description}
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                {new Date(group.tache.dateDebut).toLocaleDateString('fr-FR', { 
                                  day: 'numeric', 
                                  month: 'short',
                                  year: 'numeric'
                                })}
                                <span className="mx-1">→</span>
                                {new Date(group.tache.dateFin).toLocaleDateString('fr-FR', { 
                                  day: 'numeric', 
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                {group.phases.length} phase(s)
                              </span>
                              <Badge variant="outline" className="text-xs bg-success/5 border-success/20">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                {calculateProgression(group.phases)}% terminé
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={getTacheStatutConfig(group.tache.statut).className}>
                            {group.tache.statut}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Phases List */}
                    <motion.div
                      initial={false}
                      animate={{ 
                        height: group.isExpanded ? "auto" : 0,
                        opacity: group.isExpanded ? 1 : 0
                      }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <div className="rounded-lg border border-border/50 overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-secondary/20 hover:bg-secondary/20">
                                <TableHead className="text-foreground font-semibold">Phase</TableHead>
                                <TableHead className="text-foreground font-semibold">Description</TableHead>
                                <TableHead className="text-foreground font-semibold">Durée</TableHead>
                                <TableHead className="text-foreground font-semibold">Période</TableHead>
                                <TableHead className="text-foreground font-semibold">Statut</TableHead>
                                <TableHead className="text-right text-foreground font-semibold">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {group.phases.map((phase) => (
                                <TableRow 
                                  key={phase.id} 
                                  className="hover:bg-secondary/10 transition-colors border-border/30"
                                >
                                  <TableCell className="py-4">
                                    <div>
                                      <div className="font-medium text-foreground">{phase.nom}</div>
                                      <div className="text-xs text-muted-foreground font-mono mt-0.5">
                                        {phase.id}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-4">
                                    <div className="max-w-xs text-muted-foreground text-sm">
                                      {phase.description || "Aucune description"}
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-4">
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                      <Clock className="h-3.5 w-3.5" />
                                      {phase.dureePrevue} jour(s)
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-4">
                                    <div className="space-y-0.5">
                                      <div className="text-sm font-medium text-foreground">
                                        {new Date(phase.dateDebut).toLocaleDateString('fr-FR', { 
                                          day: 'numeric', 
                                          month: 'short' 
                                        })}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        au {new Date(phase.dateFin).toLocaleDateString('fr-FR', { 
                                          day: 'numeric', 
                                          month: 'short',
                                          year: 'numeric'
                                        })}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-4">
                                    <Badge 
                                      variant="outline" 
                                      className={`px-3 py-1 ${statutConfig[phase.statut]?.className || ""}`}
                                    >
                                      {phase.statut}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="py-4 text-right">
                                    <div className="flex justify-end gap-1">
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                                        onClick={() => openDialog("edit", phase)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
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
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialog d'ajout/modification */}
      <Dialog open={dialog?.type === "add" || dialog?.type === "edit"} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <GitBranch className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <DialogTitle className="text-foreground">
                  {dialog?.type === "add" ? "Nouvelle phase" : "Modifier la phase"}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {dialog?.type === "add" 
                    ? "Créez une nouvelle phase pour une tâche." 
                    : "Modifiez les informations de la phase."
                  }
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="idTache" className="text-foreground">Tâche parente</Label>
              <Select 
                value={formData.idTache} 
                onValueChange={(value) => setFormData({ ...formData, idTache: value })}
              >
                <SelectTrigger className="border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/10">
                  <SelectValue placeholder="Sélectionner une tâche" />
                </SelectTrigger>
                <SelectContent>
                  {taches.map((tache) => (
                    <SelectItem key={tache.id} value={tache.id}>
                      <div className="flex items-center gap-2">
                        <div className="font-mono text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                          {tache.id}
                        </div>
                        <span className="truncate">{tache.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="nom" className="text-foreground">Nom de la phase</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Ex: Phase 1 - Inspection"
                required
                className="border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="text-foreground">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description détaillée de la phase..."
                rows={3}
                className="border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dureePrevue" className="text-foreground">Durée prévue (jours)</Label>
                <Input
                  id="dureePrevue"
                  type="number"
                  min="1"
                  value={formData.dureePrevue}
                  onChange={(e) => setFormData({ ...formData, dureePrevue: parseInt(e.target.value) || 1 })}
                  className="border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="statut" className="text-foreground">Statut</Label>
                <Select 
                  value={formData.statut} 
                  onValueChange={(value: "En attente" | "En cours" | "Terminé") => 
                    setFormData({ ...formData, statut: value })
                  }
                >
                  <SelectTrigger className="border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/10">
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
                <Label htmlFor="dateDebut" className="text-foreground">Date de début</Label>
                <Input
                  id="dateDebut"
                  type="date"
                  value={formData.dateDebut}
                  onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                  className="border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dateFin" className="text-foreground">Date de fin</Label>
                <Input
                  id="dateFin"
                  type="date"
                  value={formData.dateFin}
                  onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                  className="border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={closeDialog} 
              className="border-border/50 hover:bg-secondary/50"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit}
              className="gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
            >
              {dialog?.type === "add" ? "Ajouter la phase" : "Modifier la phase"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de suppression */}
      <AlertDialog open={dialog?.type === "delete"} onOpenChange={closeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </div>
              <div>
                <AlertDialogTitle className="text-foreground">Attention : Suppression en cascade</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground space-y-3">
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

                  <div className="text-sm">
                    Cette opération ne peut pas être annulée. Souhaitez-vous vraiment continuer ?
                  </div>
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/50 hover:bg-secondary/50">Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSubmit}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-none"
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