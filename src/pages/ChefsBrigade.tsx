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
import { Badge } from "@/components/ui/badge";
import { CalendarClock, Search, Crown, Shield } from "lucide-react";

interface ChefBrigade {
  id_employe: string;
  nom: string;
  prenom: string;
  fonction: string;
  contact?: string;
  date_nomination?: string;
  id_brigade: number;
  nom_brigade: string;
}

export default function ChefsBrigade() {
  const [chefs, setChefs] = useState<ChefBrigade[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/chefs-brigade");
      if (!res.ok) throw new Error("Erreur lors du chargement des chefs de brigade");
      const data: ChefBrigade[] = await res.json();
      setChefs(data);
    } catch (error) {
      console.error("Error fetching chefs brigade:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = chefs.filter((chef) => {
    const term = searchTerm.toLowerCase();
    return (
      chef.nom.toLowerCase().includes(term) ||
      chef.prenom.toLowerCase().includes(term) ||
      chef.nom_brigade.toLowerCase().includes(term)
    );
  });

  const stats = {
    total: chefs.length,
    uniqueBrigades: new Set(chefs.map((c) => c.id_brigade)).size,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Chef de Brigade
          </h1>
          <p className="text-muted-foreground mt-2">
            Vue d’ensemble des responsables de brigade et de leurs nominations.
          </p>
        </div>
        <Button
          className="shadow-soft bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          type="button"
          disabled
          title="La nomination d'un chef de brigade sera disponible prochainement"
        >
          <Crown className="h-4 w-4 mr-2" />
          Nommer un chef
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="shadow-soft border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total chefs de brigade
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Crown className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Brigades couvertes
                </p>
                <p className="text-2xl font-bold">{stats.uniqueBrigades}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
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
              placeholder="Rechercher un chef par nom ou brigade..."
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
          <CardTitle>Liste des Chefs ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-muted-foreground py-8">
              Chargement des chefs de brigade...
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>ID Employé</TableHead>
                    <TableHead>Nom complet</TableHead>
                    <TableHead>Fonction</TableHead>
                    <TableHead>Brigade</TableHead>
                    <TableHead>Date de nomination</TableHead>
                    <TableHead>Contact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground"
                      >
                        Aucun chef de brigade trouvé.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((chef) => (
                      <TableRow
                        key={chef.id_employe}
                        className="hover:bg-muted/30 transition-smooth"
                      >
                        <TableCell className="font-medium">
                          {chef.id_employe}
                        </TableCell>
                        <TableCell>
                          {chef.prenom} {chef.nom}
                        </TableCell>
                        <TableCell>{chef.fonction}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{chef.nom_brigade}</Badge>
                        </TableCell>
                        <TableCell>
                          {chef.date_nomination ? (
                            <div className="flex items-center gap-2 text-sm">
                              <CalendarClock className="h-4 w-4 text-muted-foreground" />
                              {new Date(chef.date_nomination).toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              Non spécifiée
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{chef.contact || "Non défini"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


