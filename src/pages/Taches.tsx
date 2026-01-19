'use client'

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, type Task, type Phase } from "@/hooks/useTasks";
import { useBrigades, type Brigade } from "@/hooks/useBrigades";
import { useEquipes, type Equipe } from "@/hooks/useEquipes";
import { useMateriels, type Materiel } from "@/hooks/useMateriels";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import dynamic from "next/dynamic";

// Charger MapPicker uniquement côté client pour éviter les problèmes d'hydratation
const MapPicker = dynamic(() => import("@/components/ui/MapPicker").then(mod => ({ default: mod.MapPicker })), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-lg border border-border/50 bg-secondary/20 flex items-center justify-center" style={{ height: '350px' }}>
      <div className="text-center">
        <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-pulse" />
        <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
      </div>
    </div>
  )
});
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Search,
  Calendar,
  Clock,
  PlayCircle,
  PauseCircle,
  CheckCircle2,
  Users,
  Filter,
  Target,
  Layers,
  ChevronLeft,
  ChevronRight,
  Package,
  User,
  Wrench,
  AlertTriangle,
  MapPin
} from "lucide-react";

// Configuration des statuts
const statusConfig = {
  pending: { label: "En attente", icon: Clock, className: "bg-warning/10 text-warning border-warning/20" },
  paused: { label: "En pause", icon: PauseCircle, className: "bg-muted text-muted-foreground border-border" },
  progress: { label: "En cours", icon: PlayCircle, className: "bg-primary/10 text-primary border-primary/20" },
  completed: { label: "Terminé", icon: CheckCircle2, className: "bg-success/10 text-success border-success/20" }
};

const statusIcons = {
  pending: Clock,
  paused: PauseCircle,
  progress: PlayCircle,
  completed: CheckCircle2
};

const ITEMS_PER_PAGE = 6;

interface TaskFormProps {
  task?: Task;
  brigades: Brigade[];
  equipes: Equipe[];
  materiels: Materiel[];
  selectedBrigade: string;
  onBrigadeChange: (brigadeId: string) => void;
  onSubmit: (data: Omit<Task, "id">) => void;
  onCancel: () => void;
}

