const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    user: {
        type:mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    campground: {
        type:mongoose.Schema.ObjectId,
        ref: 'Campground',
        required: true
    },
    createAt: {
        type:Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Book', BookSchema);