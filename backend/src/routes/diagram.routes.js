import { Router } from 'express';
import {
  deleteDiagram,
  getDiagram,
  listDiagrams,
  saveDiagram,
} from '../controllers/diagram.controllers.js';

const router = Router();

router.post('/save', saveDiagram);
router.get('/', listDiagrams);
router.get('/:id', getDiagram);
router.delete('/:id', deleteDiagram);

export default router;
