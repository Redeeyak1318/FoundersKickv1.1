import * as messagesService from '../services/messagesService.js';
import { apiResponse } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/** POST /api/messages — Send a message */
export const send = asyncHandler(async (req, res) => {
  const { receiver_id, recipient_id, text, content, conversation_id } = req.body;

  // Accept multiple field names for compatibility
  const recipientId = receiver_id || recipient_id || conversation_id;
  const messageText = text || content;

  if (!recipientId || !messageText) {
    return apiResponse(res, {
      success: false,
      message: 'recipient and text are required',
      statusCode: 400,
    });
  }

  const message = await messagesService.sendMessage(req.user.id, recipientId, messageText);
  apiResponse(res, { data: { message }, message: 'Message sent', statusCode: 201 });
});

/** GET /api/messages — List conversations */
export const listConversations = asyncHandler(async (req, res) => {
  const conversations = await messagesService.getConversations(req.user.id);
  apiResponse(res, { data: { conversations } });
});

/** GET /api/messages/:userId — Get thread with a user */
export const getThread = asyncHandler(async (req, res) => {
  const messages = await messagesService.getThread(req.user.id, req.params.userId);
  apiResponse(res, { data: { messages } });
});
