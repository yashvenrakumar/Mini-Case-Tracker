import app from './app';
import { config } from './config';
import { connectDatabase } from './config/database';

const start = async () => {
  try {
    await connectDatabase();
    app.listen(config.port, '0.0.0.0', () => {
      console.log(`Server running on port ${config.port}`);
      console.log(`Swagger docs: /api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
