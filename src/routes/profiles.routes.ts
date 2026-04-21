import { Router } from 'express';
import { handleGetAllProfiles } from '../controllers/profiles.controller';
import { validateProfilesQuery } from '../middleware/validateQuery';

const router = Router();

router.get('/', validateProfilesQuery, handleGetAllProfiles);

export default router;