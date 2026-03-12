import * as notificationsService from '../services/notificationsService.js';
import { apiResponse } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/** GET /api/notifications */
export const list = asyncHandler(async (req, res) => {
  const notifications = await notificationsService.getNotifications(req.user.id);
  apiResponse(res, { data: { notifications } });
});

/** POST /api/notifications/:id/read — Mark single notification */
export const markOneRead = asyncHandler(async (req, res) => {
  const updated = await notificationsService.markOneRead(req.user.id, req.params.id);
  apiResponse(res, { data: updated, message: 'Notification marked as read' });
});

/** POST /api/notifications/read-all — Mark all as read */
export const markAllRead = asyncHandler(async (req, res) => {
  const updated = await notificationsService.markAllRead(req.user.id);
  apiResponse(res, { data: updated, message: 'All notifications marked as read' });
});

/** PUT /api/notifications/read — Legacy (also marks all) */
export const markRead = asyncHandler(async (req, res) => {
  const updated = await notificationsService.markAllRead(req.user.id);
  apiResponse(res, { data: updated, message: 'All notifications marked as read' });
});
