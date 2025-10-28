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
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Calendar,
  Package,
  User,
  Wrench,
  CheckCircle2,
  Clock,
  PlayCircle,
  PauseCircle
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

// Types
interface Task {
  id: string;
  title: string;
  employes: string[];
  materiels: { nom: string; quantite: number }[];
  dateDebut: string;
  dateFin: string;
  dateFinReel?: string;
  status: "pending" | "paused" | "progress" | "completed";
  phases: Phase[];
}

interface Phase {
  id?: string;
  nom: string;
  description: string;
  dureePrevue: number;
  dateDebut: string;
  dateFin: string;
  statut: "En attente" | "En cours" | "Termin  ";
}

interface Employe {
  id: string;
  nom: string;
  prenom: string;
  fonction: string;
  disponibilite: string;
}

interface Materiel {
  id: string;
  nom: string;
  type: string;
  quantite: number;
  etat: string;
}

const statusLabels = {
  pending: "En attente",
  paused: "En pause", 
  progress: "En cours",
  completed: "Termin  "
};

const statusVariants = {
  pending: "pending",
  paused: "paused",
  progress: "progress", 
  completed: "completed"
} as const;

const statusIcons = {
  pending: Clock,
  paused: PauseCircle,
  progress: PlayCircle,
  completed: CheckCircle2
};

