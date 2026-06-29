const { OrdersModel } = require("./model/OrdersModel");


export const newOrder = async (req, res) => {
  try {
    const { name, qty, price, mode } = req.body;

    await OrdersModel.create({
      userId: req.user._id,
      name,
      qty,
      price,
      mode,
    });

    if (mode === "BUY") {
      const holding = await HoldingModel.findOne({
        userId: req.user._id,
        name,
      });

      if (holding) {
        const totalCost =
          holding.qty * holding.avg + qty * price;

        const totalQty = holding.qty + qty;

        holding.avg = totalCost / totalQty;
        holding.qty = totalQty;
        holding.price = price;

        await holding.save();
      } else {
        await HoldingModel.create({
          userId: req.user._id,
          name,
          qty,
          avg: price,
          price,
          net: "0%",
          day: "0%",
        });
      }
    } else if (mode === "SELL") {
      const holding = await HoldingModel.findOne({
        userId: req.user._id,
        name,
      });

      if (!holding) {
        return res.status(400).json({
          message: "Holding not found",
        });
      }

      if (holding.qty < qty) {
        return res.status(400).json({
          message: "Insufficient quantity",
        });
      }

      holding.qty -= qty;

      if (holding.qty === 0) {
        await HoldingModel.deleteOne({
          _id: holding._id,
        });
      } else {
        await holding.save();
      }
    }

    res.json({
      success: true,
      message: "Order saved",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

export const orders = async (req,res)=>{
   const id = req.user._id
  let allorders = await OrdersModel.find({userId : id});
  res.json(allorders);
} 