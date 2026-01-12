import { useState, useEffect } from "react";
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
  Eye, 
  Edit, 
  Trash2, 
  Search,
  Calendar,
  Package,
  User,
  Wrench,
  CheckCircle2,
  Clock,
  PlayCircle,
  PauseCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Target,
  Layers,
  TrendingUp,
  Activity
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

// Interfaces
interface Brigade {
  id_brigade: number;
  nom_brigade: string;
  lieu: string;
}

interface Equipe {
  id_equipe: number;
  nom_equipe: string;
  specialite: string;
  id_brigade: number;
}

interface Phase {
  id?: string;
  nom: string;
  description: string;
  dureePrevue: number;
  dateDebut: string;
  dateFin: string;
  statut: "En attente" | "En cours" | "Terminé";
}

interface Materiel {
  id: string;
  nom: string;
  type: string;
  disponible: boolean;
  quantite: number;
}

interface Task {
  id: string;
  title: string;
  id_brigade: string;
  id_equipe: string;
  nom_brigade?: string;
  nom_equipe?: string;
  materiels: { nom: string; quantite: number }[];
  dateDebut: string;
  dateFin: string;
  dateFinReel?: string;
  status: "pending" | "paused" | "progress" | "completed";
  phases: Phase[];
}

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

const statusLabels = {
  pending: "En attente",
  paused: "En pause", 
  progress: "En cours",
  completed: "Terminé"
};

const statusColors = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  paused: "bg-slate-50 text-slate-700 border-slate-200",
  progress: "bg-blue-50 text-blue-700 border-blue-200", 
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200"
} as const;

const statusIcons = {
  pending: Clock,
  paused: PauseCircle,
  progress: PlayCircle,
  completed: CheckCircle2
};

