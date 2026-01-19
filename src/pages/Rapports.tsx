'use client'

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { PageHeader } from "@/components/ui/page-header";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  FileText, 
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  AlertTriangle,
  Image,
  Filter,
  TrendingUp,
  HardHat,
  User,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  Maximize2,
  Wrench,
  Upload,
  Plus,
  RotateCcw,
  Pencil,
  Type,
  Circle,
  Undo2,
  Search,
  Check
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { ImageAnnotationEditor } from "@/components/rapports/ImageAnnotationEditor";
import { toast } from "sonner";

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

const validationConfig = {
  "En attente": { 
    label: "En attente", 
    icon: Clock, 
    badgeClass: "bg-warning/10 text-warning border-warning/20",
    color: "from-amber-400 to-yellow-500"
  },
  "À réviser": { 
    label: "À réviser", 
    icon: AlertTriangle, 
    badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
    color: "from-red-400 to-rose-500"
  },
  "Approuvé": { 
    label: "Approuvé", 
    icon: CheckCircle2, 
    badgeClass: "bg-success/10 text-success border-success/20",
    color: "from-emerald-400 to-green-500"
  }
};

type AlertType = "success" | "error" | null;
type FiltreType = "tous" | "En attente" | "À réviser" | "Approuvé";

const getImageUrl = (rapportId: string, nomFichier: string) => {
  return `/api/images/rapports/${rapportId}/${nomFichier}`;
};

