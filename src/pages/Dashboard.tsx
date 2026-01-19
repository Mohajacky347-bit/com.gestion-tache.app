'use client'

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  PlayCircle, 
  PauseCircle, 
  CheckCircle2, 
  Users, 
  Wrench,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Target,
  Activity,
  FileText,
  TrendingDown,
  LucideIcon,
  BarChart3,
  PieChart as PieChartIcon
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

// Données pour les graphiques
const barData = [
  { mois: "Jan", terminées: 12, encours: 8, attente: 4 },
  { mois: "Fév", terminées: 15, encours: 6, attente: 5 },
  { mois: "Mar", terminées: 18, encours: 10, attente: 3 },
  { mois: "Avr", terminées: 22, encours: 7, attente: 6 },
  { mois: "Mai", terminées: 20, encours: 12, attente: 4 },
  { mois: "Juin", terminées: 25, encours: 8, attente: 2 },
];

const pieData = [
  { name: "Terminées", value: 45, color: "hsl(142 76% 36%)" },
  { name: "En cours", value: 28, color: "hsl(221 83% 53%)" },
  { name: "En attente", value: 18, color: "hsl(38 92% 50%)" },
  { name: "En pause", value: 9, color: "hsl(215 16% 47%)" },
];

// Données pour les activités récentes
const recentActivities = [
  { id: 1, action: "Tâche #127 terminée", time: "Il y a 2h", type: "success" },
  { id: 2, action: "Nouveau rapport soumis", time: "Il y a 4h", type: "info" },
  { id: 3, action: "Absence déclarée - M. Rakoto", time: "Il y a 5h", type: "warning" },
  { id: 4, action: "Phase 3 démarrée", time: "Il y a 6h", type: "info" },
];

// Données pour les tâches à venir
const upcomingTasks = [
  { id: 1, title: "Inspection voie principale", date: "15 Jan", priority: "high" },
  { id: 2, title: "Maintenance locomotive #12", date: "17 Jan", priority: "medium" },
  { id: 3, title: "Réparation pont km 45", date: "20 Jan", priority: "high" },
];

// Composant StatsCard avec couleurs corrigées
interface StatsCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: LucideIcon;
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
}

const variantStyles = {
  default: {
    bg: "bg-card",
    iconBg: "bg-secondary",
    iconColor: "text-muted-foreground",
    border: "border-border/50",
    textColor: "text-foreground",
  },
  primary: {
    bg: "bg-primary/5",
    iconBg: "gradient-primary",
    iconColor: "text-primary-foreground",
    border: "border-primary/20",
    textColor: "text-primary",
  },
  success: {
    bg: "bg-green-500/5",
    iconBg: "bg-green-500",
    iconColor: "text-white",
    border: "border-green-500/20",
    textColor: "text-green-600",
  },
  warning: {
    bg: "bg-amber-500/5",
    iconBg: "bg-amber-500",
    iconColor: "text-white",
    border: "border-amber-500/20",
    textColor: "text-amber-600",
  },
  danger: {
    bg: "bg-red-500/5",
    iconBg: "bg-red-500",
    iconColor: "text-white",
    border: "border-red-500/20",
    textColor: "text-red-600",
  },
  info: {
    bg: "bg-blue-500/5",
    iconBg: "bg-blue-500",
    iconColor: "text-white",
    border: "border-blue-500/20",
    textColor: "text-blue-600",
  },
};

