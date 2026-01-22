import { Router, Request, Response } from 'express';
import { access, mkdir, writeFile } from 'fs/promises';
import { dirname } from 'path';
import { extractProjectsFromProfile } from '../../services/resumeProjects.js';
import { clearProfileCache, DEFAULT_PROFILE_PATH, getProfile } from '../../services/profile.js';

export const profileRouter = Router();

/**
 * GET /api/profile/projects - Get all projects available in the base resume
 */
profileRouter.get('/projects', async (req: Request, res: Response) => {
  try {
    const profile = await getProfile();
    const { catalog } = extractProjectsFromProfile(profile);
    res.json({ success: true, data: catalog });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

/**
 * GET /api/profile - Get the full base resume profile
 */
profileRouter.get('/', async (req: Request, res: Response) => {
  try {
    const profile = await getProfile();
    res.json({ success: true, data: profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

/**
 * GET /api/profile/status - Check if base resume exists
 */
profileRouter.get('/status', async (_req: Request, res: Response) => {
  try {
    await access(DEFAULT_PROFILE_PATH);
    res.json({ success: true, data: { exists: true, error: null } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.json({ success: true, data: { exists: false, error: message } });
  }
});

/**
 * POST /api/profile/upload - Upload base resume JSON
 */
profileRouter.post('/upload', async (req: Request, res: Response) => {
  try {
    const profile = (req.body && typeof req.body === 'object' ? (req.body as Record<string, unknown>).profile : null) as unknown;

    if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
      throw new Error('Invalid profile payload. Expected a JSON object.');
    }

    await mkdir(dirname(DEFAULT_PROFILE_PATH), { recursive: true });
    await writeFile(DEFAULT_PROFILE_PATH, JSON.stringify(profile, null, 2), 'utf-8');
    clearProfileCache();

    res.json({ success: true, data: { exists: true, error: null } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ success: false, error: message });
  }
});
