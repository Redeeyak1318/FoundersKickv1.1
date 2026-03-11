import * as resourcesService from '../services/resourcesService.js';
import { apiResponse } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/** GET /api/resources */
export const list = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const resources = await resourcesService.getResources(category);
  apiResponse(res, { data: resources });
});
