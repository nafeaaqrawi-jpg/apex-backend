import { and, desc, eq } from 'drizzle-orm';
import { db } from '../lib/db';
import { posts, users } from '../db/schema';
import { AppError } from '../middleware/error.middleware';

const SAFE_POST_COLUMNS = {
  id: posts.id,
  userId: posts.userId,
  imageUrl: posts.imageUrl,
  caption: posts.caption,
  locationTag: posts.locationTag,
  createdAt: posts.createdAt,
} as const;

export interface CreatePostInput {
  imageUrl: string;
  caption?: string;
  locationTag?: string;
}

export async function createPost(userId: string, input: CreatePostInput) {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) throw new AppError('User not found.', 404, 'NOT_FOUND');

  const [post] = await db
    .insert(posts)
    .values({
      userId,
      imageUrl: input.imageUrl,
      caption: input.caption,
      locationTag: input.locationTag,
    })
    .returning(SAFE_POST_COLUMNS);

  return post;
}

export async function deletePost(postId: string, userId: string) {
  const [post] = await db
    .delete(posts)
    .where(and(eq(posts.id, postId), eq(posts.userId, userId)))
    .returning(SAFE_POST_COLUMNS);

  if (!post) {
    throw new AppError('Post not found.', 404, 'NOT_FOUND');
  }

  return post;
}

export async function getMyPosts(userId: string) {
  return db
    .select(SAFE_POST_COLUMNS)
    .from(posts)
    .where(eq(posts.userId, userId))
    .orderBy(desc(posts.createdAt));
}
