'use client'

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft,
  Calendar,
  MapPin,
  Package,
  Users,
  FileText,
  ClipboardList,
  Loader2,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileCheck,
  PlayCircle
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface Phase {
  id?: string;
  nom: string;
  description: string;
  dureePrevue: number;
  dateDebut: string;
  dateFin: string;
  statut: "En attente" | "En cours" | "Terminé";
}

interface Rapport {
  id: string;
  description: string;
  dateRapport: string;
  avancement: number;
  validation: string;
  phaseNom?: string;
}

interface TaskDetail {
  id: string;
  title: string;
  description?: string;
  id_brigade: string;
  id_equipe: string;
  nom_brigade?: string;
  nom_equipe?: string;
  lieu?: string;
  materiels: { nom: string; quantite: number }[];
  dateDebut: string;
  dateFin: string;
  dateFinReel?: string;
  status: "pending" | "paused" | "progress" | "completed";
  phases: Phase[];
  equipeMembres?: Array<{
    id: string;
    nom: string;
    prenom: string;
    fonction: string;
    role?: string | null;
  }>;
  rapports?: Rapport[];
}

const statusLabels = {
  pending: "En attente",
  progress: "En cours", 
  completed: "Terminée",
  paused: "En pause"
};

const statusVariants = {
  pending: "pending",
  progress: "progress",
  completed: "completed",
  paused: "outline"
} as const;

const phaseStatusColors = {
  "En attente": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "En cours": "bg-blue-100 text-blue-800 border-blue-200",
  "Terminé": "bg-green-100 text-green-800 border-green-200"
};

const validationLabels: Record<string, string> = {
  "en_attente": "En attente",
  "a_reviser": "À réviser",
  "approuve": "Approuvé"
};

const validationColors: Record<string, string> = {
  "en_attente": "bg-yellow-100 text-yellow-800",
  "a_reviser": "bg-orange-100 text-orange-800",
  "approuve": "bg-green-100 text-green-800"
};

export default function BrigadeTaskDetail() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchTaskDetail(params.id as string);
    }
  }, [params.id]);

  const fetchTaskDetail = async (taskId: string) => {
    try {
      setIsLoading(true);
      // Utiliser le cache navigateur par défaut (pas de no-store) pour améliorer les performances
      const response = await fetch(`/api/taches/${taskId}`);
      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "Tâche introuvable",
            description: "La tâche demandée n'existe pas.",
            variant: "destructive",
          });
          router.push("/brigade/taches");
          return;
        }
        throw new Error("Erreur lors de la récupération de la tâche");
      }
      const data = await response.json();
      setTask(data);
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails de la tâche",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Chargement des détails de la tâche...</span>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <AlertTriangle className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Tâche introuvable</p>
        <Button variant="outline" asChild>
          <Link href="/brigade/taches">Retour à la liste</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/brigade/taches">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{task.title}</h1>
              <Badge variant={statusVariants[task.status]}>
                {statusLabels[task.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground">ID: {task.id}</p>
          </div>
        </div>
        {task.status === "progress" && (
          <Button asChild>
            <Link href="/brigade/rapports" prefetch={true}>
              <FileText className="h-4 w-4 mr-2" />
              Rapporter l'avancement
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Description de la tâche
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">{task.title}</h3>
                  {task.description && task.description !== task.title ? (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Détails :</p>
                      <p className="text-foreground whitespace-pre-wrap text-sm leading-relaxed">{task.description}</p>
                    </div>
                  ) : (
                    <p className="text-foreground whitespace-pre-wrap text-sm leading-relaxed mt-2">{task.title}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations principales */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Informations principales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Localisation */}
              {task.lieu && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Localisation</p>
                    <p className="text-foreground">{task.lieu}</p>
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date de début prévue</p>
                    <p className="text-foreground">
                      {new Date(task.dateDebut).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date de fin prévue</p>
                    <p className="text-foreground">
                      {new Date(task.dateFin).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </p>
                  </div>
                  {task.dateFinReel && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Date de fin réelle</p>
                      <p className="text-foreground">
                        {new Date(task.dateFinReel).toLocaleDateString("fr-FR", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Brigade et Équipe */}
              {(task.nom_brigade || task.nom_equipe) && (
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-2">
                    {task.nom_brigade && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Brigade</p>
                        <p className="text-foreground">{task.nom_brigade}</p>
                      </div>
                    )}
                    {task.nom_equipe && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Équipe assignée</p>
                        <p className="text-foreground">{task.nom_equipe}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Phases */}
          {task.phases && task.phases.length > 0 && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5" />
                  Phases définies ({task.phases.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {task.phases.map((phase, index) => (
                    <div key={phase.id || index} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h3 className="font-semibold text-foreground">{phase.nom}</h3>
                        <Badge className={phaseStatusColors[phase.statut]}>
                          {phase.statut}
                        </Badge>
                      </div>
                      {phase.description && (
                        <p className="text-sm text-muted-foreground">{phase.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Du {new Date(phase.dateDebut).toLocaleDateString("fr-FR")} 
                            {" "}au {new Date(phase.dateFin).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                        <div>
                          <span>Durée prévue: {phase.dureePrevue} jour(s)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rapports précédents */}
          {task.rapports && task.rapports.length > 0 && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Rapports précédents ({task.rapports.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {task.rapports.map((rapport) => (
                    <div key={rapport.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <p className="font-medium text-foreground">Rapport {rapport.id}</p>
                          {rapport.phaseNom && (
                            <p className="text-sm text-muted-foreground">Phase: {rapport.phaseNom}</p>
                          )}
                        </div>
                        <Badge className={validationColors[rapport.validation] || "bg-gray-100 text-gray-800"}>
                          {validationLabels[rapport.validation] || rapport.validation}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground">{rapport.description}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(rapport.dateRapport).toLocaleDateString("fr-FR")}</span>
                        </div>
                        <div>
                          <span>Avancement: {rapport.avancement}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Statut actuel */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Statut actuel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {task.status === "completed" && <CheckCircle className="h-6 w-6 text-status-completed" />}
                {task.status === "progress" && <PlayCircle className="h-6 w-6 text-status-progress" />}
                {task.status === "pending" && <Clock className="h-6 w-6 text-status-pending" />}
                {task.status === "paused" && <AlertTriangle className="h-6 w-6 text-yellow-600" />}
                <Badge variant={statusVariants[task.status]} className="text-base px-3 py-1">
                  {statusLabels[task.status]}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Matériel associé */}
          {task.materiels && task.materiels.length > 0 && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Matériel associé ({task.materiels.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {task.materiels.map((materiel, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                      <span className="text-sm font-medium text-foreground">{materiel.nom}</span>
                      <Badge variant="secondary">{materiel.quantite}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Équipe assignée */}
          {task.equipeMembres && task.equipeMembres.length > 0 && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Équipe assignée ({task.equipeMembres.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {task.equipeMembres.map((membre) => (
                    <div key={membre.id} className="p-3 rounded-md bg-muted/50">
                      <p className="font-medium text-foreground">
                        {membre.prenom} {membre.nom}
                      </p>
                      <p className="text-sm text-muted-foreground">{membre.fonction}</p>
                      {membre.role && (
                        <Badge variant="outline" className="mt-1">
                          {membre.role}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {task.status === "progress" && (
                <Button className="w-full" asChild>
                  <Link href="/brigade/rapports" prefetch={true}>
                    <FileText className="h-4 w-4 mr-2" />
                    Rapporter l'avancement
                  </Link>
                </Button>
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link href="/brigade/taches" prefetch={true}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour à la liste
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

