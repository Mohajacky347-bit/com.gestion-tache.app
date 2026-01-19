import { ReactNode } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
}

export function PageHeader({ title, description, icon: Icon, actions }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <Icon className="h-5 w-5 text-primary-foreground" />
          </div>
        )}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1 text-sm lg:text-base">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </motion.div>
  );
}