function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  variant = "default",
  trend,
  delay = 0 
}: StatsCardProps) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className={`${styles.bg} ${styles.border} border hover:shadow-soft transition-all duration-300 hover:-translate-y-0.5`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {title}
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-foreground">
                  {value}
                </p>
                {trend && (
                  <span className={`flex items-center text-xs font-medium ${
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  }`}>
                    {trend.isPositive ? (
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-0.5" />
                    )}
                    {trend.value}%
                  </span>
                )}
              </div>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
            <div className={`w-12 h-12 rounded-xl ${styles.iconBg} flex items-center justify-center shadow-sm`}>
              <Icon className={`h-6 w-6 ${styles.iconColor}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Composant TasksChart
function TasksChart() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar Chart */}
      <Card className="border-border/50 shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-primary-foreground" />
            </div>
            Progression Mensuelle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis 
                  dataKey="mois" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                />
                <Bar dataKey="terminées" fill="hsl(142 76% 36%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="encours" fill="hsl(221 83% 53%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="attente" fill="hsl(38 92% 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Pie Chart */}
      <Card className="border-border/50 shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <PieChartIcon className="h-4 w-4 text-accent-foreground" />
            </div>
            Répartition des Tâches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                />
                <Legend 
                  verticalAlign="bottom"
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-sm text-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Composant Dashboard principal
export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Vue d'ensemble des activités du service infrastructure
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-border/50">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          title="Tâches en attente"
          value={12}
          description="Nécessitent une attribution"
          icon={Clock}
          variant="warning"
          trend={{ value: 5, isPositive: false }}
          delay={0}
        />
        <StatsCard
          title="Tâches en pause"
          value={5}
          description="Temporairement arrêtées"
          icon={PauseCircle}
          variant="default"
          trend={{ value: 12, isPositive: true }}
          delay={0.1}
        />
        <StatsCard
          title="Tâches en cours"
          value={8}
          description="Actuellement exécutées"
          icon={PlayCircle}
          variant="primary"
          trend={{ value: 8, isPositive: true }}
          delay={0.2}
        />
        <StatsCard
          title="Tâches terminées"
          value={25}
          description="Complétées ce mois"
          icon={CheckCircle2}
          variant="success"
          trend={{ value: 15, isPositive: true }}
          delay={0.3}
        />
      </div>

      {/* Charts */}
      <TasksChart />

      {/* Additional Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employés */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-border/50 shadow-soft h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                Employés
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-green-100/50 border border-green-200">
                <span className="text-sm text-foreground font-medium">Disponibles</span>
                <Badge className="bg-green-100 text-green-800 border-green-200">15</Badge>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-blue-100/50 border border-blue-200">
                <span className="text-sm text-foreground font-medium">Affectés</span>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">8</Badge>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-amber-100/50 border border-amber-200">
                <span className="text-sm text-foreground font-medium">Absents</span>
                <Badge className="bg-amber-100 text-amber-800 border-amber-200">3</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Matériels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-border/50 shadow-soft h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <div className="w-8 h-8 rounded-lg bg-purple-100/50 flex items-center justify-center">
                  <Wrench className="h-4 w-4 text-purple-600" />
                </div>
                Matériels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-green-100/50 border border-green-200">
                <span className="text-sm text-foreground font-medium">Disponibles</span>
                <Badge className="bg-green-100 text-green-800 border-green-200">22</Badge>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-blue-100/50 border border-blue-200">
                <span className="text-sm text-foreground font-medium">En utilisation</span>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">6</Badge>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-amber-100/50 border border-amber-200">
                <span className="text-sm text-foreground font-medium">En maintenance</span>
                <Badge className="bg-amber-100 text-amber-800 border-amber-200">2</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Alertes Récentes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-border/50 shadow-soft h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <div className="w-8 h-8 rounded-lg bg-red-100/50 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                Alertes Récentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-red-100/50 border border-red-200">
                <p className="font-medium text-sm text-foreground">Tâche #127</p>
                <p className="text-muted-foreground text-xs mt-1">Retard de 2 jours</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-100/50 border border-amber-200">
                <p className="font-medium text-sm text-foreground">Matériel #45</p>
                <p className="text-muted-foreground text-xs mt-1">Maintenance requise</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100/50 border border-blue-200">
                <p className="font-medium text-sm text-foreground">Employé M. Rakoto</p>
                <p className="text-muted-foreground text-xs mt-1">Absence non planifiée</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activités Récentes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border-border/50 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <Activity className="h-4 w-4 text-primary-foreground" />
                </div>
                Activités Récentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentActivities.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <span className="text-sm text-foreground">{activity.action}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Tâches à Venir */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="border-border/50 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                  <Target className="h-4 w-4 text-white" />
                </div>
                Tâches à Venir
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcomingTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      task.priority === 'high' ? 'bg-red-500' : 'bg-amber-500'
                    }`} />
                    <span className="text-sm text-foreground">{task.title}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {task.date}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}