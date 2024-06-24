const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

// Middleware
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
        await client.connect();

        // ----------------------------All Collection Names------------------------
        const CategoriesCollection = client.db('ShoppingZone').collection('Categories');
        const FlashSaleCollection = client.db('ShoppingZone').collection('FlashSale');
        const UsersCollection = client.db('ShoppingZone').collection('users');
        const CartCollection = client.db('ShoppingZone').collection('Cart');
        const BuyOrdersCollection = client.db('ShoppingZone').collection('buy');

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

        // ----------------------------Cart--------------------------
        app.post('/cart', async (req, res) => {
            const cartItem = req.body;
            const result = await CartCollection.insertOne(cartItem);
            res.send(result);
        });

        // ----------------------------Orders--------------------------
        app.post('/buy', async (req, res) => {
            const order = req.body;
            const result = await BuyOrdersCollection.insertOne(order);
            res.send(result);
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
