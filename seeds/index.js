// This is our seeds file. It is not required in our main app, but this allows
// for us to add or change our database at anytime without having to manually do it. 
// we just call our seeds/index.js file and it will update if we ever make updates to campgrounds.

// Requires
const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground')

// path to connect to mongoDB through mongoose.
mongoose.connect('mongodb://localhost:27017/yelp-camp', {});

// Connections to our DB
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// gives us a random array of numbers for our title.
const sample = array => array[Math.floor(Math.random() * array.length)];

// creating our seed DB by looping through 50 times picking a random number that 
// works with the cities.js file and pulls in random cities. Then we randomize 
// the title of the campgrounds.
const seedDb = async () => {
    await Campground.deleteMany({});
    for(let i = 0; i < 50; i++) {
        const randNum = Math.floor(Math.random()*1000);
        const camp = new Campground({
            location: `${cities[randNum].city}, ${cities[randNum].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
        })
        await camp.save()
    }
}

seedDb().then(()=> {
    mongoose.connection.close(); // closes our connection after it is ran.
})