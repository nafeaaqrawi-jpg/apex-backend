import { Request, Response, NextFunction } from 'express';
import { getNearbyProfiles, searchProfiles } from '../services/search.service';

export async function searchHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const query = String(req.query.q ?? '');
    const results = await searchProfiles(query, req.user!.userId);
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
}

export async function nearbySearchHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const radiusMiles = Number(req.query.radiusMiles ?? 75);
    const results = await getNearbyProfiles(req.user!.userId, Number.isFinite(radiusMiles) ? radiusMiles : 75);
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
}
