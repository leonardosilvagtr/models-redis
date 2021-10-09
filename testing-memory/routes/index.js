const express = require ('express');
const router = express.Router();
const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.applicationDefault()
});

const db = admin.firestore();

const redis = require('redis');

const REDISHOST = process.env.REDISHOST || 'localhost';
const REDISPORT = process.env.REDISPORT || 6379;

const client = redis.createClient(REDISPORT, REDISHOST);
client.on('error', err => console.error('ERR:REDIS:', err));

router.get('/memory/all', (req, res) =>{
    console.log(req.headers.host.split(':')[0])
    res.send('Serviço de dados...'+req.headers.host.split(':')[0])
});

router.get('/memory/get', async (req, res) =>{
    const usersRef = db.collection('users')

    const snapshot = await usersRef.get()

    if(snapshot.empty){
        return res.status(400).json({ err: "No permissions to show!" });
    }

    var users = new Object()
    snapshot.forEach(doc =>{
        users[doc.id] = doc.data()
    })

    res.json(users)
});

router.get('/memory/redis/test', async (req, res) =>{

    client.incr('visits', (err, reply) => {
        if (err) {
          console.log(err);
          res.status(500).send(err.message);
          return;
        }
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(`Visitor number: ${reply}\n`);
    });

});

router.get('/memory/redis/set/:idClient', async (req, res) =>{

    const idClient = req.params.idClient

    // await client.connect();

    let cliente = await client.get(idClient, (err, reply) => {
        if (err) throw err;
        res.json(reply);
    });

    console.log(cliente)

    if (!cliente) {
        console.log("Data returned by database!")

        const usersRef = db.collection('users').doc(idClient)

        const doc = await usersRef.get()

        await client.set(idClient, JSON.stringify(doc.data()));

        res.json(doc.data())
    }
    // else{
    //     console.log("Data returned by redis!")
    //     res.json(JSON.parse(cliente))
    // }

});

module.exports = router; 