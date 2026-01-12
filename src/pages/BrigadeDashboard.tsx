'use client'

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Wrench,
  Plus,
  Users,
  Loader2,
} from "lucide-react";

type BrigadeTaskStatus = "pending" | "progress" | "completed" | "paused";

interface BrigadeTask {
  id: string;
  title: string;
  status: BrigadeTaskStatus;
  dateDebut: string;
  dateFin: string;
  materiels: { nom: string; quantite: number }[];
  nom_equipe?: string;
  nom_brigade?: string;
}

interface BrigadeTeam {
  id_equipe: number;
  nom_equipe: string;
  specialite: string;
  members: {
    id: string;
    nom: string;
    prenom: string;
    fonction: string;
    role?: string | null;
  }[];
}

const statusLabels: Record<BrigadeTaskStatus, string> = {
  pending: "En attente",
  progress: "En cours",
  completed: "Terminée",
  paused: "En pause",
};

const statusVariants = {
  pending: "pending",
  progress: "progress",
  completed: "completed",
  paused: "outline",
} as const;

export default function BrigadeDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<BrigadeTask[]>([]);
  const [teams, setTeams] = useState<BrigadeTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.brigadeId) {
      setIsLoading(false);
      return;
    }

    let isCancelled = false;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [tasksRes, teamsRes] = await Promise.all([
          fetch(`/api/taches?brigadeId=${user.brigadeId}`).then((res) =>
            res.ok ? res.json() : []
          ),
          fetch(`/api/brigades/${user.brigadeId}/equipes`).then((res) =>
            res.ok ? res.json() : []
          ),
        ]);

        if (!isCancelled) {
          setTasks(tasksRes);
          setTeams(teamsRes);
        }
      } catch (error) {
        console.error("Erreur chargement dashboard brigade:", error);
        if (!isCancelled) {
          setTasks([]);
          setTeams([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [user?.brigadeId]);

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "pending").length,
      progress: tasks.filter((t) => t.status === "progress").length,
      completed: tasks.filter((t) => t.status === "completed").length,
    };
  }, [tasks]);

  const recentTasks = tasks.slice(0, 3);

  if (!user?.brigadeId) {
    return (
      <div className="flex items-center justify-center py-10">
        <p className="text-muted-foreground">
          Aucune brigade n&apos;est associée à votre profil.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Brigade {user.brigadeName ?? `#${user.brigadeId}`}
          </h1>
          <p className="text-muted-foreground mt-2">
            Vue d&apos;ensemble des tâches, équipes et matériels de la brigade.
          </p>
        </div>
        <Button asChild className="shadow-soft">
          <Link href="/brigade/rapports">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Rapport
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Chargement des données...
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-soft">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Tâches
                    </p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <ClipboardList className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-soft">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      En attente
                    </p>
                    <p className="text-2xl font-bold text-status-pending">
                      {stats.pending}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-status-pending" />
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-soft">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      En cours
                    </p>
                    <p className="text-2xl font-bold text-status-progress">
                      {stats.progress}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-status-progress" />
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-soft">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Terminées
                    </p>
                    <p className="text-2xl font-bold text-status-completed">
                      {stats.completed}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-status-completed" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Tâches récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aucune tâche n&apos;a encore été assignée.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recentTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex flex-col gap-3 p-4 border rounded-lg hover:bg-muted/30 transition-smooth"
                      >
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-medium text-foreground">
                            {task.title}
                          </h3>
                          <Badge variant={statusVariants[task.status]}>
                            {statusLabels[task.status]}
                          </Badge>
                          {task.nom_equipe && (
                            <Badge variant="outline">{task.nom_equipe}</Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span>
                            Début :{" "}
                            {task.dateDebut
                              ? new Date(task.dateDebut).toLocaleDateString()
                              : "-"}
                          </span>
                          <span>
                            Fin :{" "}
                            {task.dateFin
                              ? new Date(task.dateFin).toLocaleDateString()
                              : "-"}
                          </span>
                          <span>Matériels : {task.materiels.length}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/brigade/taches`}>
                              Détails
                            </Link>
                          </Button>
                          {task.status === "progress" && (
                            <Button variant="default" size="sm" asChild>
                              <Link href="/brigade/rapports">
                                <FileText className="h-4 w-4 mr-1" />
                                Rapport
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 text-center">
                  <Button variant="ghost" asChild>
                    <Link href="/brigade/taches">Voir toutes les tâches</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Équipes & membres
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {teams.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aucune équipe n&apos;est rattachée à cette brigade.
                  </p>
                ) : (
                  teams.map((team) => (
                    <div
                      key={team.id_equipe}
                      className="border rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{team.nom_equipe}</p>
                          <p className="text-xs text-muted-foreground">
                            {team.specialite}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {team.members.length} membre(s)
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {team.members.length === 0 ? (
                          <span className="text-xs text-muted-foreground">
                            Aucun membre assigné
                          </span>
                        ) : (
                          team.members.map((member) => (
                            <span
                              key={member.id}
                              className="text-xs px-2 py-1 rounded-md bg-muted/80"
                            >
                              {member.prenom} {member.nom}
                              {member.role && ` · ${member.role}`}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div className="text-center">
                  <Button variant="ghost" asChild>
                    <Link href="/brigade/materiels">
                      Voir les matériels associés
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-soft hover:shadow-md transition-shadow cursor-pointer" asChild>
              <Link href="/brigade/taches">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <ClipboardList className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-medium">Mes Tâches</h3>
                      <p className="text-sm text-muted-foreground">
                        Consulter les tâches assignées
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="shadow-soft hover:shadow-md transition-shadow cursor-pointer" asChild>
              <Link href="/brigade/rapports">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-medium">Rapports</h3>
                      <p className="text-sm text-muted-foreground">
                        Soumettre un rapport
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="shadow-soft hover:shadow-md transition-shadow cursor-pointer" asChild>
              <Link href="/brigade/materiels">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Wrench className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-medium">Matériels</h3>
                      <p className="text-sm text-muted-foreground">
                        Suivre les matériels de vos tâches
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

