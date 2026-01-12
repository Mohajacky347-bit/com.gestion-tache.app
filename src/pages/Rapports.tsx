'use client'

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
  FileText, 
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  User,
  AlertTriangle,
  Image,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  Maximize2,
  TrendingUp,
  Activity,
  BarChart3,
  Filter,
  HardHat,
  Wrench,
  Users,
  Package,
  CalendarDays,
  FileCheck
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSearchParams } from "next/navigation";

interface Employe {
  id: string;
  nom: string;
  prenom: string;
  fonction: string;
}

interface Phase {
  id: string;
  nom: string;
  tache?: {
    id: string;
    description: string;
  };
}

interface Photo {
  id: string;
  nom_fichier: string;
  ordre: number;
}

interface Rapport {
  id: string;
  description: string;
  dateRapport: string;
  photoUrl?: string;
  avancement: number;
  idPhase: string;
  validation: "En attente" | "À réviser" | "Approuvé";
  commentaire?: string;
  phase?: Phase;
  employes?: Employe[];
  photos?: Photo[];
}

const validationLabels = {
  "En attente": "En attente",
  "À réviser": "À réviser", 
  "Approuvé": "Approuvé"
};

const validationColors = {
  "En attente": "bg-amber-50 text-amber-700 border-amber-200",
  "À réviser": "bg-orange-50 text-orange-700 border-orange-200", 
  "Approuvé": "bg-emerald-50 text-emerald-700 border-emerald-200"
} as const;

type AlertType = "success" | "error" | null;
type FiltreType = "tous" | "En attente" | "À réviser" | "Approuvé";

const getImageUrl = (rapportId: string, nomFichier: string) => {
  return `/api/images/rapports/${rapportId}/${nomFichier}`;
};

