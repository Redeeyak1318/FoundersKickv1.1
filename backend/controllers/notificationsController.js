import * as notificationsService from '../services/notificationsService.js';
import { apiResponse } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/** GET /api/notifications */
export const list = asyncHandler(async (req, res) => {
  const notifications = await notificationsService.getNotifications(req.user.id);
  apiResponse(res, { data: notifications });
});

/** PUT /api/notifications/read */
export const markRead = asyncHandler(async (req, res) => {
  const updated = await notificationsService.markAllRead(req.user.id);
  apiResponse(res, { data: updated, message: 'All notifications marked as read' });
});