export default function Rapports() {
  const [rapports, setRapports] = useState<Rapport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filtreActif, setFiltreActif] = useState<FiltreType>("En attente");
  const [alert, setAlert] = useState<{ type: AlertType; message: string } | null>(null);
  const [dialog, setDialog] = useState<{ type: "details" | "revision"; rapport?: Rapport } | null>(null);
  const [commentaire, setCommentaire] = useState("");
  const [photoIndex, setPhotoIndex] = useState(0);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null);
  const [isAnnotationEditorOpen, setIsAnnotationEditorOpen] = useState(false);
  const [selectedRapportForAnnotation, setSelectedRapportForAnnotation] = useState<Rapport | null>(null);
  
  // ÉTATS POUR LE NOUVEAU FORMULAIRE
  const [isNewRapportOpen, setIsNewRapportOpen] = useState(false);
  const [newRapportPhotos, setNewRapportPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  // Stats - UNIQUEMENT SUR CETTE PAGE
  const stats = {
    total: rapports.length,
    en_attente: rapports.filter(r => r.validation === "En attente").length,
    a_reviser: rapports.filter(r => r.validation === "À réviser").length,
    approuve: rapports.filter(r => r.validation === "Approuvé").length,
    tauxApprobation: rapports.length > 0 ? Math.round((rapports.filter(r => r.validation === "Approuvé").length / rapports.length) * 100) : 0,
  };

  const formaterNomsEmployes = (employes?: Employe[]) => {
    if (!employes || employes.length === 0) return "Non assigné";
    
    if (employes.length === 1) {
      return `${employes[0].prenom} ${employes[0].nom}`;
    }
    
    return `${employes[0].prenom} ${employes[0].nom} +${employes.length - 1}`;
  };

  // FONCTIONS POUR LE NOUVEAU FORMULAIRE (EXACTEMENT COMME LE DESIGN CIBLE)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 5 - newRapportPhotos.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setNewRapportPhotos(prev => {
          if (prev.length < 5) {
            return [...prev, result];
          }
          return prev;
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setNewRapportPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const resetNewRapportForm = () => {
    setNewRapportPhotos([]);
    setIsNewRapportOpen(false);
  };

  // Fonctions pour l'éditeur d'annotation
  const openAnnotationEditor = (rapport: Rapport) => {
    setSelectedRapportForAnnotation(rapport);
    setIsAnnotationEditorOpen(true);
  };

  const closeAnnotationEditor = () => {
    setIsAnnotationEditorOpen(false);
    setSelectedRapportForAnnotation(null);
  };

  const handleAnnotationApprove = (rapportId: string) => {
    approuverRapport(rapportId);
    closeAnnotationEditor();
  };

  const handleAnnotationRevision = (rapportId: string, comment: string) => {
    // Capture du canvas et envoi au Chef de Brigade
    setCommentaire(comment);
    toast.success("Rapport envoyé pour correction au Chef de Brigade concerné");
    demanderRevision(rapportId);
    closeAnnotationEditor();
  };

  // Fonction pour obtenir le nom du Chef de Brigade (simulation)
  const getChefDeBrigade = (rapport: Rapport) => {
    // Simulation - dans un vrai projet, cela viendrait des données du rapport
    const chefsDeBrigade = {
      "1": "Jean Dupont",
      "2": "Marie Martin", 
      "3": "Pierre Bernard",
      "4": "Sophie Petit"
    };
    return chefsDeBrigade[rapport.id as keyof typeof chefsDeBrigade] || "Chef de Brigade non assigné";
  };

  // Transformer les données du rapport pour l'éditeur
  const transformRapportForEditor = (rapport: Rapport) => {
    const photos = [];
    if (rapport.photos && rapport.photos.length > 0) {
      photos.push(...rapport.photos.map(photo => getImageUrl(rapport.id, photo.nom_fichier)));
    } else if (rapport.photoUrl) {
      photos.push(rapport.photoUrl);
    }

    return {
      id: rapport.id,
      description: rapport.description,
      dateRapport: rapport.dateRapport,
      avancement: rapport.avancement,
      phase: rapport.phase?.nom || "Phase inconnue",
      tache: rapport.phase?.tache?.description || "Tâche inconnue",
      employes: rapport.employes?.map(e => `${e.prenom} ${e.nom}`) || [],
      validation: rapport.validation,
      photos: photos
    };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Alert */}
      {alert && (
        <Alert className={`fixed top-4 right-4 z-50 w-96 shadow-2xl border-l-4 backdrop-blur-sm ${
          alert.type === "success" 
            ? "border-success bg-success/10 text-success"
            : "border-destructive bg-destructive/10 text-destructive"
        }`}>
          <AlertDescription className="font-medium">
            {alert.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <PageHeader
          title="Validation des Rapports"
          description="Gérez et validez les rapports soumis par votre équipe"
          icon={FileText}
        />
        
        {/* BOUTON NOUVEAU RAPPORT AVEC FORMULAIRE DU DESIGN CIBLE */}
        <Dialog open={isNewRapportOpen} onOpenChange={setIsNewRapportOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Rapport
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Créer un nouveau rapport</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez les travaux effectués..."
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tache">Tâche</Label>
                  <Input id="tache" placeholder="Sélectionner une tâche" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phase">Phase</Label>
                  <Input id="phase" placeholder="Sélectionner une phase" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avancement">Avancement (%)</Label>
                <Input id="avancement" type="number" min="0" max="100" placeholder="50" />
              </div>

              {/* Image Upload Section - FORMULAIRE EXACT DU DESIGN CIBLE */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Photos (1-5 images)</Label>
                  <span className="text-xs text-muted-foreground">
                    {newRapportPhotos.length}/5 images
                  </span>
                </div>
                
                {/* Upload Button */}
                <div 
                  onClick={() => newRapportPhotos.length < 5 && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
                    ${newRapportPhotos.length >= 5 
                      ? 'border-muted bg-muted/20 cursor-not-allowed' 
                      : 'border-primary/30 hover:border-primary/50 hover:bg-primary/5'
                    }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={newRapportPhotos.length >= 5}
                  />
                  <Upload className={`h-8 w-8 mx-auto mb-2 ${newRapportPhotos.length >= 5 ? 'text-muted-foreground' : 'text-primary'}`} />
                  <p className={`text-sm font-medium ${newRapportPhotos.length >= 5 ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {newRapportPhotos.length >= 5 
                      ? 'Limite de 5 images atteinte'
                      : 'Cliquez pour télécharger des images'
                    }
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG jusqu'à 10MB
                  </p>
                </div>

                {/* Image Previews */}
                {newRapportPhotos.length > 0 && (
                  <div className="grid grid-cols-5 gap-2">
                    {newRapportPhotos.map((photo, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg border border-border"
                        />
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={resetNewRapportForm}>
                  Annuler
                </Button>
                <Button 
                  className="gradient-primary text-primary-foreground"
                  disabled={newRapportPhotos.length === 0}
                >
                  Créer le rapport
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards - TOUT LE RESTE DE VOTRE CODE RESTE IDENTIQUE */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Rapports"
          value={stats.total}
          description="Enregistrés"
          icon={FileText}
          variant="default"
          delay={0}
        />
        <StatsCard
          title="En attente"
          value={stats.en_attente}
          description="À traiter"
          icon={Clock}
          variant="warning"
          delay={0.1}
        />
        <StatsCard
          title="À réviser"
          value={stats.a_reviser}
          description="Corrections"
          icon={AlertTriangle}
          variant="danger"
          delay={0.2}
        />
        <StatsCard
          title="Approuvés"
          value={stats.approuve}
          description="Validés"
          icon={CheckCircle2}
          variant="success"
          delay={0.3}
        />
        <StatsCard
          title="Taux approbation"
          value={`${stats.tauxApprobation}%`}
          description="Performance"
          icon={TrendingUp}
          variant="primary"
          delay={0.4}
        />
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-secondary/50 p-3 rounded-lg border border-border/50"
      >
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Filtrer par :</span>
          </div>
          <div className="flex gap-2">
            {(["tous", "En attente", "À réviser", "Approuvé"] as FiltreType[]).map((filtre) => (
              <Button
                key={filtre}
                variant={filtreActif === filtre ? "default" : "outline"}
                size="sm"
                onClick={() => setFiltreActif(filtre)}
                className={filtreActif === filtre ? "gradient-primary text-primary-foreground" : ""}
              >
                {filtre === "tous" ? "Tous" : filtre}
                {filtre !== "tous" && (
                  <Badge variant="secondary" className="ml-2 h-5 text-xs">
                    {filtre === "En attente" ? stats.en_attente : filtre === "À réviser" ? stats.a_reviser : stats.approuve}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Rapports Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-border/50 shadow-soft">
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center text-muted-foreground py-12">
                <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                <p className="font-medium text-foreground">Chargement des rapports...</p>
                <p className="text-sm text-muted-foreground mt-1">Veuillez patienter</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50 border-b border-border/50 hover:bg-secondary/50">
                      <TableHead className="font-semibold text-foreground">ID</TableHead>
                      <TableHead className="font-semibold text-foreground">Rapport</TableHead>
                      <TableHead className="font-semibold text-foreground">Tâche / Phase</TableHead>
                      <TableHead className="font-semibold text-foreground">Date</TableHead>
                      <TableHead className="font-semibold text-foreground">Avancement</TableHead>
                      <TableHead className="font-semibold text-foreground">Photos</TableHead>
                      <TableHead className="font-semibold text-foreground">Validation</TableHead>
                      <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rapportsFiltres.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-16">
                          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p className="text-lg font-medium text-foreground">Aucun rapport trouvé</p>
                          <p className="text-sm">
                            {filtreActif !== "tous" ? `Aucun rapport ${validationConfig[filtreActif].label.toLowerCase()}` : "Aucun rapport disponible"}
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : rapportsFiltres.map((rapport, index) => {
                      const hasPhotos = (rapport.photos && rapport.photos.length > 0) || rapport.photoUrl;
                      const photoCount = rapport.photos ? rapport.photos.length : (rapport.photoUrl ? 1 : 0);
                      const ValidationIcon = validationConfig[rapport.validation].icon;
                      
                      return (
                        <motion.tr
                          key={rapport.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="border-b border-border/30 hover:bg-secondary/30 transition-colors"
                        >
                          <TableCell className="font-mono text-sm text-muted-foreground">#{rapport.id}</TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="font-medium text-foreground truncate">{rapport.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formaterNomsEmployes(rapport.employes)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground text-sm">{rapport.phase?.tache?.description || "Aucune tâche"}</p>
                              <p className="text-xs text-muted-foreground">{rapport.phase?.nom || "Phase inconnue"}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground">{new Date(rapport.dateRapport).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                                  <div 
                                    className="h-full gradient-primary rounded-full transition-all duration-500"
                                    style={{ width: `${rapport.avancement}%` }}
                                  />
                                </div>
                                <span className="text-sm font-semibold text-primary">{rapport.avancement}%</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {hasPhotos ? (
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                                  <Image className="h-4 w-4 text-success" />
                                </div>
                                <span className="text-sm font-medium text-foreground">{photoCount}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`${validationConfig[rapport.validation].badgeClass} border gap-1`}>
                              <ValidationIcon className="h-3 w-3" />
                              {validationConfig[rapport.validation].label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {rapport.validation === "En attente" && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => approuverRapport(rapport.id)}
                                    className="h-8 w-8 bg-success/10 text-success hover:bg-success/20 hover:text-success"
                                    title="Approuver"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => openDialog("revision", rapport)}
                                    className="h-8 w-8 bg-warning/10 text-warning hover:bg-warning/20 hover:text-warning"
                                    title="Demander révision"
                                  >
                                    <AlertTriangle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => openAnnotationEditor(rapport)}
                                className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                                title="Voir détails et annoter"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Modal Détails */}
      <Dialog open={dialog?.type === "details"} onOpenChange={closeDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-xl font-bold text-foreground">
                  Rapport <span className="text-primary">#{dialog?.rapport?.id}</span>
                </DialogTitle>
                <DialogDescription className="text-muted-foreground mt-1 flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  {dialog?.rapport?.phase?.nom} · {dialog?.rapport && formaterNomsEmployes(dialog.rapport.employes)}
                </DialogDescription>
              </div>
              <Badge 
                variant="outline" 
                className={`${validationConfig[dialog?.rapport?.validation || "En attente"].badgeClass} border`}
              >
                {validationConfig[dialog?.rapport?.validation || "En attente"].label}
              </Badge>
            </div>
          </DialogHeader>
          
          {dialog?.rapport && (
            <div className="space-y-4">
              {/* Layout avec photo à côté des détails */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Colonne de gauche - Photo */}
                <div className="lg:col-span-1">
                  <div className="bg-card border border-border/50 rounded-lg p-3">
                    {(dialog.rapport.photos && dialog.rapport.photos.length > 0) || dialog.rapport.photoUrl ? (
                      <div className="space-y-3">
                        {/* En-tête photos */}
                        <div className="flex items-center justify-between px-2">
                          <div className="flex items-center gap-2">
                            <Image className="h-4 w-4 text-muted-foreground" />
                            <Label className="text-sm font-medium text-foreground">
                              Photos ({getTotalPhotos(dialog.rapport)})
                            </Label>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {photoIndex + 1} / {getTotalPhotos(dialog.rapport)}
                          </span>
                        </div>
                        
                        {/* Photo principale */}
                        <div className="relative bg-muted rounded overflow-hidden group">
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
                                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-foreground w-8 h-8 rounded-full"
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={nextPhoto}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-foreground w-8 h-8 rounded-full"
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setFullscreenPhoto(getCurrentPhotoUrl(dialog.rapport!))}
                              className="absolute top-2 right-2 bg-white/90 hover:bg-white text-foreground w-8 h-8 rounded-full"
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
                                    ? 'border-primary' 
                                    : 'border-border hover:border-primary/50'
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
                      <div className="text-center py-8 border-2 border-dashed border-border rounded-lg bg-muted/50">
                        <Image className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Aucune photo disponible</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Colonne de droite - Détails */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Informations principales */}
                  <div className="bg-muted rounded-lg p-3 border border-border">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Date du rapport</Label>
                        <p className="font-semibold text-foreground mt-1">
                          {new Date(dialog.rapport.dateRapport).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Avancement</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full gradient-primary transition-all"
                              style={{ width: `${dialog.rapport.avancement}%` }}
                            />
                          </div>
                          <span className="font-semibold text-primary text-sm">{dialog.rapport.avancement}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-2">Description du travail</Label>
                    <div className="p-3 bg-muted rounded-lg border border-border">
                      <p className="text-foreground">
                        {dialog.rapport.description}
                      </p>
                    </div>
                  </div>

                  {/* Employés */}
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-2">Employé(s) assigné(s)</Label>
                    <div className="space-y-2">
                      {dialog.rapport.employes?.map((employe) => (
                        <div key={employe.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border">
                          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-primary-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">
                              {employe.prenom} {employe.nom}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {employe.fonction}
                            </p>
                          </div>
                        </div>
                      )) || <p className="text-sm text-muted-foreground text-center p-3 bg-muted rounded-lg border border-border">Non assigné</p>}
                    </div>
                  </div>

                  {/* Commentaire de révision si présent */}
                  {dialog.rapport.commentaire && dialog.rapport.validation === "À réviser" && (
                    <div className="bg-warning/10 rounded-lg p-3 border-2 border-warning/20">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        <Label className="text-sm font-semibold text-warning-foreground">Commentaire de révision</Label>
                      </div>
                      <p className="text-sm text-warning-foreground">
                        {dialog.rapport.commentaire}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {dialog.rapport.validation === "En attente" && (
                <div className="bg-muted rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-foreground">Actions de validation</h3>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                      En attente de décision
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button 
                      onClick={() => approuverRapport(dialog.rapport!.id)}
                      className="h-12 gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-semibold">Approuver</span>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => {
                        closeDialog();
                        openDialog("revision", dialog.rapport);
                      }}
                      className="h-12 border-2 border-warning text-warning hover:bg-warning/10 hover:border-warning/80"
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
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Demander révision
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Rapport #{dialog?.rapport?.id} · {dialog?.rapport?.phase?.nom}
            </DialogDescription>
          </DialogHeader>
          {dialog?.rapport && (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {formaterNomsEmployes(dialog.rapport.employes)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {dialog.rapport.employes?.[0]?.fonction}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-semibold text-foreground">
                    Commentaire pour l'employé <span className="text-destructive">*</span>
                  </Label>
                  <Badge variant="outline" className={validationConfig[dialog.rapport.validation].badgeClass}>
                    {validationConfig[dialog.rapport.validation].label}
                  </Badge>
                </div>
                <Textarea 
                  placeholder="Indiquez ce qui doit être corrigé..."
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  rows={4}
                  className="resize-none border-border focus:border-warning focus:ring-warning text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground mt-2">
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
                  className="flex-1 bg-warning text-warning-foreground hover:bg-warning/90 shadow-glow"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Envoyer pour révision
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Annotation Editor */}
      {selectedRapportForAnnotation && (
        <ImageAnnotationEditor
          rapport={transformRapportForEditor(selectedRapportForAnnotation)}
          isOpen={isAnnotationEditorOpen}
          onClose={closeAnnotationEditor}
          onApprove={handleAnnotationApprove}
          onRequestRevision={handleAnnotationRevision}
          chefDeBrigade={getChefDeBrigade(selectedRapportForAnnotation)}
        />
      )}
    </div>
  );
}