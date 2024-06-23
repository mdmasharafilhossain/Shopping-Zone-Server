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
    const UsersCollection = client.db('ShoppingZone').collection('users');

    // -------------------------------- Categories----------------------

    app.get("/categories", async(req,res)=>{
        const result = await CategoriesCollection.find().toArray();
        res.send({result});
    })


    // ----------------------------Flash Sale-----------------------------------
    app.get("/flashSale", async (req, res) => {
      const sort = req.query.sort || '';
      const color = req.query.color || '';
      const type = req.query.type || '';
      console.log(color)
      
      let filterOption = {};
      console.log(sort)
      let sortCriteria = {};
      if (sort === 'lowToHigh') {
          sortCriteria = { discount_price: 1 };
      } else if (sort === 'highToLow') {
          sortCriteria = { discount_price: -1 };
      }
      if (color) {
        filterOption = { color: { $regex: color, $options: 'i' } };
      }
      if (type) {
        filterOption.type = type;
      }

      const result = await FlashSaleCollection.find(filterOption).sort(sortCriteria).toArray();
      res.send({ result });
  });


  // --------------------------------Users--------------------------
  app.get("/users", async(req,res)=>{
    const result = await UsersCollection.find().toArray();
    res.send({result});
});

app.post('/users', async(req,res)=>{
  const user = req.body;
  // cheaking user 
  const query = {email:user.email}
  const ExistingUser = await UsersCollection.findOne(query);
  if(ExistingUser){
    return res.send({message: 'user Already Exists',insertedId: null})
  }
  const result = await UsersCollection.insertOne(user);
  res.send(result);
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