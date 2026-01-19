'use client'

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Activity,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Users,
  Palmtree,
  Stethoscope,
  Sparkles,
  User,
  Clock,
  AlertCircle,
  CheckCircle
} from "lucide-react";

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

// Configuration pour les types d'absence
const typeConfig = {
  conge: { 
    label: "Congé", 
    icon: Palmtree, 
    className: "bg-success/10 text-success border-success/20", 
    dotColor: "bg-success",
  },
  maladie: { 
    label: "Maladie", 
    icon: Stethoscope, 
    className: "bg-warning/10 text-warning border-warning/20", 
    dotColor: "bg-warning",
  }
};

// Configuration pour les statuts
const statutConfig = {
  en_cours: { 
    label: "En cours", 
    className: "bg-primary/10 text-primary border-primary/20",
    icon: Clock
  },
  termine: { 
    label: "Terminé", 
    className: "bg-success/10 text-success border-success/20",
    icon: CheckCircle
  },
  planifie: { 
    label: "Planifié", 
    className: "bg-muted/10 text-muted-foreground border-border",
    icon: Calendar
  }
};

type ViewMode = "list" | "calendar";
type AlertType = "success" | "error" | null;
type DialogType = "add" | "edit" | "delete" | "details" | null;

const ITEMS_PER_PAGE = 5;

