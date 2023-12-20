const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vyh864y.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const productCollection = client.db("productDB").collection("product");
    const addCartCollection = client.db("addCartDB").collection("addCart");
    const brandCollection = client.db("brandDB").collection("brands");

    app.get("/product/:brandName", async (req, res) => {
      const brandName = req.params.brandName;
      const cursor = productCollection.find({ brandName: brandName });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/product", async (req, res) => {
      const cursor = productCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
 

    app.get("/single-product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    app.put("/single-product/:id", async (req, res) =>{
      const id = req.params.id;
      const filter = { _id: new ObjectId(id)};
      const options = { upsert: true };
      const updateProduct = req.body
      const product = {
        $set: {
          productName: updateProduct.productName, 
          brandName: updateProduct.brandName, 
          productType: updateProduct.productType, 
          price: updateProduct.price, 
          shortDescription: updateProduct.shortDescription, 
          rating: updateProduct.rating, 
          image: updateProduct.image
        }
      }
      const result = await productCollection.updateOne(filter, product, options);
      res.send(result)
    })

    app.get("/addToCart", async (req, res) => {
      const cursor = addCartCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/addToCart", async (req, res) => {
      const newAddCart = req.body;
      const result = await addCartCollection.insertOne(newAddCart);
      res.send(result);
    });

    app.get("/brands", async (req, res) => {
     const cursor = brandCollection.find();
     const result= await cursor.toArray();
     res.send(result);
    });

    app.post("/product", async (req, res) => {
      const newProduct = req.body;
      console.log(newProduct);
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });

    app.delete("/addToCart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await addCartCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.log);

app.get("/", (req, res) => {
  res.send("Brand Shop Server is Running");
});

app.listen(port, () => {
  console.log(`Brand Shop Server is Running on Port: ${port}`);
});
