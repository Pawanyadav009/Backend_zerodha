const { PositionModel } = require("../model/PositionsModel");

export const allPositons = async (req, res) => {
  const id = req.user._id
  let allPositons = await PositionModel.find({userId : id});
  res.json(allPositons);
}