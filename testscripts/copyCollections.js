const { MongoClient } = require("mongodb");

const SOURCE_URI = "mongodb://localhost:27017/reactbackend"; // Source URI
const DESTINATION_URI = "mongodb+srv://michaelclinton8991:K7wtGrSmgekI7tQy@cluster0.ijuocbg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // Destination URI

async function copyCollections() {
  const sourceClient = new MongoClient(SOURCE_URI);
  const destinationClient = new MongoClient(DESTINATION_URI);

  try {
    // Connect to both source and destination databases
    await sourceClient.connect();
    await destinationClient.connect();

    console.log("Connected to both source and destination databases.");

    const sourceDb = sourceClient.db();
    const destinationDb = destinationClient.db();

    // Get all collections from the source database
    const collections = await sourceDb.listCollections().toArray();

    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`Copying collection: ${collectionName}`);

      const sourceCollection = sourceDb.collection(collectionName);
      const destinationCollection = destinationDb.collection(collectionName);

      // Fetch all documents from the source collection
      const documents = await sourceCollection.find().toArray();

      if (documents.length > 0) {
        // Insert documents into the destination collection
        await destinationCollection.insertMany(documents);
        console.log(`Copied ${documents.length} documents from ${collectionName}`);
      } else {
        console.log(`No documents found in collection: ${collectionName}`);
      }
    }

    console.log("Copy operation completed successfully.");
  } catch (error) {
    console.error("Error occurred during copy operation:", error);
  } finally {
    // Close connections
    await sourceClient.close();
    await destinationClient.close();
    console.log("Connections closed.");
  }
}

copyCollections();
