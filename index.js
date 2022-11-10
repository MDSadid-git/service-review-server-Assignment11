const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

//middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fdmrdur.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const photosCollection = client
      .db("mysportsphotos")
      .collection("photographer");
    const photosaddreviews = client
      .db("mysportsphotos")
      .collection("addreviews");
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = photosCollection.find(query);
      const result = await cursor.limit(3).toArray();
      res.send(result);
    });
    app.get("/servicespage", async (req, res) => {
      const query = {};
      const cursor = photosCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await photosCollection.findOne(query);
      res.send(result);
    });
    app.post("/servicespage", async (req, res) => {
      const order = req.body;
      const result = await photosCollection.insertOne(order);
      res.send(result);
    });
    app.post("/addreviews", async (req, res) => {
      const order = req.body;
      const result = await photosaddreviews.insertOne(order);
      res.send(result);
    });
    app.get("/addreviews", async (req, res) => {
      let query = {};

      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      const cursor = photosaddreviews.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.delete("/addreviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await photosaddreviews.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}
run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("photos server is running!!!");
});

app.listen(port, () => {
  console.log("my Server is running>>>", port);
});
