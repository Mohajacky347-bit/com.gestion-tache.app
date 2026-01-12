import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Users, User } from "lucide-react";

interface Equipe {
  id_equipe: number;
  nom_equipe: string;
  specialite: string;
  id_brigade: number;
  brigade_nom?: string;
  membres?: number;
}

interface Brigade {
  id_brigade: number;
  nom_brigade: string;
  lieu: string;
}

type AlertType = "success" | "error" | null;
type DialogType = "add" | null;

export default function Equipes() {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [brigades, setBrigades] = useState<Brigade[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [alert, setAlert] = useState<{ type: AlertType; message: string } | null>(null);
  const [dialog, setDialog] = useState<{ type: DialogType } | null>(null);
  const [formData, setFormData] = useState({
    nom_equipe: "",
    specialite: "",
    id_brigade: "",
  });

  useEffect(() => {
    fetchData();
    fetchBrigades();
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
      const res = await fetch("/api/equipes");
      if (!res.ok) throw new Error("Erreur lors du chargement des équipes");
      const data: Equipe[] = await res.json();
      setEquipes(data);
    } catch (error) {
      console.error("Error fetching equipes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrigades = async () => {
    try {
      const res = await fetch("/api/brigades");
      if (!res.ok) throw new Error("Erreur lors du chargement des brigades");
      const data: Brigade[] = await res.json();
      setBrigades(data);
    } catch (error) {
      console.error("Error fetching brigades:", error);
    }
  };

  const showAlert = (type: AlertType, message: string) => {
    setAlert({ type, message });
  };

  const openDialog = (type: DialogType) => {
    setDialog({ type });
    if (type === "add") {
      setFormData({
        nom_equipe: "",
        specialite: "",
        id_brigade: "",
      });
    }
  };

  const closeDialog = () => {
    setDialog(null);
    setFormData({
      nom_equipe: "",
      specialite: "",
      id_brigade: "",
    });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.nom_equipe || !formData.specialite || !formData.id_brigade) {
        showAlert("error", "Veuillez remplir tous les champs");
        return;
      }

      const response = await fetch("/api/equipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom_equipe: formData.nom_equipe,
          specialite: formData.specialite,
          id_brigade: Number(formData.id_brigade),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'ajout");
      }
      
      await fetchData();
      showAlert("success", "Équipe ajoutée avec succès");
      closeDialog();
    } catch (error: any) {
      console.error("Error adding equipe:", error);
      showAlert("error", error.message || "Erreur lors de l'ajout de l'équipe");
    }
  };

  const filtered = equipes.filter(
    (e) =>
      e.nom_equipe.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.specialite.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Gestion des Équipes
          </h1>
          <p className="text-muted-foreground mt-2">
            Organisez les équipes par spécialité et par brigade.
          </p>
        </div>
        <Button
          className="shadow-soft bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          type="button"
          onClick={() => openDialog("add")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une équipe
        </Button>
      </div>

      {/* Search */}
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher une équipe par nom ou spécialité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Liste des Équipes ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-muted-foreground py-8">
              Chargement des équipes...
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>ID</TableHead>
                    <TableHead>Nom de l&apos;équipe</TableHead>
                    <TableHead>Spécialité</TableHead>
                    <TableHead>Brigade</TableHead>
                    <TableHead>Membres</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground"
                      >
                        Aucune équipe trouvée.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((equipe) => (
                      <TableRow
                        key={equipe.id_equipe}
                        className="hover:bg-muted/30 transition-smooth"
                      >
                        <TableCell className="font-medium">
                          {equipe.id_equipe}
                        </TableCell>
                        <TableCell>{equipe.nom_equipe}</TableCell>
                        <TableCell>{equipe.specialite}</TableCell>
                        <TableCell>{equipe.brigade_nom || "Non définie"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            {equipe.membres && equipe.membres > 1 ? (
                              <Users className="h-3 w-3" />
                            ) : (
                              <User className="h-3 w-3" />
                            )}
                            {equipe.membres ?? 0} membre
                            {equipe.membres && equipe.membres > 1 ? "s" : ""}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog d'ajout */}
      <Dialog open={dialog?.type === "add"} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Ajouter une équipe
          </DialogTitle>
          <DialogDescription>
            Remplissez les informations de la nouvelle équipe.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nom_equipe">Nom de l&apos;équipe</Label>
            <Input
              id="nom_equipe"
              value={formData.nom_equipe}
              onChange={(e) => setFormData({ ...formData, nom_equipe: e.target.value })}
              placeholder="Équipe Maintenance"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="specialite">Spécialité</Label>
            <Input
              id="specialite"
              value={formData.specialite}
              onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
              placeholder="Électricité, Voies, Signalisation..."
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="id_brigade">Brigade</Label>
            <Select
              value={formData.id_brigade}
              onValueChange={(value) => setFormData({ ...formData, id_brigade: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une brigade" />
              </SelectTrigger>
              <SelectContent>
                {brigades.length === 0 ? (
                  <SelectItem value="" disabled>
                    Aucune brigade disponible
                  </SelectItem>
                ) : (
                  brigades.map((brigade) => (
                    <SelectItem key={brigade.id_brigade} value={String(brigade.id_brigade)}>
                      {brigade.nom_brigade} - {brigade.lieu}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closeDialog}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled={brigades.length === 0}
          >
            Ajouter
          </Button>
        </DialogFooter>
      </DialogContent>
      </Dialog>
    </div>
  );
}


