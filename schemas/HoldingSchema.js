const {Schema} = require('mongoose');
const mongoose = require('mongoose');
const HoldingSchema = new Schema({
    
    name: String,
    qty: Number,
    avg: Number,
    price: Number,
    net: String,
    day: String,
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
        },
})

module.exports = {HoldingSchema};