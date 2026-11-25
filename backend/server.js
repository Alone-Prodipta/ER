import 'dotenv/config';
import app from './src/app.js';
import connectDatabase from './src/database/db.database.js';

const port = Number(process.env.PORT) || 5000;

try {
  await connectDatabase();
  app.listen(port, () => console.log(`ER API listening on http://localhost:${port}`));
} catch (error) {
  console.error(`Could not connect to MongoDB: ${error.message}`);
  process.exit(1);
}
