import * as messagesService from '../services/messagesService.js';
import { apiResponse } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/** POST /api/messages */
export const send = asyncHandler(async (req, res) => {
  const { receiver_id, content } = req.body;
  if (!receiver_id || !content) {
    return apiResponse(res, { success: false, message: 'receiver_id and content are required', statusCode: 400 });
  }
  const message = await messagesService.sendMessage(req.user.id, receiver_id, content);
  apiResponse(res, { data: message, message: 'Message sent', statusCode: 201 });
});

/** GET /api/messages/:userId */
export const getThread = asyncHandler(async (req, res) => {
  const messages = await messagesService.getThread(req.user.id, req.params.userId);
  apiResponse(res, { data: messages });
});
