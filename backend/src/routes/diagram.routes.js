import { Router } from 'express';
import requireAuth from '../middlewares/requireAuth.middlewares.js';
import {
  deleteDiagram,
  getDiagram,
  listDiagrams,
  saveDiagram,
} from '../controllers/diagram.controllers.js';

const router = Router();

router.use(requireAuth);
router.post('/save', saveDiagram);
router.get('/', listDiagrams);
router.get('/:id', getDiagram);
router.delete('/:id', deleteDiagram);

export default router;
