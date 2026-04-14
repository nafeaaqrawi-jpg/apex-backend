import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createPost, deletePost, getMyPosts } from '../services/post.service';

export const createPostSchema = z.object({
  imageUrl: z.string().url('Post image must be a valid URL.'),
  caption: z.string().max(280, 'Caption must be 280 characters or fewer.').optional(),
  locationTag: z.string().max(80, 'Location must be 80 characters or fewer.').optional(),
});

export async function createPostHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const post = await createPost(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
}

export async function deletePostHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { postId } = req.params;
    const deleted = await deletePost(postId, req.user!.userId);
    res.json({ success: true, data: deleted });
  } catch (err) {
    next(err);
  }
}

export async function getMyPostsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const posts = await getMyPosts(req.user!.userId);
    res.json({ success: true, data: posts });
  } catch (err) {
    next(err);
  }
}
