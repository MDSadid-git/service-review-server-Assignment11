const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  console.log(token);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const photosCollection = client
      .db("mysportsphotos")
      .collection("photographer");
    const photosaddreviews = client
      .db("mysportsphotos")
      .collection("addreviews");
    app.post("/jwt", (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ token });
    });
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
      const reviews = req.body;
      const result = await photosaddreviews.insertOne(reviews);
      res.send(result);
    });
    app.get("/addreviews", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      console.log("inside", decoded);
      if (decoded.email !== req.query.email) {
        res.status(403).send({ message: "unauthorized access" });
      }

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
    app.patch("/addreviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };

      const result = await photosaddreviews.updateOne(query, {
        $set: req.body,
      });
      res.send(result);
    });
    app.get("/addreviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await photosaddreviews.findOne(query);
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
