// *********************************************************
//         Controller logic for Campgrounds route
// *********************************************************
// Requires
const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');

// *********************************************************
//              Show Campgrounds
// *********************************************************
module.exports.index = async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

// *********************************************************
//                 Create Campgrounds
// *********************************************************
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createCampground = async (req, res, next) => {
    // // Error if campground doesn't exist. Allows us to custimize our error message.
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename })); // makes an array of file names of images. And save it to campgrounds.
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

// *********************************************************
//                  Read Campgrounds
// *********************************************************
module.exports.readCampground = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if(!campground) {
        req.flash('error', 'Cannot find that campground!');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

// *********************************************************
//                  Update Campgrounds
// *********************************************************
module.exports.renderUpdateForm = async (req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground) {
        req.flash('error', 'Cannot find that campground!');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground })
}

module.exports.updateCampground = async (req, res, next) => {
    const {id} = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, {new: true}); // These can be refactored to not have two saves.
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));  // makes an array of file names of images.
    campground.images.push(...imgs); // spread operator into images array.
    await campground.save();
    // If we choose any pictures to delete
    if(req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename); // Deletes or destroys from cloudinary web storage
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } } ); // deletes from server the filename and URL.
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

// *********************************************************
//                  Delete Campgrounds
// *********************************************************
module.exports.deleteCampground = async (req, res, next) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted review!');
    res.redirect('/campgrounds');
}