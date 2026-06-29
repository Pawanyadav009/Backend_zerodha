import { PositionModel } from "../model/PositionsModel.js"

export const allPositons = async (req, res) => {
  const id = req.user._id
  let allPositons = await PositionModel.find({userId : id});
  res.json(allPositons);
}