export default function Taches() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [brigades, setBrigades] = useState<Brigade[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [materiels, setMateriels] = useState<Materiel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; taskId: string | null }>({ open: false, taskId: null });
  const [selectedBrigade, setSelectedBrigade] = useState<string>("");

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.nom_equipe?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.nom_brigade?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === "pending").length,
    progress: tasks.filter(t => t.status === "progress").length,
    completed: tasks.filter(t => t.status === "completed").length,
    tauxCompletion: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === "completed").length / tasks.length) * 100) : 0
  };

  const getPhaseProgress = (phases: Phase[]) => {
    const total = phases.length;
    const completed = phases.filter(p => p.statut === "Terminé").length;
    const inProgress = phases.filter(p => p.statut === "En cours").length;
    
    return {
      currentPhase: inProgress > 0 ? phases.findIndex(p => p.statut === "En cours") + 1 : completed + 1,
      totalPhases: total,
      progress: total > 0 ? (completed / total) * 100 : 0
    };
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedBrigade) {
      fetchEquipesByBrigade(selectedBrigade);
    } else {
      setEquipes([]);
    }
  }, [selectedBrigade]);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [tasksRes, brigadesRes, equipesRes, materielsRes] = await Promise.all([
        fetch("/api/taches"),
        fetch("/api/brigades"),
        fetch("/api/equipes"),
        fetch("/api/materiels")
      ]);

      if (!tasksRes.ok) throw new Error("Erreur lors du chargement des tâches");
      
      const tasksData = await tasksRes.json();
      const brigadesData = brigadesRes.ok ? await brigadesRes.json() : [];
      const equipesData = equipesRes.ok ? await equipesRes.json() : [];
      const materielsData = materielsRes.ok ? await materielsRes.json() : [];

      setTasks(tasksData);
      setBrigades(brigadesData);
      setEquipes(equipesData);
      setMateriels(materielsData);

    } catch (error) {
      console.error("Erreur:", error);
      showAlert("error", "Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipesByBrigade = async (brigadeId: string) => {
    try {
      const res = await fetch(`/api/equipes?brigade=${brigadeId}`);
      if (res.ok) {
        const equipesData = await res.json();
        setEquipes(equipesData);
      }
    } catch (error) {
      console.error("Erreur chargement équipes:", error);
    }
  };

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
  };

  const handleAddTask = async (data: Omit<Task, "id">) => {
    try {
      const res = await fetch("/api/taches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error("Erreur lors de l'ajout");
      
      const newTask = await res.json();
      setTasks(prev => [...prev, newTask]);
      setIsAddDialogOpen(false);
      setSelectedBrigade("");
      showAlert("success", "Tâche ajoutée avec succès");
    } catch (error) {
      showAlert("error", "Erreur lors de l'ajout de la tâche");
    }
  };

  const handleEditTask = async (data: Omit<Task, "id">) => {
    if (!editingTask) return;

    try {
      const res = await fetch("/api/taches", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingTask.id, ...data })
      });

      if (!res.ok) throw new Error("Erreur lors de la modification");
      
      const updatedTask = await res.json();
      setTasks(prev => prev.map(task => 
        task.id === editingTask.id ? updatedTask : task
      ));
      setEditingTask(null);
      showAlert("success", "Tâche modifiée avec succès");
    } catch (error) {
      showAlert("error", "Erreur lors de la modification de la tâche");
    }
  };

  const handleDeleteTask = async () => {
    if (!deleteDialog.taskId) return;

    try {
      const res = await fetch(`/api/taches?id=${deleteDialog.taskId}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Erreur lors de la suppression");
      
      setTasks(prev => prev.filter(task => task.id !== deleteDialog.taskId));
      setDeleteDialog({ open: false, taskId: null });
      showAlert("success", "Tâche supprimée avec succès");
    } catch (error) {
      showAlert("error", "Erreur lors de la suppression de la tâche");
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert */}
      {alert && (
        <Alert className={`fixed top-20 right-6 z-50 w-96 shadow-xl border-l-4 animate-in slide-in-from-top-2 ${
          alert.type === "success" 
            ? "border-emerald-500 bg-emerald-50" 
            : "border-red-500 bg-red-50"
        }`}>
          <AlertDescription className={`font-medium ${
            alert.type === "success" ? "text-emerald-800" : "text-red-800"
          }`}>
            {alert.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestion des Tâches</h1>
            <p className="text-slate-500 mt-1 font-normal">
              Organisez et suivez l'avancement des travaux par brigade
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
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
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border-slate-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                  <Target className="h-6 w-6 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-md transition-shadow bg-amber-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-amber-700 uppercase tracking-wide">En attente</p>
                  <p className="text-2xl font-bold text-amber-900 mt-1">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 hover:shadow-md transition-shadow bg-blue-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">En cours</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">{stats.progress}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <PlayCircle className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 hover:shadow-md transition-shadow bg-emerald-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide">Terminées</p>
                  <p className="text-2xl font-bold text-emerald-900 mt-1">{stats.completed}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 hover:shadow-md transition-shadow bg-purple-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">Taux de complétion</p>
                  <p className="text-2xl font-bold text-purple-900 mt-1">{stats.tauxCompletion}%</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          placeholder="Rechercher par titre, brigade ou équipe..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {/* Tasks Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <Activity className="h-8 w-8 animate-spin mx-auto mb-3 text-blue-600" />
              <p className="text-slate-500 font-medium">Chargement des tâches...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 border-b border-slate-200">
                    <TableHead className="font-semibold text-slate-700">ID</TableHead>
                    <TableHead className="font-semibold text-slate-700">Titre</TableHead>
                    <TableHead className="font-semibold text-slate-700">Brigade</TableHead>
                    <TableHead className="font-semibold text-slate-700">Équipe</TableHead>
                    <TableHead className="font-semibold text-slate-700">Matériels</TableHead>
                    <TableHead className="font-semibold text-slate-700">Dates</TableHead>
                    <TableHead className="font-semibold text-slate-700">Progression</TableHead>
                    <TableHead className="font-semibold text-slate-700">Statut</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12">
                        <Package className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                        <p className="text-slate-500 font-medium">Aucune tâche trouvée</p>
                        <p className="text-sm text-slate-400 mt-1">Créez votre première tâche pour commencer</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredTasks.map((task) => {
                    const progress = getPhaseProgress(task.phases);
                    const StatusIcon = statusIcons[task.status];
                    
                    return (
                      <TableRow key={task.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100">
                        <TableCell className="font-mono font-semibold text-slate-900">#{task.id}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="font-medium text-slate-900">{task.title}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
                            {task.nom_brigade || "Brigade"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
                            {task.nom_equipe || "Équipe"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center">
                              <Package className="h-4 w-4 text-slate-600" />
                            </div>
                            <span className="text-sm font-semibold text-slate-700">{task.materiels.length}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(task.dateDebut).toLocaleDateString('fr-FR')}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              au {new Date(task.dateFin).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 max-w-[100px]">
                              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                                  style={{ width: `${progress.progress}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-slate-700 min-w-[60px]">
                              {progress.currentPhase}/{progress.totalPhases}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${statusColors[task.status]} font-medium`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusLabels[task.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setEditingTask(task)}
                                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
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
                              size="sm"
                              onClick={() => setDeleteDialog({ open: true, taskId: task.id })}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de suppression */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, taskId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement la tâche. 
              Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTask}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// FORMULAIRE SPECTACULAIRE
function TaskForm({ task, brigades, equipes, materiels, selectedBrigade, onBrigadeChange, onSubmit, onCancel }: TaskFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Omit<Task, "id">>({
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
    ]
  });

  const [selectedMateriels, setSelectedMateriels] = useState<{ [key: string]: number }>(
    task?.materiels.reduce((acc, mat) => ({ ...acc, [mat.nom]: mat.quantite }), {}) || {}
  );

  const steps = [
    { number: 1, title: "Informations", icon: Clock },
    { number: 2, title: "Brigade & Équipe", icon: User },
    { number: 3, title: "Matériels", icon: Package },
    { number: 4, title: "Phases", icon: Layers }
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
    
    for (let i = 0; i < formData.phases.length; i++) {
      const phase = formData.phases[i];
      if (!phase.nom.trim() || !phase.dateDebut || !phase.dateFin) {
        alert(`Veuillez remplir toutes les informations de la phase ${i + 1}`);
        setCurrentStep(4);
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
    if (currentStep < 4) setCurrentStep(currentStep + 1);
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
        <DialogTitle className="text-2xl font-bold text-slate-900">
          {task ? "Modifier la tâche" : "Nouvelle tâche"}
        </DialogTitle>
        <DialogDescription className="text-slate-600">
          {task ? "Modifiez les informations de la tâche" : "Créez une nouvelle tâche en 4 étapes"}
        </DialogDescription>
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
                      isCompleted || isActive ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  />
                )}
                
                {/* Step circle */}
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  isActive 
                    ? 'border-blue-600 bg-blue-600 text-white' 
                    : isCompleted 
                      ? 'border-blue-600 bg-blue-600 text-white' 
                      : 'border-slate-200 bg-white text-slate-400'
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
                      isCompleted ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
              <span className={`text-xs font-medium mt-2 ${
                isActive || isCompleted ? 'text-blue-600' : 'text-slate-500'
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
              <Label htmlFor="title">Titre de la tâche *</Label>
              <Input
                id="title"
                placeholder="Ex: Réparation de la voie principale"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "pending" | "paused" | "progress" | "completed") => 
                  setFormData({...formData, status: value})
                }
              >
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <StatusIcon className="h-4 w-4" />
                      {statusLabels[formData.status]}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([value, label]) => {
                    const Icon = statusIcons[value as keyof typeof statusIcons];
                    return (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {label}
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
              <Label htmlFor="dateDebut">Date de début *</Label>
              <Input
                id="dateDebut"
                type="date"
                value={formData.dateDebut}
                onChange={(e) => setFormData({...formData, dateDebut: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateFin">Date de fin prévue *</Label>
              <Input
                id="dateFin"
                type="date"
                value={formData.dateFin}
                onChange={(e) => setFormData({...formData, dateFin: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateFinReel">Date de fin réelle</Label>
              <Input
                id="dateFinReel"
                type="date"
                value={formData.dateFinReel || ""}
                onChange={(e) => setFormData({...formData, dateFinReel: e.target.value})}
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
              <Label htmlFor="brigade">Brigade *</Label>
              <Select
                value={selectedBrigade}
                onValueChange={(value) => {
                  onBrigadeChange(value);
                  setFormData({...formData, id_brigade: value, id_equipe: ""});
                }}
              >
                <SelectTrigger>
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
              <Label htmlFor="equipe">Équipe *</Label>
              <Select
                value={formData.id_equipe}
                onValueChange={(value) => setFormData({...formData, id_equipe: value})}
                disabled={!selectedBrigade}
              >
                <SelectTrigger>
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
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Équipes disponibles</h4>
                  <p className="text-sm text-slate-500">
                    {filteredEquipes.length} équipe(s) dans cette brigade
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Matériels */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Matériels nécessaires</Label>
              <span className="text-sm text-slate-500">
                {Object.keys(selectedMateriels).length} matériel(s) sélectionné(s)
              </span>
            </div>
            
            <div className="border border-slate-200 rounded-lg divide-y max-h-[300px] overflow-y-auto">
              {materiels.map((materiel) => (
                <div key={materiel.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
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
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-slate-400" />
                        <span className="font-medium text-slate-900">{materiel.nom}</span>
                        <Badge variant="outline" className="text-xs">
                          {materiel.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">
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
                      >
                        -
                      </Button>
                      <span className="w-8 text-center font-medium">
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
                      >
                        +
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              
              {materiels.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Package className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p>Aucun matériel disponible</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Phases */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label>Phases de la tâche</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPhase}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une phase
            </Button>
          </div>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {formData.phases.map((phase, index) => (
              <Card key={index} className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <div className="space-y-1">
                        <Input
                          placeholder="Nom de la phase"
                          value={phase.nom}
                          onChange={(e) => updatePhase(index, "nom", e.target.value)}
                          className="font-semibold border-none p-0 h-auto text-base"
                        />
                        <Textarea
                          placeholder="Description"
                          value={phase.description}
                          onChange={(e) => updatePhase(index, "description", e.target.value)}
                          className="min-h-[60px] text-sm"
                        />
                      </div>
                    </div>
                    
                    {formData.phases.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePhase(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Durée prévue (jours)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={phase.dureePrevue}
                        onChange={(e) => updatePhase(index, "dureePrevue", parseInt(e.target.value) || 1)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs">Date début</Label>
                      <Input
                        type="date"
                        value={phase.dateDebut}
                        onChange={(e) => updatePhase(index, "dateDebut", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs">Date fin</Label>
                      <Input
                        type="date"
                        value={phase.dateFin}
                        onChange={(e) => updatePhase(index, "dateFin", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs">Statut</Label>
                      <Select
                        value={phase.statut}
                        onValueChange={(value: "En attente" | "En cours" | "Terminé") => 
                          updatePhase(index, "statut", value)
                        }
                      >
                        <SelectTrigger className="text-xs">
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
          >
            Annuler
          </Button>
          
          {currentStep < 4 ? (
            <Button
              type="button"
              onClick={nextStep}
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleFinalSubmit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {task ? "Modifier la tâche" : "Créer la tâche"}
            </Button>
          )}
        </div>
      </DialogFooter>
    </DialogContent>
  );
}