import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { getGameStateHandler } from '../controllers/game.controller'

const router = Router()

router.get('/state', requireAuth, getGameStateHandler)

export default router
