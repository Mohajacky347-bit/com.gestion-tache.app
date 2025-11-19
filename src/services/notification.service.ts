import {
  notificationModel,
  CreateNotificationInput,
  NotificationRecord,
  NotificationTargetRole,
} from "@/models/notification.model";

export interface RoleNotificationPayload extends Record<string, unknown> {
  taskId?: string;
  redirectTo?: string;
}

export const notificationService = {
  async createForRole(
    data: CreateNotificationInput
  ): Promise<NotificationRecord> {
    return notificationModel.create(data);
  },

  async listForRole(
    role: NotificationTargetRole
  ): Promise<NotificationRecord[]> {
    return notificationModel.listByRole(role);
  },

  async markAsRead(id: string): Promise<boolean> {
    return notificationModel.markAsRead(id);
  },
};



