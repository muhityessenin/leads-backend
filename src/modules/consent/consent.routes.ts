import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import consentController from './consent.controller';

const router = Router();

router.get('/', authMiddleware, (req, res) => consentController.getConsents(req, res));
router.get('/:id', authMiddleware, (req, res) => consentController.getConsent(req, res));

export default router;
