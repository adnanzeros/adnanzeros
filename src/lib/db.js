import { MongoClient } from 'mongodb';

export const hasDb = () => Boolean((process.env.MONGODB_URI || '').trim());

export async function getDb() {
  const uri = (process.env.MONGODB_URI || '').trim();
  if (!uri) throw new Error('MONGODB_URI missing');
  if (!globalThis._portfolioMongo) {
    globalThis._portfolioMongo = new MongoClient(uri, {
      serverSelectionTimeoutMS: 8000,
    })
      .connect()
      .catch(error => {
        globalThis._portfolioMongo = null;
        throw error;
      });
  }
  const client = await globalThis._portfolioMongo;
  return client.db((process.env.MONGODB_DB || 'portfolio').trim());
}
