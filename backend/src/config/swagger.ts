import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index';

const routesDir = path.join(__dirname, '../routes');

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Mini Case Tracker API',
      version: '1.0.0',
      description:
        'REST API for the Mini Case Tracker MERN take-home task. Supports Manager and Agent roles with JWT authentication, case lifecycle management, documents, comments, and audit logging.',
    },
    servers: [
      {
        // Keep base URL without trailing slash so paths like
        // `/api/v1/cases/dashboard` resolve correctly in Swagger UI
        url: `http://localhost:${config.port}`,
        description: 'Local development',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ApiSuccess: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
            data: { type: 'object' },
            meta: { type: 'object' },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                token: { type: 'string' },
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string' },
                    role: { type: 'string', enum: ['manager', 'agent'] },
                  },
                },
              },
            },
          },
        },
        UserRef: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'Jane Agent' },
            email: { type: 'string', example: 'agent@example.com' },
            role: { type: 'string', enum: ['manager', 'agent'], example: 'agent' },
          },
        },
        ObjectId: {
          type: 'string',
          description:
            '24-character hexadecimal MongoDB ObjectId (0-9, a-f, A-F)',
          minLength: 24,
          maxLength: 24,
          example: '507f1f77bcf86cd799439011',
        },
        CaseStatus: {
          type: 'string',
          enum: [
            'new',
            'assigned',
            'in_progress',
            'submitted',
            'cleared',
            'discrepant',
          ],
        },
        Case: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
            clientName: { type: 'string', example: 'Acme Corp' },
            subjectName: { type: 'string', example: 'John Doe' },
            caseType: { type: 'string', example: 'Background Check' },
            dueDate: { type: 'string', format: 'date-time', example: '2026-06-15T00:00:00.000Z' },
            status: { $ref: '#/components/schemas/CaseStatus' },
            assignedTo: { oneOf: [{ $ref: '#/components/schemas/UserRef' }, { type: 'null' }] },
            createdBy: { $ref: '#/components/schemas/UserRef' },
            submittedAt: { type: 'string', format: 'date-time', nullable: true },
            reviewedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            total: { type: 'integer', example: 42 },
            totalPages: { type: 'integer', example: 5 },
          },
        },
        AuditLogEntry: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439013' },
            caseId: { type: 'string', example: '507f1f77bcf86cd799439012' },
            action: {
              type: 'string',
              example: 'status_change',
              description: 'e.g. status_change, case_created, case_reassigned',
            },
            fromStatus: { $ref: '#/components/schemas/CaseStatus' },
            toStatus: { $ref: '#/components/schemas/CaseStatus' },
            metadata: { type: 'object', additionalProperties: true },
            performedBy: { $ref: '#/components/schemas/UserRef' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CaseDetail: {
          type: 'object',
          properties: {
            case: { $ref: '#/components/schemas/Case' },
            timeline: {
              type: 'array',
              items: { $ref: '#/components/schemas/AuditLogEntry' },
            },
            counts: {
              type: 'object',
              properties: {
                comments: { type: 'integer', example: 2 },
                documents: { type: 'integer', example: 1 },
              },
            },
          },
        },
        DashboardStats: {
          type: 'object',
          properties: {
            total: { type: 'integer', example: 12 },
            byStatus: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    enum: [
                      'new',
                      'assigned',
                      'in_progress',
                      'submitted',
                      'cleared',
                      'discrepant',
                    ],
                  },
                  count: { type: 'integer', example: 3 },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication' },
      { name: 'Users', description: 'User management' },
      { name: 'Cases', description: 'Case CRUD and workflow' },
      { name: 'Comments', description: 'Case notes' },
      { name: 'Documents', description: 'File uploads' },
    ],
  },
  apis: [
    path.join(routesDir, '*.ts'),
    path.join(routesDir, '*.js'),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
