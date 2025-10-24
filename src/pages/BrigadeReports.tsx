'use client'

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
  FileText, 
  Plus,
  Upload,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Download
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Report {
  id: string;
  taskId: string;
  taskTitle: string;
  description: string;
  status: "brouillon" | "soumis" | "approuve";
  dateCreation: string;
  dateSoumission?: string;
  photos: string[];
  notes?: string;
}

// Données de démonstration
const reports: Report[] = [
  {
    id: "R001",
    taskId: "T001",
    taskTitle: "Maintenance route principale",
    description: "Rapport d'avancement des travaux de réparation des nids-de-poule",
    status: "soumis",
    dateCreation: "2024-01-16",
    dateSoumission: "2024-01-16",
    photos: ["photo1.jpg", "photo2.jpg"],
    notes: "Travaux en cours, 60% terminés"
  },
  {
    id: "R002",
    taskId: "T003",
    taskTitle: "Installation éclairage public",
    description: "Rapport final des travaux d'installation des lampadaires",
    status: "approuve",
    dateCreation: "2024-01-12",
    dateSoumission: "2024-01-12",
    photos: ["photo3.jpg"],
    notes: "Travaux terminés avec succès"
  }
];

const statusLabels = {
  brouillon: "Brouillon",
  soumis: "Soumis", 
  approuve: "Approuvé"
};

const statusVariants = {
  brouillon: "secondary",
  soumis: "progress",
  approuve: "completed"
} as const;

// Tâches disponibles pour les rapports
const availableTasks = [
  { id: "T001", title: "Maintenance route principale" },
  { id: "T002", title: "Nettoyage caniveaux secteur A" },
  { id: "T004", title: "Réparation pont piétonnier" }
];

export default function BrigadeReports() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos(prev => [...prev, ...files]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedTask || !description.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une tâche et saisir une description",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulation de soumission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Rapport soumis",
        description: "Votre rapport a été soumis avec succès",
      });
      
      // Reset form
      setSelectedTask("");
      setDescription("");
      setNotes("");
      setPhotos([]);
      setIsDialogOpen(false);
      
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la soumission",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = {
    total: reports.length,
    brouillons: reports.filter(r => r.status === "brouillon").length,
    soumis: reports.filter(r => r.status === "soumis").length,
    approuves: reports.filter(r => r.status === "approuve").length
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rapports</h1>
          <p className="text-muted-foreground mt-2">
            Soumettez et consultez vos rapports d'activité
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-soft">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Rapport
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nouveau Rapport</DialogTitle>
              <DialogDescription>
                Soumettez un rapport pour une tâche en cours
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task">Tâche concernée</Label>
                <Select value={selectedTask} onValueChange={setSelectedTask}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une tâche" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
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
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes supplémentaires (optionnel)</Label>
                <Textarea
                  id="notes"
                  placeholder="Ajoutez des notes ou commentaires..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Photos (optionnel)</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Glissez-déposez vos photos ou cliquez pour sélectionner
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <Label htmlFor="photo-upload" className="cursor-pointer">
                    <Button variant="outline" size="sm">
                      Sélectionner des photos
                    </Button>
                  </Label>
                </div>
                
                {photos.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Photos sélectionnées:</p>
                    <div className="flex flex-wrap gap-2">
                      {photos.map((photo, index) => (
                        <div key={index} className="flex items-center gap-2 bg-muted p-2 rounded">
                          <span className="text-sm">{photo.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePhoto(index)}
                            className="h-6 w-6 p-0"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Soumission...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Soumettre
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Brouillons</p>
                <p className="text-2xl font-bold text-status-pending">{stats.brouillons}</p>
              </div>
              <Clock className="h-8 w-8 text-status-pending" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Soumis</p>
                <p className="text-2xl font-bold text-status-progress">{stats.soumis}</p>
              </div>
              <FileText className="h-8 w-8 text-status-progress" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approuvés</p>
                <p className="text-2xl font-bold text-status-completed">{stats.approuves}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-status-completed" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Mes Rapports ({reports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>ID</TableHead>
                  <TableHead>Tâche</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Photos</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Aucun rapport trouvé
                    </TableCell>
                  </TableRow>
                ) : reports.map((report) => (
                  <TableRow key={report.id} className="hover:bg-muted/30 transition-smooth">
                    <TableCell className="font-medium">{report.id}</TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{report.taskTitle}</div>
                      <div className="text-sm text-muted-foreground">
                        {report.taskId}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm max-w-xs truncate">
                        {report.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[report.status]}>
                        {statusLabels[report.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(report.dateCreation).toLocaleDateString()}
                        </div>
                        {report.dateSoumission && (
                          <div className="text-xs text-muted-foreground">
                            Soumis: {new Date(report.dateSoumission).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {report.photos.length} photo(s)
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          PDF
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
    </div>
  );
}

