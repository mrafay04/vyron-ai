import { MongoClient } from 'mongodb'

const mongoUri = process.env.MONGODB_URI

if (!mongoUri) {
  throw new Error(
    'MONGODB_URI is missing from the .env.local file.'
  )
}

const globalForMongo = globalThis as unknown as {
  mongoClientPromise?: Promise<MongoClient>
}

const client = new MongoClient(mongoUri)

const clientPromise =
  globalForMongo.mongoClientPromise ??
  client.connect()

if (process.env.NODE_ENV !== 'production') {
  globalForMongo.mongoClientPromise = clientPromise
}

export default clientPromise