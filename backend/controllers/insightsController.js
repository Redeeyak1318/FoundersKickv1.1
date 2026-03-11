import * as insightsService from '../services/insightsService.js';
import { apiResponse } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/** GET /api/insights */
export const list = asyncHandler(async (req, res) => {
  const insights = await insightsService.getInsights(req.user.id);
  apiResponse(res, { data: insights });
});
