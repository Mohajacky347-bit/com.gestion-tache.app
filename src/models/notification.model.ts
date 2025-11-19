import { dbPool } from "@/lib/db";

export type NotificationTargetRole = "chef_section" | "chef_brigade";

export interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  targetRole: NotificationTargetRole;
  targetUserId?: string | null;
  payload: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

export interface CreateNotificationInput {
  title: string;
  message: string;
  targetRole: NotificationTargetRole;
  targetUserId?: string | null;
  payload?: Record<string, unknown> | null;
}

interface NotificationRow {
  id: string;
  titre: string;
  message: string;
  cible_role: NotificationTargetRole;
  cible_utilisateur: string | null;
  payload: string | null;
  est_lu: number;
  created_at: Date;
}

const mapRowToRecord = (row: NotificationRow): NotificationRecord => {
  let parsedPayload: Record<string, unknown> | null = null;

  if (row.payload) {
    try {
      parsedPayload = JSON.parse(row.payload);
    } catch (error) {
      console.warn("Impossible de parser le payload de la notification:", error);
    }
  }

  return {
    id: row.id,
    title: row.titre,
    message: row.message,
    targetRole: row.cible_role,
    targetUserId: row.cible_utilisateur,
    payload: parsedPayload,
    isRead: !!row.est_lu,
    createdAt: row.created_at.toISOString(),
  };
};

export const notificationModel = {
  async create(data: CreateNotificationInput): Promise<NotificationRecord> {
    const [lastNotification] = await dbPool.query(
      "SELECT id FROM notification ORDER BY id DESC LIMIT 1"
    );
    const lastRows = lastNotification as { id: string }[];
    const lastId = lastRows[0]?.id || "N000";
    const lastNumber = parseInt(lastId.replace("N", ""), 10) || 0;
    const newId = `N${String(lastNumber + 1).padStart(3, "0")}`;

    await dbPool.query(
      `INSERT INTO notification (id, titre, message, cible_role, cible_utilisateur, payload) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        newId,
        data.title,
        data.message,
        data.targetRole,
        data.targetUserId ?? null,
        data.payload ? JSON.stringify(data.payload) : null,
      ]
    );

    return {
      id: newId,
      title: data.title,
      message: data.message,
      targetRole: data.targetRole,
      targetUserId: data.targetUserId ?? null,
      payload: data.payload ?? null,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
  },

  async listByRole(
    targetRole: NotificationTargetRole,
    limit = 50
  ): Promise<NotificationRecord[]> {
    const [rows] = await dbPool.query(
      `SELECT id, titre, message, cible_role, cible_utilisateur, payload, est_lu, created_at
       FROM notification
       WHERE cible_role = ?
       ORDER BY created_at DESC
       LIMIT ?`,
      [targetRole, limit]
    );

    return (rows as NotificationRow[]).map(mapRowToRecord);
  },

  async markAsRead(id: string): Promise<boolean> {
    const [result] = await dbPool.query(
      `UPDATE notification SET est_lu = 1 WHERE id = ?`,
      [id]
    );

    return (result as any).affectedRows > 0;
  },
};



