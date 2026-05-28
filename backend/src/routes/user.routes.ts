import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { UserRole } from '../utils/constants';

const router = Router();

router.use(authenticate, authorize(UserRole.MANAGER));

/**
 * @openapi
 * /api/v1/users/agents:
 *   get:
 *     tags: [Users]
 *     summary: List active agents (Manager only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Agents list
 */
router.get('/agents', userController.listAgents);

export default router;
