import * as profileService from '../services/profileService.js';
import { apiResponse } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * GET /api/profile
 */
export const getProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.getProfile(req.user.id, req.user.email);
  apiResponse(res, { data: profile });
});

/**
 * PUT /api/profile
 * Body can include: name, bio, location, skills (array), avatar_url
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const updated = await profileService.updateProfile(req.user.id, req.body);
  apiResponse(res, { data: updated, message: 'Profile updated' });
});
