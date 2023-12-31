const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());
console.log(process.env.DB_PASSWORD);


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rdjlwie.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const ToysCollection = client.db('toyShop').collection('addToy');

        const indexKeys = { ToyName: 1 };
        const indexOptions = { name: "Toyname" };

        const result = await ToysCollection.createIndex(indexKeys, indexOptions);


        app.get("/toySearch/:text", async (req, res) => {
            const searchText = req.params.text;

            const result = await ToysCollection.find({
                $or: [
                    { ToyName: { $regex: searchText, $options: "i" } },
                ],
            }).toArray()
            res.send(result);



        })

        //ADDTOYS
        app.get('/toys', async (req, res) => {
            console.log(req.query.email);
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await ToysCollection.find(query).toArray();
            res.send(result);

        });
        app.post('/toys', async (req, res) => {
            const addToy = req.body;
            console.log(addToy);
            const result = await ToysCollection.insertOne(addToy);
            res.send(result);

        });

        app.delete('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await ToysCollection.deleteOne(query);
            res.send(result);

        })

        app.patch('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedToy = req.body;
            console.log(updatedToy);
            const updateToy = {
                $set: {
                    status: updatedToy.status
                },
            };
            const result = await ToysCollection.updateOne(filter, updateToy);
            res.send(result);

        })

        app.get('/alltoys', async (req, res) => {
            const result = await ToysCollection.find({}).limit(20).toArray();

            res.send(result);
        })



        app.get("/alltoys/:id", async (req, res) => {
            console.log(req.params.id);
            const result = await ToysCollection.findOne({
                _id: new ObjectId(req.params.id),
            });
            res.send(result);
        })

        app.get('/mytoys', async (req, res) => {
            const result = await ToysCollection.find({}).toArray();
            res.send(result);
        })

        app.get('/mytoys/:id', async (req, res) => {
            console.log(req.params.id);
            const result = await ToysCollection.findOne({
                _id: new ObjectId(req.params.id),
            });
            res.send(result);

        })

        app.put('/mytoys/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updateToys = req.body;
            const Toys = {
                $set: {
                    ToyPrice: updateToys.price,
                    quantity: updateToys.quantity,
                    bio: updateToys.bio
                }
            }
            const result = await ToysCollection.updateOne(filter, Toys, options);
            res.send(result);
        })
        app.get('/mytoys', async (req, res) => {
            console.log(req.query.email);
            let query = {};
            // let sortDirection = -1;
            if (req.query?.email) {
                query = { email: req.query.email }
                // const sort = req?.query?.sort == 'true' ? 1: -1;
            }
            if (req.query?.sort == 'true') {
                sortDirection = 1;
            }
            const result = await ToysCollection.find(query).sort({ "ToyPrice": sortDirection }).toArray();
            res.send(result);
        });
        app.delete('/mytoys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await ToysCollection.deleteOne(query);
            res.send(result);

        })









        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('server is runnig')

})
app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})