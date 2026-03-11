import * as startupsService from '../services/startupsService.js';
import { apiResponse } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/** POST /api/startups */
export const create = asyncHandler(async (req, res) => {
  const startup = await startupsService.createStartup(req.user.id, req.body);
  apiResponse(res, { data: startup, message: 'Startup created', statusCode: 201 });
});

/** GET /api/startups */
export const list = asyncHandler(async (req, res) => {
  const { search, stage, limit, offset } = req.query;
  const result = await startupsService.getAllStartups({
    search,
    stage,
    limit: parseInt(limit) || 50,
    offset: parseInt(offset) || 0,
  });
  apiResponse(res, { data: result });
});

/** GET /api/startups/:id */
export const getById = asyncHandler(async (req, res) => {
  const startup = await startupsService.getStartupById(req.params.id);
  apiResponse(res, { data: startup });
});

/** PUT /api/startups/:id */
export const update = asyncHandler(async (req, res) => {
  const startup = await startupsService.updateStartup(req.params.id, req.user.id, req.body);
  apiResponse(res, { data: startup, message: 'Startup updated' });
});

/** DELETE /api/startups/:id */
export const remove = asyncHandler(async (req, res) => {
  await startupsService.deleteStartup(req.params.id, req.user.id);
  apiResponse(res, { message: 'Startup deleted' });
});
