import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
    iconContainer: "bg-secondary", // Gris moyen
    iconColor: "text-muted-foreground",
    border: "border-border/50",
    textColor: "text-foreground",
    titleColor: "text-muted-foreground",
  },
  primary: {
    bg: "bg-primary/10",
    iconContainer: "gradient-primary", // Dégradé bleu PLEIN
    iconColor: "text-primary-foreground", // Blanc
    border: "border-primary/20",
    textColor: "text-primary",
    titleColor: "text-primary",
  },
  success: {
    bg: "bg-success/10", // Fond carte: vert très clair
    iconContainer: "bg-success", // Vert PLEIN
    iconColor: "text-success-foreground", // Blanc
    border: "border-success/20",
    textColor: "text-success",
    titleColor: "text-success",
  },
  warning: {
    bg: "bg-warning/10", // Fond carte: orange très clair
    iconContainer: "bg-warning", // Orange PLEIN
    iconColor: "text-warning-foreground", // Blanc
    border: "border-warning/20",
    textColor: "text-warning",
    titleColor: "text-warning",
  },
  danger: {
    bg: "bg-destructive/10", // Fond carte: rouge très clair
    iconContainer: "bg-destructive", // Rouge PLEIN
    iconColor: "text-destructive-foreground", // Blanc
    border: "border-destructive/20",
    textColor: "text-destructive",
    titleColor: "text-destructive",
  },
  info: {
    bg: "bg-info/10",
    iconContainer: "bg-info",
    iconColor: "text-info-foreground",
    border: "border-info/20",
    textColor: "text-info",
    titleColor: "text-info",
  },
};

export function StatsCard({ 
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
      <Card className={`${styles.bg} ${styles.border} border hover:shadow-soft transition-all duration-300 hover:-translate-y-0.5 shadow-soft`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className={`text-xs font-medium uppercase tracking-wide ${styles.titleColor}`}>
                {title}
              </p>
              <div className="flex items-baseline gap-2">
                <p className={`text-3xl font-bold ${styles.textColor}`}>
                  {value}
                </p>
                {trend && (
                  <span className={`flex items-center text-xs font-medium ${
                    trend.isPositive ? "text-success" : "text-destructive"
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
            {/* CARRÉ ARRONDI AVEC FOND PLEIN */}
            <div className={`w-12 h-12 rounded-xl ${styles.iconContainer} flex items-center justify-center shadow-sm`}>
              <Icon className={`h-6 w-6 ${styles.iconColor}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}