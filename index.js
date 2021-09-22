// Requires
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Campground = require('./models/campground');
const methodOverride = require('method-override');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

// View Engines
app.engine('ejs', ejsMate); // an engine to use to run EJS. 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// This is to make sure that express will actually parse any post requests sent back.
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

// Home page
app.get('/', (req, res) => {
    res.render('home');
});

// index page from campgrounds
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
});

// *********************************************************
//              CRUD Structure for Campgrounds
// *********************************************************

// Creat Form
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
});

// Create 
app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
});

// Read
app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground });
});

// Update Form
app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground })
});

// Update
app.put('/campgrounds/:id', async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, {new: true});
    res.redirect(`/campgrounds/${campground._id}`);
});

// Delete
app.delete('/campgrounds/:id', async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
});

// App listening
app.listen(3000, ()=>{
    console.log("Serving on port 3000");
});