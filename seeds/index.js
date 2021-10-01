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
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '6154a61cdbf811f9f693663f',
            location: `${cities[randNum].city}, ${cities[randNum].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Officia a nam nisi dolores nemo nesciunt ea voluptates dolore consequuntur temporibus nulla, facilis illum ipsum fugiat est similique numquam expedita. Impedit.',
            price,
            geometry: {
               type: "Point", 
               coordinates: [
                  cities[randNum].longitude, 
                  cities[randNum].latitude
                ]
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/dhupzqyiq/image/upload/v1633029658/YelpCamp/IMG_1231_mkcnyh.jpg',
                  filename: 'YelpCamp/IMG_1231_mkcnyh'
                },
                {
                  url: 'https://res.cloudinary.com/dhupzqyiq/image/upload/v1633029659/YelpCamp/IMG_3313_pxqesa.jpg',
                  filename: 'YelpCamp/IMG_3313_pxqesa'
                }
              ],
            
        })
        await camp.save()
    }
}

seedDb().then(()=> {
    mongoose.connection.close(); // closes our connection after it is ran.
})