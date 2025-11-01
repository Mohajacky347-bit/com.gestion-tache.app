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
  Plus,
  Upload,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Download,
  Edit,
  Trash2,
  AlertTriangle,
  X,
  Image
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

interface Phase {
  id: string;
  nom: string;
  tache?: {
    id: string;
    description: string;
  };
}

interface Rapport {
  id: string;
  description: string;
  dateRapport: string;
  photoUrl?: string;
  avancement: number;
  idPhase: string;
  validation: "en_attente" | "a_reviser" | "approuve";
  phase?: Phase;
  photos?: {
    id: string;
    nom_fichier: string;
    ordre: number;
  }[];
}

const validationLabels = {
  en_attente: "En attente",
  a_reviser: "À réviser", 
  approuve: "Approuvé"
};

const validationVariants = {
  en_attente: "pending",
  a_reviser: "paused",
  approuve: "completed"
} as const;

type AlertType = "success" | "error" | null;
type DialogType = "add" | "edit" | "delete" | "details" | null;

// Fonction pour convertir les images en Base64
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Fonction utilitaire pour générer les URLs des images
const getImageUrl = (rapportId: string, nomFichier: string) => {
  return `/api/images/rapports/${rapportId}/${nomFichier}`;
};

export default function Rapports() {
  const [rapports, setRapports] = useState<Rapport[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [alert, setAlert] = useState<{ type: AlertType; message: string } | null>(null);
  const [dialog, setDialog] = useState<{ type: DialogType; rapport?: Rapport } | null>(null);
  const [formData, setFormData] = useState<Partial<Rapport>>({
    description: "",
    dateRapport: new Date().toISOString().split('T')[0],
    avancement: 0,
    idPhase: "",
    photoUrl: ""
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      
      // Récupérer les rapports
      const rapportsRes = await fetch("/api/rapports", { cache: "no-store" });
      if (!rapportsRes.ok) throw new Error("Erreur lors du chargement des rapports");
      const rapportsData = await rapportsRes.json();

      // Récupérer les phases avec leurs tâches
      const phasesRes = await fetch("/api/phases/with-taches", { cache: "no-store" });
      if (!phasesRes.ok) throw new Error("Erreur lors du chargement des phases");
      const phasesData = await phasesRes.json();

      // Associer les phases aux rapports
      const rapportsWithPhases = rapportsData.map((rapport: Rapport) => ({
        ...rapport,
        phase: phasesData.find((p: Phase) => p.id === rapport.idPhase)
      }));

      setRapports(rapportsWithPhases);
      setPhases(phasesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type: AlertType, message: string) => {
    setAlert({ type, message });
  };

  const openDialog = (type: DialogType, rapport?: Rapport) => {
    setDialog({ type, rapport });
    if (type === "edit" && rapport) {
      setFormData({
        description: rapport.description,
        dateRapport: rapport.dateRapport,
        avancement: rapport.avancement,
        idPhase: rapport.idPhase,
        photoUrl: rapport.photoUrl
      });
      setPhotos([]);
      // Pour l'édition, on garde les prévisualisations des photos existantes
      if (rapport.photos && rapport.photos.length > 0) {
        const previews = rapport.photos.map(photo => 
          getImageUrl(rapport.id, photo.nom_fichier)
        );
        setPhotoPreviews(previews);
      } else {
        setPhotoPreviews(rapport.photoUrl ? [rapport.photoUrl] : []);
      }
    } else if (type === "add") {
      setFormData({
        description: "",
        dateRapport: new Date().toISOString().split('T')[0],
        avancement: 0,
        idPhase: "",
        photoUrl: ""
      });
      setPhotos([]);
      setPhotoPreviews([]);
    } else if (type === "details" && rapport) {
      // Pour les détails, on précharge les images existantes
      if (rapport.photos && rapport.photos.length > 0) {
        const previews = rapport.photos.map(photo => 
          getImageUrl(rapport.id, photo.nom_fichier)
        );
        setPhotoPreviews(previews);
      } else {
        setPhotoPreviews(rapport.photoUrl ? [rapport.photoUrl] : []);
      }
    }
  };

  const closeDialog = () => {
    setDialog(null);
    setFormData({
      description: "",
      dateRapport: new Date().toISOString().split('T')[0],
      avancement: 0,
      idPhase: "",
      photoUrl: ""
    });
    setPhotos([]);
    setPhotoPreviews([]);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validation : maximum 5 photos
    if (photos.length + files.length > 5) {
      showAlert("error", "Maximum 5 photos autorisées");
      return;
    }

    // Validation : taille maximale 5MB par photo
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      showAlert("error", "Certaines photos dépassent 5MB");
      return;
    }

    // Convertir les fichiers en prévisualisations Base64
    const newPreviews = await Promise.all(
      files.map(file => convertToBase64(file))
    );

    setPhotos(prev => [...prev, ...files]);
    setPhotoPreviews(prev => [...prev, ...newPreviews]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      // Validation des photos
      if (dialog?.type === "add" && photos.length === 0) {
        showAlert("error", "Au moins une photo est obligatoire");
        return;
      }
      if (dialog?.type === "edit" && photos.length === 0 && !dialog.rapport?.photos?.length) {
        showAlert("error", "Au moins une photo est obligatoire");
        return;
      }

      setIsSubmitting(true);

      if (dialog?.type === "add") {
        // Préparer les données pour l'envoi
        const submitFormData = new FormData();
        submitFormData.append('description', formData.description || '');
        submitFormData.append('dateRapport', formData.dateRapport || '');
        submitFormData.append('avancement', formData.avancement?.toString() || '0');
        submitFormData.append('idPhase', formData.idPhase || '');
        
        // Ajouter toutes les photos
        photos.forEach(photo => {
          submitFormData.append('photos', photo);
        });

        const response = await fetch("/api/rapports", {
          method: "POST",
          body: submitFormData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erreur lors de l'ajout");
        }
        
        await fetchData();
        showAlert("success", "Rapport soumis avec succès");

      } else if (dialog?.type === "edit" && dialog.rapport) {
        // Préparer les données pour la modification
        const submitFormData = new FormData();
        submitFormData.append('description', formData.description || '');
        submitFormData.append('dateRapport', formData.dateRapport || '');
        submitFormData.append('avancement', formData.avancement?.toString() || '0');
        submitFormData.append('idPhase', formData.idPhase || '');
        
        // Ajouter les nouvelles photos seulement (les anciennes sont déjà en base)
        photos.forEach(photo => {
          submitFormData.append('photos', photo);
        });

        const response = await fetch(`/api/rapports/${dialog.rapport.id}`, {
          method: "PUT",
          body: submitFormData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erreur lors de la modification");
        }
        
        await fetchData();
        showAlert("success", "Rapport modifié avec succès");

      } else if (dialog?.type === "delete" && dialog.rapport) {
        const response = await fetch(`/api/rapports/${dialog.rapport.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erreur lors de la suppression");
        }
        
        await fetchData();
        showAlert("success", "Rapport supprimé avec succès");
      }
      
      closeDialog();
    } catch (error) {
      console.error('Submit error:', error);
      showAlert("error", error instanceof Error ? error.message : "Erreur lors de l'opération");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRapports = rapports.filter(rapport =>
    rapport.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rapport.phase?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rapport.phase?.tache?.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: rapports.length,
    en_attente: rapports.filter(r => r.validation === "en_attente").length,
    a_reviser: rapports.filter(r => r.validation === "a_reviser").length,
    approuve: rapports.filter(r => r.validation === "approuve").length
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
            Rapports d'Avancement
          </h1>
          <p className="text-muted-foreground mt-2">
            Soumettez et consultez vos rapports d'activité
          </p>
        </div>
        
        <Button 
          className="shadow-soft bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          onClick={() => openDialog("add")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Rapport
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
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.en_attente}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-orange-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">À réviser</p>
                <p className="text-2xl font-bold text-orange-600">{stats.a_reviser}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approuvés</p>
                <p className="text-2xl font-bold text-green-600">{stats.approuve}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="relative">
            <Input
              placeholder="Rechercher par description, phase ou tâche..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Mes Rapports ({filteredRapports.length})</CardTitle>
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
                    <TableHead>Phase / Tâche</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Avancement</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Photos</TableHead>
                    <TableHead>Validation</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRapports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        Aucun rapport trouvé
                      </TableCell>
                    </TableRow>
                  ) : filteredRapports.map((rapport) => (
                    <TableRow key={rapport.id} className="hover:bg-muted/30 transition-smooth">
                      <TableCell className="font-medium">{rapport.id}</TableCell>
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
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${rapport.avancement}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8">
                            {rapport.avancement}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(rapport.dateRapport).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {rapport.photos && rapport.photos.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <Image className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-muted-foreground">
                              {rapport.photos.length} photo(s)
                            </span>
                          </div>
                        ) : rapport.photoUrl ? (
                          <div className="flex items-center gap-2">
                            <Image className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-muted-foreground">Avec photo</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Image className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-muted-foreground">Sans photo</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={validationVariants[rapport.validation]}>
                          {validationLabels[rapport.validation]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openDialog("details", rapport)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openDialog("edit", rapport)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => openDialog("delete", rapport)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {dialog?.type === "add" ? "Nouveau Rapport" : "Modifier le Rapport"}
            </DialogTitle>
            <DialogDescription>
              {dialog?.type === "add" 
                ? "Soumettez un rapport d'avancement pour une phase" 
                : "Modifiez les informations du rapport"
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="idPhase">Phase concernée</Label>
              <Select 
                value={formData.idPhase} 
                onValueChange={(value) => setFormData({ ...formData, idPhase: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une phase" />
                </SelectTrigger>
                <SelectContent>
                  {phases.map((phase) => (
                    <SelectItem key={phase.id} value={phase.id}>
                      {phase.nom} - {phase.tache?.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description du rapport</Label>
              <Textarea
                id="description"
                placeholder="Décrivez l'avancement des travaux, les difficultés rencontrées, etc."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateRapport">Date du rapport</Label>
                <Input
                  id="dateRapport"
                  type="date"
                  value={formData.dateRapport}
                  onChange={(e) => setFormData({ ...formData, dateRapport: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avancement">Avancement (%)</Label>
                <Input
                  id="avancement"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.avancement}
                  onChange={(e) => setFormData({ ...formData, avancement: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="photo-upload">Photos *</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                
                {photoPreviews.length === 0 ? (
                  <div className="py-8">
                    <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Glissez-déposez vos photos ou
                    </p>
                    <Label htmlFor="photo-upload" className="cursor-pointer">
                      <Button 
                        variant="outline" 
                        size="sm"
                        type="button"
                        className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Sélectionner des photos
                      </Button>
                    </Label>
                    <p className="text-xs text-muted-foreground mt-3">
                      Maximum 5 photos, 5MB par photo
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Photos sélectionnées ({photoPreviews.length}/5)
                      </span>
                      <Label htmlFor="photo-upload" className="cursor-pointer">
                        <Button 
                          variant="outline" 
                          size="sm"
                          type="button"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter plus
                        </Button>
                      </Label>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-40 overflow-y-auto">
                      {photoPreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={preview} 
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border shadow-sm"
                          />
                          <Button
                            size="sm"
                            onClick={() => removePhoto(index)}
                            className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          <div className="text-xs text-center mt-1 truncate">
                            {photos[index]?.name || `Photo ${index + 1}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={closeDialog}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || (dialog?.type === "add" && photoPreviews.length === 0) || (dialog?.type === "edit" && photoPreviews.length === 0 && !dialog.rapport?.photos?.length)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    {dialog?.type === "add" ? "Soumission..." : "Modification..."}
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    {dialog?.type === "add" ? "Soumettre" : "Modifier"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de détails */}
      <Dialog open={dialog?.type === "details"} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Détails du Rapport
            </DialogTitle>
          </DialogHeader>
          {dialog?.rapport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">ID</Label>
                  <p className="font-medium">{dialog.rapport.id}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Validation</Label>
                  <Badge variant={validationVariants[dialog.rapport.validation]}>
                    {validationLabels[dialog.rapport.validation]}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Phase</Label>
                <p className="font-medium">{dialog.rapport.phase?.nom}</p>
                <p className="text-sm text-muted-foreground">
                  {dialog.rapport.phase?.tache?.description}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Description</Label>
                <p className="font-medium">{dialog.rapport.description}</p>
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
              {dialog.rapport.photos && dialog.rapport.photos.length > 0 && (
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Photos du travail ({dialog.rapport.photos.length})
                  </Label>
                  <div className="space-y-3 mt-2">
                    {dialog.rapport.photos.map((photo, index) => (
                      <div key={photo.id} className="border rounded-lg p-2">
                        <img 
                          src={getImageUrl(dialog.rapport!.id, photo.nom_fichier)}
                          alt={`Photo ${index + 1} du rapport`}
                          className="rounded-lg max-w-full max-h-64 object-contain mx-auto"
                        />
                        <p className="text-xs text-center text-muted-foreground mt-1">
                          Photo {index + 1}
                        </p>
                      </div>
                    ))}
                  </div>
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
            <AlertDialogDescription>
              Cette action supprimera définitivement le rapport{" "}
              <span className="font-semibold">{dialog?.rapport?.id}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSubmit}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
