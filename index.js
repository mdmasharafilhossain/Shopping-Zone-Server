const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json());
// ShoppingZone
// SgM2JANdl7nZyuzW

app.get('/',(req,res)=>{
    res.send('Shopping Server Running Successfully');
});

app.listen(port,()=>{
    console.log(`Shopping Server Running at Port ${port}`)
});