export default function Absences() {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
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
  const [currentPage, setCurrentPage] = useState(1);

  // Filtrage et pagination
  const filteredAbsences = absences.filter(abs =>
    abs.employe?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    abs.employe?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    abs.motif?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAbsences.length / ITEMS_PER_PAGE);
  const paginatedAbsences = filteredAbsences.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
    if (!debut) return 0;
    const startDate = new Date(debut);
    const endDate = fin ? new Date(fin) : new Date();
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Fonctions pour le calendrier
  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true });
    }

    while (days.length < 42) {
      const nextDate = new Date(year, month + 1, days.length - lastDay.getDate() - firstDayOfWeek + 1);
      days.push({ date: nextDate, isCurrentMonth: false });
    }

    return days;
  };

  const getAbsencesForDate = (date: Date) => {
    return absences.filter(absence => {
      if (!absence.dateDebut || !absence.employe) return false;
      
      const startDate = new Date(absence.dateDebut);
      const endDate = absence.dateFin ? new Date(absence.dateFin) : startDate;
      
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      const checkDate = new Date(date);
      checkDate.setHours(12, 0, 0, 0);
      
      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  const days = getDaysInMonth(selectedDate);

  // Obtenir les absences en cours (aujourd'hui compris)
  const getAbsencesEnCours = () => {
    const aujourdHui = new Date();
    aujourdHui.setHours(0, 0, 0, 0);
    
    return absences.filter(absence => {
      if (absence.statut !== "en_cours") return false;
      
      const startDate = new Date(absence.dateDebut);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = absence.dateFin ? new Date(absence.dateFin) : null;
      if (endDate) endDate.setHours(23, 59, 59, 999);
      
      // Vérifier si aujourd'hui est entre dateDebut et dateFin (si existante)
      if (endDate) {
        return aujourdHui >= startDate && aujourdHui <= endDate;
      } else {
        return aujourdHui >= startDate;
      }
    });
  };

  const absencesEnCours = getAbsencesEnCours();

  return (
    <div className="space-y-6">
      {/* Alert - Style moderne */}
      {alert && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50"
        >
          <Alert className={`w-96 shadow-xl border-l-4 ${alert.type === "success" 
            ? "border-success bg-success/10" 
            : "border-destructive bg-destructive/10"
          }`}>
            <div className="flex items-center gap-3">
              {alert.type === "success" ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive" />
              )}
              <AlertDescription className={`font-medium ${
                alert.type === "success" ? "text-success-foreground" : "text-destructive-foreground"
              }`}>
                {alert.message}
              </AlertDescription>
            </div>
          </Alert>
        </motion.div>
      )}

      {/* Header Section - Style du premier code */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <motion.div
              className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-glow"
              whileHover={{ scale: 1.05 }}
            >
              <CalendarRange className="h-6 w-6 text-primary-foreground" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Gestion des Absences</h1>
              <p className="text-sm text-muted-foreground">Suivi des congés et absences du personnel</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Bouton de vue */}
            <div className="flex items-center rounded-xl border border-border/50 p-1 bg-secondary/50">
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => { setViewMode("list"); setCurrentPage(1); }}
                className={`h-8 px-3 rounded-lg transition-all ${viewMode === "list" ? "shadow-sm" : ""}`}
              >
                <List className="h-4 w-4 mr-1.5" />
                Liste
              </Button>
              <Button
                variant={viewMode === "calendar" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("calendar")}
                className={`h-8 px-3 rounded-lg transition-all ${viewMode === "calendar" ? "shadow-sm" : ""}`}
              >
                <Calendar className="h-4 w-4 mr-1.5" />
                Calendrier
              </Button>
            </div>
            
            {/* Bouton exporter */}
            <Button variant="outline" size="sm" className="border-border/50 hover:bg-primary/10">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            
            {/* Bouton ajouter */}
            <Button 
              onClick={() => openDialog("add")}
              className="gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Déclarer absence
            </Button>
          </div>
        </div>
      </div>

      {/* Search - Style du premier code */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Rechercher par nom, prénom ou motif..."
          value={searchTerm}
          onChange={(e) => { 
            setSearchTerm(e.target.value); 
            setCurrentPage(1); 
          }}
          className="pl-10 border-border/50 focus:border-primary"
        />
      </div>

      <AnimatePresence mode="wait">
        {/* Calendar View - Style du premier code */}
        {viewMode === "calendar" && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Calendar Card */}
            <div className="border-border/50 shadow-soft rounded-xl overflow-hidden bg-card">
              <div className="p-0">
                {/* Calendar Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 border-b border-border/50">
                  <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                      </h2>
                      <p className="text-sm text-muted-foreground">Visualisez les absences du mois</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    {/* Legend */}
                    <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-card border border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-success" />
                        <Palmtree className="h-4 w-4 text-success" />
                        <span className="text-sm text-foreground font-medium">Congé</span>
                      </div>
                      <div className="w-px h-4 bg-border" />
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-warning" />
                        <Stethoscope className="h-4 w-4 text-warning" />
                        <span className="text-sm text-foreground font-medium">Maladie</span>
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                        className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:border-primary/30"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDate(new Date())}
                        className="px-4 rounded-xl hover:bg-primary/10 hover:border-primary/30"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Aujourd'hui
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                        className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:border-primary/30"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="p-6">
                  {/* Week days header */}
                  <div className="grid grid-cols-7 mb-3">
                    {weekDays.map((day, i) => (
                      <div 
                        key={day} 
                        className={`text-center font-bold py-3 text-sm rounded-lg ${
                          i >= 5 ? "text-muted-foreground/60 bg-muted/30" : "text-foreground bg-secondary/50"
                        }`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Days grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {days.map((day, index) => {
                      const dayAbsences = getAbsencesForDate(day.date);
                      const isToday = day.date.toDateString() === new Date().toDateString();
                      const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
                      
                      return (
                        <Tooltip key={index}>
                          <TooltipTrigger asChild>
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.003 }}
                              className={`
                                relative min-h-24 p-2 rounded-xl border-2 transition-all cursor-pointer
                                ${!day.isCurrentMonth 
                                  ? "bg-muted/20 border-transparent opacity-30" 
                                  : isWeekend 
                                    ? "bg-muted/30 border-border/30 hover:border-primary/30" 
                                    : "bg-card border-border/50 hover:border-primary hover:shadow-lg"
                                }
                                ${isToday ? "ring-2 ring-primary ring-offset-2 ring-offset-background border-primary" : ""}
                                ${dayAbsences.length > 0 ? "hover:scale-[1.02]" : ""}
                              `}
                            >
                              {/* Day number */}
                              <div className="flex items-center justify-between mb-2">
                                <span className={`
                                  text-sm font-bold w-7 h-7 flex items-center justify-center rounded-lg
                                  ${isToday 
                                    ? "bg-primary text-primary-foreground shadow-glow" 
                                    : day.isCurrentMonth 
                                      ? "text-foreground" 
                                      : "text-muted-foreground/50"
                                  }
                                `}>
                                  {day.date.getDate()}
                                </span>
                                {dayAbsences.length > 0 && (
                                  <Badge variant="secondary" className="h-5 px-1.5 text-xs font-bold bg-primary/10 text-primary border-0">
                                    {dayAbsences.length}
                                  </Badge>
                                )}
                              </div>
                              
                              {/* Absences indicators */}
                              <div className="space-y-1">
                                {dayAbsences.slice(0, 2).map((absence, i) => {
                                  const TypeIcon = typeConfig[absence.type].icon;
                                  return (
                                    <motion.div
                                      key={absence.id}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: i * 0.05 }}
                                      className={`
                                        flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium cursor-pointer
                                        ${absence.type === 'conge' 
                                          ? 'bg-success/15 text-success border border-success/30 hover:bg-success/25' 
                                          : 'bg-warning/15 text-warning border border-warning/30 hover:bg-warning/25'
                                        }
                                      `}
                                      onClick={() => openDialog("details", absence)}
                                    >
                                      <TypeIcon className="h-3 w-3 shrink-0" />
                                      <span className="truncate">{absence.employe?.prenom?.[0]}. {absence.employe?.nom}</span>
                                    </motion.div>
                                  );
                                })}
                                {dayAbsences.length > 2 && (
                                  <div className="text-xs text-muted-foreground font-medium text-center py-0.5">
                                    +{dayAbsences.length - 2} autre{dayAbsences.length > 3 ? 's' : ''}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          </TooltipTrigger>
                          {dayAbsences.length > 0 && (
                            <TooltipContent 
                              side="top" 
                              className="p-3 max-w-xs bg-popover border-border shadow-xl"
                            >
                              <div className="space-y-2">
                                <p className="font-bold text-foreground text-sm">
                                  {day.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </p>
                                <div className="space-y-1.5">
                                  {dayAbsences.map(absence => {
                                    const TypeIcon = typeConfig[absence.type].icon;
                                    return (
                                      <div 
                                        key={absence.id} 
                                        className="flex items-center gap-2 text-sm cursor-pointer hover:bg-accent/50 p-1 rounded"
                                        onClick={() => openDialog("details", absence)}
                                      >
                                        <div className={`w-2 h-2 rounded-full ${typeConfig[absence.type].dotColor}`} />
                                        <TypeIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="font-medium text-foreground">{absence.employe?.prenom} {absence.employe?.nom}</span>
                                        <span className="text-muted-foreground">({typeConfig[absence.type].label})</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Absences en cours - Section simple */}
            <div className="border-border/50 shadow-soft rounded-xl overflow-hidden bg-card">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Absences en cours</h3>
                </div>
                
                {loading ? (
                  <div className="text-center py-8">
                    <Activity className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
                    <p className="text-muted-foreground font-medium">Chargement des absences...</p>
                  </div>
                ) : absencesEnCours.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-success opacity-50" />
                    <p className="text-muted-foreground font-medium">Aucune absence en cours</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {absencesEnCours.map((absence, i) => {
                      const TypeIcon = typeConfig[absence.type].icon;
                      return (
                        <motion.div
                          key={absence.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="p-4 rounded-xl border border-border/50 bg-card hover:shadow-md transition-all cursor-pointer"
                          onClick={() => openDialog("details", absence)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                              <User className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground truncate">
                                {absence.employe?.prenom} {absence.employe?.nom}
                              </p>
                              <p className="text-sm text-muted-foreground">{absence.employe?.fonction}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className={`${typeConfig[absence.type].className} border text-xs`}>
                                  <TypeIcon className="h-3 w-3 mr-1" />
                                  {typeConfig[absence.type].label}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {calculateDuration(absence.dateDebut, absence.dateFin)} jours
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* List View - Style du premier code avec pagination */}
        {viewMode === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="border-border/50 shadow-soft rounded-xl overflow-hidden bg-card">
              <div className="p-0">
                {loading ? (
                  <div className="text-center py-16">
                    <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-lg font-medium text-foreground">Chargement des absences</p>
                    <p className="text-sm text-muted-foreground">Veuillez patienter...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-secondary/50 border-b border-border/50 hover:bg-secondary/50">
                          <TableHead className="font-semibold text-foreground">Employé</TableHead>
                          <TableHead className="font-semibold text-foreground">Type</TableHead>
                          <TableHead className="font-semibold text-foreground">Période</TableHead>
                          <TableHead className="font-semibold text-foreground">Durée</TableHead>
                          <TableHead className="font-semibold text-foreground">Motif</TableHead>
                          <TableHead className="font-semibold text-foreground">Statut</TableHead>
                          <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence mode="popLayout">
                          {paginatedAbsences.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center text-muted-foreground py-16">
                                <CalendarRange className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p className="text-lg font-medium text-foreground">Aucune absence trouvée</p>
                                <p className="text-sm">Modifiez votre recherche ou déclarez une absence</p>
                              </TableCell>
                            </TableRow>
                          ) : paginatedAbsences.map((absence, index) => {
                            const TypeIcon = typeConfig[absence.type].icon;
                            const StatutIcon = statutConfig[absence.statut].icon;
                            
                            return (
                              <motion.tr
                                key={absence.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ delay: index * 0.03 }}
                                className="border-b border-border/30 hover:bg-secondary/30 transition-colors"
                              >
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                                      {absence.employe?.prenom?.[0]}{absence.employe?.nom?.[0]}
                                    </div>
                                    <div>
                                      <p className="font-medium text-foreground">{absence.employe?.prenom} {absence.employe?.nom}</p>
                                      <p className="text-xs text-muted-foreground">{absence.employe?.fonction}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={`${typeConfig[absence.type].className} border`}>
                                    <TypeIcon className="h-3.5 w-3.5 mr-1.5" />
                                    {typeConfig[absence.type].label}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <p className="text-foreground">{new Date(absence.dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                                      {absence.dateFin && (
                                        <p className="text-muted-foreground text-xs">→ {new Date(absence.dateFin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="font-medium text-foreground">{calculateDuration(absence.dateDebut, absence.dateFin)} jours</span>
                                </TableCell>
                                <TableCell>
                                  <span className="text-muted-foreground text-sm">{absence.motif || "-"}</span>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={`${statutConfig[absence.statut].className} border flex items-center gap-1.5`}>
                                    <StatutIcon className="h-3.5 w-3.5" />
                                    {statutConfig[absence.statut].label}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex justify-end gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                                      onClick={() => openDialog("details", absence)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 hover:bg-info/10 hover:text-info"
                                      onClick={() => openDialog("edit", absence)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    {absence.statut === "en_cours" && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => cloturerAbsence(absence)}
                                        className="h-8 text-xs border-border/50 hover:bg-success/10 hover:text-success hover:border-success/30"
                                      >
                                        <X className="h-3 w-3 mr-1" />
                                        Clôturer
                                      </Button>
                                    )}
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                      onClick={() => openDialog("delete", absence)}
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
              </div>
            </div>

            {/* Pagination - Ajoutée */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <p className="text-sm text-muted-foreground">
                  Affichage de {(currentPage - 1) * ITEMS_PER_PAGE + 1} à {Math.min(currentPage * ITEMS_PER_PAGE, filteredAbsences.length)} sur {filteredAbsences.length} absences
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialogs (conservés de votre version avec style ajusté) */}
      <Dialog open={dialog?.type === "add" || dialog?.type === "edit"} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              {dialog?.type === "add" ? "Déclarer une absence" : "Modifier l'absence"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {dialog?.type === "add" 
                ? "Remplissez les informations de l'absence." 
                : "Modifiez les informations de l'absence."
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="employe" className="text-foreground font-medium">Employé</Label>
              <Select 
                value={formData.idEmploye} 
                onValueChange={(value) => setFormData({ ...formData, idEmploye: value })}
              >
                <SelectTrigger className="border-border/50">
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
                <Label htmlFor="type" className="text-foreground font-medium">Type d'absence</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: "conge" | "maladie") => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conge">Congé</SelectItem>
                    <SelectItem value="maladie">Maladie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="statut" className="text-foreground font-medium">Statut</Label>
                <Select 
                  value={formData.statut} 
                  onValueChange={(value: "en_cours" | "termine" | "planifie") => setFormData({ ...formData, statut: value })}
                >
                  <SelectTrigger className="border-border/50">
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
                <Label htmlFor="dateDebut" className="text-foreground font-medium">Date de début</Label>
                <Input
                  id="dateDebut"
                  type="date"
                  value={formData.dateDebut}
                  onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                  className="border-border/50"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dateFin" className="text-foreground font-medium">Date de fin</Label>
                <Input
                  id="dateFin"
                  type="date"
                  value={formData.dateFin}
                  onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                  className="border-border/50"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="motif" className="text-foreground font-medium">Motif</Label>
              <Textarea
                id="motif"
                value={formData.motif}
                onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                placeholder="Raison de l'absence..."
                rows={3}
                className="border-border/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} className="border-border/50">
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit}
              className="gradient-primary text-primary-foreground"
            >
              {dialog?.type === "add" ? "Déclarer" : "Modifier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog?.type === "details"} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Détails de l'absence
            </DialogTitle>
          </DialogHeader>
          {dialog?.absence && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">ID</Label>
                  <p className="font-medium text-foreground mt-1">{dialog.absence.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Statut</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className={statutConfig[dialog.absence.statut].className}>
                      {statutConfig[dialog.absence.statut].label}
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Employé</Label>
                <div className="flex items-center gap-3 mt-1">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{dialog.absence.employe?.prenom} {dialog.absence.employe?.nom}</p>
                    <p className="text-sm text-muted-foreground">{dialog.absence.employe?.fonction}</p>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                <div className="mt-1">
                  <Badge variant="outline" className={typeConfig[dialog.absence.type].className}>
                    {typeConfig[dialog.absence.type].label}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Date de début</Label>
                  <p className="font-medium text-foreground mt-1">
                    {new Date(dialog.absence.dateDebut).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Date de fin</Label>
                  <p className="font-medium text-foreground mt-1">
                    {dialog.absence.dateFin 
                      ? new Date(dialog.absence.dateFin).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                      : "En cours..."
                    }
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Durée</Label>
                <p className="font-medium text-foreground mt-1">
                  {calculateDuration(dialog.absence.dateDebut, dialog.absence.dateFin)} jour
                  {calculateDuration(dialog.absence.dateDebut, dialog.absence.dateFin) > 1 ? "s" : ""}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Motif</Label>
                <p className="font-medium text-foreground mt-1">{dialog.absence.motif || '-'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={dialog?.type === "delete"} onOpenChange={closeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Cette action supprimera définitivement l'absence de{" "}
              <span className="font-semibold text-foreground">{dialog?.absence?.employe?.prenom} {dialog?.absence?.employe?.nom}</span>. 
              Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/50">Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSubmit}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}