const mongoose = require('mongoose')
const Campground = require('../models/campground')
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers')
const axios = require('axios')

mongoose.connect('mongodb://localhost:27017/yelp-camp-v2',{
    useNewUrlParser : true,
    useUnifiedTopology : true
})

const db = mongoose.connection;
db.on('error',console.error.bind(console,'mongo connection error'));
db.once('open', () => {
    console.log('mongo database connected')
})

const sample = array => array[Math.floor(Math.random()*array.length)];


async function seedImg() {
    try {
      const resp = await axios.get('https://api.unsplash.com/photos/random', {
        params: {
          client_id: 'Imvi7PbQVIRLCyIkwYLGuF9GAP6Ui3S3nz75aSbkpXc',
          collections: 1114848,
        },
      })
      return resp.data.urls.small
    } catch (err) {
      console.error(err)
    }
  }

const seedDB = async () => {
    await Campground.deleteMany();
    
    for(let i=0;i<20;i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            title : `${sample(descriptors)} ${sample(places)}`,
            location : `${cities[random1000].city}, ${cities[random1000].state}`,
            image : await seedImg(),
            price,
            description : 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ratione nostrum dolores facere! Dolore eveniet molestiae omnis laborum adipisci tenetur, reprehenderit corporis aliquid, excepturi voluptatibus alias deserunt ab debitis ullam quaerat ipsa cupiditate sunt, aperiam veritatis. Iusto dignissimos sint voluptate numquam, sed inventore, totam expedita possimus tempora perspiciatis accusantium, sequi consequatur!'
        })
        await camp.save();
    }
    
}

seedDB().then(() => {
    mongoose.connection.close();
})




