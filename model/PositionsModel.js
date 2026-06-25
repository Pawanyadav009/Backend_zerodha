const {model} = require('mongoose')

const {PositionSchema} = require('../schemas/PositionsSchema');

const PositionModel = new model('Position',PositionSchema);

module.exports = {PositionModel};