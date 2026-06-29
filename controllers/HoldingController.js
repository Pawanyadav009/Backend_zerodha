import { HoldingModel } from "../model/HoldingsModel.js"


export const allHoldings = async (req, res) => {
  const id = req.user._id
  let allHoldings = await HoldingModel.find({userId : id});
  res.json(allHoldings);
}