export default function Taches() {
  // React Query hooks
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: brigades = [], isLoading: brigadesLoading } = useBrigades();
  const { data: materiels = [], isLoading: materielsLoading } = useMateriels();
  
  // États locaux
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; taskId: string | null }>({ open: false, taskId: null });
  const [selectedBrigade, setSelectedBrigade] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  // Charger les équipes uniquement si une brigade est sélectionnée
  const { data: equipes = [] } = useEquipes(selectedBrigade || undefined);

  // Mutations React Query
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  // Calcul des données filtrées
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.nom_brigade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.nom_equipe?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const stats = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter(t => t.status === "pending").length,
    progress: tasks.filter(t => t.status === "progress").length,
    completed: tasks.filter(t => t.status === "completed").length,
    tauxCompletion: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === "completed").length / tasks.length) * 100) : 0
  }), [tasks]);

  const getPhaseProgress = (phases: Phase[]) => {
    const total = phases.length;
    const completed = phases.filter(p => p.statut === "Terminé").length;
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const loading = tasksLoading || brigadesLoading || materielsLoading;

  // Gestion des alertes
  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  // Handlers
  const handleAddTask = async (data: Omit<Task, "id">) => {
    try {
      await createTaskMutation.mutateAsync(data);
      setIsAddDialogOpen(false);
      setSelectedBrigade("");
      showAlert("success", "Tâche ajoutée avec succès");
      setCurrentPage(1);
    } catch (error) {
      showAlert("error", "Erreur lors de l'ajout de la tâche");
    }
  };

  const handleEditTask = async (data: Omit<Task, "id">) => {
    if (!editingTask) return;

    try {
      await updateTaskMutation.mutateAsync({ id: editingTask.id, ...data });
      setEditingTask(null);
      showAlert("success", "Tâche modifiée avec succès");
    } catch (error) {
      showAlert("error", "Erreur lors de la modification de la tâche");
    }
  };

  const handleDeleteTask = async () => {
    if (!deleteDialog.taskId) return;

    try {
      await deleteTaskMutation.mutateAsync(deleteDialog.taskId);
      setDeleteDialog({ open: false, taskId: null });
      showAlert("success", "Tâche supprimée avec succès");
    } catch (error) {
      showAlert("error", "Erreur lors de la suppression de la tâche");
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Calcul des tâches en cours
  const tasksInProgress = tasks.filter(t => t.status === "progress");

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

      {/* En-tête */}
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow flex-shrink-0"
          >
            <Layers className="w-6 h-6 text-primary-foreground" />
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
              Gestion des Tâches
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Organisez et suivez l'avancement des travaux par brigade
            </p>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground shadow-glow hover:opacity-90 group">
                <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
                Nouvelle tâche
              </Button>
            </DialogTrigger>
            <TaskForm 
              brigades={brigades}
              equipes={equipes}
              materiels={materiels}
              selectedBrigade={selectedBrigade}
              onBrigadeChange={setSelectedBrigade}
              onSubmit={handleAddTask}
              onCancel={() => {
                setIsAddDialogOpen(false);
                setSelectedBrigade("");
              }}
            />
          </Dialog>
        </motion.div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { 
            label: "Total", 
            value: stats.total, 
            icon: Target, 
            className: "bg-secondary/50 border-border/50",
            color: "text-foreground"
          },
          { 
            label: "En attente", 
            value: stats.pending, 
            icon: Clock, 
            className: "bg-warning/10 border-warning/20",
            color: "text-warning"
          },
          { 
            label: "En cours", 
            value: stats.progress, 
            icon: PlayCircle, 
            className: "bg-primary/10 border-primary/20",
            color: "text-primary"
          },
          { 
            label: "Terminées", 
            value: stats.completed, 
            icon: CheckCircle2, 
            className: "bg-success/10 border-success/20",
            color: "text-success"
          },
          { 
            label: "Taux de complétion", 
            value: `${stats.tauxCompletion}%`, 
            icon: Target, 
            className: "bg-accent/10 border-accent/20",
            color: "text-accent"
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
          >
            <Card className={`border ${stat.className}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filtres */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher par titre, brigade ou équipe..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="pl-10 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select 
              value={statusFilter} 
              onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
            >
              <SelectTrigger className="w-40 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/10">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="progress">En cours</SelectItem>
                <SelectItem value="paused">En pause</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Table des tâches */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="border-border/50 shadow-soft">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-4" />
                <p className="text-foreground font-medium">Chargement des tâches...</p>
                <p className="text-sm text-muted-foreground mt-1">Veuillez patienter</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50 border-b border-border/50 hover:bg-secondary/50">
                      <TableHead className="font-semibold text-foreground">ID</TableHead>
                      <TableHead className="font-semibold text-foreground">Titre</TableHead>
                      <TableHead className="font-semibold text-foreground">Brigade / Équipe</TableHead>
                      <TableHead className="font-semibold text-foreground">Période</TableHead>
                      <TableHead className="font-semibold text-foreground">Phases</TableHead>
                      <TableHead className="font-semibold text-foreground">Matériels</TableHead>
                      <TableHead className="font-semibold text-foreground">Statut</TableHead>
                      <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {paginatedTasks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground py-16">
                            <Layers className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p className="text-lg font-medium text-foreground">Aucune tâche trouvée</p>
                            <p className="text-sm">Modifiez votre recherche ou créez une nouvelle tâche</p>
                          </TableCell>
                        </TableRow>
                      ) : paginatedTasks.map((task, index) => {
                        const StatusIcon = statusConfig[task.status].icon;
                        const progress = getPhaseProgress(task.phases);
                        
                        return (
                          <motion.tr
                            key={task.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: index * 0.03 }}
                            className="border-b border-border/30 hover:bg-secondary/30 transition-colors"
                          >
                            <TableCell className="font-mono text-sm text-muted-foreground">#{task.id}</TableCell>
                            <TableCell>
                              <div className="font-medium text-foreground max-w-xs">{task.title}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <Users className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium text-foreground text-sm">{task.nom_brigade || "Brigade"}</p>
                                  <p className="text-xs text-muted-foreground">{task.nom_equipe || "Équipe"}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-foreground">{new Date(task.dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                                  <p className="text-muted-foreground text-xs">→ {new Date(task.dateFin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-sm">
                                  <Target className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span className="text-muted-foreground">{task.phases.filter(p => p.statut === "Terminé").length}/{task.phases.length}</span>
                                </div>
                                <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
                                  <motion.div 
                                    className="h-full gradient-primary rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                  />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                                  <Package className="h-4 w-4 text-accent" />
                                </div>
                                <span className="text-sm font-medium text-foreground">{task.materiels.length}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`${statusConfig[task.status].className} border`}>
                                <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
                                {statusConfig[task.status].label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => setEditingTask(task)}
                                      className="h-8 w-8 hover:bg-info/10 hover:text-info"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <TaskForm 
                                    task={task}
                                    brigades={brigades}
                                    equipes={equipes}
                                    materiels={materiels}
                                    selectedBrigade={task.id_brigade}
                                    onBrigadeChange={setSelectedBrigade}
                                    onSubmit={handleEditTask}
                                    onCancel={() => setEditingTask(null)}
                                  />
                                </Dialog>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => setDeleteDialog({ open: true, taskId: task.id })}
                                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between"
        >
          <p className="text-sm text-muted-foreground">
            Affichage de {(currentPage - 1) * ITEMS_PER_PAGE + 1} à {Math.min(currentPage * ITEMS_PER_PAGE, filteredTasks.length)} sur {filteredTasks.length} tâches
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-primary/10"}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => handlePageChange(page)}
                    isActive={currentPage === page}
                    className={`cursor-pointer ${currentPage === page ? "gradient-primary text-primary-foreground" : "hover:bg-primary/10"}`}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-primary/10"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </motion.div>
      )}

      {/* Dialog de suppression */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, taskId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </div>
              <div>
                <AlertDialogTitle className="text-foreground">Êtes-vous sûr ?</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  Cette action supprimera définitivement la tâche et toutes ses phases.
                  Cette action ne peut pas être annulée.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/50 hover:bg-secondary/50">Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTask}
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

// FORMULAIRE DES TÂCHES
function TaskForm({ task, brigades, equipes, materiels, selectedBrigade, onBrigadeChange, onSubmit, onCancel }: TaskFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Omit<Task, "id"> & { location?: { latitude: number | null; longitude: number | null; label: string } }>({
    title: task?.title || "",
    id_brigade: task?.id_brigade || "",
    id_equipe: task?.id_equipe || "",
    materiels: task?.materiels || [],
    dateDebut: task?.dateDebut || "",
    dateFin: task?.dateFin || "",
    dateFinReel: task?.dateFinReel || "",
    status: task?.status || "pending",
    phases: task?.phases || [
      { nom: "Phase 1", description: "", dureePrevue: 1, dateDebut: "", dateFin: "", statut: "En attente" }
    ],
    location: (task as any)?.location || { latitude: null, longitude: null, label: "" }
  });

  const [selectedMateriels, setSelectedMateriels] = useState<{ [key: string]: number }>(
    task?.materiels.reduce((acc, mat) => ({ ...acc, [mat.nom]: mat.quantite }), {}) || {}
  );

  const steps = [
    { number: 1, title: "Informations", icon: Clock },
    { number: 2, title: "Brigade & Équipe", icon: User },
    { number: 3, title: "Localisation", icon: MapPin },
    { number: 4, title: "Matériels", icon: Package },
    { number: 5, title: "Phases", icon: Layers }
  ];

  const handleFinalSubmit = () => {
    if (!validateForm()) return;
    
    const finalData: Omit<Task, "id"> = {
      ...formData,
      materiels: Object.entries(selectedMateriels).map(([nom, quantite]) => ({ nom, quantite })),
      dateFinReel: formData.status === "completed" && !formData.dateFinReel ? undefined : formData.dateFinReel
    };
    
    onSubmit(finalData);
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      alert("Veuillez remplir le titre de la tâche");
      setCurrentStep(1);
      return false;
    }
    
    if (!formData.dateDebut || !formData.dateFin) {
      alert("Veuillez remplir les dates de début et fin");
      setCurrentStep(1);
      return false;
    }
    
    if (!formData.id_brigade || !formData.id_equipe) {
      alert("Veuillez sélectionner une brigade et une équipe");
      setCurrentStep(2);
      return false;
    }
    
    if (!formData.location || formData.location.latitude === null || formData.location.longitude === null) {
      alert("Veuillez définir l'emplacement du travail en cliquant sur la carte");
      setCurrentStep(3);
      return false;
    }
    
    for (let i = 0; i < formData.phases.length; i++) {
      const phase = formData.phases[i];
      if (!phase.nom.trim() || !phase.dateDebut || !phase.dateFin) {
        alert(`Veuillez remplir toutes les informations de la phase ${i + 1}`);
        setCurrentStep(5);
        return false;
      }
    }
    
    return true;
  };

  const addPhase = () => {
    setFormData({
      ...formData,
      phases: [
        ...formData.phases,
        { 
          nom: `Phase ${formData.phases.length + 1}`, 
          description: "", 
          dureePrevue: 1, 
          dateDebut: "", 
          dateFin: "", 
          statut: "En attente" 
        }
      ]
    });
  };

  const removePhase = (index: number) => {
    if (formData.phases.length <= 1) return;
    setFormData({
      ...formData,
      phases: formData.phases.filter((_, i) => i !== index)
    });
  };

  const updatePhase = (index: number, field: string, value: any) => {
    const updatedPhases = formData.phases.map((phase, i) =>
      i === index ? { ...phase, [field]: value } : phase
    );
    setFormData({ ...formData, phases: updatedPhases });
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const StatusIcon = statusIcons[formData.status];

  const filteredEquipes = equipes.filter(equipe => 
    equipe.id_brigade.toString() === selectedBrigade
  );

  return (
    <DialogContent className="sm:max-w-[700px]">
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Layers className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <DialogTitle className="text-foreground">
              {task ? "Modifier la tâche" : "Nouvelle tâche"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {task ? "Modifiez les informations de la tâche" : "Créez une nouvelle tâche en 5 étapes"}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {/* Steps Indicator */}
      <div className="flex items-center justify-between mb-6">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          
          return (
            <div key={step.number} className="flex flex-col items-center relative flex-1">
              <div className="flex items-center">
                {/* Connector line */}
                {index > 0 && (
                  <div 
                    className={`h-0.5 flex-1 mr-2 ${
                      isCompleted || isActive ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                )}
                
                {/* Step circle */}
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  isActive 
                    ? 'border-primary bg-primary text-primary-foreground' 
                    : isCompleted 
                      ? 'border-primary bg-primary text-primary-foreground' 
                      : 'border-border bg-background text-muted-foreground'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <StepIcon className="h-4 w-4" />
                  )}
                </div>
                
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div 
                    className={`h-0.5 flex-1 ml-2 ${
                      isCompleted ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                )}
              </div>
              <span className={`text-xs font-medium mt-2 ${
                isActive || isCompleted ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step 1: Informations de base */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground">Titre de la tâche *</Label>
              <Input
                id="title"
                placeholder="Ex: Réparation de la voie principale"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status" className="text-foreground">Statut</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "pending" | "paused" | "progress" | "completed") => 
                  setFormData({...formData, status: value})
                }
              >
                <SelectTrigger className="border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/10">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <StatusIcon className="h-4 w-4" />
                      {statusConfig[formData.status].label}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([value, config]) => {
                    const Icon = config.icon;
                    return (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {config.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateDebut" className="text-foreground">Date de début *</Label>
              <Input
                id="dateDebut"
                type="date"
                value={formData.dateDebut}
                onChange={(e) => setFormData({...formData, dateDebut: e.target.value})}
                className="border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateFin" className="text-foreground">Date de fin prévue *</Label>
              <Input
                id="dateFin"
                type="date"
                value={formData.dateFin}
                onChange={(e) => setFormData({...formData, dateFin: e.target.value})}
                className="border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateFinReel" className="text-foreground">Date de fin réelle</Label>
              <Input
                id="dateFinReel"
                type="date"
                value={formData.dateFinReel || ""}
                onChange={(e) => setFormData({...formData, dateFinReel: e.target.value})}
                className="border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Brigade & Équipe */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brigade" className="text-foreground">Brigade *</Label>
              <Select
                value={selectedBrigade}
                onValueChange={(value) => {
                  onBrigadeChange(value);
                  setFormData({...formData, id_brigade: value, id_equipe: ""});
                }}
              >
                <SelectTrigger className="border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/10">
                  <SelectValue placeholder="Sélectionnez une brigade" />
                </SelectTrigger>
                <SelectContent>
                  {brigades.map((brigade) => (
                    <SelectItem key={brigade.id_brigade} value={brigade.id_brigade.toString()}>
                      {brigade.nom_brigade} - {brigade.lieu}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="equipe" className="text-foreground">Équipe *</Label>
              <Select
                value={formData.id_equipe}
                onValueChange={(value) => setFormData({...formData, id_equipe: value})}
                disabled={!selectedBrigade}
              >
                <SelectTrigger className="border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/10">
                  <SelectValue placeholder={selectedBrigade ? "Sélectionnez une équipe" : "Sélectionnez d'abord une brigade"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredEquipes.map((equipe) => (
                    <SelectItem key={equipe.id_equipe} value={equipe.id_equipe.toString()}>
                      {equipe.nom_equipe} - {equipe.specialite}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {selectedBrigade && filteredEquipes.length > 0 && (
            <div className="rounded-lg border border-border/50 p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Équipes disponibles</h4>
                  <p className="text-sm text-muted-foreground">
                    {filteredEquipes.length} équipe(s) dans cette brigade
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Localisation */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-foreground mb-3 block">Emplacement du travail *</Label>
              <MapPicker
                key={`map-${currentStep}`}
                latitude={formData.location?.latitude || null}
                longitude={formData.location?.longitude || null}
                onLocationChange={(lat, lng) => {
                  setFormData({
                    ...formData,
                    location: {
                      latitude: lat,
                      longitude: lng,
                      label: formData.location?.label || ""
                    }
                  });
                }}
                height="350px"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="locationLabel" className="text-foreground">
                Description du lieu (optionnel)
              </Label>
              <Input
                id="locationLabel"
                placeholder="Ex: Gare centrale, PK 45+200, Voie 3..."
                value={formData.location?.label || ""}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    location: {
                      latitude: formData.location?.latitude || null,
                      longitude: formData.location?.longitude || null,
                      label: e.target.value
                    }
                  });
                }}
                className="border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
              <p className="text-xs text-muted-foreground">
                Ajoutez des repères pour faciliter l'identification du lieu (gare, PK, voie, etc.)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Matériels */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-foreground">Matériels nécessaires</Label>
              <span className="text-sm text-muted-foreground">
                {Object.keys(selectedMateriels).length} matériel(s) sélectionné(s)
              </span>
            </div>
            
            <div className="border border-border/50 rounded-lg divide-y divide-border/50 max-h-[300px] overflow-y-auto">
              {materiels.map((materiel) => (
                <div key={materiel.id} className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedMateriels.hasOwnProperty(materiel.nom)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedMateriels(prev => ({
                            ...prev,
                            [materiel.nom]: 1
                          }));
                        } else {
                          const newSelection = { ...selectedMateriels };
                          delete newSelection[materiel.nom];
                          setSelectedMateriels(newSelection);
                        }
                      }}
                      className="border-border"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{materiel.nom}</span>
                        <Badge variant="outline" className="text-xs">
                          {materiel.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Disponible: {materiel.disponible ? "Oui" : "Non"} • Stock: {materiel.quantite}
                      </p>
                    </div>
                  </div>
                  
                  {selectedMateriels.hasOwnProperty(materiel.nom) && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (selectedMateriels[materiel.nom] > 1) {
                            setSelectedMateriels(prev => ({
                              ...prev,
                              [materiel.nom]: prev[materiel.nom] - 1
                            }));
                          }
                        }}
                        className="border-border/50 hover:bg-secondary"
                      >
                        -
                      </Button>
                      <span className="w-8 text-center font-medium text-foreground">
                        {selectedMateriels[materiel.nom]}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (selectedMateriels[materiel.nom] < materiel.quantite) {
                            setSelectedMateriels(prev => ({
                              ...prev,
                              [materiel.nom]: prev[materiel.nom] + 1
                            }));
                          }
                        }}
                        className="border-border/50 hover:bg-secondary"
                      >
                        +
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              
              {materiels.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun matériel disponible</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Phases */}
      {currentStep === 5 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label className="text-foreground">Phases de la tâche</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPhase}
              className="border-border/50 hover:bg-secondary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une phase
            </Button>
          </div>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {formData.phases.map((phase, index) => (
              <Card key={index} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="font-bold text-primary">{index + 1}</span>
                      </div>
                      <div className="space-y-1">
                        <Input
                          placeholder="Nom de la phase"
                          value={phase.nom}
                          onChange={(e) => updatePhase(index, "nom", e.target.value)}
                          className="font-semibold border-none p-0 h-auto text-base focus:ring-0"
                        />
                        <Textarea
                          placeholder="Description"
                          value={phase.description}
                          onChange={(e) => updatePhase(index, "description", e.target.value)}
                          className="min-h-[60px] text-sm border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/10"
                        />
                      </div>
                    </div>
                    
                    {formData.phases.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePhase(index)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Durée prévue (jours)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={phase.dureePrevue}
                        onChange={(e) => updatePhase(index, "dureePrevue", parseInt(e.target.value) || 1)}
                        className="border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Date début</Label>
                      <Input
                        type="date"
                        value={phase.dateDebut}
                        onChange={(e) => updatePhase(index, "dateDebut", e.target.value)}
                        className="border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Date fin</Label>
                      <Input
                        type="date"
                        value={phase.dateFin}
                        onChange={(e) => updatePhase(index, "dateFin", e.target.value)}
                        className="border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Statut</Label>
                      <Select
                        value={phase.statut}
                        onValueChange={(value: "En attente" | "En cours" | "Terminé") => 
                          updatePhase(index, "statut", value)
                        }
                      >
                        <SelectTrigger className="text-xs border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/10">
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
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <DialogFooter className="flex justify-between items-center mt-8">
        <div className="flex items-center gap-2">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              className="border-border/50 hover:bg-secondary"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Précédent
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-border/50 hover:bg-secondary"
          >
            Annuler
          </Button>
          
          {currentStep < 5 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleFinalSubmit}
              className="gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
            >
              {task ? "Modifier la tâche" : "Créer la tâche"}
            </Button>
          )}
        </div>
      </DialogFooter>
    </DialogContent>
  );
}