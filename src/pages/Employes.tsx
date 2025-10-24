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
  Search,
  UserCheck,
  UserX,
  Users,
  Edit,
  Phone,
  Star,
  Trash2,
  Send
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Employee {
  id: string;
  nom: string;
  prenom: string;
  fonction: string;
  contact: string;
  specialite: string;
  disponibilite: "disponible" | "affecte" | "absent";
  tacheActuelle?: string;
  dateAbsence?: string;
  typeAbsence?: "conge" | "maladie";
}

const mockEmployees: Employee[] = [
  {
    id: "E001",
    nom: "Rakoto",
    prenom: "Jean",
    fonction: "Technicien voies",
    contact: "034 12 345 67",
    specialite: "Soudure, Réparation voies",
    disponibilite: "affecte",
    tacheActuelle: "Réparation voie ferrée secteur A"
  },
  {
    id: "E002",
    nom: "Rabe",
    prenom: "Marie",
    fonction: "Électricien",
    contact: "032 98 765 43",
    specialite: "Électricité industrielle",
    disponibilite: "disponible"
  },
  {
    id: "E003",
    nom: "Andry",
    prenom: "Paul",
    fonction: "Mécanicien",
    contact: "033 45 678 90",
    specialite: "Mécanique moteurs",
    disponibilite: "absent",
    dateAbsence: "2025-01-15",
    typeAbsence: "maladie"
  },
  {
    id: "E004",
    nom: "Razafy",
    prenom: "Hanta",
    fonction: "Chef d'équipe",
    contact: "038 12 345 67",
    specialite: "Gestion d'équipe, Planification",
    disponibilite: "affecte",
    tacheActuelle: "Maintenance signalisation"
  },
  {
    id: "E005",
    nom: "Ratovo",
    prenom: "Michel",
    fonction: "Inspecteur matériel",
    contact: "034 23 456 78",
    specialite: "Contrôle qualité, Inspection",
    disponibilite: "disponible"
  }
];

const disponibiliteLabels = {
  disponible: "Disponible",
  affecte: "Affecté",
  absent: "Absent"
};

const disponibiliteVariants = {
  disponible: "completed",
  affecte: "progress", 
  absent: "paused"
} as const;

export default function Employes() {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const filteredEmployees = employees.filter(emp =>
    emp.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.fonction.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.specialite.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: employees.length,
    disponible: employees.filter(e => e.disponibilite === "disponible").length,
    affecte: employees.filter(e => e.disponibilite === "affecte").length,
    absent: employees.filter(e => e.disponibilite === "absent").length
  };

  const handleAddEmployee = (data: Omit<Employee, "id">) => {
    const newEmployee: Employee = {
      ...data,
      id: `E${String(employees.length + 1).padStart(3, '0')}`
    };
    setEmployees([...employees, newEmployee]);
    setIsAddDialogOpen(false);
  };

  const handleEditEmployee = (data: Omit<Employee, "id">) => {
    if (editingEmployee) {
      setEmployees(employees.map(emp => 
        emp.id === editingEmployee.id ? { ...data, id: editingEmployee.id } : emp
      ));
      setEditingEmployee(null);
    }
  };

  const handleDeleteEmployee = (employeeId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet employé ?")) {
      setEmployees(employees.filter(emp => emp.id !== employeeId));
    }
  };

  const transferEmployee = (employee: Employee) => {
    // Logique de transfert - à implémenter selon les besoins
    alert(`Transfert de l'employé ${employee.prenom} ${employee.nom} - Fonctionnalité à développer`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Employés</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les employés du service infrastructure
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-soft">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un employé
            </Button>
          </DialogTrigger>
          <EmployeeForm 
            onSubmit={handleAddEmployee}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </Dialog>
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
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Disponibles</p>
                <p className="text-2xl font-bold text-status-completed">{stats.disponible}</p>
              </div>
              <UserCheck className="h-8 w-8 text-status-completed" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Affectés</p>
                <p className="text-2xl font-bold text-status-progress">{stats.affecte}</p>
              </div>
              <Users className="h-8 w-8 text-status-progress" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Absents</p>
                <p className="text-2xl font-bold text-status-paused">{stats.absent}</p>
              </div>
              <UserX className="h-8 w-8 text-status-paused" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher par nom, prénom, fonction ou spécialité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Liste des Employés ({filteredEmployees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>ID</TableHead>
                  <TableHead>Nom Complet</TableHead>
                  <TableHead>Fonction</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Spécialité</TableHead>
                  <TableHead>Disponibilité</TableHead>
                  <TableHead>Tâche Actuelle / Absence</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id} className="hover:bg-muted/30 transition-smooth">
                    <TableCell className="font-medium">{employee.id}</TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">
                        {employee.prenom} {employee.nom}
                      </div>
                    </TableCell>
                    <TableCell>{employee.fonction}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {employee.contact}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {employee.specialite}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={disponibiliteVariants[employee.disponibilite]}>
                        {disponibiliteLabels[employee.disponibilite]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {employee.tacheActuelle && (
                        <span className="text-sm">{employee.tacheActuelle}</span>
                      )}
                      {employee.dateAbsence && (
                        <div className="text-sm">
                          <div className="font-medium">
                            {employee.typeAbsence === "conge" ? "Congé" : "Maladie"}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            Depuis le {new Date(employee.dateAbsence).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                      {employee.disponibilite === "disponible" && (
                        <span className="text-sm text-muted-foreground">Aucune affectation</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setEditingEmployee(employee)}
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <EmployeeForm 
                            employee={employee}
                            onSubmit={handleEditEmployee}
                            onCancel={() => setEditingEmployee(null)}
                          />
                        </Dialog>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => transferEmployee(employee)}
                          title="Transférer à une autre tâche"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteEmployee(employee.id)}
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

// Composant Formulaire Employé (inchangé)
interface EmployeeFormProps {
  employee?: Employee;
  onSubmit: (data: Omit<Employee, "id">) => void;
  onCancel: () => void;
}

function EmployeeForm({ employee, onSubmit, onCancel }: EmployeeFormProps) {
  const [formData, setFormData] = useState({
    nom: employee?.nom || "",
    prenom: employee?.prenom || "",
    fonction: employee?.fonction || "",
    contact: employee?.contact || "",
    specialite: employee?.specialite || "",
    disponibilite: employee?.disponibilite || "disponible"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>{employee ? "Modifier l'employé" : "Ajouter un employé"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="prenom">Prénom</Label>
            <Input
              id="prenom"
              value={formData.prenom}
              onChange={(e) => setFormData({...formData, prenom: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nom">Nom</Label>
            <Input
              id="nom"
              value={formData.nom}
              onChange={(e) => setFormData({...formData, nom: e.target.value})}
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="fonction">Fonction</Label>
          <Input
            id="fonction"
            value={formData.fonction}
            onChange={(e) => setFormData({...formData, fonction: e.target.value})}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact">Contact</Label>
          <Input
            id="contact"
            value={formData.contact}
            onChange={(e) => setFormData({...formData, contact: e.target.value})}
            placeholder="034 12 345 67"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialite">Spécialité</Label>
          <Input
            id="specialite"
            value={formData.specialite}
            onChange={(e) => setFormData({...formData, specialite: e.target.value})}
            placeholder="Compétences principales"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="disponibilite">Disponibilité</Label>
          <Select 
            value={formData.disponibilite} 
            onValueChange={(value: "disponible" | "affecte" | "absent") => 
              setFormData({...formData, disponibilite: value})
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="disponible">Disponible</SelectItem>
              <SelectItem value="affecte">Affecté</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit">
            {employee ? "Modifier" : "Ajouter"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
