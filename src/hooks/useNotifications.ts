'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  targetRole: "chef_section" | "chef_brigade";
  targetUserId?: string | null;
  payload: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

interface UseNotificationsOptions {
  pollInterval?: number;
  autoStart?: boolean;
}

export function useNotifications(
  role: "chef_section" | "chef_brigade",
  options?: UseNotificationsOptions
) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pollInterval = options?.pollInterval ?? 15000;
  const autoStart = options?.autoStart ?? true;

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/notifications?role=${role}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des notifications");
      }

      const data = (await res.json()) as NotificationItem[];
      setNotifications(data);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Erreur inattendue des notifications"
      );
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      fetchNotifications();
    }, pollInterval);
  }, [fetchNotifications, pollInterval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!autoStart) return;

    fetchNotifications();
    startPolling();

    return () => {
      stopPolling();
    };
  }, [autoStart, fetchNotifications, startPolling, stopPolling]);

  const markAsRead = useCallback(
    async (id: string) => {
      try {
        const res = await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });

        if (!res.ok) {
          throw new Error("Impossible de mettre la notification en lue");
        }

        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === id ? { ...notif, isRead: true } : notif
          )
        );
      } catch (err) {
        console.error(err);
      }
    },
    []
  );

  const unreadCount = useMemo(
    () => notifications.filter((notif) => !notif.isRead).length,
    [notifications]
  );

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refresh: fetchNotifications,
    markAsRead,
    startPolling,
    stopPolling,
  };
}


