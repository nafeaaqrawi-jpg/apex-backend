import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import {
  createPostHandler,
  createPostSchema,
  deletePostHandler,
  getMyPostsHandler,
} from '../controllers/post.controller';

const router = Router();

router.use(requireAuth);

router.get('/posts/me', getMyPostsHandler);
router.post('/posts', validate(createPostSchema), createPostHandler);
router.delete('/posts/:postId', deletePostHandler);

export default router;
