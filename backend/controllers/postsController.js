import * as postsService from '../services/postsService.js';
import { apiResponse } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/** GET /api/posts */
export const list = asyncHandler(async (req, res) => {
  const posts = await postsService.getPosts(req.user.id);
  apiResponse(res, { data: posts });
});

/** POST /api/posts */
export const create = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return apiResponse(res, { success: false, message: 'Content is required', statusCode: 400 });
  }
  const post = await postsService.createPost(req.user.id, content);
  apiResponse(res, { data: post, message: 'Post created', statusCode: 201 });
});

/** DELETE /api/posts/:id */
export const remove = asyncHandler(async (req, res) => {
  await postsService.deletePost(req.user.id, req.params.id);
  apiResponse(res, { message: 'Post deleted' });
});

/** POST /api/posts/:id/like */
export const like = asyncHandler(async (req, res) => {
  const result = await postsService.toggleLike(req.user.id, req.params.id);
  apiResponse(res, { data: result });
});

/** POST /api/posts/:id/comment */
export const comment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return apiResponse(res, { success: false, message: 'Comment text is required', statusCode: 400 });
  }
  const result = await postsService.addComment(req.user.id, req.params.id, text);
  apiResponse(res, { data: result });
});
