const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

// Adding passport-local-mongoose to give us authen features.
UserSchema.plugin(passportLocalMongoose); // This adds on to our schema a username and field for password. This also gives us additional methods

module.exports = mongoose.model('User', UserSchema);