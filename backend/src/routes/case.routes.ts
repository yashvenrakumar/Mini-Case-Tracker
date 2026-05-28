import { Router } from 'express';
import * as caseController from '../controllers/case.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createCaseSchema,
  assignCaseSchema,
  updateStatusSchema,
  listCasesQuerySchema,
  caseIdParamSchema,
  updateCaseSchema,
} from '../validation/case.validation';
import { UserRole } from '../utils/constants';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/v1/cases:
 *   get:
 *     tags: [Cases]
 *     summary: List cases with search, filters, and pagination
 *     description: |
 *       Managers see all cases and may filter by `assignedTo`.
 *       Agents only see cases assigned to them (`assignedTo` filter is ignored).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *         example: 10
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Case-insensitive search on clientName, subjectName, caseType
 *         example: Acme
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/CaseStatus'
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           $ref: '#/components/schemas/ObjectId'
 *         description: Filter by agent ObjectId (managers only)
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Paginated cases list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Cases retrieved }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Case' }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 *             example:
 *               success: true
 *               message: Cases retrieved
 *               data:
 *                 - _id: 507f1f77bcf86cd799439012
 *                   clientName: Acme Corp
 *                   subjectName: John Doe
 *                   caseType: Background Check
 *                   dueDate: '2026-06-15T00:00:00.000Z'
 *                   status: assigned
 *                   assignedTo:
 *                     _id: 507f1f77bcf86cd799439011
 *                     name: Jane Agent
 *                     email: agent@example.com
 *                   createdBy:
 *                     _id: 507f1f77bcf86cd799439010
 *                     name: Mike Manager
 *                     email: manager@example.com
 *                   createdAt: '2026-05-20T10:00:00.000Z'
 *                   updatedAt: '2026-05-21T14:30:00.000Z'
 *               meta:
 *                 page: 1
 *                 limit: 10
 *                 total: 1
 *                 totalPages: 1
 *       401:
 *         description: Missing or invalid JWT
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 */
router.get('/', validate(listCasesQuerySchema, 'query'), caseController.listCases);

/**
 * @openapi
 * /api/v1/cases/dashboard:
 *   get:
 *     tags: [Cases]
 *     summary: Dashboard statistics by status
 *     description: |
 *       Returns aggregate case counts grouped by status.
 *       Managers see all cases; agents see only cases assigned to them.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Dashboard stats retrieved }
 *                 data: { $ref: '#/components/schemas/DashboardStats' }
 *             example:
 *               success: true
 *               message: Dashboard stats retrieved
 *               data:
 *                 total: 12
 *                 byStatus:
 *                   - status: new
 *                     count: 2
 *                   - status: assigned
 *                     count: 3
 *                   - status: in_progress
 *                     count: 4
 *                   - status: submitted
 *                     count: 1
 *                   - status: cleared
 *                     count: 1
 *                   - status: discrepant
 *                     count: 1
 *       401:
 *         description: Missing or invalid JWT
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 */
router.get('/dashboard', caseController.getDashboard);

/**
 * @openapi
 * /api/v1/cases:
 *   post:
 *     tags: [Cases]
 *     summary: Create a new case (Manager only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [clientName, subjectName, caseType, dueDate]
 *             properties:
 *               clientName: { type: string, example: Acme Corp }
 *               subjectName: { type: string, example: John Doe }
 *               caseType: { type: string, example: Background Check }
 *               dueDate: { type: string, format: date, example: '2026-06-15' }
 *               assignedTo:
 *                 type: string
 *                 description: Optional agent ObjectId; if set, case starts as `assigned`
 *                 example: 507f1f77bcf86cd799439011
 *           examples:
 *             withoutAssignee:
 *               summary: Create unassigned case (status `new`)
 *               value:
 *                 clientName: Acme Corp
 *                 subjectName: John Doe
 *                 caseType: Background Check
 *                 dueDate: '2026-06-15'
 *             withAssignee:
 *               summary: Create and assign to agent (status `assigned`)
 *               value:
 *                 clientName: Globex Inc
 *                 subjectName: Jane Smith
 *                 caseType: Employment Verification
 *                 dueDate: '2026-07-01'
 *                 assignedTo: 507f1f77bcf86cd799439011
 *     responses:
 *       201:
 *         description: Case created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Case created successfully }
 *                 data: { $ref: '#/components/schemas/Case' }
 *             example:
 *               success: true
 *               message: Case created successfully
 *               data:
 *                 _id: 507f1f77bcf86cd799439012
 *                 clientName: Acme Corp
 *                 subjectName: John Doe
 *                 caseType: Background Check
 *                 dueDate: '2026-06-15T00:00:00.000Z'
 *                 status: new
 *                 createdBy:
 *                   _id: 507f1f77bcf86cd799439010
 *                   name: Mike Manager
 *                   email: manager@example.com
 *                 createdAt: '2026-05-27T09:00:00.000Z'
 *                 updatedAt: '2026-05-27T09:00:00.000Z'
 *       400:
 *         description: Validation error or invalid assigned agent
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 *       401:
 *         description: Missing or invalid JWT
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 *       403:
 *         description: Manager role required
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 */
router.post(
  '/',
  authorize(UserRole.MANAGER),
  validate(createCaseSchema),
  caseController.createCase
);

