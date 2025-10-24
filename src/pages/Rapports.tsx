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
  Plus,
  FileText,
  Search,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const mockRapports = [
  {
    id: "R001",
    titre: "Avancement du pont RN2",
    tache: "Réparation du tablier",
    date: "2025-10-01",
    statut: "En attente",
    photo: "/pont_rn2.jpg",
  },
  {
    id: "R002",
    titre: "Installation des lampadaires",
    tache: "Phase 2 - Électricité",
    date: "2025-09-27",
    statut: "Validé",
    photo: "/lampadaires_zone3.jpg",
  },
  {
    id: "R003",
    titre: "Réfection de la chaussée",
    tache: "Phase 1 - Nivellement",
    date: "2025-09-29",
    statut: "Rejeté",
    photo: "/chaussee_zone1.jpg",
  },
];

const statutVariants = {
  "En attente": "pending",
  "Validé": "completed",
  "Rejeté": "destructive",
};

export default function Rapports() {
  const [rapports, setRapports] = useState(mockRapports);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRapport, setNewRapport] = useState({
    titre: "",
    tache: "",
    description: "",
    photo: null,
  });

  const filteredRapports = rapports.filter(
    (r) =>
      r.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.tache.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewRapport({ ...newRapport, photo: URL.createObjectURL(file) });
    }
  };

  const handleSubmit = () => {
    const newId = "R" + String(rapports.length + 1).padStart(3, "0");
    const nouveau = {
      id: newId,
      titre: newRapport.titre,
      tache: newRapport.tache,
      date: new Date().toISOString().split("T")[0],
      statut: "En attente",
      photo: newRapport.photo,
    };
    setRapports([...rapports, nouveau]);
    setNewRapport({ titre: "", tache: "", description: "", photo: null });
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rapports de Brigade</h1>
          <p className="text-muted-foreground mt-2">
            Déclarez et consultez les rapports d’avancement des travaux
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-soft">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau rapport
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Soumettre un nouveau rapport</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Titre du rapport
                </label>
                <Input
                  placeholder="Ex : Réparation du pont RN2"
                  value={newRapport.titre}
                  onChange={(e) =>
                    setNewRapport({ ...newRapport, titre: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Tâche concernée
                </label>
                <Input
                  placeholder="Ex : Phase 1 - Démolition"
                  value={newRapport.tache}
                  onChange={(e) =>
                    setNewRapport({ ...newRapport, tache: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Description
                </label>
                <Textarea
                  placeholder="Décrivez l’avancement des travaux..."
                  value={newRapport.description}
                  onChange={(e) =>
                    setNewRapport({ ...newRapport, description: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Photo (preuve)
                </label>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Importer une image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                  {newRapport.photo && (
                    <img
                      src={newRapport.photo}
                      alt="aperçu"
                      className="h-12 w-12 rounded-md object-cover border"
                    />
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSubmit}>Soumettre</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Barre de recherche */}
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher un rapport..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tableau des rapports */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Liste des Rapports ({filteredRapports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>ID</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Tâche</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Photo</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRapports.map((r) => (
                  <TableRow key={r.id} className="hover:bg-muted/30 transition-smooth">
                    <TableCell>{r.id}</TableCell>
                    <TableCell className="font-medium">{r.titre}</TableCell>
                    <TableCell>{r.tache}</TableCell>
                    <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {r.photo ? (
                        <img
                          src={r.photo}
                          alt={r.titre}
                          className="h-10 w-10 object-cover rounded"
                        />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statutVariants[r.statut]}>{r.statut}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Voir détails
                      </Button>
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
