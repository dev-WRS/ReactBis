import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || '';
const DB_NAME = process.env.DB_NAME || 'test';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (db) return db;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is required');
  }

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);

    // Create indexes for optimization
    const collection = db.collection('buildingexternals');
    await collection.createIndex({ projectId: 1 }, { background: true });
    await collection.createIndex({ projectName: 1 }, { background: true });
    await collection.createIndex({ projectId: 1, projectName: 1 }, { background: true });

    console.log(`Connected to MongoDB database: ${DB_NAME}`);
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export function getDatabase(): Db {
  if (!db) {
    throw new Error('Database not connected. Call connectToDatabase() first.');
  }
  return db;
}

export async function closeConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB connection closed');
  }
}

export function isConnected(): boolean {
  return db !== null;
}
