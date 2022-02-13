const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const colors = require('colors');
const cors = require('cors');

// parsing .env file
dotenv.config()

// creating server instance
const app = express()

// const __dirname = path.resolve();

app.use(express.json()); // parsing body
app.use('/api', cors()); // Enabling CORS for all /api routes

// server routes go here
app.use('/css', express.static(path.join(__dirname, '../client/public/css')));
app.use('/img', express.static(path.join(__dirname, '../client/public/img')));
app.use('/js', express.static(path.join(__dirname, '../client/public/js')));
app.use('/env', express.static(path.join(__dirname, '../env')));
app.use('/token', express.static(path.join(__dirname, '../build/contracts/Token.json')));

app.set('views', path.join(__dirname, '../client/views'))
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    res.render('index.ejs', { NODE_ENV: process.env.NODE_ENV });
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));