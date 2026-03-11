import * as authService from '../services/authService.js';
import { apiResponse } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * GET /api/auth/session
 * Returns the authenticated user's session data.
 */
export const getSession = asyncHandler(async (req, res) => {
  // req.user is already set by authMiddleware
  apiResponse(res, {
    data: {
      user: {
        id: req.user.id,
        email: req.user.email,
        user_metadata: req.user.user_metadata,
      },
    },
    message: 'Session is valid',
  });
});

/**
 * POST /api/auth/logout
 * Invalidates the current session.
 */
export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.token);
  apiResponse(res, { message: 'Logged out successfully' });
});

/**
 * GET /api/auth/google
 * Returns the Supabase Google OAuth redirect URL.
 * The frontend can call this to get the URL dynamically.
 */
export const googleOAuth = asyncHandler(async (req, res) => {
  const redirectTo = req.query.redirectTo || `${process.env.CLIENT_URL}/dashboard`;
  const data = await authService.getGoogleOAuthUrl(redirectTo);
  apiResponse(res, { data, message: 'Redirect to the returned URL to authenticate with Google' });
});
