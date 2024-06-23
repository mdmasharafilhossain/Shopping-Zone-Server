const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;


// middleware 
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lzichn4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

async function run() {
  try {
    // ----------------------------All Collection Name------------------------
    const CategoriesCollection = client.db('ShoppingZone').collection('Categories');
    const FlashSaleCollection = client.db('ShoppingZone').collection('FlashSale');

    // -------------------------------- Categories----------------------

    app.get("/categories", async(req,res)=>{
        const result = await CategoriesCollection.find().toArray();
        res.send({result});
    })


    // ----------------------------Flash Sale-----------------------------------
    app.get("/flashSale", async (req, res) => {
      const sort = req.query.sort;
      console.log(sort)
      let sortCriteria = {};
      if (sort === 'lowToHigh') {
          sortCriteria = { discount_price: 1 };
      } else if (sort === 'highToLow') {
          sortCriteria = { discount_price: -1 };
      }

      const result = await FlashSaleCollection.find().sort(sortCriteria).toArray();
      res.send({ result });
  });






  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.get('/',(req,res)=>{
    res.send('Shopping Server Running Successfully');
});

app.listen(port,()=>{
    console.log(`Shopping Server Running at Port ${port}`)
});