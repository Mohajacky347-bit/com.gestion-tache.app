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
  Plus, 
  Search,
  Wrench,
  CheckCircle,
  Edit,
  Trash2,
  Eye,
  Package,
  Package2
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

interface Material {
  id: string;
  nom: string;
  type: string;
  quantite: number;
  etat: "disponible" | "utilise";
}

const etatLabels = {
  disponible: "Disponible",
  utilise: "En utilisation"
};

const etatVariants = {
  disponible: "completed",
  utilise: "progress"
} as const;

type AlertType = "success" | "error" | null;
type DialogType = "add" | "edit" | "delete" | "details" | null;

export default function Materiels() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [alert, setAlert] = useState<{ type: AlertType; message: string } | null>(null);
  const [dialog, setDialog] = useState<{ type: DialogType; material?: Material } | null>(null);
  const [formData, setFormData] = useState<Partial<Material>>({
  nom: "",
  type: "",
  quantite: 1,
  etat: "disponible"
});


  const filteredMaterials = materials.filter(mat =>
    mat.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mat.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: materials.length,
    disponible: materials.filter(m => m.etat === "disponible").length,
    utilise: materials.filter(m => m.etat === "utilise").length,
    enStock: materials.reduce((sum, mat) => sum + mat.quantite, 0)
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
      const res = await fetch("/api/materiels", { cache: "no-store" });
      if (!res.ok) throw new Error("Erreur lors du chargement des matériels");
      const data: Material[] = await res.json();
      setMaterials(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type: AlertType, message: string) => {
    setAlert({ type, message });
  };

  const openDialog = (type: DialogType, material?: Material) => {
    setDialog({ type, material });
    if (type === "edit" && material) {
      setFormData(material);
    } else if (type === "add") {
      setFormData({
        nom: "",
        type: "",
        quantite: 1,
        etat: "disponible"
      });
    }
  };

  const closeDialog = () => {
    setDialog(null);
    setFormData({
      nom: "",
      type: "",
      quantite: 1,
      etat: "disponible"
    });
  };

  const handleSubmit = async () => {
  try {
    if (dialog?.type === "add") {
      // Pour l'ajout, envoyer les données SANS l'ID dans le corps
      const materialData = {
        nom: formData.nom!,
        type: formData.type!,
        quantite: formData.quantite!,
        etat: formData.etat!
      };
      
      const response = await fetch("/api/materiels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(materialData),
      });

      if (!response.ok) throw new Error("Erreur lors de l'ajout");
      
      await fetchData();
      showAlert("success", "Matériel ajouté avec succès");

    } else if (dialog?.type === "edit" && dialog.material) {
      // Pour la modification, utiliser l'ID existant du matériel
      const materialData = {
        nom: formData.nom!,
        type: formData.type!,
        quantite: formData.quantite!,
        etat: formData.etat!
      };
      
      const response = await fetch(`/api/materiels/${dialog.material.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(materialData),
      });

      if (!response.ok) throw new Error("Erreur lors de la modification");
      
      await fetchData();
      showAlert("success", "Matériel modifié avec succès");
    }else if (dialog?.type === "delete" && dialog.material) {
      const response = await fetch(`/api/materiels/${dialog.material.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erreur lors de la suppression");
      
      await fetchData();
      showAlert("success", "Matériel supprimé avec succès");
    }
    
    closeDialog();
  } catch (error) {
    showAlert("error", "Erreur lors de l'opération");
  }
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
            Gestion des Matériels
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez le matériel et les équipements du service
          </p>
        </div>
        <Button 
          className="shadow-soft bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          onClick={() => openDialog("add")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter du matériel
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-soft border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Matériels</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Disponibles</p>
                <p className="text-2xl font-bold text-green-600">{stats.disponible}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-orange-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En utilisation</p>
                <p className="text-2xl font-bold text-orange-600">{stats.utilise}</p>
              </div>
              <Wrench className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total en stock</p>
                <p className="text-2xl font-bold text-purple-600">{stats.enStock}</p>
              </div>
              <Package2 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher par nom ou type de matériel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Materials Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Liste des Matériels ({filteredMaterials.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 text-sm text-destructive">{error}</div>
          )}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>ID</TableHead>
                  <TableHead>Nom du Matériel</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>État</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : filteredMaterials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Aucun matériel trouvé
                    </TableCell>
                  </TableRow>
                ) : filteredMaterials.map((material) => (
                  <TableRow key={material.id} className="hover:bg-muted/30 transition-smooth">
                    <TableCell className="font-medium">{material.id}</TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{material.nom}</div>
                    </TableCell>
                    <TableCell>{material.type}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {material.quantite}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={etatVariants[material.etat]}>
                        {etatLabels[material.etat]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openDialog("details", material)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openDialog("edit", material)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => openDialog("delete", material)}
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
        </CardContent>
      </Card>

      {/* Dialog d'ajout/modification */}
      <Dialog open={dialog?.type === "add" || dialog?.type === "edit"} onOpenChange={closeDialog}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {dialog?.type === "add" ? "Ajouter un matériel" : "Modifier le matériel"}
      </DialogTitle>
      <DialogDescription>
        {dialog?.type === "add" 
          ? "Remplissez les informations du nouveau matériel." 
          : "Modifiez les informations du matériel."
        }
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="nom">Nom du matériel</Label>
        <Input
          id="nom"
          value={formData.nom}
          onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
          placeholder="Ex: Perceuse électrique"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="type">Type</Label>
        <Input
          id="type"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          placeholder="Ex: Outil électroportatif"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="quantite">Quantité</Label>
          <Input
            id="quantite"
            type="number"
            min="1"
            value={formData.quantite}
            onChange={(e) => setFormData({ ...formData, quantite: parseInt(e.target.value) || 1 })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="etat">État</Label>
          <Select 
            value={formData.etat} 
            onValueChange={(value: "disponible" | "utilise") => setFormData({ ...formData, etat: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="disponible">Disponible</SelectItem>
              <SelectItem value="utilise">En utilisation</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
        {dialog?.type === "add" ? "Ajouter" : "Modifier"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

      {/* Dialog de détails */}
      <Dialog open={dialog?.type === "details"} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Détails du matériel
            </DialogTitle>
          </DialogHeader>
          {dialog?.material && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">ID</Label>
                  <p className="font-medium">{dialog.material.id}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">État</Label>
                  <Badge variant={etatVariants[dialog.material.etat]}>
                    {etatLabels[dialog.material.etat]}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Nom</Label>
                <p className="font-medium">{dialog.material.nom}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Type</Label>
                <p className="font-medium">{dialog.material.type}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Quantité</Label>
                <p className="font-medium">{dialog.material.quantite}</p>
              </div>
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
              Cette action supprimera définitivement le matériel{" "}
              <span className="font-semibold">{dialog?.material?.nom}</span>. 
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
