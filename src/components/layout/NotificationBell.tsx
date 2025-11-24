'use client'

import { useEffect, useMemo, useRef, useCallback } from "react";
import { Bell, CheckCircle2, Loader2, MailOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useNotifications, NotificationItem } from "@/hooks/useNotifications";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface NotificationBellProps {
  role: "chef_section" | "chef_brigade";
}

export function NotificationBell({ role }: NotificationBellProps) {
  const { notifications, unreadCount, isLoading, markAsRead } =
    useNotifications(role);
  const { toast } = useToast();
  const lastNotificationId = useRef<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!notifications.length) return;

    const latest = notifications[0];
    if (lastNotificationId.current && latest.id !== lastNotificationId.current) {
      toast({
        title: latest.title,
        description: latest.message,
      });
    }

    lastNotificationId.current = latest.id;
  }, [notifications, toast]);

  const hasNotifications = notifications.length > 0;

  const items = useMemo(() => notifications.slice(0, 10), [notifications]);

  const buildRedirectUrl = (rawPath: string, payload?: Record<string, unknown> | null) => {
    const [path, existingQuery] = rawPath.split("?");
    const params = new URLSearchParams(existingQuery ?? "");

    const filter = typeof payload?.filter === "string" ? payload.filter : null;
    const rapportId = typeof payload?.rapportId === "string" ? payload.rapportId : null;
    const taskId = typeof payload?.taskId === "string" ? payload.taskId : null;
    const demandeId = typeof payload?.demandeId === "string" ? payload.demandeId : null;

    if (filter) params.set("filtre", filter);
    if (rapportId) params.set("rapportId", rapportId);
    if (taskId) params.set("taskId", taskId);
    if (demandeId) params.set("demandeId", demandeId);

    const queryString = params.toString();
    return queryString ? `${path}?${queryString}` : path;
  };

  const handleNotificationClick = useCallback(
    async (notif: NotificationItem) => {
      await markAsRead(notif.id);

      const redirectTo = typeof notif.payload?.redirectTo === "string" ? notif.payload.redirectTo : null;
      
      // Si pas de redirectTo explicite, déterminer la redirection selon le type de notification
      if (!redirectTo) {
        const taskId = typeof notif.payload?.taskId === "string" ? notif.payload.taskId : null;
        const rapportId = typeof notif.payload?.rapportId === "string" ? notif.payload.rapportId : null;
        const demandeId = typeof notif.payload?.demandeId === "string" ? notif.payload.demandeId : null;

        if (taskId && role === "chef_brigade") {
          router.push(`/brigade/taches?taskId=${taskId}`);
          return;
        }
        
        if (rapportId && role === "chef_section") {
          router.push(`/rapports?rapportId=${rapportId}`);
          return;
        }

        if (demandeId && role === "chef_section") {
          router.push(`/materiels?demandeId=${demandeId}`);
          return;
        }
      } else {
        const target = buildRedirectUrl(redirectTo, notif.payload ?? undefined);
        router.push(target);
      }
    },
    [markAsRead, router, role]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative transition-colors",
            unreadCount > 0 && "text-destructive hover:text-destructive"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 rounded-full px-1.5 py-0 text-[10px] leading-5"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {unreadCount} non lues
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hasNotifications ? (
          <ScrollArea className="h-64">
            {items.map((notif) => (
              <DropdownMenuItem
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={cn(
                  "flex flex-col items-start gap-1 cursor-pointer rounded-none border-b border-border/60 px-4 py-3",
                  !notif.isRead && "bg-accent/10"
                )}
              >
                <div className="flex items-center gap-2">
                  {notif.isRead ? (
                    <MailOpen className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  <span className="font-semibold">{notif.title}</span>
                  {!notif.isRead && (
                    <Badge variant="outline" className="text-[10px]">
                      Nouveau
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{notif.message}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{new Date(notif.createdAt).toLocaleString()}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        ) : (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Aucune notification pour le moment
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


