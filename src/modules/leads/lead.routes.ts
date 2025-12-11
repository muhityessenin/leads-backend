import { Router } from 'express';
import { authMiddleware, optionalAuthMiddleware } from '../../middleware/authMiddleware';
import leadController from './lead.controller';


const router = Router();

// Public catalog endpoint (supports ?page=&limit=)
router.get('/', optionalAuthMiddleware, (req, res) => leadController.getCatalog(req, res));

// Authenticated routes
router.post('/', authMiddleware, (req, res) => leadController.createLead(req, res));
router.get('/my', authMiddleware, (req, res) => leadController.getMyLeads(req, res));
router.get('/catalog', optionalAuthMiddleware, (req, res) => leadController.getCatalog(req, res));
router.get('/search', optionalAuthMiddleware, (req, res) => leadController.searchLeads(req, res));
router.get('/:id/full', authMiddleware, (req, res) => leadController.getLeadFullInfo(req, res));
router.put('/:id/publish', authMiddleware, (req, res) => leadController.publishLead(req, res));

export default router;
