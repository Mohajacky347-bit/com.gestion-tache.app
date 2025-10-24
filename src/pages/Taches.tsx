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
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Send,
  Calendar,
  Package
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Task {
  id: string;
  title: string;
  chefSection: string;
  employes: string[];
  materiels: string[];
  dateDebut: string;
  dateFin: string;
  dateFinReel?: string;
  status: "pending" | "paused" | "progress" | "completed";
  phase: 1 | 2 | 3;
}

const mockTasks: Task[] = [
  {
    id: "T001",
    title: "Réparation voie ferrée secteur A",
    chefSection: "M. Rasolofo",
    employes: ["Rakoto", "Rabe", "Andry"],
    materiels: ["Perceuse industrielle", "Cisaille hydraulique"],
    dateDebut: "2025-01-15",
    dateFin: "2025-01-25",
    dateFinReel: "2025-01-24",
    status: "progress",
    phase: 2
  },
  {
    id: "T002", 
    title: "Maintenance signalisation",
    chefSection: "Mme. Razafy",
    employes: ["Hery", "Nivo"],
    materiels: ["Multimètre digital", "Oscilloscope"],
    dateDebut: "2025-01-10",
    dateFin: "2025-01-20",
    status: "pending",
    phase: 1
  },
  {
    id: "T003",
    title: "Nettoyage quais voyageurs",
    chefSection: "M. Randria", 
    employes: ["Miora", "Faly", "Tiana", "Solo"],
    materiels: ["Nettoyeur haute pression", "Balayeuse mécanique"],
    dateDebut: "2025-01-08",
    dateFin: "2025-01-12",
    status: "completed",
    phase: 3
  },
  {
    id: "T004",
    title: "Inspection matériel roulant",
    chefSection: "M. Ratovo",
    employes: ["Jean", "Paul"],
    materiels: ["Jauges de mesure", "Caméra endoscopique"],
    dateDebut: "2025-01-12",
    dateFin: "2025-01-18",
    status: "paused",
    phase: 1
  }
];

const statusLabels = {
  pending: "En attente",
  paused: "En pause", 
  progress: "En cours",
  completed: "Terminé"
};

const statusVariants = {
  pending: "pending",
  paused: "paused",
  progress: "progress", 
  completed: "completed"
} as const;

export default function Taches() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.chefSection.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTask = (data: Omit<Task, "id">) => {
    const newTask: Task = {
      ...data,
      id: `T${String(tasks.length + 1).padStart(3, '0')}`
    };
    setTasks([...tasks, newTask]);
    setIsAddDialogOpen(false);
  };

  const handleEditTask = (data: Omit<Task, "id">) => {
    if (editingTask) {
      setTasks(tasks.map(task => 
        task.id === editingTask.id ? { ...data, id: editingTask.id } : task
      ));
      setEditingTask(null);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Tâches</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les tâches du service infrastructure
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-soft">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une tâche
            </Button>
          </DialogTrigger>
          <TaskForm 
            onSubmit={handleAddTask}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher par titre ou chef de section..."
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
          <CardTitle>Liste des Tâches ({filteredTasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>ID</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Chef de Section</TableHead>
                  <TableHead>Employés</TableHead>
                  <TableHead>Matériels</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Date Fin Réelle</TableHead>
                  <TableHead>État</TableHead>
                  <TableHead>Phase</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id} className="hover:bg-muted/30 transition-smooth">
                    <TableCell className="font-medium">{task.id}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="font-medium text-foreground">{task.title}</div>
                    </TableCell>
                    <TableCell>{task.chefSection}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {task.employes.slice(0, 2).map((emp, idx) => (
                          <span key={idx} className="text-xs bg-muted px-2 py-1 rounded">
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
                            {mat}
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
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">Phase {task.phase}</span>
                        <div className="flex gap-1">
                          {[1, 2, 3].map((phase) => (
                            <div
                              key={phase}
                              className={`w-2 h-2 rounded-full ${
                                phase <= task.phase 
                                  ? "bg-primary" 
                                  : "bg-muted"
                              }`}
                            />
                          ))}
                        </div>
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
                            onSubmit={handleEditTask}
                            onCancel={() => setEditingTask(null)}
                          />
                        </Dialog>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          title="Supprimer"
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
        </CardContent>
      </Card>
    </div>
  );
}

// Composant Formulaire Tâche
interface TaskFormProps {
  task?: Task;
  onSubmit: (data: Omit<Task, "id">) => void;
  onCancel: () => void;
}

function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: task?.title || "",
    chefSection: task?.chefSection || "",
    employes: task?.employes || [],
    materiels: task?.materiels || [],
    dateDebut: task?.dateDebut || "",
    dateFin: task?.dateFin || "",
    dateFinReel: task?.dateFinReel || "",
    status: task?.status || "pending",
    phase: task?.phase || 1
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addEmployee = () => {
    const empName = prompt("Nom de l'employé:");
    if (empName) {
      setFormData({
        ...formData,
        employes: [...formData.employes, empName]
      });
    }
  };

  const removeEmployee = (index: number) => {
    setFormData({
      ...formData,
      employes: formData.employes.filter((_, i) => i !== index)
    });
  };

  const addMaterial = () => {
    const matName = prompt("Nom du matériel:");
    if (matName) {
      setFormData({
        ...formData,
        materiels: [...formData.materiels, matName]
      });
    }
  };

  const removeMaterial = (index: number) => {
    setFormData({
      ...formData,
      materiels: formData.materiels.filter((_, i) => i !== index)
    });
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>{task ? "Modifier la tâche" : "Ajouter une tâche"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Titre de la tâche</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="chefSection">Chef de section</Label>
          <Input
            id="chefSection"
            value={formData.chefSection}
            onChange={(e) => setFormData({...formData, chefSection: e.target.value})}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Employés assignés</Label>
            <div className="space-y-2">
              {formData.employes.map((emp, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm bg-muted px-2 py-1 rounded flex-1">{emp}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEmployee(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addEmployee}>
                + Ajouter employé
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Matériels nécessaires</Label>
            <div className="space-y-2">
              {formData.materiels.map((mat, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm bg-secondary/20 px-2 py-1 rounded flex-1">{mat}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMaterial(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addMaterial}>
                + Ajouter matériel
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dateDebut">Date de début</Label>
            <Input
              id="dateDebut"
              type="date"
              value={formData.dateDebut}
              onChange={(e) => setFormData({...formData, dateDebut: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateFin">Date de fin prévue</Label>
            <Input
              id="dateFin"
              type="date"
              value={formData.dateFin}
              onChange={(e) => setFormData({...formData, dateFin: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: "pending" | "paused" | "progress" | "completed") => 
                setFormData({...formData, status: value})
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="paused">En pause</SelectItem>
                <SelectItem value="progress">En cours</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phase">Phase</Label>
            <Select 
              value={String(formData.phase)} 
              onValueChange={(value) => 
                setFormData({...formData, phase: parseInt(value) as 1 | 2 | 3})
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Phase 1</SelectItem>
                <SelectItem value="2">Phase 2</SelectItem>
                <SelectItem value="3">Phase 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit">
            {task ? "Modifier" : "Ajouter"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
