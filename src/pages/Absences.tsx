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
  Calendar,
  User,
  Grid3X3,
  List
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface Absence {
  id: string;
  employe: {
    id: string;
    nom: string;
    prenom: string;
    fonction: string;
  };
  type: "conge" | "maladie";
  dateDebut: string;
  dateFin?: string;
  motif?: string;
  statut: "en_cours" | "termine" | "planifie";
}

const mockAbsences: Absence[] = [
  {
    id: "A001",
    employe: { id: "E003", nom: "Andry", prenom: "Paul", fonction: "Mécanicien" },
    type: "maladie",
    dateDebut: "2025-01-15",
    motif: "Grippe",
    statut: "en_cours"
  },
  {
    id: "A002",
    employe: { id: "E006", nom: "Rakotobe", prenom: "Hery", fonction: "Électricien" },
    type: "conge",
    dateDebut: "2025-01-20",
    dateFin: "2025-01-27",
    motif: "Congés annuels",
    statut: "planifie"
  },
  {
    id: "A003",
    employe: { id: "E007", nom: "Rasolofo", prenom: "Nivo", fonction: "Chef d'équipe" },
    type: "conge",
    dateDebut: "2025-01-05",
    dateFin: "2025-01-12",
    motif: "Vacances familiales",
    statut: "termine"
  },
  {
    id: "A004",
    employe: { id: "E008", nom: "Randriamalala", prenom: "Miora", fonction: "Agent de nettoyage" },
    type: "maladie",
    dateDebut: "2025-01-08",
    dateFin: "2025-01-10",
    motif: "Consultation médicale",
    statut: "termine"
  }
];

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

export default function Absences() {
  const [absences] = useState<Absence[]>(mockAbsences);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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
    const totalCells = 42; // 6 semaines de 7 jours
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Absences</h1>
          <p className="text-muted-foreground mt-2">
            Suivez les absences des employés du service
          </p>
        </div>
        <Button className="shadow-soft">
          <Plus className="h-4 w-4 mr-2" />
          Déclarer une absence
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En cours</p>
                <p className="text-2xl font-bold text-status-progress">{stats.en_cours}</p>
              </div>
              <User className="h-8 w-8 text-status-progress" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Planifiées</p>
                <p className="text-2xl font-bold text-status-pending">{stats.planifie}</p>
              </div>
              <Calendar className="h-8 w-8 text-status-pending" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Congés</p>
                <p className="text-2xl font-bold text-secondary">{stats.conge}</p>
              </div>
              <Calendar className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Maladies</p>
                <p className="text-2xl font-bold text-status-paused">{stats.maladie}</p>
              </div>
              <User className="h-8 w-8 text-status-paused" />
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
              <CardTitle>
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
                              ? "bg-secondary/20 text-secondary-foreground border border-secondary/30"
                              : "bg-status-paused/20 text-status-paused-foreground border border-status-paused/30"
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
                  {filteredAbsences.map((absence) => (
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
                          <Button variant="ghost" size="sm">
                            Voir détails
                          </Button>
                          {absence.statut === "en_cours" && (
                            <Button variant="outline" size="sm">
                              Clôturer
                            </Button>
                          )}
                          {absence.statut === "planifie" && (
                            <Button variant="ghost" size="sm">
                              Modifier
                            </Button>
                          )}
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
    </div>
  );
}

