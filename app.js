const express = require('express');
const http = require("http");
const https = require("https");
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const pe = require('parse-error')
const config = require('./config/config')
//mongoose.set('useCreateIndex', true)
const models = require('./models')
const app = express()
const { addSocketIO } = require('./services/socket.service')

const PORT = config.port

app.use(cors())

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.get('/', (req, res) => {
  return res.json({
    message: 'Rest-API CURD operation for contacts (users), and Login module',
  })
});

const v1 = require('./routes/v1');
app.use('/v1', v1)

const server = http.createServer(app);

addSocketIO(server);

const { socket } = require('./services/socket.service');
const { encodeBase64 } = require('bcryptjs');

server.listen(PORT, (error) => {
  error
    ? console.log(error)
    : console.log(`Server is listening on port ${PORT}`);
});