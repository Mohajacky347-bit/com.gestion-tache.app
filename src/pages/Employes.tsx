import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Search,
  Edit,
  Phone,
  Star,
  Trash2,
  Send,
  Eye,
  AlertTriangle,
  Crown,
  Shield,
  Users,
  Briefcase,
  MapPin
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

  useEffect(() => {
    fetchData();
    fetchBrigades();
    fetchEquipes();
  }, []);

  const fetchEquipes = async () => {
    try {
      const res = await fetch("/api/equipes");
      if (!res.ok) throw new Error("Erreur lors du chargement des équipes");
      const data: Equipe[] = await res.json();
      setEquipes(data);
    } catch (error) {
      console.error('Error fetching equipes:', error);
    }
  };

  const fetchBrigades = async () => {
    try {
      const res = await fetch("/api/brigades");
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
      const res = await fetch("/api/employes");
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

        let payload: any = {
          nom: employeData.nom?.trim(),
          prenom: employeData.prenom?.trim(),
          fonction: employeData.fonction?.trim(),
          contact: employeData.contact?.trim(),
          disponibilite: formData.disponibilite || "disponible",
        };

        if (employeeType === "chef_brigade") {
          if (!formData.id_brigade || formData.id_brigade === "" || formData.id_brigade === "0") {
            showAlert("error", "Veuillez sélectionner une brigade valide pour le chef de brigade");
            return;
          }
          const brigadeId = Number(formData.id_brigade);
          if (isNaN(brigadeId) || brigadeId <= 0) {
            showAlert("error", "Veuillez sélectionner une brigade valide pour le chef de brigade");
            return;
          }
          payload.isChefBrigade = true;
          payload.id_brigade = brigadeId;
          payload.specialite = undefined;
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
    if (!formData.prenom?.trim() || !formData.nom?.trim() ||
      !formData.fonction?.trim() || !formData.contact?.trim()) {
      showAlert("error", "Veuillez remplir tous les champs obligatoires");
      return;
    }
    setEmployeeType("employe");
  };

  const transferEmployee = (employee: Employee) => {
    window.alert(`Transfert de l'employé ${employee.prenom} ${employee.nom} - Fonctionnalité à développer`);
  };

  const getInitials = (prenom: string, nom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  const getAvatarGradient = (id: string) => {
    const gradients = [
      "from-blue-500 to-cyan-400",
      "from-purple-500 to-pink-400",
      "from-emerald-500 to-teal-400",
      "from-orange-500 to-amber-400",
      "from-rose-500 to-red-400",
      "from-indigo-500 to-violet-400",
    ];
    const index = parseInt(id) % gradients.length;
    return gradients[index];
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Alerte */}
      {alert && (
        <Alert className={`fixed top-4 right-4 z-50 w-96 shadow-2xl border-l-4 backdrop-blur-sm ${alert.type === "success"
            ? "border-emerald-500 bg-emerald-50/95"
            : "border-red-500 bg-red-50/95"
          }`}>
          <AlertDescription className={`font-medium ${alert.type === "success" ? "text-emerald-800" : "text-red-800"
            }`}>
            {alert.message}
          </AlertDescription>
        </Alert>
      )}

      {/* En-tête spectaculaire */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Gestion des Employés
            </h1>
            <p className="text-blue-200/80 text-lg">
              {filteredEmployees.length} employé{filteredEmployees.length > 1 ? 's' : ''} dans le service infrastructure
            </p>
          </div>
          <Button
            size="lg"
            className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 shadow-xl transition-all duration-300 hover:scale-105"
            onClick={() => openDialog("add")}
          >
            <Plus className="h-5 w-5 mr-2" />
            Ajouter un employé
          </Button>
        </div>
      </div>

      {/* Barre de recherche élégante */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl" />
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg p-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Rechercher par nom, prénom, fonction ou spécialité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Grille d'employés */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-gray-200 mb-4" />
                  <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <Users className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun employé trouvé</h3>
          <p className="text-gray-500">Essayez de modifier votre recherche ou ajoutez un nouvel employé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEmployees.map((employee, index) => (
            <Card 
              key={employee.id} 
              className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Bande de disponibilité */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${
                employee.disponibilite === 'disponible' 
                  ? 'bg-gradient-to-r from-emerald-400 to-green-500' 
                  : employee.disponibilite === 'affecte' 
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                  : 'bg-gradient-to-r from-red-400 to-rose-500'
              }`} />
              
              {/* Effet de hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500" />
              
              <CardContent className="p-6 relative">
                {/* Avatar et infos principales */}
                <div className="flex flex-col items-center text-center mb-4">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getAvatarGradient(employee.id)} flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {getInitials(employee.prenom, employee.nom)}
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {employee.prenom} {employee.nom}
                  </h3>
                  
                  <Badge variant={disponibiliteVariants[employee.disponibilite]} className="mb-3">
                    {disponibiliteLabels[employee.disponibilite]}
                  </Badge>
                </div>

                {/* Détails */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="h-4 w-4 text-blue-500" />
                    </div>
                    <span className="truncate">{employee.fonction}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-4 w-4 text-emerald-500" />
                    </div>
                    <span>{employee.contact}</span>
                  </div>
                  
                  {employee.specialite && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <Star className="h-4 w-4 text-amber-500" />
                      </div>
                      <span className="truncate">{employee.specialite}</span>
                    </div>
                  )}
                  
                  {employee.tacheActuelle && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-4 w-4 text-purple-500" />
                      </div>
                      <span className="truncate">{employee.tacheActuelle}</span>
                    </div>
                  )}
                </div>

                {/* Actions au hover */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => openDialog("details", employee)}
                      title="Voir détails"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 hover:bg-emerald-50 hover:text-emerald-600"
                      onClick={() => openDialog("edit", employee)}
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 hover:bg-purple-50 hover:text-purple-600"
                      onClick={() => transferEmployee(employee)}
                      title="Transférer"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 hover:bg-red-50 hover:text-red-600"
                      onClick={() => openDialog("delete", employee)}
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog d'ajout/modification */}
      <Dialog open={dialog?.type === "add" || dialog?.type === "edit"} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {dialog?.type === "add" ? "Ajouter un employé" : "Modifier l'employé"}
            </DialogTitle>
            <DialogDescription>
              {dialog?.type === "add"
                ? `Étape ${employeeType === "" ? 1 : 2} sur 2 - ${employeeType === "" ? "Informations de base" : "Configuration"}`
                : "Modifiez les informations de l'employé."
              }
            </DialogDescription>
          </DialogHeader>

          {dialog?.type === "add" && (
            <div className="flex space-x-1 rounded-lg bg-muted p-1 mb-4">
              <div className={`flex-1 text-center py-2 rounded-md text-sm font-medium transition-all ${employeeType === ""
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground"
                }`}>
                Étape 1: Informations
              </div>
              <div className={`flex-1 text-center py-2 rounded-md text-sm font-medium transition-all ${employeeType !== ""
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground"
                }`}>
                Étape 2: Configuration
              </div>
            </div>
          )}

          <div className="grid gap-4 py-4">
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

                {employeeType === "employe" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="id_brigade_employe" className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Brigade *
                          {formData.id_brigade && (
                            <Badge variant="outline" className="text-xs">
                              {equipes.filter(e => e.id_brigade === Number(formData.id_brigade)).length} équipe(s)
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
                          <SelectTrigger className={!formData.id_brigade ? "bg-muted text-muted-foreground" : ""}>
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

                {employeeType === "chef_magasinier" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
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
            {dialog?.type === "add" && employeeType !== "" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setEmployeeType("")}
              >
                ← Retour à l'étape 1
              </Button>
            )}

            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Annuler
              </Button>
              <Button
                type="button"
                onClick={employeeType === "" && dialog?.type === "add" ? handleNextStep : handleSubmit}
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
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Détails de l'employé
            </DialogTitle>
          </DialogHeader>
          {dialog?.employee && (
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getAvatarGradient(dialog.employee.id)} flex items-center justify-center text-white text-3xl font-bold shadow-xl mb-4`}>
                  {getInitials(dialog.employee.prenom, dialog.employee.nom)}
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {dialog.employee.prenom} {dialog.employee.nom}
                </h3>
                <Badge variant={disponibiliteVariants[dialog.employee.disponibilite]} className="mt-2">
                  {disponibiliteLabels[dialog.employee.disponibilite]}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">ID</Label>
                  <p className="font-semibold mt-1">{dialog.employee.id}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Contact</Label>
                  <p className="font-semibold mt-1">{dialog.employee.contact}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Fonction</Label>
                <p className="font-semibold mt-1">{dialog.employee.fonction}</p>
              </div>

              {dialog.employee.specialite && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Spécialité</Label>
                  <p className="font-semibold mt-1">{dialog.employee.specialite}</p>
                </div>
              )}

              {dialog.employee.tacheActuelle && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <Label className="text-xs text-blue-600 uppercase tracking-wide">Tâche actuelle</Label>
                  <p className="font-semibold mt-1 text-blue-900">{dialog.employee.tacheActuelle}</p>
                </div>
              )}

              {dialog.employee.dateAbsence && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <Label className="text-xs text-amber-600 uppercase tracking-wide">Absence</Label>
                  <p className="font-semibold mt-1 text-amber-900">
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
            <AlertDialogTitle className="text-xl">Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <div>
                Vous êtes sur le point de supprimer{" "}
                <span className="font-semibold text-foreground">
                  {dialog?.employee?.prenom} {dialog?.employee?.nom}
                </span>.
              </div>

              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
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
