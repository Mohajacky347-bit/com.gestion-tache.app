import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Calendar,
  List,
  Edit,
  Trash2,
  Eye,
  X,
  Download,
  Activity, // VOTRE ICÔNE DE CHARGEMENT
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

// MODIFICATION: Couleurs du premier code
const typeVariants = {
  conge: "teal",
  maladie: "orange"
} as const;

const statutLabels = {
  en_cours: "En cours",
  termine: "Terminé",
  planifie: "Planifié"
};

// MODIFICATION: Variants du premier code
const statutVariants = {
  en_cours: "progress",
  termine: "completed",
  planifie: "pending"
} as const;

type ViewMode = "list" | "calendar";
type AlertType = "success" | "error" | null;
type DialogType = "add" | "edit" | "delete" | "details" | null;

// AJOUT: Animations Framer Motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

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

  // AJOUT: Déclaration de stats
  const stats = {
    total: absences.length,
    en_cours: absences.filter(a => a.statut === "en_cours").length,
    planifie: absences.filter(a => a.statut === "planifie").length,
    conges: absences.filter(a => a.type === "conge").length,
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
      const absencesRes = await fetch("/api/absences", { cache: "no-store" });
      if (!absencesRes.ok) throw new Error("Erreur lors du chargement des absences");
      const absencesData = await absencesRes.json();

      const employesRes = await fetch("/api/employes", { cache: "no-store" });
      if (!employesRes.ok) throw new Error("Erreur lors du chargement des employés");
      const employesData = await employesRes.json();

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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error("Erreur lors de l'ajout");
        await fetchData();
        showAlert("success", "Absence ajoutée avec succès");
      } else if (dialog?.type === "edit" && dialog.absence) {
        const response = await fetch(`/api/absences/${dialog.absence.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const currentDate = new Date(year, month, day);
      days.push({ date: currentDate, isCurrentMonth: true });
    }

    const totalCells = 42;
    while (days.length < totalCells) {
      const nextDate = new Date(year, month + 1, days.length - lastDay.getDate() - firstDayOfWeek + 1);
      days.push({ date: nextDate, isCurrentMonth: false });
    }

    return days;
  };

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
    <div className="space-y-6">
      {/* Alert - GARDÉ LE VÔTRE */}
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

      {/* Header Section - GARDÉ LE VÔTRE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-600">Gestion des Absences</h1>
          <p className="text-slate-500 mt-1 font-normal">
            {stats.total} absence{stats.total > 1 ? 's' : ''} · {stats.en_cours} en cours · {stats.planifie} planifiée{stats.planifie > 1 ? 's' : ''}
          </p>
        </div>
        <Button 
          onClick={() => openDialog("add")}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Déclarer une absence
        </Button>
      </div>

      {/* Search and View Controls - GARDÉ LE VÔTRE */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Rechercher un employé, motif..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50">
            <button
              onClick={() => setViewMode("list")}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === "list" 
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <List className={`h-4 w-4 ${viewMode === "list" ? "text-blue-600" : "text-slate-600"}`} />
              <span>Liste</span>
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === "calendar" 
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Calendar className={`h-4 w-4 ${viewMode === "calendar" ? "text-blue-600" : "text-slate-600"}`} />
              <span>Calendrier</span>
            </button>
          </div>
          <Button variant="outline" size="sm" className="border-slate-200 hover:bg-slate-50 text-slate-700">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Calendar View - GARDÉ LE VÔTRE */}
      {viewMode === "calendar" && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            {/* Compact Header */}
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-900">
                  {monthNames[selectedDate.getMonth()]} <span className="text-slate-500 font-normal">{selectedDate.getFullYear()}</span>
                </h2>
                <div className="flex items-center gap-4 ml-6 text-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-teal-500"></div>
                    <span className="text-slate-600">Congé</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-orange-500"></div>
                    <span className="text-slate-600">Maladie</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                  className="w-9 h-9 p-0"
                >
                  <span className="text-slate-700">‹</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date())}
                  className="text-slate-700 hover:bg-slate-50"
                >
                  Aujourd'hui
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                  className="w-9 h-9 p-0"
                >
                  <span className="text-slate-700">›</span>
                </Button>
              </div>
            </div>

            {/* Compact Calendar Grid */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              {/* Days Header */}
              <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
                {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
                  <div key={day} className="text-center font-semibold text-slate-600 py-2 text-xs border-r border-slate-200 last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Days - COMPACT */}
              <div className="grid grid-cols-7">
                {days.map((day, index) => {
                  const dayAbsences = getAbsencesForDate(day.date);
                  const isToday = day.date.toDateString() === new Date().toDateString();
                  
                  return (
                    <div
                      key={index}
                      className={`relative min-h-20 p-2 border-r border-b border-slate-100 last:border-r-0 transition-colors ${
                        !day.isCurrentMonth ? "bg-slate-50/50" : "bg-white hover:bg-slate-50"
                      } ${isToday ? "ring-2 ring-inset ring-blue-500 bg-blue-50" : ""}`}
                    >
                      {/* Day Number - Compact */}
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-xs font-semibold ${
                          isToday 
                            ? "text-blue-600 font-bold" 
                            : day.isCurrentMonth 
                              ? "text-slate-700" 
                              : "text-slate-400"
                        }`}>
                          {day.date.getDate()}
                        </span>
                        
                        {/* Compact Badge */}
                        {dayAbsences.length > 0 && (
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-700 text-white text-xs font-bold">
                            {dayAbsences.length}
                          </span>
                        )}
                      </div>
                      
                      {/* Compact Absences */}
                      <div className="space-y-1">
                        {dayAbsences.slice(0, 4).map((absence) => (
                          <div
                            key={absence.id}
                            className={`group relative text-xs px-1.5 py-1 rounded cursor-pointer transition-all ${
                              absence.type === "conge"
                                ? "bg-teal-100 hover:bg-teal-200 text-teal-800 border border-teal-200"
                                : "bg-orange-100 hover:bg-orange-200 text-orange-800 border border-orange-200"
                            }`}
                            onClick={() => openDialog("details", absence)}
                          >
                            <div className="flex items-center gap-1">
                              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                absence.type === "conge" ? "bg-teal-600" : "bg-orange-600"
                              }`}></div>
                              <span className="font-medium truncate text-xs">
                                {absence.employe.prenom.charAt(0)}. {absence.employe.nom}
                              </span>
                            </div>
                            
                            {/* Tooltip */}
                            <div className="absolute left-full ml-2 top-0 z-50 hidden group-hover:block w-72 p-3 bg-slate-900 text-white rounded-lg shadow-2xl">
                              <div className="font-bold text-sm mb-1">{absence.employe.prenom} {absence.employe.nom}</div>
                              <div className="text-xs text-slate-300 mb-2">{absence.employe.fonction}</div>
                              <div className="flex items-center gap-2 text-xs mb-1">
                                <Badge className={`text-xs ${
                                  absence.type === "conge" 
                                    ? "bg-teal-100 text-teal-800 border-teal-200" 
                                    : "bg-orange-100 text-orange-800 border-orange-200"
                                }`}>
                                  {typeLabels[absence.type]}
                                </Badge>
                                <Badge variant={statutVariants[absence.statut]} className="text-xs">
                                  {statutLabels[absence.statut]}
                                </Badge>
                              </div>
                              <div className="text-xs border-t border-slate-700 pt-2 mt-2">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-3 h-3" />
                                  <span>{new Date(absence.dateDebut).toLocaleDateString()}</span>
                                  {absence.dateFin && (
                                    <>
                                      <span>→</span>
                                      <span>{new Date(absence.dateFin).toLocaleDateString()}</span>
                                    </>
                                  )}
                                </div>
                                {absence.motif && (
                                  <div className="mt-2 text-slate-300">{absence.motif}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {dayAbsences.length > 4 && (
                          <div className="text-xs text-slate-500 font-medium pl-1">
                            +{dayAbsences.length - 4}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List View - MODIFIÉ: Style du premier code */}
      {viewMode === "list" && (
        <motion.div
          key="list"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border border-border/50 shadow-sm bg-card overflow-hidden">
            <CardContent className="p-0">
              {/* MODIFICATION: VOTRE icône de chargement */}
              {loading ? (
                <div className="text-center py-12">
                  <Activity className="h-8 w-8 animate-spin mx-auto mb-3 text-blue-600" />
                  <p className="text-slate-500 font-medium">Chargement des absences...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 border-b border-border/50 hover:bg-muted/50">
                        <TableHead className="font-semibold text-foreground text-xs md:text-sm">ID</TableHead>
                        <TableHead className="font-semibold text-foreground text-xs md:text-sm">Employé</TableHead>
                        <TableHead className="font-semibold text-foreground text-xs md:text-sm">Type</TableHead>
                        <TableHead className="font-semibold text-foreground text-xs md:text-sm">Période</TableHead>
                        <TableHead className="font-semibold text-foreground text-xs md:text-sm">Durée</TableHead>
                        <TableHead className="font-semibold text-foreground text-xs md:text-sm">Motif</TableHead>
                        <TableHead className="font-semibold text-foreground text-xs md:text-sm">Statut</TableHead>
                        <TableHead className="text-right font-semibold text-foreground text-xs md:text-sm">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAbsences.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground py-12 md:py-16">
                            <div className="flex flex-col items-center gap-2 md:gap-3">
                              <Calendar className="h-8 w-8 md:h-12 md:w-12 text-muted-foreground/50" />
                              <p className="text-base md:text-lg font-medium">Aucune absence trouvée</p>
                              <p className="text-xs md:text-sm">Commencez par déclarer une nouvelle absence</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredAbsences.map((absence, index) => (
                        <motion.tr
                          key={absence.id}
                          className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <TableCell className="font-mono text-xs md:text-sm text-muted-foreground">{absence.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 md:gap-3">
                              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs md:text-sm">
                                {absence.employe.prenom.charAt(0)}{absence.employe.nom.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium text-foreground text-xs md:text-sm">
                                  {absence.employe.prenom} {absence.employe.nom}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {absence.employe.fonction}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              absence.type === "conge" 
                                ? "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-900/30 dark:text-teal-300" 
                                : "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                            }>
                              {typeLabels[absence.type]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs md:text-sm">
                              <div className="text-foreground font-medium">
                                {new Date(absence.dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                              </div>
                              {absence.dateFin && (
                                <div className="text-muted-foreground">
                                  → {new Date(absence.dateFin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs md:text-sm font-semibold text-foreground">
                              {calculateDuration(absence.dateDebut, absence.dateFin)} jour{calculateDuration(absence.dateDebut, absence.dateFin) > 1 ? 's' : ''}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs md:text-sm text-muted-foreground max-w-[100px] md:max-w-[150px] truncate block">
                              {absence.motif || '—'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              absence.statut === "en_cours" 
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" 
                                : absence.statut === "termine"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                            }>
                              {statutLabels[absence.statut]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => openDialog("details", absence)}
                                className="h-7 w-7 md:h-8 md:w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                              >
                                <Eye className="h-3 w-3 md:h-4 md:w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => openDialog("edit", absence)}
                                className="h-7 w-7 md:h-8 md:w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                              >
                                <Edit className="h-3 w-3 md:h-4 md:w-4" />
                              </Button>
                              {absence.statut === "en_cours" && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => cloturerAbsence(absence)}
                                  className="h-7 text-xs border-border/50"
                                >
                                  <X className="h-2 w-2 md:h-3 md:w-3 mr-1" />
                                  Clôturer
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-7 w-7 md:h-8 md:w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => openDialog("delete", absence)}
                              >
                                <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Dialog d'ajout/modification - GARDÉ LE VÔTRE */}
      <Dialog open={dialog?.type === "add" || dialog?.type === "edit"} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">
              {dialog?.type === "add" ? "Déclarer une absence" : "Modifier l'absence"}
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              {dialog?.type === "add" 
                ? "Remplissez les informations de l'absence." 
                : "Modifiez les informations de l'absence."
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="employe" className="text-slate-700 font-medium">Employé</Label>
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
                <Label htmlFor="type" className="text-slate-700 font-medium">Type d'absence</Label>
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
                <Label htmlFor="statut" className="text-slate-700 font-medium">Statut</Label>
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
                <Label htmlFor="dateDebut" className="text-slate-700 font-medium">Date de début</Label>
                <Input
                  id="dateDebut"
                  type="date"
                  value={formData.dateDebut}
                  onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dateFin" className="text-slate-700 font-medium">Date de fin</Label>
                <Input
                  id="dateFin"
                  type="date"
                  value={formData.dateFin}
                  onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="motif" className="text-slate-700 font-medium">Motif</Label>
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
              className="bg-slate-900 hover:bg-slate-800"
            >
              {dialog?.type === "add" ? "Déclarer" : "Modifier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de détails - GARDÉ LE VÔTRE */}
      <Dialog open={dialog?.type === "details"} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">
              Détails de l'absence
            </DialogTitle>
          </DialogHeader>
          {dialog?.absence && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-500">ID</Label>
                  <p className="font-medium text-slate-900 mt-1">{dialog.absence.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-500">Statut</Label>
                  <div className="mt-1">
                    <Badge variant={statutVariants[dialog.absence.statut]}>
                      {statutLabels[dialog.absence.statut]}
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-500">Employé</Label>
                <p className="font-medium text-slate-900 mt-1">{dialog.absence.employe.prenom} {dialog.absence.employe.nom}</p>
                <p className="text-sm text-slate-500 mt-1">{dialog.absence.employe.fonction}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-500">Type</Label>
                <div className="mt-1">
                  <Badge 
                    className={`${
                      dialog.absence.type === "conge" 
                        ? "bg-teal-100 text-teal-800 border-teal-200" 
                        : "bg-orange-100 text-orange-800 border-orange-200"
                    }`}
                  >
                    {typeLabels[dialog.absence.type]}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-500">Date de début</Label>
                  <p className="font-medium text-slate-900 mt-1">{new Date(dialog.absence.dateDebut).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-500">Date de fin</Label>
                  <p className="font-medium text-slate-900 mt-1">
                    {dialog.absence.dateFin 
                      ? new Date(dialog.absence.dateFin).toLocaleDateString()
                      : "En cours..."
                    }
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-500">Durée</Label>
                <p className="font-medium text-slate-900 mt-1">
                  {calculateDuration(dialog.absence.dateDebut, dialog.absence.dateFin)} jour
                  {calculateDuration(dialog.absence.dateDebut, dialog.absence.dateFin) > 1 ? "s" : ""}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-500">Motif</Label>
                <p className="font-medium text-slate-900 mt-1">{dialog.absence.motif || '-'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de suppression - GARDÉ LE VÔTRE */}
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