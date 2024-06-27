const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


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
        // await client.connect();

        // ----------------------------All Collection Names------------------------
        const CategoriesCollection = client.db('ShoppingZone').collection('Categories');
        const FlashSaleCollection = client.db('ShoppingZone').collection('FlashSale');
        const UsersCollection = client.db('ShoppingZone').collection('users');
        const CartCollection = client.db('ShoppingZone').collection('Cart');
        const BuyOrdersCollection = client.db('ShoppingZone').collection('buy');
        const WhiteListCollection = client.db('ShoppingZone').collection('whiteList');
        const AllProductsCollection = client.db('ShoppingZone').collection('AllProducts');
        const SellerCollection = client.db('ShoppingZone').collection('seller');
        const UserPaymentCollection = client.db('ShoppingZone').collection('payment');

        // -------------------------------- Categories----------------------
        app.get("/categories", async (req, res) => {
            const result = await CategoriesCollection.find().toArray();
            res.send({ result });
        });

        // ----------------------------Flash Sale-----------------------------------
        app.get("/flashSale", async (req, res) => {
            const sort = req.query.sort || '';
            const color = req.query.color || '';
            const type = req.query.type || '';
            console.log(color);

            let filterOption = {};
            console.log(sort);
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
        app.get("/users", async (req, res) => {
            const result = await UsersCollection.find().toArray();
            res.send({ result });
        });

        app.get('/users/profile/:email', async (req, res) => {
            const email = req.params.email;
            const result = await UsersCollection.find({ email }).toArray();
            res.send(result);
        });
        app.get("/users/pagination", async (req, res) => {
            const query = req.query;
            const page = query.page;
            console.log(page);
            const pageNumber = parseInt(page);
            const perPage = 10;
            const skip = pageNumber * perPage;
            const users = UsersCollection.find().skip(skip).limit(perPage);
            const result = await users.toArray();
            const UsersCount = await UsersCollection.countDocuments();
            res.send({ result, UsersCount });
          });

        app.post('/users', async (req, res) => {
            const user = req.body;
            // Checking user
            const query = { email: user.email };
            const ExistingUser = await UsersCollection.findOne(query);
            if (ExistingUser) {
                return res.send({ message: 'user Already Exists', insertedId: null });
            }
            const result = await UsersCollection.insertOne(user);
            res.send(result);
        });

        // Patch Operation
        app.patch('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = {
                $set: {
                    name: user.name,
                    number: user.number,
                    address: user.address,
                    birthday_date: user.birthday_date,
                    gender: user.gender
                },
            };
            const result = await UsersCollection.updateOne(filter, updateDoc);
            res.send(result);
        });
        //   Pagination Operation
        app.get("/users/pagination", async (req, res) => {
            const query = req.query;
            const page = query.page;
            console.log(page);
            const pageNumber = parseInt(page);
            const perPage = 10;
            const skip = pageNumber * perPage;
            const users = UsersCollection.find().skip(skip).limit(perPage);
            const result = await users.toArray();
            const UsersCount = await UsersCollection.countDocuments();
            res.send({ result, UsersCount });
          });
      
          // Make Admin to User
          app.patch("/users/admin/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const UpdatedDoc = {
              $set: {
                role: "admin",
              },
             };
            const result = await UsersCollection.updateOne(filter, UpdatedDoc);
            res.send(result);
          });
            // remove admin
    app.patch("/users/remove-admin/:id", async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const UpdatedDoc = {
          $unset: {
            role: "",
          },
        };
        const result = await UsersCollection.updateOne(filter, UpdatedDoc);
        res.send(result);
      });
  
      // Delete User
      app.delete("/users/customers/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await UsersCollection.deleteOne(query);
        res.send(result);
      });

        // ----------------------------Cart--------------------------
        app.get("/cart/user/:customer_email", async (req, res) => {
            const customer_email = req.params.customer_email;
            const result = await CartCollection.find({ customer_email }).toArray();
            res.send(result);
        });
        app.post('/cart', async (req, res) => {
            const cartItem = req.body;
            const result = await CartCollection.insertOne(cartItem);
            res.send(result);
        });

        app.delete('/cart/user/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await CartCollection.deleteOne(query);
            res.send(result);
         });


        // ----------------------------Orders--------------------------
        app.get("/buy", async (req, res) => {
          const result = await BuyOrdersCollection.find().toArray();
          res.send(result);
        });
         app.post('/buy', async (req, res) => {
            const order = req.body;
            const result = await BuyOrdersCollection.insertOne(order);
            res.send(result);
        });
// --------------White List Collection---------------

app.get("/whiteList/user/:customer_email", async (req, res) => {
    const customer_email = req.params.customer_email;
    const result = await WhiteListCollection.find({ customer_email }).toArray();
    res.send(result);
});

app.post('/whiteList', async (req, res) => {
    const whiteListItem = req.body;
    const { customer_email, productCode } = whiteListItem;
    const query = { customer_email, productCode };
    const ExistingItem = await WhiteListCollection.findOne(query);
    
    if (ExistingItem) {
        return res.send({ message: 'Item already exists in the whitelist', insertedId: null });
    }
    
    const result = await WhiteListCollection.insertOne(whiteListItem);
    res.send(result);
});
app.delete('/whiteList/user/:id', async(req,res)=>{
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const result = await WhiteListCollection.deleteOne(query);
    res.send(result);
 });

//----------------------------------AllProductsCollection------------------------
app.get("/allProducts", async (req, res) => {
    const result = await AllProductsCollection.find().toArray();
    res.send(result);
});
app.get("/allProducts/user/:seller_email", async (req, res) => {
    const seller_email = req.params.seller_email;
    const result = await WhiteListCollection.find({ seller_email }).toArray();
    res.send(result);
});
app.delete('/allProducts/user/:id', async(req,res)=>{
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const result = await AllProductsCollection.deleteOne(query);
    res.send(result);
 });
 app.post('/allProducts', async (req, res) => {
    const cartItem = req.body;
    const result = await AllProductsCollection.insertOne(cartItem);
    res.send(result);
});

// --------------------Seller Info------------------------
app.post('/sellers', async (req, res) => {
    const user = req.body;
    // Checking seller
    const query = { email: user.email };
    const ExistingUser = await SellerCollection.findOne(query);
    if (ExistingUser) {
        return res.send({ message: 'Seller Already Exists', insertedId: null });
    }
    const result = await SellerCollection.insertOne(user);
    res.send(result);
});

// ------------------Stripe Payment--------------------

    //Payment Intent
     app.post("/create-payment-intent", async (req, res) => {
        const { price } = req.body;
        const amount = parseInt(price * 100);
        console.log(amount);
  
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: "usd",
          payment_method_types: ["card"],
        });
  
        res.send({
          clientSecret: paymentIntent.client_secret,
        });
      });
  
      app.get("/payments", async (req, res) => {
        const result = await UserPaymentCollection.find().toArray();
        res.send(result);
      });
      app.get("/payments", async (req, res) => {
        const cursor = UserPaymentCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      });
  
      app.post("/payments", async (req, res) => {
        const payment = req.body;
        const paymentResult = UserPaymentCollection.insertOne(payment);
        res.send(paymentResult);
      });


    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Shopping Server Running Successfully');
});

app.listen(port, () => {
    console.log(`Shopping Server Running at Port ${port}`);
});
