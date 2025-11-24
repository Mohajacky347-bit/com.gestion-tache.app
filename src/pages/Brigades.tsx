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
import { Plus, Search, MapPin, Users } from "lucide-react";

interface Brigade {
  id_brigade: number;
  nom_brigade: string;
  lieu: string;
  chef_nom?: string;
}

type AlertType = "success" | "error" | null;
type DialogType = "add" | null;

export default function Brigades() {
  const [brigades, setBrigades] = useState<Brigade[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [alert, setAlert] = useState<{ type: AlertType; message: string } | null>(null);
  const [dialog, setDialog] = useState<{ type: DialogType } | null>(null);
  const [formData, setFormData] = useState({
    nom_brigade: "",
    lieu: "",
  });

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
      const res = await fetch("/api/brigades", { cache: "no-store" });
      if (!res.ok) throw new Error("Erreur lors du chargement des brigades");
      const data: Brigade[] = await res.json();
      setBrigades(data);
    } catch (error) {
      console.error("Error fetching brigades:", error);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type: AlertType, message: string) => {
    setAlert({ type, message });
  };

  const openDialog = (type: DialogType) => {
    setDialog({ type });
    if (type === "add") {
      setFormData({
        nom_brigade: "",
        lieu: "",
      });
    }
  };

  const closeDialog = () => {
    setDialog(null);
    setFormData({
      nom_brigade: "",
      lieu: "",
    });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.nom_brigade || !formData.lieu) {
        showAlert("error", "Veuillez remplir tous les champs");
        return;
      }

      const response = await fetch("/api/brigades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'ajout");
      }
      
      await fetchData();
      showAlert("success", "Brigade ajoutée avec succès");
      closeDialog();
    } catch (error: any) {
      console.error("Error adding brigade:", error);
      showAlert("error", error.message || "Erreur lors de l'ajout de la brigade");
    }
  };

  const filtered = brigades.filter(
    (b) =>
      b.nom_brigade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.lieu.toLowerCase().includes(searchTerm.toLowerCase())
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
            Gestion des Brigades
          </h1>
          <p className="text-muted-foreground mt-2">
            Visualisez les brigades et leurs lieux d&apos;affectation.
          </p>
        </div>
        <Button
          className="shadow-soft bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          type="button"
          onClick={() => openDialog("add")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une brigade
        </Button>
      </div>

      {/* Search */}
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher une brigade par nom ou lieu..."
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
          <CardTitle>Liste des Brigades ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-muted-foreground py-8">
              Chargement des brigades...
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>ID</TableHead>
                    <TableHead>Nom de la brigade</TableHead>
                    <TableHead>Lieu</TableHead>
                    <TableHead>Chef de brigade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground"
                      >
                        Aucune brigade trouvée.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((brigade) => (
                      <TableRow
                        key={brigade.id_brigade}
                        className="hover:bg-muted/30 transition-smooth"
                      >
                        <TableCell className="font-medium">
                          {brigade.id_brigade}
                        </TableCell>
                        <TableCell>{brigade.nom_brigade}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            {brigade.lieu}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Users className="h-3 w-3" />
                            {brigade.chef_nom || "Non défini"}
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
            Ajouter une brigade
          </DialogTitle>
          <DialogDescription>
            Remplissez les informations de la nouvelle brigade.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nom_brigade">Nom de la brigade</Label>
            <Input
              id="nom_brigade"
              value={formData.nom_brigade}
              onChange={(e) => setFormData({ ...formData, nom_brigade: e.target.value })}
              placeholder="Brigade A"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="lieu">Lieu</Label>
            <Input
              id="lieu"
              value={formData.lieu}
              onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
              placeholder="Fianarantsoa"
              required
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
            Ajouter
          </Button>
        </DialogFooter>
      </DialogContent>
      </Dialog>
    </div>
  );
}


