import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { swaggerSpec } from './config/swagger';
import routes from './routes';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';

const app = express();

// Disable ETag so Swagger UI and clients always receive JSON bodies (not 304).
app.set('etag', false);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

const uploadDir = path.resolve(process.cwd(), config.upload.dir);
app.use('/uploads', express.static(uploadDir));

const swaggerUiOptions = {
  swaggerOptions: {
    url: '/api-docs.json',
    validatorUrl: null as null,
  },
};

app.get('/api-docs.json', (_req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.json(swaggerSpec);
});

app.use(
  '/api-docs',
  (_req: Request, res: Response, next: NextFunction) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    next();
  },
  swaggerUi.serve,
  swaggerUi.setup(undefined, swaggerUiOptions)
);

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'API is running', data: { env: config.env } });
});

app.use('/api/v1', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
