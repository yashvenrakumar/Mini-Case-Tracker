import app from './app';
import { config } from './config';
import { connectDatabase } from './config/database';

const start = async () => {
  try {
    await connectDatabase();
    app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
      console.log(`Swagger docs: http://localhost:${config.port}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
