import { Router } from 'express';
import { handleGetAllProfiles, handleSearchProfiles } from '../controllers/profiles.controller';
import { validateProfilesQuery } from '../middleware/validateQuery';

const router = Router();

router.get('/', validateProfilesQuery, handleGetAllProfiles);
router.get('/search', handleSearchProfiles);


export default router;