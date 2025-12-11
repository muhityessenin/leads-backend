import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import leadTypeController from './leadType.controller';


const router = Router();

// Public: list all lead types (supports pagination via ?page=&limit=)
router.get('/', (req, res) => leadTypeController.getAll(req, res));

// Public: get single lead type by id
router.get('/:id', (req, res) => leadTypeController.getById(req, res));

// Authenticated routes
router.post('/', authMiddleware, (req, res) => leadTypeController.create(req, res));
router.get('/my', authMiddleware, (req, res) => leadTypeController.getMyLeadTypes(req, res));
router.put('/:id', authMiddleware, (req, res) => leadTypeController.update(req, res));
router.delete('/:id', authMiddleware, (req, res) => leadTypeController.delete(req, res));

export default router;
