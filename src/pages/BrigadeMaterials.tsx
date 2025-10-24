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
  Wrench, 
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  MapPin,
  ClipboardList
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface BrigadeMaterial {
  id: string;
  nom: string;
  type: string;
  quantite: number;
  etat: "disponible" | "utilise" | "maintenance";
  tacheActuelle?: string;
  tacheId?: string;
  dateMaintenance?: string;
  responsable?: string;
  localisation: string;
}

// Données de démonstration - matériels liés aux tâches de la brigade
const brigadeMaterials: BrigadeMaterial[] = [
  {
    id: "M001",
    nom: "Pelle mécanique CAT 320",
    type: "Engin de chantier",
    quantite: 1,
    etat: "utilise",
    tacheActuelle: "Maintenance route principale",
    tacheId: "T001",
    responsable: "Chef de Brigade",
    localisation: "Chantier RN1"
  },
  {
    id: "M002",
    nom: "Camion de nettoyage",
    type: "Véhicule utilitaire",
    quantite: 1,
    etat: "disponible",
    localisation: "Dépôt central"
  },
  {
    id: "M003",
    nom: "Débouchage haute pression",
    type: "Équipement de nettoyage",
    quantite: 2,
    etat: "disponible",
    localisation: "Dépôt central"
  },
  {
    id: "M004",
    nom: "Béton prêt à l'emploi",
    type: "Matériau de construction",
    quantite: 50,
    etat: "utilise",
    tacheActuelle: "Maintenance route principale",
    tacheId: "T001",
    responsable: "Chef de Brigade",
    localisation: "Chantier RN1"
  },
  {
    id: "M005",
    nom: "Compacteur vibratoire",
    type: "Engin de chantier",
    quantite: 1,
    etat: "maintenance",
    dateMaintenance: "2024-01-10",
    localisation: "Atelier maintenance"
  },
  {
    id: "M006",
    nom: "Échafaudage métallique",
    type: "Équipement de sécurité",
    quantite: 10,
    etat: "disponible",
    localisation: "Dépôt central"
  },
  {
    id: "M007",
    nom: "Lampadaires LED",
    type: "Équipement électrique",
    quantite: 5,
    etat: "utilise",
    tacheActuelle: "Installation éclairage public",
    tacheId: "T003",
    responsable: "Chef de Brigade",
    localisation: "Avenue de la République"
  }
];

const etatLabels = {
  disponible: "Disponible",
  utilise: "En utilisation",
  maintenance: "Maintenance"
};

const etatVariants = {
  disponible: "completed",
  utilise: "progress",
  maintenance: "paused"
} as const;

export default function BrigadeMaterials() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredMaterials = brigadeMaterials.filter(mat => {
    const matchesSearch = mat.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mat.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mat.localisation.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || mat.etat === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: brigadeMaterials.length,
    disponible: brigadeMaterials.filter(m => m.etat === "disponible").length,
    utilise: brigadeMaterials.filter(m => m.etat === "utilise").length,
    maintenance: brigadeMaterials.filter(m => m.etat === "maintenance").length
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Matériels Brigade</h1>
          <p className="text-muted-foreground mt-2">
            Matériels liés aux tâches de votre brigade
          </p>
        </div>
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
              <Wrench className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Disponibles</p>
                <p className="text-2xl font-bold text-status-completed">{stats.disponible}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-status-completed" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En utilisation</p>
                <p className="text-2xl font-bold text-status-progress">{stats.utilise}</p>
              </div>
              <Clock className="h-8 w-8 text-status-progress" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Maintenance</p>
                <p className="text-2xl font-bold text-status-paused">{stats.maintenance}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-status-paused" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher par nom, type ou localisation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">Tous les états</option>
              <option value="disponible">Disponibles</option>
              <option value="utilise">En utilisation</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Materials Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Matériels ({filteredMaterials.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>ID</TableHead>
                  <TableHead>Nom du Matériel</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>État</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Utilisation / Maintenance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
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
                    <TableCell>{material.quantite}</TableCell>
                    <TableCell>
                      <Badge variant={etatVariants[material.etat]}>
                        {etatLabels[material.etat]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {material.localisation}
                      </div>
                    </TableCell>
                    <TableCell>
                      {material.tacheActuelle && (
                        <div className="text-sm">
                          <div className="flex items-center gap-1 font-medium">
                            <ClipboardList className="h-3 w-3" />
                            {material.tacheActuelle}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            Responsable: {material.responsable}
                          </div>
                        </div>
                      )}
                      {material.dateMaintenance && (
                        <div className="text-sm">
                          <div className="font-medium text-status-paused">En maintenance</div>
                          <div className="text-muted-foreground text-xs">
                            Depuis le {new Date(material.dateMaintenance).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                      {material.etat === "disponible" && (
                        <span className="text-sm text-muted-foreground">Libre</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          Détails
                        </Button>
                        {material.tacheId && (
                          <Button variant="ghost" size="sm">
                            Voir tâche
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

      {/* Information Card */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-accent" />
            Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• Cette section affiche uniquement les matériels liés aux tâches de votre brigade.</p>
            <p>• Les matériels en cours d'utilisation sont associés à une tâche spécifique.</p>
            <p>• Contactez le chef de section pour toute demande de matériel supplémentaire.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