export default function RapportsChef() {
  const [rapports, setRapports] = useState<Rapport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filtreActif, setFiltreActif] = useState<FiltreType>("En attente");
  const [alert, setAlert] = useState<{ type: AlertType; message: string } | null>(null);
  const [dialog, setDialog] = useState<{ type: "details" | "revision"; rapport?: Rapport } | null>(null);
  const [commentaire, setCommentaire] = useState("");
  const [photoIndex, setPhotoIndex] = useState(0);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtreParam = searchParams.get("filtre");
    const validFilters: FiltreType[] = ["tous", "En attente", "À réviser", "Approuvé"];

    if (filtreParam && validFilters.includes(filtreParam as FiltreType)) {
      setFiltreActif(filtreParam as FiltreType);
    }
  }, [searchParams]);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const rapportsRes = await fetch("/api/rapports/avec-employes");
      if (!rapportsRes.ok) throw new Error("Erreur lors du chargement des rapports");
      const rapportsData = await rapportsRes.json();

      setRapports(rapportsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      showAlert("error", "Erreur lors du chargement des rapports");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type: AlertType, message: string) => {
    setAlert({ type, message });
  };

  const openDialog = (type: "details" | "revision", rapport?: Rapport) => {
    setDialog({ type, rapport });
    setPhotoIndex(0);
    if (type === "revision") {
      setCommentaire("");
    }
  };

  const closeDialog = () => {
    setDialog(null);
    setCommentaire("");
    setPhotoIndex(0);
  };

  const approuverRapport = async (rapportId: string) => {
    try {
      const response = await fetch(`/api/rapports/${rapportId}/validation`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          validation: "Approuvé",
          commentaire: "" 
        }),
      });

      if (!response.ok) throw new Error("Erreur lors de l'approbation");
      
      await fetchData();
      showAlert("success", "Rapport approuvé avec succès");
      closeDialog();
    } catch (error) {
      showAlert("error", "Erreur lors de l'approbation");
    }
  };

  const demanderRevision = async (rapportId: string) => {
    try {
      const response = await fetch(`/api/rapports/${rapportId}/validation`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          validation: "À réviser",
          commentaire: commentaire 
        }),
      });

      if (!response.ok) throw new Error("Erreur lors de la demande de révision");
      
      await fetchData();
      showAlert("success", "Rapport envoyé pour révision");
      closeDialog();
    } catch (error) {
      showAlert("error", "Erreur lors de la demande de révision");
    }
  };

  const nextPhoto = () => {
    const currentRapport = dialog?.rapport;
    if (!currentRapport) return;
    
    const totalPhotos = getTotalPhotos(currentRapport);
    setPhotoIndex((prev) => (prev + 1) % totalPhotos);
  };

  const prevPhoto = () => {
    const currentRapport = dialog?.rapport;
    if (!currentRapport) return;
    
    const totalPhotos = getTotalPhotos(currentRapport);
    setPhotoIndex((prev) => (prev - 1 + totalPhotos) % totalPhotos);
  };

  const getTotalPhotos = (rapport: Rapport) => {
    if (rapport.photos && rapport.photos.length > 0) {
      return rapport.photos.length;
    }
    return rapport.photoUrl ? 1 : 0;
  };

  const getCurrentPhotoUrl = (rapport: Rapport) => {
    if (rapport.photos && rapport.photos.length > 0) {
      return `/api/images/rapports/${rapport.id}/${rapport.photos[photoIndex].nom_fichier}`;
    }
    return rapport.photoUrl || "";
  };

  const rapportsFiltres = rapports.filter(rapport => 
    filtreActif === "tous" || rapport.validation === filtreActif
  );

  const stats = {
    total: rapports.length,
    en_attente: rapports.filter(r => r.validation === "En attente").length,
    a_reviser: rapports.filter(r => r.validation === "À réviser").length,
    approuve: rapports.filter(r => r.validation === "Approuvé").length,
    tauxApprobation: rapports.length > 0 ? Math.round((rapports.filter(r => r.validation === "Approuvé").length / rapports.length) * 100) : 0,
    avecPhotos: rapports.filter(r => (r.photos && r.photos.length > 0) || r.photoUrl).length
  };

  const formaterNomsEmployes = (employes?: Employe[]) => {
    if (!employes || employes.length === 0) return "Non assigné";
    
    if (employes.length === 1) {
      return `${employes[0].prenom} ${employes[0].nom}`;
    }
    
    return `${employes[0].prenom} ${employes[0].nom} +${employes.length - 1}`;
  };

  return (
    <div className="space-y-6">
      {/* Alert */}
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

      {/* Header avec stats enrichies */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font text-slate-900 flex items-center gap-3">
              <HardHat className="h-8 w-8 text-blue-600" />
              Validation des Rapports
            </h1>
            <p className="text-slate-500 mt-1 font-normal">
              Gérez et validez les rapports soumis par votre équipe - Système de Gestion Infrastructure
            </p>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
            <FileCheck className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              FCE : Depuis 1999
            </span>
          </div>
        </div>

        {/* Stats Cards avec design amélioré */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border-slate-200 hover:shadow-md transition-shadow hover:border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Rapports</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
                  <p className="text-xs text-slate-400 mt-1">Enregistrés</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-sm">
                  <FileText className="h-6 w-6 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-md transition-shadow hover:border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-amber-700 uppercase tracking-wide">En attente</p>
                  <p className="text-2xl font-bold text-amber-900 mt-1">{stats.en_attente}</p>
                  <p className="text-xs text-amber-500 mt-1">À traiter</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center shadow-sm">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 hover:shadow-md transition-shadow hover:border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-orange-700 uppercase tracking-wide">À réviser</p>
                  <p className="text-2xl font-bold text-orange-900 mt-1">{stats.a_reviser}</p>
                  <p className="text-xs text-orange-500 mt-1">Corrections</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center shadow-sm">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 hover:shadow-md transition-shadow hover:border-emerald-300 bg-gradient-to-br from-emerald-50 to-emerald-100/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide">Approuvés</p>
                  <p className="text-2xl font-bold text-emerald-900 mt-1">{stats.approuve}</p>
                  <p className="text-xs text-emerald-500 mt-1">Validés</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center shadow-sm">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 hover:shadow-md transition-shadow hover:border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-100/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Taux approbation</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">{stats.tauxApprobation}%</p>
                  <p className="text-xs text-blue-500 mt-1">Performance</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-cyan-200 flex items-center justify-center shadow-sm">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filtres stylisés - BOUTONS RÉDUITS */}
      <div className="bg-gradient-to-r from-white to-slate-50 p-3 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-blue-600" />
            <h3 className="font-medium text-slate-800 text-sm">Filtres de rapports</h3>
          </div>
          <span className="text-xs text-slate-500">
            {rapportsFiltres.length} rapport{rapportsFiltres.length !== 1 ? 's' : ''} trouvé{rapportsFiltres.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltreActif("En attente")}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
              filtreActif === "En attente" 
                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm" 
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Clock className="h-3 w-3" />
            <span>En attente</span>
          </button>
          <button
            onClick={() => setFiltreActif("À réviser")}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
              filtreActif === "À réviser" 
                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm" 
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <AlertTriangle className="h-3 w-3" />
            <span>À réviser</span>
          </button>
          <button
            onClick={() => setFiltreActif("Approuvé")}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
              filtreActif === "Approuvé" 
                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm" 
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <CheckCircle className="h-3 w-3" />
            <span>Approuvés</span>
          </button>
          <button
            onClick={() => setFiltreActif("tous")}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
              filtreActif === "tous" 
                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm" 
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <FileText className="h-3 w-3" />
            <span>Tous</span>
          </button>
        </div>
      </div>

      {/* Tableau amélioré */}
      <Card className="border-slate-200 shadow-lg overflow-hidden">
        
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center text-slate-500 py-12">
              <Activity className="h-8 w-8 animate-spin mx-auto mb-3 text-blue-600" />
              <p className="font-medium">Chargement des rapports...</p>
              <p className="text-sm text-slate-400 mt-1">Veuillez patienter</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-300">
                    <TableHead className="font-semibold text-slate-700 py-4">ID</TableHead>
                    <TableHead className="font-semibold text-slate-700 py-4">Employé(s)</TableHead>
                    <TableHead className="font-semibold text-slate-700 py-4">Phase / Tâche</TableHead>
                    <TableHead className="font-semibold text-slate-700 py-4">Description</TableHead>
                    <TableHead className="font-semibold text-slate-700 py-4">Date</TableHead>
                    <TableHead className="font-semibold text-slate-700 py-4">Avancement</TableHead>
                    <TableHead className="font-semibold text-slate-700 py-4">Photos</TableHead>
                    <TableHead className="font-semibold text-slate-700 py-4">Statut</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 py-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rapportsFiltres.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-16">
                        <div className="max-w-md mx-auto">
                          <FileText className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                          <h3 className="text-lg font-semibold text-slate-600 mb-2">
                            Aucun rapport {filtreActif !== "tous" && validationLabels[filtreActif].toLowerCase()}
                          </h3>
                          <p className="text-slate-500">
                            Les rapports apparaîtront ici une fois soumis par les équipes
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : rapportsFiltres.map((rapport) => {
                    const hasPhotos = (rapport.photos && rapport.photos.length > 0) || rapport.photoUrl;
                    const photoCount = rapport.photos ? rapport.photos.length : (rapport.photoUrl ? 1 : 0);
                    
                    return (
                      <TableRow key={rapport.id} className="hover:bg-blue-50/30 transition-colors border-b border-slate-100 group">
                        <TableCell className="font-mono font-bold text-blue-700 py-4">#{rapport.id}</TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                              <User className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-500">
                                {formaterNomsEmployes(rapport.employes)}
                              </div>
                              <div className="text-xs text-slate-500">
                                {rapport.employes?.[0]?.fonction || "Non assigné"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div>
                            <div className="font-semibold text-slate-500 flex items-center gap-2">
                              <HardHat className="h-4 w-4 text-blue-500" />
                              {rapport.phase?.nom || "Phase inconnue"}
                            </div>
                            <div className="text-xs text-slate-500 mt-1 max-w-xs truncate">
                              {rapport.phase?.tache?.description || "Aucune tâche spécifiée"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="max-w-xs truncate text-slate-700 group-hover:text-blue-700 transition-colors" title={rapport.description}>
                            {rapport.description}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-sm flex items-center gap-2 text-slate-600">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            {new Date(rapport.dateRapport).toLocaleDateString('fr-FR')}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden flex-1">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                                style={{ width: `${rapport.avancement}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-blue-700 min-w-[40px]">{rapport.avancement}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          {hasPhotos ? (
                            <div className="flex items-center gap-2">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center shadow-sm">
                                <Image className="h-4 w-4 text-emerald-600" />
                              </div>
                              <div>
                                <span className="text-sm font-semibold text-slate-700">{photoCount}</span>
                                <div className="text-xs text-emerald-600">photo{photoCount > 1 ? 's' : ''}</div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400 px-2 py-1 bg-slate-100 rounded">—</span>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge 
                            variant="outline" 
                            className={`${validationColors[rapport.validation]} font-semibold px-3 py-1 border-2`}
                          >
                            {validationLabels[rapport.validation]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right py-4">
                          <div className="flex justify-end gap-2">
                            {rapport.validation === "En attente" && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => approuverRapport(rapport.id)}
                                  className="h-9 w-9 p-0 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 hover:text-emerald-800 hover:from-emerald-100 hover:to-emerald-200 border border-emerald-200 shadow-sm"
                                  title="Approuver ce rapport"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => openDialog("revision", rapport)}
                                  className="h-9 w-9 p-0 bg-gradient-to-br from-orange-50 to-orange-100 text-orange-700 hover:text-orange-800 hover:from-orange-100 hover:to-orange-200 border border-orange-200 shadow-sm"
                                  title="Demander révision"
                                >
                                  <AlertTriangle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openDialog("details", rapport)}
                              className="h-9 w-9 p-0 bg-gradient-to-br from-blue-50 to-cyan-100 text-blue-700 hover:text-blue-800 hover:from-blue-100 hover:to-cyan-200 border border-blue-200 shadow-sm"
                              title="Voir les détails"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Détails - TAILLE NORMALE */}
      <Dialog open={dialog?.type === "details"} onOpenChange={closeDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900">
                  Rapport <span className="text-blue-600">#{dialog?.rapport?.id}</span>
                </DialogTitle>
                <DialogDescription className="text-slate-600 mt-1 flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  {dialog?.rapport?.phase?.nom} · {dialog?.rapport && formaterNomsEmployes(dialog.rapport.employes)}
                </DialogDescription>
              </div>
              <Badge 
                variant="outline" 
                className={`${validationColors[dialog?.rapport?.validation || "En attente"]} font-semibold px-3 py-1`}
              >
                {validationLabels[dialog?.rapport?.validation || "En attente"]}
              </Badge>
            </div>
          </DialogHeader>
          
          {dialog?.rapport && (
            <div className="space-y-4">
              {/* Layout avec photo à côté des détails */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Colonne de gauche - Photo réduite */}
                <div className="lg:col-span-1">
                  <div className="bg-slate-900 rounded-lg p-2">
                    {(dialog.rapport.photos && dialog.rapport.photos.length > 0) || dialog.rapport.photoUrl ? (
                      <div className="space-y-3">
                        {/* En-tête photos */}
                        <div className="flex items-center justify-between px-2">
                          <div className="flex items-center gap-2">
                            <Image className="h-4 w-4 text-white" />
                            <Label className="text-sm font-medium text-white">
                              Photos ({getTotalPhotos(dialog.rapport)})
                            </Label>
                          </div>
                          <span className="text-xs text-slate-300">
                            {photoIndex + 1} / {getTotalPhotos(dialog.rapport)}
                          </span>
                        </div>
                        
                        {/* Photo principale réduite */}
                        <div className="relative bg-slate-950 rounded overflow-hidden group">
                          <div className="aspect-square flex items-center justify-center">
                            <img 
                              src={getCurrentPhotoUrl(dialog.rapport)}
                              alt={`Photo ${photoIndex + 1}`}
                              className="w-full h-full object-cover cursor-pointer"
                              onClick={() => setFullscreenPhoto(getCurrentPhotoUrl(dialog.rapport))}
                            />
                          </div>
                          
                          {/* Controls overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            {getTotalPhotos(dialog.rapport) > 1 && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={prevPhoto}
                                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-900 w-8 h-8 rounded-full"
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={nextPhoto}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-900 w-8 h-8 rounded-full"
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setFullscreenPhoto(getCurrentPhotoUrl(dialog.rapport!))}
                              className="absolute top-2 right-2 bg-white/90 hover:bg-white text-slate-900 w-8 h-8 rounded-full"
                            >
                              <Maximize2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Vignettes si plusieurs photos */}
                        {dialog.rapport.photos && dialog.rapport.photos.length > 1 && (
                          <div className="grid grid-cols-4 gap-2">
                            {dialog.rapport.photos.map((photo, index) => (
                              <button
                                key={photo.id}
                                onClick={() => setPhotoIndex(index)}
                                className={`relative aspect-square rounded overflow-hidden border-2 transition-all ${
                                  index === photoIndex 
                                    ? 'border-blue-500' 
                                    : 'border-slate-700 hover:border-slate-600'
                                }`}
                              >
                                <img 
                                  src={getImageUrl(dialog.rapport!.id, photo.nom_fichier)}
                                  alt={`Vignette ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-slate-700 rounded-lg bg-slate-900/50">
                        <Image className="h-10 w-10 mx-auto mb-2 text-slate-600" />
                        <p className="text-sm text-slate-400">Aucune photo disponible</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Colonne de droite - Détails */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Informations principales */}
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-medium text-slate-500">Date du rapport</Label>
                        <p className="font-semibold text-slate-900 mt-1">
                          {new Date(dialog.rapport.dateRapport).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-xs font-medium text-slate-500">Avancement</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                              style={{ width: `${dialog.rapport.avancement}%` }}
                            />
                          </div>
                          <span className="font-semibold text-slate-900 text-sm">{dialog.rapport.avancement}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <Label className="text-sm font-semibold text-slate-700 mb-2">Description du travail</Label>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-slate-700">
                        {dialog.rapport.description}
                      </p>
                    </div>
                  </div>

                  {/* Employés */}
                  <div>
                    <Label className="text-sm font-semibold text-slate-700 mb-2">Employé(s) assigné(s)</Label>
                    <div className="space-y-2">
                      {dialog.rapport.employes?.map((employe) => (
                        <div key={employe.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">
                              {employe.prenom} {employe.nom}
                            </p>
                            <p className="text-sm text-slate-500">
                              {employe.fonction}
                            </p>
                          </div>
                        </div>
                      )) || <p className="text-sm text-slate-500 text-center p-3 bg-slate-50 rounded-lg border border-slate-200">Non assigné</p>}
                    </div>
                  </div>

                  {/* Commentaire de révision si présent */}
                  {dialog.rapport.commentaire && dialog.rapport.validation === "À réviser" && (
                    <div className="bg-orange-50 rounded-lg p-3 border-2 border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <Label className="text-sm font-semibold text-orange-900">Commentaire de révision</Label>
                      </div>
                      <p className="text-sm text-orange-800">
                        {dialog.rapport.commentaire}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions - SUPPRIMÉ LE BOUTON FERMER */}
              {dialog.rapport.validation === "En attente" && (
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">Actions de validation</h3>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                      En attente de décision
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button 
                      onClick={() => approuverRapport(dialog.rapport!.id)}
                      className="h-12 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-semibold">Approuver</span>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => {
                        closeDialog();
                        openDialog("revision", dialog.rapport);
                      }}
                      className="h-12 border-2 border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-semibold">Demander révision</span>
                      </div>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Fullscreen Photo */}
      {fullscreenPhoto && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setFullscreenPhoto(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFullscreenPhoto(null)}
            className="absolute top-4 right-4 text-white hover:bg-white/20 w-12 h-12 rounded-full"
          >
            <X className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="absolute top-4 right-20 text-white hover:bg-white/20 w-12 h-12 rounded-full"
          >
            <a href={fullscreenPhoto} download>
              <Download className="h-6 w-6" />
            </a>
          </Button>
          <img 
            src={fullscreenPhoto}
            alt="Photo en plein écran"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Modal Révision */}
      <Dialog open={dialog?.type === "revision"} onOpenChange={closeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Demander révision
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Rapport #{dialog?.rapport?.id} · {dialog?.rapport?.phase?.nom}
            </DialogDescription>
          </DialogHeader>
          {dialog?.rapport && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {formaterNomsEmployes(dialog.rapport.employes)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {dialog.rapport.employes?.[0]?.fonction}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    Commentaire pour l'employé <span className="text-red-500">*</span>
                  </Label>
                  <Badge variant="outline" className={validationColors[dialog.rapport.validation]}>
                    {validationLabels[dialog.rapport.validation]}
                  </Badge>
                </div>
                <Textarea 
                  placeholder="Indiquez ce qui doit être corrigé..."
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  rows={4}
                  className="resize-none border-slate-300 focus:border-orange-500 focus:ring-orange-500 text-sm"
                  required
                />
                <p className="text-xs text-slate-500 mt-2">
                  Ce commentaire sera envoyé à l'employé
                </p>
              </div>

              <DialogFooter className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={closeDialog}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button 
                  onClick={() => demanderRevision(dialog.rapport!.id)}
                  disabled={!commentaire.trim()}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Envoyer pour révision
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}