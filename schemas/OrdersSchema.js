const { Schema } = require('mongoose');
const mongoose = require('mongoose');
const OrderSchema = new Schema({
    name : String,
    qty : Number,
    price : Number,
    mode : String,
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
        },
});

module.exports = {OrderSchema}