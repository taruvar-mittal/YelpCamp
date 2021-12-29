const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp-v2',{
    useNewUrlParser : true,
    useUnifiedTopology : true
});

const app = express();

const db = mongoose.connection;
db.on('error',console.error.bind(console,'Mongo connection error!'));
db.once('open', () => {
    console.log('Mongo database connected');
})

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req,res) => {
    res.render('Home');
})

app.get('/newCampground' , async (req,res) => {
    const camp = new Campground({title:'My backyard', description:'Cheap camping!!'})
    await camp.save();
    res.send(camp);
})

app.listen(3000,() => {
    console.log('Server listening on port 3000');
})