/**
 * @openapi
 * /api/v1/cases/{id}:
 *   get:
 *     tags: [Cases]
 *     summary: Get case detail with timeline and counts
 *     description: |
 *       Returns the case, full audit timeline, and comment/document counts.
 *       Agents may only access cases assigned to them.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/ObjectId'
 *         example: 507f1f77bcf86cd799439012
 *     responses:
 *       200:
 *         description: Case retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Case retrieved }
 *                 data: { $ref: '#/components/schemas/CaseDetail' }
 *             example:
 *               success: true
 *               message: Case retrieved
 *               data:
 *                 case:
 *                   _id: 507f1f77bcf86cd799439012
 *                   clientName: Acme Corp
 *                   subjectName: John Doe
 *                   caseType: Background Check
 *                   dueDate: '2026-06-15T00:00:00.000Z'
 *                   status: in_progress
 *                   assignedTo:
 *                     _id: 507f1f77bcf86cd799439011
 *                     name: Jane Agent
 *                     email: agent@example.com
 *                   createdBy:
 *                     _id: 507f1f77bcf86cd799439010
 *                     name: Mike Manager
 *                     email: manager@example.com
 *                   createdAt: '2026-05-20T10:00:00.000Z'
 *                   updatedAt: '2026-05-21T14:30:00.000Z'
 *                 timeline:
 *                   - _id: 507f1f77bcf86cd799439013
 *                     caseId: 507f1f77bcf86cd799439012
 *                     action: case_created
 *                     metadata: { status: new }
 *                     performedBy:
 *                       _id: 507f1f77bcf86cd799439010
 *                       name: Mike Manager
 *                       email: manager@example.com
 *                       role: manager
 *                     createdAt: '2026-05-20T10:00:00.000Z'
 *                     updatedAt: '2026-05-20T10:00:00.000Z'
 *                   - _id: 507f1f77bcf86cd799439014
 *                     caseId: 507f1f77bcf86cd799439012
 *                     action: status_change
 *                     fromStatus: assigned
 *                     toStatus: in_progress
 *                     performedBy:
 *                       _id: 507f1f77bcf86cd799439011
 *                       name: Jane Agent
 *                       email: agent@example.com
 *                       role: agent
 *                     createdAt: '2026-05-21T14:30:00.000Z'
 *                     updatedAt: '2026-05-21T14:30:00.000Z'
 *                 counts:
 *                   comments: 2
 *                   documents: 1
 *       401:
 *         description: Missing or invalid JWT
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 *       403:
 *         description: Agent cannot access this case
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 *       404:
 *         description: Case not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 */
router.get(
  '/:id',
  validate(caseIdParamSchema, 'params'),
  caseController.getCase
);

/**
 * @openapi
 * /api/v1/cases/{id}:
 *   patch:
 *     tags: [Cases]
 *     summary: Update case fields (Manager only)
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id',
  authorize(UserRole.MANAGER),
  validate(caseIdParamSchema, 'params'),
  validate(updateCaseSchema),
  caseController.updateCase
);

/**
 * @openapi
 * /api/v1/cases/{id}:
 *   delete:
 *     tags: [Cases]
 *     summary: Delete a case (Manager only)
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:id',
  authorize(UserRole.MANAGER),
  validate(caseIdParamSchema, 'params'),
  caseController.deleteCase
);

/**
 * @openapi
 * /api/v1/cases/{id}/audit:
 *   get:
 *     tags: [Cases]
 *     summary: Get audit log for a case
 *     description: |
 *       Returns chronological audit entries for the case.
 *       Agents may only access cases assigned to them.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/ObjectId'
 *         example: 507f1f77bcf86cd799439012
 *     responses:
 *       200:
 *         description: Audit log retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Audit log retrieved }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/AuditLogEntry' }
 *             example:
 *               success: true
 *               message: Audit log retrieved
 *               data:
 *                 - _id: 507f1f77bcf86cd799439013
 *                   caseId: 507f1f77bcf86cd799439012
 *                   action: case_created
 *                   metadata: { status: new }
 *                   performedBy:
 *                     _id: 507f1f77bcf86cd799439010
 *                     name: Mike Manager
 *                     email: manager@example.com
 *                     role: manager
 *                   createdAt: '2026-05-20T10:00:00.000Z'
 *                   updatedAt: '2026-05-20T10:00:00.000Z'
 *                 - _id: 507f1f77bcf86cd799439014
 *                   caseId: 507f1f77bcf86cd799439012
 *                   action: status_change
 *                   fromStatus: new
 *                   toStatus: assigned
 *                   metadata: { assignedTo: 507f1f77bcf86cd799439011 }
 *                   performedBy:
 *                     _id: 507f1f77bcf86cd799439010
 *                     name: Mike Manager
 *                     email: manager@example.com
 *                     role: manager
 *                   createdAt: '2026-05-20T11:00:00.000Z'
 *                   updatedAt: '2026-05-20T11:00:00.000Z'
 *       401:
 *         description: Missing or invalid JWT
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 *       403:
 *         description: Agent cannot access this case
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 *       404:
 *         description: Case not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 */
