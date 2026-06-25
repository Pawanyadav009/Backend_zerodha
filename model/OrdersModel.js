
const {model} = require('mongoose')

const {OrderSchema}= require('../schemas/OrdersSchema')

const OrdersModel = new model('order', OrderSchema);
module.exports = {OrdersModel}