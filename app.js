const express = require('express');
const app = express();
const path = require('path');
const spawn = require('child_process').spawn;
const mongoose = require('mongoose');
var bodyParser = require('body-parser');
var fs = require('fs');
const fetch = require('node-fetch');
const axios = require('axios');
var cors = require('cors');
var sys = require('util');

app.use(cors());

let db = null;

mongoose.connect('mongodb://localhost/dmproject', (err, database) => {
    if (err) {
        throw err;
    } else {
        db = database;
        console.log("Connected to Database");
        // app.listen(3000);
    }
});

app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, '/views'));

//ROUTES

//Initial Route
app.get('/', (req, res) => {
    console.log("first page");
    // res.render('explore');
    res.redirect('/processdata');
});

// processdata route
app.get('/processdata', (req, res) => {
    var process = spawn('python', [path.join(__dirname, 'processdata.py')]);


    process.stdout.on('data', (data) =>{
        console.log(`1: ${data}`);
    });

    process.on('close',  (code) => {
        // console.log("code: "+code)
        var jsondata = fs.readFile('dataset.json', async (err, data) => {
            var collection = db.collection('twitterdata');
            await collection.deleteMany({})
            await collection.insertMany(JSON.parse(data), (err, docs) => {
                collection.countDocuments(function (err, count) {
                    res.redirect('/tweets');
                });
            });
        });
    });

    
});

//Explore route
app.get('/tweets',  async (req, res) => {
    var collection = db.collection('twitterdata');
    var process = spawn('python', [path.join(__dirname, 'parallelprocessing.py')]);
    // //  console.log(process);

    // process.on('error', (err) =>{
    //     console.log(`3: ${err}`);
    // });

    // process.stdout.on('data', (data) =>{
    //     console.log(`2: ${data}`);
    // });

    // process.on('exit', (code) =>{
    //     console.log(`4: ${code}`);
    // });

  

     process.on('close', async ()=>{
        await collection.find({}).toArray(function(err,docs){

            res.render('viewing', {tweets: docs});
            // res.redirect('/file');
        });
     })
 

});

app.get('/tweets/:id', async (req,res) => {
    var id = String(req.params.id);
    var collection = db.collection('twitterdata');
  
    const tweet = await collection.find({_id: mongoose.Types.ObjectId(id)}).toArray((err,docs) => {
        res.render("show", {tweet: docs});
    });
});

app.get('/file', (req,res) => {
    const file = `${__dirname}/languages.txt`;
    res.download(file);
});

// Port to listen 
app.listen(3000, () => {
    console.log("App is listening on port 3000")
});