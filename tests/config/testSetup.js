import mongoose from "mongoose";
import dotenv from "dotenv";
import { MongoMemoryServer } from "mongodb-memory-server";

// ðŸ§© Ø¨Ø§Ø±Ú¯Ø°Ø§Ø±ÛŒ env Ù…Ø®ØµÙˆØµ ØªØ³Øª
dotenv.config({ path: ".env.test" });

let mongoServer;

// Ù‚Ø¨Ù„ Ø§Ø² Ø´Ø±ÙˆØ¹ ØªØ³Øªâ€ŒÙ‡Ø§
beforeAll(async () => {
  // Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø§Ø² Ø¯ÛŒØªØ§Ø¨ÛŒØ³ Ø­Ø§ÙØ¸Ù‡â€ŒØ§ÛŒ Ø¨Ø±Ø§ÛŒ ØªØ³Øª Ø³Ø±ÛŒØ¹ Ùˆ Ø§ÛŒØ²ÙˆÙ„Ù‡
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGO_URI = uri;
  await mongoose.connect(uri, { dbName: "test_audit_db_temp" });
});

// Ø¨Ø¹Ø¯ Ø§Ø² Ù‡Ø± ØªØ³Øª
afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

// Ø¨Ø¹Ø¯ Ø§Ø² Ù¾Ø§ÛŒØ§Ù† Ù‡Ù…Ù‡ ØªØ³Øªâ€ŒÙ‡Ø§
afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});
