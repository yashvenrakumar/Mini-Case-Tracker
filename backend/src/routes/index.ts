import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import caseRoutes from './case.routes';
import commentRoutes from './comment.routes';
import documentRoutes from './document.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/cases', caseRoutes);
router.use('/cases/:caseId/comments', commentRoutes);
router.use('/cases/:caseId/documents', documentRoutes);

export default router;
