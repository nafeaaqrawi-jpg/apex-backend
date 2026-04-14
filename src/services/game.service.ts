import { db } from '../lib/db'
import { userGameState } from '../db/schema'
import { eq } from 'drizzle-orm'
import type { UserGameState } from '../db/schema'

// ── XP table ──────────────────────────────────────────────────────────────────

export const XP_TABLE = {
  DAILY_LOGIN: 5,
  SEND_INTEREST: 10,
  NEW_MATCH: 50,
  SEND_MESSAGE: 3,
  COMPLETE_PROFILE: 100,
} as const

export type XPAction = keyof typeof XP_TABLE

// ── Achievement definitions ───────────────────────────────────────────────────

export const ACHIEVEMENTS = [
  { id: 'first_connection', label: 'First Connection', xp: 50, icon: '🤝' },
  { id: 'streak_3', label: '3-Day Streak', xp: 30, icon: '🔥' },
  { id: 'streak_7', label: 'Week Warrior', xp: 100, icon: '⚡' },
  { id: 'streak_30', label: 'Monthly Legend', xp: 500, icon: '👑' },
  { id: 'ten_connections', label: 'Social Butterfly', xp: 200, icon: '🦋' },
  { id: 'profile_complete', label: 'Full Profile', xp: 100, icon: '✨' },
  { id: 'verified', label: 'Verified Member', xp: 150, icon: '🛡️' },
  { id: 'first_message', label: 'Icebreaker', xp: 20, icon: '💬' },
] as const

// ── Level thresholds (XP needed to reach each level) ─────────────────────────

const LEVEL_XP = [0, 100, 250, 500, 900, 1500, 2500, 4000, 6000, 10000]

function xpToLevel(xp: number): number {
  for (let i = LEVEL_XP.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_XP[i]) return i + 1
  }
  return 1
}

// ── Get or create game state ──────────────────────────────────────────────────

export async function getGameState(userId: string): Promise<UserGameState> {
  const [existing] = await db
    .select()
    .from(userGameState)
    .where(eq(userGameState.userId, userId))

  if (existing) return existing

  // First time — create a row
  const [created] = await db
    .insert(userGameState)
    .values({ userId })
    .returning()

  return created
}

// ── Award XP ─────────────────────────────────────────────────────────────────

export async function awardXP(
  userId: string,
  action: XPAction
): Promise<{ xp: number; newAchievements: typeof ACHIEVEMENTS[number][]; leveledUp: boolean }> {
  const state = await getGameState(userId)
  const earned = XP_TABLE[action]
  const newTotal = state.totalXP + earned
  const oldLevel = state.level
  const newLevel = xpToLevel(newTotal)

  const currentAchievements = (state.achievements as string[]) ?? []
  const newAchievements: typeof ACHIEVEMENTS[number][] = []

  // Check connection achievements
  if (action === 'NEW_MATCH') {
    const matchCount = state.totalXP // approximation — we check via match count in real impl
    if (!currentAchievements.includes('first_connection')) {
      newAchievements.push(ACHIEVEMENTS.find(a => a.id === 'first_connection')!)
      currentAchievements.push('first_connection')
    }
  }

  // Check profile complete
  if (action === 'COMPLETE_PROFILE' && !currentAchievements.includes('profile_complete')) {
    newAchievements.push(ACHIEVEMENTS.find(a => a.id === 'profile_complete')!)
    currentAchievements.push('profile_complete')
  }

  // Check first message
  if (action === 'SEND_MESSAGE' && !currentAchievements.includes('first_message')) {
    newAchievements.push(ACHIEVEMENTS.find(a => a.id === 'first_message')!)
    currentAchievements.push('first_message')
  }

  // Bonus XP from new achievements
  const bonusXP = newAchievements.reduce((sum, a) => sum + a.xp, 0)
  const finalTotal = newTotal + bonusXP

  await db
    .update(userGameState)
    .set({
      totalXP: finalTotal,
      level: xpToLevel(finalTotal),
      achievements: currentAchievements,
      updatedAt: new Date(),
    })
    .where(eq(userGameState.userId, userId))

  return {
    xp: earned + bonusXP,
    newAchievements: newAchievements.filter(Boolean),
    leveledUp: xpToLevel(finalTotal) > oldLevel,
  }
}

// ── Update daily streak ───────────────────────────────────────────────────────

export async function updateStreak(
  userId: string
): Promise<{ streak: number; broken: boolean; newAchievements: typeof ACHIEVEMENTS[number][] }> {
  const state = await getGameState(userId)
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  let newStreak = state.currentStreak
  let broken = false

  if (state.lastActiveDate === today) {
    // Already counted today — no change
    return { streak: newStreak, broken: false, newAchievements: [] }
  } else if (state.lastActiveDate === yesterday) {
    // Consecutive day — extend streak
    newStreak += 1
  } else {
    // Streak broken
    broken = state.currentStreak > 0
    newStreak = 1
  }

  const newLongest = Math.max(state.longestStreak, newStreak)
  const currentAchievements = (state.achievements as string[]) ?? []
  const newAchievements: typeof ACHIEVEMENTS[number][] = []

  // Streak achievements
  if (newStreak >= 3 && !currentAchievements.includes('streak_3')) {
    newAchievements.push(ACHIEVEMENTS.find(a => a.id === 'streak_3')!)
    currentAchievements.push('streak_3')
  }
  if (newStreak >= 7 && !currentAchievements.includes('streak_7')) {
    newAchievements.push(ACHIEVEMENTS.find(a => a.id === 'streak_7')!)
    currentAchievements.push('streak_7')
  }
  if (newStreak >= 30 && !currentAchievements.includes('streak_30')) {
    newAchievements.push(ACHIEVEMENTS.find(a => a.id === 'streak_30')!)
    currentAchievements.push('streak_30')
  }

  // Daily login XP
  const bonusXP = XP_TABLE.DAILY_LOGIN + newAchievements.reduce((s, a) => s + a.xp, 0)

  await db
    .update(userGameState)
    .set({
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActiveDate: today,
      achievements: currentAchievements,
      totalXP: state.totalXP + bonusXP,
      level: xpToLevel(state.totalXP + bonusXP),
      updatedAt: new Date(),
    })
    .where(eq(userGameState.userId, userId))

  return { streak: newStreak, broken, newAchievements: newAchievements.filter(Boolean) }
}

// ── Get full game state with achievement details ──────────────────────────────

export async function getFullGameState(userId: string) {
  const state = await getGameState(userId)
  const earnedIds = (state.achievements as string[]) ?? []
  const earnedAchievements = ACHIEVEMENTS.filter(a => earnedIds.includes(a.id))
  const currentLevelXP = LEVEL_XP[state.level - 1] ?? 0
  const nextLevelXP = LEVEL_XP[state.level] ?? LEVEL_XP[LEVEL_XP.length - 1]
  const progressToNext = nextLevelXP - currentLevelXP > 0
    ? ((state.totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
    : 100

  return {
    totalXP: state.totalXP,
    level: state.level,
    currentStreak: state.currentStreak,
    longestStreak: state.longestStreak,
    progressToNext: Math.min(100, Math.round(progressToNext)),
    achievements: earnedAchievements,
  }
}
