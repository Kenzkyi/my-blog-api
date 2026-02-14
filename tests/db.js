const { MongoMemoryServer } = require("mongodb-memory-server");
const { default: mongoose } = require("mongoose");

class db {
  constructor() {
    this.connection = null;
  }
  async connect() {
    this.connection = await MongoMemoryServer.create();
    const uri = this.connection.getUri();
    try {
      await mongoose.connect(uri);
      console.log("Connected successfully");
    } catch (error) {
      console.log("Connection error", error);
    }
  }

  async disconnect() {
    await mongoose.disconnect();
    await this.connection.stop();
    this.connection = null;
  }

  async clear() {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  }
}

module.exports = new db();
