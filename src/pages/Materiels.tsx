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
  CheckCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface Material {
  id: string;
  nom: string;
  type: string;
  quantite: number;
  etat: "disponible" | "utilise" | "maintenance";
  tacheActuelle?: string;
  dateMaintenance?: string;
  responsable?: string;
}
 

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

export default function Materiels() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMaterials = materials.filter(mat =>
    mat.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mat.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: materials.length,
    disponible: materials.filter(m => m.etat === "disponible").length,
    utilise: materials.filter(m => m.etat === "utilise").length,
    maintenance: materials.filter(m => m.etat === "maintenance").length
  };

  useEffect(() => {
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
    fetchData();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Matériels</h1>
          <p className="text-muted-foreground mt-2">
            Gérez le matériel et les équipements du service
          </p>
        </div>
        <Button className="shadow-soft">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter du matériel
        </Button>
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
              <Wrench className="h-8 w-8 text-status-progress" />
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
              <Wrench className="h-8 w-8 text-status-paused" />
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
                  <TableHead>Utilisation / Maintenance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : filteredMaterials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
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
                      {material.tacheActuelle && (
                        <div className="text-sm">
                          <div className="font-medium">{material.tacheActuelle}</div>
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
                        <Button variant="ghost" size="sm">
                          Modifier
                        </Button>
                        {material.etat === "disponible" && (
                          <Button variant="outline" size="sm">
                            Affecter
                          </Button>
                        )}
                        {material.etat === "utilise" && (
                          <Button variant="outline" size="sm">
                            Libérer
                          </Button>
                        )}
                        {material.etat !== "maintenance" && (
                          <Button variant="secondary" size="sm">
                            Maintenance
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
    </div>
  );
}