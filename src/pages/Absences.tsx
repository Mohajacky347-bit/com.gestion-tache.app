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
  Calendar,
  User,
  Grid3X3,
  List,
  Edit,
  Trash2,
  Eye,
  X
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

interface Employe {
  id: string;
  nom: string;
  prenom: string;
  fonction: string;
  disponibilite: string;
}

interface Absence {
  id: string;
  idEmploye: string;
  employe: Employe;
  type: "conge" | "maladie";
  dateDebut: string;
  dateFin?: string;
  motif?: string;
  statut: "en_cours" | "termine" | "planifie";
}

const typeLabels = {
  conge: "Congé",
  maladie: "Maladie"
};

const typeVariants = {
  conge: "secondary",
  maladie: "paused"
} as const;

const statutLabels = {
  en_cours: "En cours",
  termine: "Terminé",
  planifie: "Planifié"
};

const statutVariants = {
  en_cours: "progress",
  termine: "completed",
  planifie: "pending"
} as const;

type ViewMode = "list" | "calendar";
type AlertType = "success" | "error" | null;
type DialogType = "add" | "edit" | "delete" | "details" | null;

export default function Absences() {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [alert, setAlert] = useState<{ type: AlertType; message: string } | null>(null);
  const [dialog, setDialog] = useState<{ type: DialogType; absence?: Absence } | null>(null);
  const [formData, setFormData] = useState<Partial<Absence>>({
    idEmploye: "",
    type: "conge",
    dateDebut: "",
    dateFin: "",
    motif: "",
    statut: "planifie"
  });

  const filteredAbsences = absences.filter(abs =>
    abs.employe.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    abs.employe.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    abs.motif?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: absences.length,
    en_cours: absences.filter(a => a.statut === "en_cours").length,
    planifie: absences.filter(a => a.statut === "planifie").length,
    conge: absences.filter(a => a.type === "conge").length,
    maladie: absences.filter(a => a.type === "maladie").length
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
      // Récupérer les absences
      const absencesRes = await fetch("/api/absences", { cache: "no-store" });
      if (!absencesRes.ok) throw new Error("Erreur lors du chargement des absences");
      const absencesData = await absencesRes.json();

      // Récupérer les employés
      const employesRes = await fetch("/api/employes", { cache: "no-store" });
      if (!employesRes.ok) throw new Error("Erreur lors du chargement des employés");
      const employesData = await employesRes.json();

      // Associer les employés aux absences
      const absencesWithEmployes = absencesData.map((absence: any) => ({
        ...absence,
        employe: employesData.find((emp: Employe) => emp.id === absence.idEmploye)
      }));

      setAbsences(absencesWithEmployes);
      setEmployes(employesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type: AlertType, message: string) => {
    setAlert({ type, message });
  };

  const openDialog = (type: DialogType, absence?: Absence) => {
    setDialog({ type, absence });
    if (type === "edit" && absence) {
      setFormData({
        idEmploye: absence.idEmploye,
        type: absence.type,
        dateDebut: absence.dateDebut,
        dateFin: absence.dateFin,
        motif: absence.motif,
        statut: absence.statut
      });
    } else if (type === "add") {
      setFormData({
        idEmploye: "",
        type: "conge",
        dateDebut: "",
        dateFin: "",
        motif: "",
        statut: "planifie"
      });
    }
  };

  const closeDialog = () => {
    setDialog(null);
    setFormData({
      idEmploye: "",
      type: "conge",
      dateDebut: "",
      dateFin: "",
      motif: "",
      statut: "planifie"
    });
  };

  const handleSubmit = async () => {
    try {
      if (dialog?.type === "add") {
        const response = await fetch("/api/absences", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error("Erreur lors de l'ajout");
        
        await fetchData();
        showAlert("success", "Absence ajoutée avec succès");

      } else if (dialog?.type === "edit" && dialog.absence) {
        const response = await fetch(`/api/absences/${dialog.absence.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error("Erreur lors de la modification");
        
        await fetchData();
        showAlert("success", "Absence modifiée avec succès");

      } else if (dialog?.type === "delete" && dialog.absence) {
        const response = await fetch(`/api/absences/${dialog.absence.id}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Erreur lors de la suppression");
        
        await fetchData();
        showAlert("success", "Absence supprimée avec succès");
      }
      
      closeDialog();
    } catch (error) {
      showAlert("error", "Erreur lors de l'opération");
    }
  };

  const cloturerAbsence = async (absence: Absence) => {
    try {
      const response = await fetch(`/api/absences/${absence.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...absence,
          statut: "termine",
          dateFin: new Date().toISOString().split('T')[0]
        }),
      });

      if (!response.ok) throw new Error("Erreur lors de la clôture");
      
      await fetchData();
      showAlert("success", "Absence clôturée avec succès");
    } catch (error) {
      showAlert("error", "Erreur lors de la clôture");
    }
  };

  const calculateDuration = (debut: string, fin?: string) => {
    const startDate = new Date(debut);
    const endDate = fin ? new Date(fin) : new Date();
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Fonction pour générer les jours du mois
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Ajouter les jours du mois précédent pour compléter la première semaine
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    // Ajouter les jours du mois courant
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const currentDate = new Date(year, month, day);
      days.push({ date: currentDate, isCurrentMonth: true });
    }

    // Ajouter les jours du mois suivant pour compléter la dernière semaine
    const totalCells = 42;
    while (days.length < totalCells) {
      const nextDate = new Date(year, month + 1, days.length - lastDay.getDate() - firstDayOfWeek + 1);
      days.push({ date: nextDate, isCurrentMonth: false });
    }

    return days;
  };

  // Obtenir les absences pour une date spécifique
  const getAbsencesForDate = (date: Date) => {
    return absences.filter(absence => {
      const startDate = new Date(absence.dateDebut);
      const endDate = absence.dateFin ? new Date(absence.dateFin) : startDate;
      
      return date >= startDate && date <= endDate;
    });
  };

  const days = getDaysInMonth(selectedDate);
  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

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
            Gestion des Absences
          </h1>
          <p className="text-muted-foreground mt-2">
            Suivez les absences des employés du service
          </p>
        </div>
        <Button 
          className="shadow-soft bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          onClick={() => openDialog("add")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Déclarer une absence
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="shadow-soft border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-orange-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En cours</p>
                <p className="text-2xl font-bold text-orange-600">{stats.en_cours}</p>
              </div>
              <User className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Planifiées</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.planifie}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Congés</p>
                <p className="text-2xl font-bold text-green-600">{stats.conge}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Maladies</p>
                <p className="text-2xl font-bold text-red-600">{stats.maladie}</p>
              </div>
              <User className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and View Controls */}
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher par nom d'employé ou motif..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="flex items-center gap-2"
              >
                <List className="h-4 w-4" />
                Liste
              </Button>
              <Button
                variant={viewMode === "calendar" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("calendar")}
                className="flex items-center gap-2"
              >
                <Grid3X3 className="h-4 w-4" />
                Calendrier
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Calendrier des Absences - {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                >
                  Mois précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date())}
                >
                  Aujourd'hui
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                >
                  Mois suivant
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
                <div key={day} className="text-center font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const dayAbsences = getAbsencesForDate(day.date);
                const isToday = day.date.toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={index}
                    className={`min-h-24 p-2 border rounded-lg ${
                      day.isCurrentMonth
                        ? "bg-background border-border"
                        : "bg-muted/20 border-muted/30"
                    } ${
                      isToday ? "ring-2 ring-primary ring-offset-1" : ""
                    }`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      day.isCurrentMonth ? "text-foreground" : "text-muted-foreground"
                    } ${isToday ? "text-primary" : ""}`}>
                      {day.date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayAbsences.slice(0, 2).map((absence) => (
                        <div
                          key={absence.id}
                          className={`text-xs p-1 rounded cursor-pointer ${
                            absence.type === "conge"
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}
                          title={`${absence.employe.prenom} ${absence.employe.nom} - ${typeLabels[absence.type]}`}
                        >
                          <div className="font-medium truncate">
                            {absence.employe.prenom.charAt(0)}. {absence.employe.nom}
                          </div>
                          <div className="truncate">{typeLabels[absence.type]}</div>
                        </div>
                      ))}
                      {dayAbsences.length > 2 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{dayAbsences.length - 2} autres
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Historique des Absences ({filteredAbsences.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>ID</TableHead>
                    <TableHead>Employé</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Durée</TableHead>
                    <TableHead>Motif</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        Chargement...
                      </TableCell>
                    </TableRow>
                  ) : filteredAbsences.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        Aucune absence trouvée
                      </TableCell>
                    </TableRow>
                  ) : filteredAbsences.map((absence) => (
                    <TableRow key={absence.id} className="hover:bg-muted/30 transition-smooth">
                      <TableCell className="font-medium">{absence.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-foreground">
                            {absence.employe.prenom} {absence.employe.nom}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {absence.employe.fonction}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={typeVariants[absence.type]}>
                          {typeLabels[absence.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Du {new Date(absence.dateDebut).toLocaleDateString()}</div>
                          {absence.dateFin && (
                            <div className="text-muted-foreground">
                              Au {new Date(absence.dateFin).toLocaleDateString()}
                            </div>
                          )}
                          {!absence.dateFin && absence.statut === "en_cours" && (
                            <div className="text-muted-foreground">En cours...</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {calculateDuration(absence.dateDebut, absence.dateFin)} jour
                          {calculateDuration(absence.dateDebut, absence.dateFin) > 1 ? "s" : ""}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{absence.motif}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statutVariants[absence.statut]}>
                          {statutLabels[absence.statut]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openDialog("details", absence)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openDialog("edit", absence)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {absence.statut === "en_cours" && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => cloturerAbsence(absence)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Clôturer
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => openDialog("delete", absence)}
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
      )}

      {/* Dialog d'ajout/modification */}
      <Dialog open={dialog?.type === "add" || dialog?.type === "edit"} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {dialog?.type === "add" ? "Déclarer une absence" : "Modifier l'absence"}
            </DialogTitle>
            <DialogDescription>
              {dialog?.type === "add" 
                ? "Remplissez les informations de l'absence." 
                : "Modifiez les informations de l'absence."
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="employe">Employé</Label>
              <Select 
                value={formData.idEmploye} 
                onValueChange={(value) => setFormData({ ...formData, idEmploye: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un employé" />
                </SelectTrigger>
                <SelectContent>
                  {employes.map((employe) => (
                    <SelectItem key={employe.id} value={employe.id}>
                      {employe.prenom} {employe.nom} - {employe.fonction}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Type d'absence</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: "conge" | "maladie") => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conge">Congé</SelectItem>
                    <SelectItem value="maladie">Maladie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="statut">Statut</Label>
                <Select 
                  value={formData.statut} 
                  onValueChange={(value: "en_cours" | "termine" | "planifie") => setFormData({ ...formData, statut: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planifie">Planifié</SelectItem>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="termine">Terminé</SelectItem>
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

            <div className="grid gap-2">
              <Label htmlFor="motif">Motif</Label>
              <Textarea
                id="motif"
                value={formData.motif}
                onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                placeholder="Raison de l'absence..."
                rows={3}
              />
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
              {dialog?.type === "add" ? "Déclarer" : "Modifier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de détails */}
      <Dialog open={dialog?.type === "details"} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Détails de l'absence
            </DialogTitle>
          </DialogHeader>
          {dialog?.absence && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">ID</Label>
                  <p className="font-medium">{dialog.absence.id}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Statut</Label>
                  <Badge variant={statutVariants[dialog.absence.statut]}>
                    {statutLabels[dialog.absence.statut]}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Employé</Label>
                <p className="font-medium">{dialog.absence.employe.prenom} {dialog.absence.employe.nom}</p>
                <p className="text-sm text-muted-foreground">{dialog.absence.employe.fonction}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Type</Label>
                <Badge variant={typeVariants[dialog.absence.type]}>
                  {typeLabels[dialog.absence.type]}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Date de début</Label>
                  <p className="font-medium">{new Date(dialog.absence.dateDebut).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Date de fin</Label>
                  <p className="font-medium">
                    {dialog.absence.dateFin 
                      ? new Date(dialog.absence.dateFin).toLocaleDateString()
                      : "En cours..."
                    }
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Durée</Label>
                <p className="font-medium">
                  {calculateDuration(dialog.absence.dateDebut, dialog.absence.dateFin)} jour
                  {calculateDuration(dialog.absence.dateDebut, dialog.absence.dateFin) > 1 ? "s" : ""}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Motif</Label>
                <p className="font-medium">{dialog.absence.motif}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de suppression */}
      <AlertDialog open={dialog?.type === "delete"} onOpenChange={closeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement l'absence de{" "}
              <span className="font-semibold">{dialog?.absence?.employe.prenom} {dialog?.absence?.employe.nom}</span>. 
              Cette action ne peut pas être annulée.
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
