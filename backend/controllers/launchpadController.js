import * as launchpadService from '../services/launchpadService.js';
import { apiResponse } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/** POST /api/launchpad */
export const submit = asyncHandler(async (req, res) => {
  const submission = await launchpadService.createSubmission(req.user.id, req.body);
  apiResponse(res, { data: submission, message: 'Launchpad submission created', statusCode: 201 });
});

/** GET /api/launchpad (bonus — list own submissions) */
export const list = asyncHandler(async (req, res) => {
  const submissions = await launchpadService.getSubmissions(req.user.id);
  apiResponse(res, { data: submissions });
});
