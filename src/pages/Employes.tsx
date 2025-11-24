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
  AlertTriangle,
  Crown,
  Shield
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
import { Switch } from "@/components/ui/switch";

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
  brigade_nom?: string;
  membres?: number;
}

type EmployeeType = "chef_brigade" | "chef_magasinier" | "employe" | "";

export default function Employes() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [brigades, setBrigades] = useState<Brigade[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [alert, setAlert] = useState<{ type: AlertType; message: string } | null>(null);
  const [dialog, setDialog] = useState<{ type: DialogType; employee?: Employee } | null>(null);
  const [employeeType, setEmployeeType] = useState<EmployeeType>("");
  const [formData, setFormData] = useState<Partial<Employee> & {
    isChefBrigade?: boolean;
    id_brigade?: string;
    isChefMagasinier?: boolean;
    id_equipe?: string;
  }>({
    nom: "",
    prenom: "",
    fonction: "",
    contact: "",
    specialite: "",
    disponibilite: "disponible",
    isChefBrigade: false,
    id_brigade: undefined,
    isChefMagasinier: false,
    id_equipe: undefined
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
    fetchBrigades();
    fetchEquipes();
  }, []);

  const fetchEquipes = async () => {
    try {
      const res = await fetch("/api/equipes", { cache: "no-store" });
      if (!res.ok) throw new Error("Erreur lors du chargement des équipes");
      const data: Equipe[] = await res.json();
      setEquipes(data);
    } catch (error) {
      console.error('Error fetching equipes:', error);
    }
  };

  const fetchBrigades = async () => {
    try {
      const res = await fetch("/api/brigades", { cache: "no-store" });
      if (!res.ok) throw new Error("Erreur lors du chargement des brigades");
      const data: Brigade[] = await res.json();
      setBrigades(data);
    } catch (error) {
      console.error('Error fetching brigades:', error);
    }
  };

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
        disponibilite: employee.disponibilite,
        isChefBrigade: false,
        id_brigade: undefined,
        isChefMagasinier: false,
        id_equipe: undefined
      });
      setEmployeeType("");
    } else if (type === "add") {
      setFormData({
        nom: "",
        prenom: "",
        fonction: "",
        contact: "",
        specialite: "",
        disponibilite: "disponible",
        isChefBrigade: false,
        id_brigade: undefined,
        isChefMagasinier: false,
        id_equipe: undefined
      });
      setEmployeeType("");
    }
  };

  const closeDialog = () => {
    setDialog(null);
    setEmployeeType("");
    setFormData({
      nom: "",
      prenom: "",
      fonction: "",
      contact: "",
      specialite: "",
      disponibilite: "disponible",
      isChefBrigade: false,
      id_brigade: "",
      isChefMagasinier: false,
      id_equipe: ""
    });
  };

  const handleSubmit = async () => {
    try {
      if (dialog?.type === "add") {
        // Valider les champs requis
        if (!formData.prenom || !formData.prenom.trim()) {
          showAlert("error", "Veuillez remplir le prénom");
          return;
        }
        if (!formData.nom || !formData.nom.trim()) {
          showAlert("error", "Veuillez remplir le nom");
          return;
        }
        if (!formData.fonction || !formData.fonction.trim()) {
          showAlert("error", "Veuillez remplir la fonction");
          return;
        }
        if (!formData.contact || !formData.contact.trim()) {
          showAlert("error", "Veuillez remplir le contact");
          return;
        }

        // Valider selon le type d'employé
        if (employeeType === "chef_brigade") {
          if (!formData.id_brigade || formData.id_brigade === "" || formData.id_brigade === undefined) {
            showAlert("error", "Veuillez sélectionner une brigade pour le chef de brigade");
            return;
          }
        }
        if (employeeType === "employe") {
          if (!formData.id_equipe || formData.id_equipe === "" || formData.id_equipe === undefined) {
            showAlert("error", "Veuillez sélectionner une équipe pour l'employé");
            return;
          }
        }

        const { isChefBrigade, id_brigade, isChefMagasinier, id_equipe, ...employeData } = formData;

        // Préparer le payload selon le type d'employé
        let payload: any = {
          nom: employeData.nom?.trim(),
          prenom: employeData.prenom?.trim(),
          fonction: employeData.fonction?.trim(),
          contact: employeData.contact?.trim(),
          disponibilite: formData.disponibilite || "disponible",
        };

        // Gérer selon le type d'employé
        if (employeeType === "chef_brigade") {
          // Vérifier que id_brigade existe et n'est pas vide
          if (!formData.id_brigade || formData.id_brigade === "" || formData.id_brigade === "0") {
            console.error("Erreur: id_brigade invalide ou vide", formData.id_brigade);
            showAlert("error", "Veuillez sélectionner une brigade valide pour le chef de brigade");
            return;
          }
          const brigadeId = Number(formData.id_brigade);
          if (isNaN(brigadeId) || brigadeId <= 0) {
            console.error("Erreur: id_brigade invalide après conversion", formData.id_brigade, "->", brigadeId);
            showAlert("error", "Veuillez sélectionner une brigade valide pour le chef de brigade");
            return;
          }
          payload.isChefBrigade = true;
          payload.id_brigade = brigadeId;
          payload.specialite = undefined; // Pas de spécialité pour chef de brigade
        } else if (employeeType === "chef_magasinier") {
          payload.isChefMagasinier = true;
          payload.specialite = "Chef magasinier";
        } else if (employeeType === "employe") {
          const equipeId = Number(formData.id_equipe);
          if (isNaN(equipeId) || equipeId === 0) {
            showAlert("error", "Veuillez sélectionner une équipe valide pour l'employé");
            return;
          }
          payload.id_equipe = equipeId;
          payload.specialite = employeData.specialite?.trim() || undefined;
        }

        console.log("Type d'employé:", employeeType);
        console.log("formData.id_brigade:", formData.id_brigade);
        console.log("Payload envoyé:", JSON.stringify(payload, null, 2));

        const response = await fetch("/api/employes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erreur lors de l'ajout");
        }

        await fetchData();
        let message = "Employé ajouté avec succès";
        if (employeeType === "chef_brigade") {
          message = "Chef de brigade ajouté avec succès";
        } else if (employeeType === "chef_magasinier") {
          message = "Chef magasinier ajouté avec succès";
        }
        showAlert("success", message);

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
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      showAlert("error", error.message || "Erreur lors de l'opération");
    }
  };

  const handleNextStep = () => {
    // Valider les champs de base
    if (!formData.prenom?.trim() || !formData.nom?.trim() ||
      !formData.fonction?.trim() || !formData.contact?.trim()) {
      showAlert("error", "Veuillez remplir tous les champs obligatoires");
      return;
    }
    setEmployeeType("employe"); // Ou laissez vide pour que l'utilisateur choisisse
  };

  const transferEmployee = (employee: Employee) => {
    // Logique de transfert - à implémenter selon les besoins
    alert(`Transfert de l'employé ${employee.prenom} ${employee.nom} - Fonctionnalité à développer`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Alerte */}
      {alert && (
        <Alert className={`fixed top-4 right-4 z-50 w-96 shadow-lg border-l-4 ${alert.type === "success"
            ? "border-green-500 bg-green-50"
            : "border-red-500 bg-red-50"
          }`}>
          <AlertDescription className={`font-medium ${alert.type === "success" ? "text-green-800" : "text-red-800"
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
      {/* Dialog d'ajout/modification */}
      <Dialog open={dialog?.type === "add" || dialog?.type === "edit"} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {dialog?.type === "add" ? "Ajouter un employé" : "Modifier l'employé"}
            </DialogTitle>
            <DialogDescription>
              {dialog?.type === "add"
                ? `Étape ${employeeType === "" ? 1 : 2} sur 2 - ${employeeType === "" ? "Informations de base" : "Configuration"}`
                : "Modifiez les informations de l'employé."
              }
            </DialogDescription>
          </DialogHeader>

          {/* Indicateur d'étape - seulement en mode ajout */}
          {dialog?.type === "add" && (
            <div className="flex space-x-1 rounded-lg bg-muted p-1 mb-4">
              <div className={`flex-1 text-center py-1 rounded text-sm font-medium ${employeeType === ""
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground"
                }`}>
                Étape 1: Informations
              </div>
              <div className={`flex-1 text-center py-1 rounded text-sm font-medium ${employeeType !== ""
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground"
                }`}>
                Étape 2: Configuration
              </div>
            </div>
          )}

          <div className="grid gap-4 py-4">
            {/* ÉTAPE 1 : Informations de base (seulement visible à l'étape 1) */}
            {dialog?.type === "add" && employeeType === "" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="prenom">Prénom *</Label>
                    <Input
                      id="prenom"
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      placeholder="Jean"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="nom">Nom *</Label>
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
                  <Label htmlFor="fonction">Fonction *</Label>
                  <Input
                    id="fonction"
                    value={formData.fonction}
                    onChange={(e) => setFormData({ ...formData, fonction: e.target.value })}
                    placeholder="Technicien voies"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="contact">Contact *</Label>
                  <Input
                    id="contact"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="034 12 345 67"
                    required
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
            )}

            {/* ÉTAPE 2 : Type d'employé et configuration - seulement en mode ajout */}
            {dialog?.type === "add" && employeeType !== "" && (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="employeeType" className="flex items-center gap-2 text-lg font-semibold">
                    <Users className="h-5 w-5" />
                    Type d'employé *
                  </Label>
                  <Select
                    value={employeeType}
                    onValueChange={(value: EmployeeType) => {
                      setEmployeeType(value);
                      // Réinitialiser les champs selon le type
                      setFormData({
                        ...formData,
                        isChefBrigade: value === "chef_brigade",
                        id_brigade: undefined,
                        isChefMagasinier: value === "chef_magasinier",
                        id_equipe: undefined,
                        specialite: value === "chef_magasinier" ? "" : formData.specialite
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type d'employé" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chef_brigade">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-yellow-600" />
                          Chef de brigade
                        </div>
                      </SelectItem>
                      <SelectItem value="chef_magasinier">Chef magasinier</SelectItem>
                      <SelectItem value="employe">Employé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Configuration spécifique selon le type */}

                {/* Chef de brigade : Sélection de brigade */}
                {employeeType === "chef_brigade" && (
                  <div className="grid gap-2">
                    <Label htmlFor="id_brigade" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Brigade à diriger *
                    </Label>
                    <Select
                      value={formData.id_brigade || ""}
                      onValueChange={(value) => {
                        if (value && value !== "" && value !== "0") {
                          setFormData({ ...formData, id_brigade: value });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une brigade" />
                      </SelectTrigger>
                      <SelectContent>
                        {brigades.length === 0 ? (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            Aucune brigade disponible
                          </div>
                        ) : (
                          brigades
                            .filter(brigade => brigade.id_brigade && brigade.id_brigade > 0)
                            .map((brigade) => (
                              <SelectItem key={brigade.id_brigade} value={String(brigade.id_brigade)}>
                                {brigade.nom_brigade} - {brigade.lieu}
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Employé simple : Sélection en 2 étapes */}
                {employeeType === "employe" && (
                  <div className="space-y-4">
                    {/* Brigade et Équipe côte à côte */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Brigade */}
                      <div className="grid gap-2">
                        <Label htmlFor="id_brigade_employe" className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Brigade *
                          {formData.id_brigade && (
                            <Badge variant="outline" className="text-xs">
                              {
                                equipes.filter(e => e.id_brigade === Number(formData.id_brigade)).length
                              } équipe(s)
                            </Badge>
                          )}
                        </Label>
                        <Select
                          value={formData.id_brigade || ""}
                          onValueChange={(value) => {
                            if (value && value !== "" && value !== "0") {
                              setFormData({
                                ...formData,
                                id_brigade: value,
                                id_equipe: undefined
                              });
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir une brigade" />
                          </SelectTrigger>
                          <SelectContent>
                            {brigades.length === 0 ? (
                              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                Aucune brigade disponible
                              </div>
                            ) : (
                              brigades
                                .filter(brigade => brigade.id_brigade && brigade.id_brigade > 0)
                                .map((brigade) => (
                                  <SelectItem key={brigade.id_brigade} value={String(brigade.id_brigade)}>
                                    {brigade.nom_brigade} - {brigade.lieu}
                                  </SelectItem>
                                ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Équipe */}
                      <div className="grid gap-2">
                        <Label htmlFor="id_equipe" className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Équipe *
                        </Label>
                        <Select
                          value={formData.id_equipe || ""}
                          onValueChange={(value) => setFormData({ ...formData, id_equipe: value })}
                          disabled={!formData.id_brigade}
                        >
                          <SelectTrigger className={
                            !formData.id_brigade ? "bg-muted text-muted-foreground" : ""
                          }>
                            <SelectValue
                              placeholder={
                                formData.id_brigade
                                  ? "Choisir une équipe"
                                  : "Sélectionnez d'abord une brigade"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {!formData.id_brigade ? (
                              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                Veuillez d'abord sélectionner une brigade
                              </div>
                            ) : (
                              (() => {
                                const equipesDeLaBrigade = equipes.filter(
                                  equipe => equipe.id_brigade === Number(formData.id_brigade)
                                );

                                if (equipesDeLaBrigade.length === 0) {
                                  return (
                                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                      Aucune équipe dans cette brigade
                                    </div>
                                  );
                                }

                                return equipesDeLaBrigade.map((equipe) => (
                                  <SelectItem key={equipe.id_equipe} value={String(equipe.id_equipe)}>
                                    {equipe.nom_equipe} - {equipe.specialite}
                                  </SelectItem>
                                ));
                              })()
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Spécialité */}
                    <div className="grid gap-2">
                      <Label htmlFor="specialite">Spécialité</Label>
                      <Textarea
                        id="specialite"
                        value={formData.specialite}
                        onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                        placeholder="Ex: Maçon, Électricien, etc."
                        rows={2}
                      />
                    </div>
                  </div>
                )}

                {/* Chef magasinier : Pas de configuration supplémentaire */}
                {employeeType === "chef_magasinier" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Shield className="h-4 w-4" />
                      <span className="font-medium">Configuration automatique</span>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">
                      Le chef magasinier sera automatiquement configuré avec les droits de gestion du matériel.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Mode édition : afficher tout */}
            {dialog?.type === "edit" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="prenom">Prénom *</Label>
                    <Input
                      id="prenom"
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      placeholder="Jean"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="nom">Nom *</Label>
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
                  <Label htmlFor="fonction">Fonction *</Label>
                  <Input
                    id="fonction"
                    value={formData.fonction}
                    onChange={(e) => setFormData({ ...formData, fonction: e.target.value })}
                    placeholder="Technicien voies"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="contact">Contact *</Label>
                  <Input
                    id="contact"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="034 12 345 67"
                    required
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
            )}
          </div>

          <DialogFooter className="flex justify-between items-center">
            {/* Bouton retour pour l'étape 2 */}
            {dialog?.type === "add" && employeeType !== "" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setEmployeeType("")}
              >
                ← Retour à l'étape 1
              </Button>
            )}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Annuler
              </Button>
              <Button
                type="button"
                onClick={employeeType === "" ? handleNextStep : handleSubmit}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={
                  dialog?.type === "edit" && (
                    !formData.prenom?.trim() ||
                    !formData.nom?.trim() ||
                    !formData.fonction?.trim() ||
                    !formData.contact?.trim()
                  )
                }
              >
                {dialog?.type === "add"
                  ? (employeeType === "" ? "Suivant →" : "Ajouter")
                  : "Modifier"
                }
              </Button>
            </div>
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
              {dialog.employee.specialite && (
                <div>
                  <Label className="text-sm text-muted-foreground">Spécialité</Label>
                  <p className="font-medium">{dialog.employee.specialite}</p>
                </div>
              )}
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
