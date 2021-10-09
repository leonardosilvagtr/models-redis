const express = require ('express');
const app = express (); 

app.use('/', require('./routes/index.js'))

app.listen (8080, () => console.log('server running...')); //In the server GCP is used port 8080