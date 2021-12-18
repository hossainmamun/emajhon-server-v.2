const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()
const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1ssjj.mongodb.net/${process.env.EmaJhonStore}?retryWrites=true&w=majority`;

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    res.send('hello world')
})
// mongodb connection
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const productCollection = client.db(process.env.DB_NAME).collection(process.env.DB_SUB_NAME);
    const ordersCollection = client.db(process.env.DB_NAME).collection(process.env.DB_SUB_NAME2);

    // get method [load data from mongodb]
    app.get('/products', (req, res) => {
        productCollection.find({})
            .toArray((err, document) => {
                res.send(document)
            })
    })
    // get method [load single product by key]
    app.get('/product/:key', (req, res) => {
        productCollection.find({ key: req.params.key })
            .toArray((err, document) => {
                res.send(document[0])
            })
    })
    // post method [load all products by keys]
    app.post('/productsByKeys', (req, res) => {
        const products = req.body
        productCollection.find({ key: { $in: products } })
            .toArray((err, document) => {
                res.send(document)
            })
    })
    // post method [post data to mongodb]
    app.post('/addProduct', (req, res) => {
        const product = req.body
        productCollection.insertMany(product)
            .then(result => {
                console.log(result)
                res.send(result)
            })
    })
    // post method [post order to database form client side shipment]
    app.post('/orders', (req, res) => {
        const order = req.body
        ordersCollection.insertOne(order)
        .then(result => {
            res.send(result)
        })
    })
    console.log('database connect')
});

// ---- port connection -----
const port = process.env.PORT ||  4444;
app.listen(port, () => {
    console.log(`port listen ${port}`)
})