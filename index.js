const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zjf8o.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();
        console.log("connected");
        const database = client.db('ar-travels');
        const tourCollection = database.collection('tours');
        const ordersCollection = database.collection('orders');
        const reviewsCollection = database.collection('reviews');

        //Using get method
        app.get('/tours', async (req, res) => {
            const cursor = tourCollection.find({});
            const tours = await cursor.toArray();
            res.send(tours);
        });

        app.get('/tours/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const order = await tourCollection.findOne(query);
            res.json(order);
        })

        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });

        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        app.get('/orders/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: { $in: [`${email}`] } }
            const cursor = ordersCollection.find(query);
            const tours = await cursor.toArray();
            res.json(tours);
        });

        //Using post method
        app.post('/tours', async (req, res) => {
            const order = req.body;
            console.log('hit the post api', order);

            const result = await tourCollection.insertOne(order);
            res.json(result)
        });

        app.post('/orders', async (req, res) => {
            const order = req.body;
            console.log('hit the post api', order);

            const result = await ordersCollection.insertOne(order);
            res.json(result)
        });

        //Using update method
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updatedTour = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updatedTour.status
                },
            };
            const result = await ordersCollection.updateOne(filter, updateDoc, options)
            res.json(result)
        });

        //Using delete method
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        });

    }
    finally{
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.listen(port, () => {
    console.log('Server running at port', port);
})