export default function Taches() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [materiels, setMateriels] = useState<Materiel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; taskId: string | null }>({ open: false, taskId: null });

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.employes.some(emp => emp.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calcul de la progression des phases
  const getPhaseProgress = (phases: Phase[]) => {
    const total = phases.length;
    const completed = phases.filter(p => p.statut === "Termin  ").length;
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
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // R  cup  rer les tâches
      const tasksRes = await fetch("/api/taches");
      if (!tasksRes.ok) throw new Error("Erreur lors du chargement des tâches");
      const tasksData = await tasksRes.json();
      setTasks(tasksData);

      // R  cup  rer les employ  s
      const employesRes = await fetch("/api/employes");
      if (employesRes.ok) {
        const employesData = await employesRes.json();
        setEmployes(employesData);
      }

      // R  cup  rer les mat  riels
      const materielsRes = await fetch("/api/materiels");
      if (materielsRes.ok) {
        const materielsData = await materielsRes.json();
        setMateriels(materielsData);
      }
    } catch (error) {
      console.error("Erreur:", error);
      showAlert("error", "Erreur lors du chargement des donn  es");
    } finally {
      setLoading(false);
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
      showAlert("success", "tâche ajout  e avec succ  s");
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
      
      setTasks(prev => prev.map(task => 
        task.id === editingTask.id ? { ...data, id: editingTask.id } : task
      ));
      setEditingTask(null);
      showAlert("success", "tâche modifi  e avec succ  s");
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
      showAlert("success", "tâche supprim  e avec succ  s");
    } catch (error) {
      showAlert("error", "Erreur lors de la suppression de la tâche");
    }
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

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des tâches</h1>
          <p className="text-muted-foreground mt-2">
            G  rez les tâches du service infrastructure
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-soft bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une tâche
            </Button>
          </DialogTrigger>
          <TaskForm 
            employes={employes}
            materiels={materiels}
            onSubmit={handleAddTask}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </Dialog>
      </div>

      {/* Search */}
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher par titre ou employ  ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Liste des tâches ({filteredTasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>ID</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Employ  s</TableHead>
                  <TableHead>Mat  riels</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Date Fin R  elle</TableHead>
                  <TableHead>?tat</TableHead>
                  <TableHead>Phase</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      Aucune tâche trouv  e
                    </TableCell>
                  </TableRow>
                ) : filteredTasks.map((task) => {
                  const progress = getPhaseProgress(task.phases);
                  return (
                    <TableRow key={task.id} className="hover:bg-muted/30 transition-smooth">
                      <TableCell className="font-medium">{task.id}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="font-medium text-foreground">{task.title}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {task.employes.slice(0, 2).map((emp, idx) => (
                            <span key={idx} className="text-xs bg-muted px-2 py-1 rounded flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {emp}
                            </span>
                          ))}
                          {task.employes.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{task.employes.length - 2}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {task.materiels.slice(0, 2).map((mat, idx) => (
                            <span key={idx} className="text-xs bg-secondary/20 px-2 py-1 rounded flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              {mat.nom} ({mat.quantite})
                            </span>
                          ))}
                          {task.materiels.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{task.materiels.length - 2}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(task.dateDebut).toLocaleDateString()}
                          </div>
                          <div className="text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(task.dateFin).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {task.dateFinReel ? (
                          <div className="text-sm text-status-completed flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(task.dateFinReel).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariants[task.status]}>
                          {statusLabels[task.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {Array.from({ length: progress.totalPhases }).map((_, index) => (
                              <div
                                key={index}
                                className={`w-2 h-2 rounded-full ${
                                  index < progress.currentPhase 
                                    ? "bg-primary" 
                                    : "bg-muted"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">
                            {progress.currentPhase}/{progress.totalPhases}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setEditingTask(task)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <TaskForm 
                              task={task}
                              employes={employes}
                              materiels={materiels}
                              onSubmit={handleEditTask}
                              onCancel={() => setEditingTask(null)}
                            />
                          </Dialog>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setDeleteDialog({ open: true, taskId: task.id })}
                            title="Supprimer"
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
        </CardContent>
      </Card>

      {/* Dialog de suppression */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, taskId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>?tes-vous s?r ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera d  finitivement la tâche. 
              Cette action ne peut pas   tre annul  e.
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

// COMPOSANT FORMULAIRE CORRIG? - NE S'ENVOIE QU'? L'?TAPE 4
function TaskForm({ task, employes, materiels, onSubmit, onCancel }: TaskFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Omit<Task, "id">>({
    title: task?.title || "",
    employes: task?.employes || [],
    materiels: task?.materiels || [],
    dateDebut: task?.dateDebut || "",
    dateFin: task?.dateFin || "",
    dateFinReel: task?.dateFinReel || "",
    status: task?.status || "pending",
    phases: task?.phases || [
      { nom: "Phase 1", description: "", dureePrevue: 1, dateDebut: "", dateFin: "", statut: "En attente" }
    ]
  });

  const [selectedEmployes, setSelectedEmployes] = useState<string[]>(task?.employes || []);
  const [selectedMateriels, setSelectedMateriels] = useState<{ [key: string]: number }>(
    task?.materiels.reduce((acc, mat) => ({ ...acc, [mat.nom]: mat.quantite }), {}) || {}
  );

  const steps = [
    { number: 1, title: "Informations", icon: Clock },
    { number: 2, title: "Employ  s", icon: User },
    { number: 3, title: "Mat  riels", icon: Package },
    { number: 4, title: "Phases", icon: Wrench }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation avant envoi
    if (!validateForm()) {
      return;
    }
    
    // Pr  parer les donn  es finales
    const finalData: Omit<Task, "id"> = {
      ...formData,
      employes: selectedEmployes,
      materiels: Object.entries(selectedMateriels).map(([nom, quantite]) => ({ nom, quantite })),
      dateFinReel: formData.status === "completed" && !formData.dateFinReel ? undefined : formData.dateFinReel
    };
    
    onSubmit(finalData);
  };

  // Fonction de validation
  const validateForm = (): boolean => {
    // Validation   tape 1
    if (!formData.title.trim()) {
      alert("Veuillez remplir le titre de la tâche");
      setCurrentStep(1);
      return false;
    }
    
    if (!formData.dateDebut || !formData.dateFin) {
      alert("Veuillez remplir les dates de d  but et fin");
      setCurrentStep(1);
      return false;
    }
    
    // Validation   tape 2
    if (selectedEmployes.length === 0) {
      alert("Veuillez s  lectionner au moins un employ  ");
      setCurrentStep(2);
      return false;
    }
    
    // Validation   tape 3
    if (Object.keys(selectedMateriels).length === 0) {
      alert("Veuillez s  lectionner au moins un mat  riel");
      setCurrentStep(3);
      return false;
    }
    
    // Validation   tape 4
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

  const handleFinalSubmit = () => {
    if (!validateForm()) {
      return;
    }
    
    const finalData: Omit<Task, "id"> = {
      ...formData,
      employes: selectedEmployes,
      materiels: Object.entries(selectedMateriels).map(([nom, quantite]) => ({ nom, quantite })),
      dateFinReel: formData.status === "completed" && !formData.dateFinReel ? undefined : formData.dateFinReel
    };
    
    onSubmit(finalData);
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

  return (
    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-xl">
          {task ? "Modifier la tâche" : "Nouvelle tâche"}
        </DialogTitle>
        <DialogDescription>
          {task ? "Modifiez les informations de la tâche" : "Remplissez les informations pour cr  er une nouvelle tâche"}
        </DialogDescription>
        
        {/* Stepper am  lior   */}
        <div className="flex justify-between items-center mt-6 px-4">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <div key={step.number} className="flex flex-col items-center flex-1">
                <div className="flex items-center w-full">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.number 
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 border-transparent text-white" 
                      : "bg-background border-muted text-muted-foreground"
                  } transition-all duration-300`}>
                    {currentStep > step.number ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      currentStep > step.number ? "bg-gradient-to-r from-blue-600 to-purple-600" : "bg-muted"
                    } transition-all duration-300`} />
                  )}
                </div>
                <span className={`text-xs mt-2 font-medium ${
                  currentStep >= step.number ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </DialogHeader>

      <div className="space-y-6 mt-6">
        {/* ?tape 1: Informations de base - PAS DE FORMULAIRE */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">Titre de la tâche</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  placeholder="Ex: R  paration voie ferr  e secteur A"
                  className="border-input bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateDebut" className="text-sm font-medium">Date de d  but</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="dateDebut"
                      type="date"
                      value={formData.dateDebut}
                      onChange={(e) => setFormData({...formData, dateDebut: e.target.value})}
                      required
                      className="pl-10 border-input bg-background"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFin" className="text-sm font-medium">Date de fin pr  vue</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="dateFin"
                      type="date"
                      value={formData.dateFin}
                      onChange={(e) => setFormData({...formData, dateFin: e.target.value})}
                      required
                      className="pl-10 border-input bg-background"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateFinReel" className="text-sm font-medium">
                  Date de fin r  elle 
                  <span className="text-muted-foreground text-xs ml-2">(optionnel)</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="dateFinReel"
                    type="date"
                    value={formData.dateFinReel || ""}
                    onChange={(e) => setFormData({...formData, dateFinReel: e.target.value})}
                    placeholder="? remplir seulement en cas de retard"
                    className="pl-10 border-input bg-background"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  ? remplir seulement si la tâche est termin  e avec retard
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">Statut</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: "pending" | "paused" | "progress" | "completed") => 
                    setFormData({...formData, status: value})
                  }
                >
                  <SelectTrigger className="border-input bg-background">
                    <div className="flex items-center gap-2">
                      <StatusIcon className="h-4 w-4" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      En attente
                    </SelectItem>
                    <SelectItem value="paused" className="flex items-center gap-2">
                      <PauseCircle className="h-4 w-4" />
                      En pause
                    </SelectItem>
                    <SelectItem value="progress" className="flex items-center gap-2">
                      <PlayCircle className="h-4 w-4" />
                      En cours
                    </SelectItem>
                    <SelectItem value="completed" className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Termin  
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* ?tape 2: Employ  s - PAS DE FORMULAIRE */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Employ  s assign  s</Label>
              <Badge variant="secondary" className="px-2 py-1">
                {selectedEmployes.length} s  lectionn  (s)
              </Badge>
            </div>
            
            <div className="border rounded-lg bg-background">
              <div className="max-h-60 overflow-y-auto p-4 space-y-3">
                {employes.filter(emp => emp.disponibilite === 'disponible').map((employe) => (
                  <div key={employe.id} className="flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors">
                    <Checkbox
                      id={`emp-${employe.id}`}
                      checked={selectedEmployes.includes(`${employe.prenom} ${employe.nom}`)}
                      onCheckedChange={(checked) => {
                        const employeName = `${employe.prenom} ${employe.nom}`;
                        setSelectedEmployes(prev =>
                          checked
                            ? [...prev, employeName]
                            : prev.filter(name => name !== employeName)
                        );
                      }}
                    />
                    <label
                      htmlFor={`emp-${employe.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-foreground">
                            {employe.prenom} {employe.nom}
                          </div>
                          <div className="text-sm text-muted-foreground">{employe.fonction}</div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Disponible
                        </Badge>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
              
              {employes.filter(emp => emp.disponibilite === 'disponible').length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Aucun employ   disponible</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ?tape 3: Mat  riels - PAS DE FORMULAIRE */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Mat  riels n  cessaires</Label>
              <Badge variant="secondary" className="px-2 py-1">
                {Object.keys(selectedMateriels).length} s  lectionn  (s)
              </Badge>
            </div>
            
            <div className="border rounded-lg bg-background">
              <div className="max-h-60 overflow-y-auto p-4 space-y-3">
                {materiels.filter(mat => mat.etat === 'disponible').map((materiel) => (
                  <div key={materiel.id} className="p-3 rounded-lg border bg-card hover:bg-accent transition-colors">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={`mat-${materiel.id}`}
                        checked={selectedMateriels.hasOwnProperty(materiel.nom)}
                        onCheckedChange={(checked) => {
                          setSelectedMateriels(prev => {
                            const newSelection = { ...prev };
                            if (checked) {
                              newSelection[materiel.nom] = 1;
                            } else {
                              delete newSelection[materiel.nom];
                            }
                            return newSelection;
                          });
                        }}
                      />
                      <label
                        htmlFor={`mat-${materiel.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-foreground">{materiel.nom}</div>
                            <div className="text-sm text-muted-foreground">{materiel.type}</div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Stock: {materiel.quantite}
                          </Badge>
                        </div>
                      </label>
                    </div>
                    
                    {selectedMateriels.hasOwnProperty(materiel.nom) && (
                      <div className="mt-3 pl-9">
                        <Label htmlFor={`qty-${materiel.id}`} className="text-sm text-muted-foreground">
                          Quantit   n  cessaire
                        </Label>
                        <Input
                          id={`qty-${materiel.id}`}
                          type="number"
                          min="1"
                          max={materiel.quantite}
                          value={selectedMateriels[materiel.nom]}
                          onChange={(e) => setSelectedMateriels(prev => ({
                            ...prev,
                            [materiel.nom]: parseInt(e.target.value) || 1
                          }))}
                          className="w-24 mt-1"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {materiels.filter(mat => mat.etat === 'disponible').length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Aucun mat  riel disponible</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ?tape 4: Phases - SEULEMENT CETTE ?TAPE A UN FORMULAIRE */}
        {currentStep === 4 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <Label className="text-sm font-medium">Phases de travail</Label>
                <p className="text-sm text-muted-foreground">
                  D  finissez les diff  rentes   tapes de la tâche
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addPhase}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une phase
              </Button>
            </div>
            
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {formData.phases.map((phase, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4 bg-card">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium">
                        {index + 1}
                      </div>
                      <h4 className="font-medium text-foreground">{phase.nom}</h4>
                    </div>
                    {formData.phases.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePhase(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Nom de la phase</Label>
                      <Input
                        value={phase.nom}
                        onChange={(e) => updatePhase(index, "nom", e.target.value)}
                        placeholder="Ex: Pr  paration du site"
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Dur  e pr  vue (jours)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={phase.dureePrevue}
                        onChange={(e) => updatePhase(index, "dureePrevue", parseInt(e.target.value))}
                        className="bg-background"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm">Description</Label>
                    <Textarea
                      value={phase.description}
                      onChange={(e) => updatePhase(index, "description", e.target.value)}
                      placeholder="Description d  taill  e des travaux..."
                      className="bg-background min-h-[80px]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Date de d  but</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          type="date"
                          value={phase.dateDebut}
                          onChange={(e) => updatePhase(index, "dateDebut", e.target.value)}
                          className="pl-10 bg-background"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Date de fin</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          type="date"
                          value={phase.dateFin}
                          onChange={(e) => updatePhase(index, "dateFin", e.target.value)}
                          className="pl-10 bg-background"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </form>
        )}

        {/* Navigation - TOUJOURS EN DEHORS DES FORMULAIRES */}
        <DialogFooter className="flex justify-between items-center pt-6 border-t">
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={prevStep} 
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <Wrench className="h-4 w-4" />
              Pr  c  dent
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            
            {currentStep < 4 ? (
              <Button 
                type="button"
                onClick={nextStep}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Continuer
                <PlayCircle className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                type="submit"
                onClick={handleFinalSubmit}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {task ? "Modifier la tâche" : "Cr  er la tâche"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </div>
    </DialogContent>
  );
}
