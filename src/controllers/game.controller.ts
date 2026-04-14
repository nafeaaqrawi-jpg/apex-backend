import type { Request, Response, NextFunction } from 'express'
import { getFullGameState, updateStreak } from '../services/game.service'

export async function getGameStateHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId
    // Update streak on every page load (idempotent for same day)
    await updateStreak(userId)
    const state = await getFullGameState(userId)
    res.json({ success: true, data: state })
  } catch (err) {
    next(err)
  }
}
