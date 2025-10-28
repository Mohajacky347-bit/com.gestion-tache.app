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
  UserCheck,
  UserX,
  Users,
  Edit,
  Phone,
  Star,
  Trash2,
  Send,
  Eye,
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

interface Employee {
  id: string;
  nom: string;
  prenom: string;
  fonction: string;
  contact: string;
  specialite?: string;
  disponibilite: "disponible" | "affecte" | "absent";
  tacheActuelle?: string;
  dateAbsence?: string;
  typeAbsence?: "conge" | "maladie";
}

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

type AlertType = "success" | "error" | null;
type DialogType = "add" | "edit" | "delete" | "details" | null;

export default function Employes() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [alert, setAlert] = useState<{ type: AlertType; message: string } | null>(null);
  const [dialog, setDialog] = useState<{ type: DialogType; employee?: Employee } | null>(null);
  const [formData, setFormData] = useState<Partial<Employee>>({
    nom: "",
    prenom: "",
    fonction: "",
    contact: "",
    specialite: "",
    disponibilite: "disponible"
  });

  const filteredEmployees = employees.filter(emp =>
    emp.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.fonction.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.specialite && emp.specialite.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: employees.length,
    disponible: employees.filter(e => e.disponibilite === "disponible").length,
    affecte: employees.filter(e => e.disponibilite === "affecte").length,
    absent: employees.filter(e => e.disponibilite === "absent").length
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
      const res = await fetch("/api/employes", { cache: "no-store" });
      if (!res.ok) throw new Error("Erreur lors du chargement des employés");
      const data: Employee[] = await res.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type: AlertType, message: string) => {
    setAlert({ type, message });
  };

  const openDialog = (type: DialogType, employee?: Employee) => {
    setDialog({ type, employee });
    if (type === "edit" && employee) {
      setFormData({
        nom: employee.nom,
        prenom: employee.prenom,
        fonction: employee.fonction,
        contact: employee.contact,
        specialite: employee.specialite || "",
        disponibilite: employee.disponibilite
      });
    } else if (type === "add") {
      setFormData({
        nom: "",
        prenom: "",
        fonction: "",
        contact: "",
        specialite: "",
        disponibilite: "disponible"
      });
    }
  };

  const closeDialog = () => {
    setDialog(null);
    setFormData({
      nom: "",
      prenom: "",
      fonction: "",
      contact: "",
      specialite: "",
      disponibilite: "disponible"
    });
  };

  const handleSubmit = async () => {
    try {
      if (dialog?.type === "add") {
        const response = await fetch("/api/employes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error("Erreur lors de l'ajout");
        
        await fetchData();
        showAlert("success", "Employé ajouté avec succès");

      } else if (dialog?.type === "edit" && dialog.employee) {
        const response = await fetch(`/api/employes/${dialog.employee.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error("Erreur lors de la modification");
        
        await fetchData();
        showAlert("success", "Employé modifié avec succès");

      } else if (dialog?.type === "delete" && dialog.employee) {
        const response = await fetch(`/api/employes/${dialog.employee.id}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Erreur lors de la suppression");
        
        await fetchData();
        showAlert("success", "Employé supprimé avec succès");
      }
      
      closeDialog();
    } catch (error) {
      showAlert("error", "Erreur lors de l'opération");
    }
  };

  const transferEmployee = (employee: Employee) => {
    // Logique de transfert - à implémenter selon les besoins
    alert(`Transfert de l'employé ${employee.prenom} ${employee.nom} - Fonctionnalité à développer`);
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
            Gestion des Employés
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez les employés du service infrastructure
          </p>
        </div>
        <Button 
          className="shadow-soft bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          onClick={() => openDialog("add")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un employé
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-soft border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Disponibles</p>
                <p className="text-2xl font-bold text-green-600">{stats.disponible}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-orange-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Affectés</p>
                <p className="text-2xl font-bold text-orange-600">{stats.affecte}</p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Absents</p>
                <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
              </div>
              <UserX className="h-8 w-8 text-red-500" />
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
          {loading ? (
            <div className="text-center text-muted-foreground py-8">
              Chargement des employés...
            </div>
          ) : (
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
                  {filteredEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        Aucun employé trouvé
                      </TableCell>
                    </TableRow>
                  ) : filteredEmployees.map((employee) => (
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
                          {employee.specialite || "Non spécifiée"}
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
                        {employee.disponibilite === "disponible" && !employee.tacheActuelle && (
                          <span className="text-sm text-muted-foreground">Aucune affectation</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openDialog("details", employee)}
                            title="Voir détails"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openDialog("edit", employee)}
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
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
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => openDialog("delete", employee)}
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
          )}
        </CardContent>
      </Card>

      {/* Dialog d'ajout/modification */}
      <Dialog open={dialog?.type === "add" || dialog?.type === "edit"} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {dialog?.type === "add" ? "Ajouter un employé" : "Modifier l'employé"}
            </DialogTitle>
            <DialogDescription>
              {dialog?.type === "add" 
                ? "Remplissez les informations du nouvel employé." 
                : "Modifiez les informations de l'employé."
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="prenom">Prénom</Label>
                <Input
                  id="prenom"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  placeholder="Jean"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nom">Nom</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Dupont"
                  required
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="fonction">Fonction</Label>
              <Input
                id="fonction"
                value={formData.fonction}
                onChange={(e) => setFormData({ ...formData, fonction: e.target.value })}
                placeholder="Technicien voies"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contact">Contact</Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="034 12 345 67"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="specialite">Spécialité</Label>
              <Textarea
                id="specialite"
                value={formData.specialite}
                onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                placeholder="Soudure, Réparation voies"
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="disponibilite">Disponibilité</Label>
              <Select 
                value={formData.disponibilite} 
                onValueChange={(value: "disponible" | "affecte" | "absent") => 
                  setFormData({ ...formData, disponibilite: value })
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

      {/* Dialog de détails */}
      <Dialog open={dialog?.type === "details"} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Détails de l'employé
            </DialogTitle>
          </DialogHeader>
          {dialog?.employee && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">ID</Label>
                  <p className="font-medium">{dialog.employee.id}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Disponibilité</Label>
                  <Badge variant={disponibiliteVariants[dialog.employee.disponibilite]}>
                    {disponibiliteLabels[dialog.employee.disponibilite]}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Prénom</Label>
                  <p className="font-medium">{dialog.employee.prenom}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Nom</Label>
                  <p className="font-medium">{dialog.employee.nom}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Fonction</Label>
                <p className="font-medium">{dialog.employee.fonction}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Contact</Label>
                <p className="font-medium">{dialog.employee.contact}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Spécialité</Label>
                <p className="font-medium">{dialog.employee.specialite || "Non spécifiée"}</p>
              </div>
              {dialog.employee.tacheActuelle && (
                <div>
                  <Label className="text-sm text-muted-foreground">Tâche actuelle</Label>
                  <p className="font-medium">{dialog.employee.tacheActuelle}</p>
                </div>
              )}
              {dialog.employee.dateAbsence && (
                <div>
                  <Label className="text-sm text-muted-foreground">Absence</Label>
                  <p className="font-medium">
                    {dialog.employee.typeAbsence === "conge" ? "Congé" : "Maladie"} depuis le{" "}
                    {new Date(dialog.employee.dateAbsence).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de suppression */}
      <AlertDialog open={dialog?.type === "delete"} onOpenChange={closeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
  <div>
    Vous êtes sur le point de supprimer{" "}
    <span className="font-semibold text-foreground">
      {dialog?.employee?.prenom} {dialog?.employee?.nom}
    </span>.
  </div>
  
  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
    <div className="flex items-start gap-2">
      <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
      <div className="text-sm text-destructive">
        <span className="font-semibold">Suppression en cascade :</span> 
        {" "}Toutes les données associées (absences, affectations) seront également supprimées.
      </div>
    </div>
  </div>

  <div className="text-sm text-muted-foreground">
    Cette action est irréversible. Confirmez-vous la suppression ?
  </div>
</AlertDialogDescription>

          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSubmit}
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