router.get(
  '/:id/audit',
  validate(caseIdParamSchema, 'params'),
  caseController.getCaseAudit
);

/**
 * @openapi
 * /api/v1/cases/{id}/assign:
 *   patch:
 *     tags: [Cases]
 *     summary: Assign case to an agent (Manager only)
 *     description: |
 *       Assigns or reassigns a case. Allowed when status is `new` or `assigned`.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/ObjectId'
 *         example: 507f1f77bcf86cd799439012
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [assignedTo]
 *             properties:
 *               assignedTo:
 *                 type: string
 *                 description: Active agent ObjectId
 *                 example: 507f1f77bcf86cd799439011
 *           example:
 *             assignedTo: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Case assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Case assigned successfully }
 *                 data: { $ref: '#/components/schemas/Case' }
 *             example:
 *               success: true
 *               message: Case assigned successfully
 *               data:
 *                 _id: 507f1f77bcf86cd799439012
 *                 clientName: Acme Corp
 *                 subjectName: John Doe
 *                 caseType: Background Check
 *                 dueDate: '2026-06-15T00:00:00.000Z'
 *                 status: assigned
 *                 assignedTo:
 *                   _id: 507f1f77bcf86cd799439011
 *                   name: Jane Agent
 *                   email: agent@example.com
 *                 createdAt: '2026-05-20T10:00:00.000Z'
 *                 updatedAt: '2026-05-27T10:00:00.000Z'
 *       400:
 *         description: Invalid agent or case not in assignable status
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 *       401:
 *         description: Missing or invalid JWT
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 *       403:
 *         description: Manager role required
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 *       404:
 *         description: Case not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 */
router.patch(
  '/:id/assign',
  authorize(UserRole.MANAGER),
  validate(caseIdParamSchema, 'params'),
  validate(assignCaseSchema),
  caseController.assignCase
);

/**
 * @openapi
 * /api/v1/cases/{id}/status:
 *   patch:
 *     tags: [Cases]
 *     summary: Update case status (role-based transitions)
 *     description: |
 *       Agents may transition assigned cases through workflow states.
 *       Managers may review submitted cases (`cleared` / `discrepant`).
 *       Submitting requires at least one uploaded document.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/ObjectId'
 *         example: 507f1f77bcf86cd799439012
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 $ref: '#/components/schemas/CaseStatus'
 *           examples:
 *             agentStart:
 *               summary: Agent starts work
 *               value:
 *                 status: in_progress
 *             agentSubmit:
 *               summary: Agent submits case
 *               value:
 *                 status: submitted
 *             managerClear:
 *               summary: Manager clears case
 *               value:
 *                 status: cleared
 *             managerDiscrepant:
 *               summary: Manager marks discrepant
 *               value:
 *                 status: discrepant
 *     responses:
 *       200:
 *         description: Case status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Case status updated }
 *                 data: { $ref: '#/components/schemas/Case' }
 *             example:
 *               success: true
 *               message: Case status updated
 *               data:
 *                 _id: 507f1f77bcf86cd799439012
 *                 clientName: Acme Corp
 *                 subjectName: John Doe
 *                 caseType: Background Check
 *                 dueDate: '2026-06-15T00:00:00.000Z'
 *                 status: in_progress
 *                 assignedTo:
 *                   _id: 507f1f77bcf86cd799439011
 *                   name: Jane Agent
 *                   email: agent@example.com
 *                 submittedAt: null
 *                 reviewedAt: null
 *                 createdAt: '2026-05-20T10:00:00.000Z'
 *                 updatedAt: '2026-05-27T11:00:00.000Z'
 *       400:
 *         description: Invalid transition or missing documents on submit
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 *             example:
 *               success: false
 *               message: Upload at least one document before submitting
 *       401:
 *         description: Missing or invalid JWT
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 *       403:
 *         description: Forbidden transition or wrong assignee
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 *       404:
 *         description: Case not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 */
router.patch(
  '/:id/status',
  validate(caseIdParamSchema, 'params'),
  validate(updateStatusSchema),
  caseController.updateCaseStatus
);

export default router;
