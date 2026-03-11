import * as networkService from '../services/networkService.js';
import { apiResponse } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/** POST /api/network/connect */
export const connect = asyncHandler(async (req, res) => {
  const { receiver_id } = req.body;
  if (!receiver_id) {
    return apiResponse(res, { success: false, message: 'receiver_id is required', statusCode: 400 });
  }
  const connection = await networkService.sendConnectionRequest(req.user.id, receiver_id);
  apiResponse(res, { data: connection, message: 'Connection request sent', statusCode: 201 });
});

/** GET /api/network */
export const list = asyncHandler(async (req, res) => {
  const connections = await networkService.getConnections(req.user.id);
  apiResponse(res, { data: connections });
});

/** PUT /api/network/accept */
export const accept = asyncHandler(async (req, res) => {
  const { connection_id } = req.body;
  if (!connection_id) {
    return apiResponse(res, { success: false, message: 'connection_id is required', statusCode: 400 });
  }
  const connection = await networkService.acceptConnection(connection_id, req.user.id);
  apiResponse(res, { data: connection, message: 'Connection accepted' });
});
