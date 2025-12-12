import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import leadTypeController from './leadType.controller';


const router = Router();

// Public
router.get('/', (req, res) => leadTypeController.getAll(req, res));

// Authenticated
router.get('/my', authMiddleware, (req, res) =>
  leadTypeController.getMyLeadTypes(req, res),
);
router.post('/', authMiddleware, (req, res) =>
  leadTypeController.create(req, res),
);

// Dynamic (ВСЕГДА В КОНЦЕ)
router.get('/:id', (req, res) =>
  leadTypeController.getById(req, res),
);
router.put('/:id', authMiddleware, (req, res) =>
  leadTypeController.update(req, res),
);
router.delete('/:id', authMiddleware, (req, res) =>
  leadTypeController.delete(req, res),
);

export default router;
