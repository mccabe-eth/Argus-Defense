require('dotenv').config({ path: '../.env' });
const { MongoClient, ServerApiVersion } = require('mongodb');

const username = process.env.MONGO_USERNAME;
const password = process.env.MONGO_PASSWORD;  
const clusterUrl = process.env.MONGO_CLUSTER_URL;
const dbName = process.env.MONGO_DB_NAME;
const uri = `mongodb+srv://${username}:${password}@${clusterUrl}/?retryWrites=true&w=majority&appName=${dbName}`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
