import { Db, MongoClient } from 'mongodb';
import { env } from '../config/env';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectMongo(): Promise<Db> {
  if (db) return db;

  client = new MongoClient(env.mongoUri);
  await client.connect();
  db = client.db();
  console.log('Connected to MongoDB');
  return db;
}

export async function getMongoDb(): Promise<Db> {
  if (!db) {
    return connectMongo();
  }
  return db;
}

export async function closeMongo(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
