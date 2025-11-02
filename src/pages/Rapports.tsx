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
  X
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

const validationVariants = {
  "En attente": "pending",
  "À réviser": "paused",
  "Approuvé": "completed"
} as const;

const validationColors = {
  "En attente": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "À réviser": "bg-orange-100 text-orange-800 border-orange-200", 
  "Approuvé": "bg-green-100 text-green-800 border-green-200"
} as const;

type AlertType = "success" | "error" | null;
type FiltreType = "tous" | "En attente" | "À réviser" | "Approuvé";

// Fonction utilitaire pour générer les URLs des images
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
      
      const rapportsRes = await fetch("/api/rapports/avec-employes", { cache: "no-store" });
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
        headers: {
          "Content-Type": "application/json",
        },
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
        headers: {
          "Content-Type": "application/json",
        },
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

  // Navigation des photos
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

 // Obtenir le nombre total de photos (nouveau système + ancien système)
const getTotalPhotos = (rapport: Rapport) => {
  if (rapport.photos && rapport.photos.length > 0) {
    return rapport.photos.length;
  }
  return rapport.photoUrl ? 1 : 0;
};

// Obtenir l'URL de la photo actuelle
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
    approuve: rapports.filter(r => r.validation === "Approuvé").length
  };

  const formaterNomsEmployes = (employes?: Employe[]) => {
    if (!employes || employes.length === 0) return "Non assigné";
    
    if (employes.length === 1) {
      return `${employes[0].prenom} ${employes[0].nom}`;
    }
    
    return `${employes[0].prenom} ${employes[0].nom} +${employes.length - 1}`;
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
            Validation des Rapports
          </h1>
          <p className="text-muted-foreground mt-2">
            Validez les rapports soumis par votre équipe
          </p>
        </div>
      </div>

      {/* Filtres */}
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={filtreActif === "En attente" ? "default" : "outline"}
              onClick={() => setFiltreActif("En attente")}
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              En attente ({stats.en_attente})
            </Button>
            <Button 
              variant={filtreActif === "À réviser" ? "default" : "outline"}
              onClick={() => setFiltreActif("À réviser")}
              className="flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              À réviser ({stats.a_reviser})
            </Button>
            <Button 
              variant={filtreActif === "Approuvé" ? "default" : "outline"}
              onClick={() => setFiltreActif("Approuvé")}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Approuvés ({stats.approuve})
            </Button>
            <Button 
              variant={filtreActif === "tous" ? "default" : "outline"}
              onClick={() => setFiltreActif("tous")}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Tous ({stats.total})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des Rapports */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>
            Rapports {filtreActif !== "tous" && `- ${validationLabels[filtreActif]}`} ({rapportsFiltres.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-muted-foreground py-8">
              Chargement des rapports...
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>ID</TableHead>
                    <TableHead>Employé(s)</TableHead>
                    <TableHead>Phase / Tâche</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Photos</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rapportsFiltres.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        Aucun rapport {filtreActif !== "tous" && validationLabels[filtreActif].toLowerCase()}
                      </TableCell>
                    </TableRow>
                  ) : rapportsFiltres.map((rapport) => {
                    const hasPhotos = (rapport.photos && rapport.photos.length > 0) || rapport.photoUrl;
                    const photoCount = rapport.photos ? rapport.photos.length : (rapport.photoUrl ? 1 : 0);
                    
                    return (
                      <TableRow key={rapport.id} className="hover:bg-muted/30 transition-smooth">
                        <TableCell className="font-medium">{rapport.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium text-foreground">
                                {formaterNomsEmployes(rapport.employes)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {rapport.employes?.[0]?.fonction || "Non spécifié"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-foreground">
                              {rapport.phase?.nom}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {rapport.phase?.tache?.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={rapport.description}>
                            {rapport.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(rapport.dateRapport).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          {hasPhotos ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Image className="h-4 w-4 text-green-500" />
                              {photoCount} photo(s)
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Aucune</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={validationColors[rapport.validation]}
                          >
                            {validationLabels[rapport.validation]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {rapport.validation === "En attente" && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => approuverRapport(rapport.id)}
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                  title="Approuver"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openDialog("revision", rapport)}
                                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                  title="Demander révision"
                                >
                                  <AlertTriangle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openDialog("details", rapport)}
                              title="Voir détails"
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

      {/* Modal Détails */}
      <Dialog open={dialog?.type === "details"} onOpenChange={closeDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Détails du Rapport
            </DialogTitle>
          </DialogHeader>
          {dialog?.rapport && (
            <div className="space-y-6">
              {/* Gallery Photos */}
              {(dialog.rapport.photos && dialog.rapport.photos.length > 0) || dialog.rapport.photoUrl ? (
                <div className="space-y-4">
                  <Label className="text-sm font-medium">
                    Photos du travail ({getTotalPhotos(dialog.rapport)})
                  </Label>
                  
                  {/* Photo principale */}
                  <div className="relative bg-muted rounded-lg p-4">
                    <div className="flex justify-center items-center min-h-64">
                      <img 
                        src={getCurrentPhotoUrl(dialog.rapport)}
                        alt={`Photo ${photoIndex + 1} du rapport`}
                        className="max-w-full max-h-96 object-contain rounded-lg"
                      />
                    </div>
                    
                    {/* Navigation */}
                    {getTotalPhotos(dialog.rapport) > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={prevPhoto}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={nextPhoto}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        
                        {/* Indicateurs */}
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                          {Array.from({ length: getTotalPhotos(dialog.rapport) }).map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setPhotoIndex(index)}
                              className={`w-2 h-2 rounded-full transition-all ${
                                index === photoIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Vignettes */}
                  {dialog.rapport.photos && dialog.rapport.photos.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {dialog.rapport.photos.map((photo, index) => (
                        <button
                          key={photo.id}
                          onClick={() => setPhotoIndex(index)}
                          className={`relative border-2 rounded-lg overflow-hidden transition-all ${
                            index === photoIndex ? 'border-primary' : 'border-transparent'
                          }`}
                        >
                          <img 
                            src={getImageUrl(dialog.rapport!.id, photo.nom_fichier)}
                            alt={`Vignette ${index + 1}`}
                            className="w-full h-16 object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                  <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune photo disponible</p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informations gauche */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">ID Rapport</Label>
                    <p className="font-medium text-lg">{dialog.rapport.id}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-muted-foreground">Employé(s)</Label>
                    <div className="space-y-2 mt-2">
                      {dialog.rapport.employes?.map((employe) => (
                        <div key={employe.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {employe.prenom} {employe.nom}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {employe.fonction}
                            </p>
                          </div>
                        </div>
                      )) || <p className="text-muted-foreground">Non assigné</p>}
                    </div>
                  </div>
                </div>

                {/* Informations droite */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Phase</Label>
                    <p className="font-medium">{dialog.rapport.phase?.nom}</p>
                    <p className="text-sm text-muted-foreground">
                      {dialog.rapport.phase?.tache?.description}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Date</Label>
                      <p className="font-medium">
                        {new Date(dialog.rapport.dateRapport).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-sm text-muted-foreground">Avancement</Label>
                      <p className="font-medium">{dialog.rapport.avancement}%</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-muted-foreground">Statut</Label>
                    <Badge 
                      variant="outline" 
                      className={`${validationColors[dialog.rapport.validation]} text-sm py-1`}
                    >
                      {validationLabels[dialog.rapport.validation]}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="mt-2 text-foreground bg-muted/30 p-4 rounded-lg min-h-20">
                  {dialog.rapport.description}
                </p>
              </div>

              {/* Commentaire existant */}
              {dialog.rapport.commentaire && (
                <div>
                  <Label className="text-sm font-medium">Commentaire précédent</Label>
                  <p className="mt-2 text-foreground bg-amber-50 border border-amber-200 p-3 rounded-lg">
                    {dialog.rapport.commentaire}
                  </p>
                </div>
              )}

              {/* Actions pour rapports en attente */}
              {dialog.rapport.validation === "En attente" && (
                <DialogFooter className="flex gap-2 pt-4 border-t">
                  <Button 
                    onClick={() => approuverRapport(dialog.rapport!.id)}
                    className="bg-green-600 hover:bg-green-700 flex-1"
                    size="lg"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approuver le rapport
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      closeDialog();
                      openDialog("revision", dialog.rapport);
                    }}
                    className="border-orange-200 text-orange-600 hover:bg-orange-50 flex-1"
                    size="lg"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Demander révision
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Demande de Révision */}
      <Dialog open={dialog?.type === "revision"} onOpenChange={closeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Demander une révision
            </DialogTitle>
            <DialogDescription>
              Indiquez à l'employé ce qui doit être modifié dans son rapport
            </DialogDescription>
          </DialogHeader>
          {dialog?.rapport && (
            <div className="space-y-4">
              {/* Aperçu du rapport */}
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Rapport {dialog.rapport.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {dialog.rapport.phase?.nom} - {formaterNomsEmployes(dialog.rapport.employes)}
                    </p>
                  </div>
                  <Badge variant="outline" className={validationColors[dialog.rapport.validation]}>
                    {validationLabels[dialog.rapport.validation]}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Commentaire pour l'employé *</Label>
                <Textarea 
                  placeholder="Expliquez clairement ce qui doit être modifié ou complété dans le rapport..."
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  rows={5}
                  className="mt-2 resize-none"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ce commentaire sera visible par l'employé
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
                  className="bg-orange-600 hover:bg-orange-700 flex-1"
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
