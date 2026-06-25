require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const { User } = require("./model/UserModel");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const express_session = require("express-session");

// ---------
const { HoldingModel } = require("./model/HoldingsModel");
const { PositionModel } = require("./model/PositionsModel");
const bodyParser = require("body-parser");
const cors = require("cors");
const { OrdersModel } = require("./model/OrdersModel");

// ---------

const PORT = process.env.PORT || 5405;
const URL = process.env.MONGO_URL;

// ---------
// app.use(cors())
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(bodyParser.json());
// ---------

mongoose
  .connect(URL)
  .then(() => console.log("Connected"))
  .catch((err) => console.log(err));

// --------------------------------------------------
app.use(express.urlencoded({ extended: true }));
app.use(
  express_session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy({ usernameField: "email" }, User.authenticate()),
);
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// --------------------------------------------------
// ==middleware==============================

const isloggedIn=((req,res,next)=>{
  if(req.isAuthenticated()){
    return next();
  }
  return res.status(401).json({
    success :false,
    message : "Unauthorized or bad request"
  })
})



// ==========================================

app.get("/me",(req,res)=>{
  if(req.isAuthenticated()){
    res.json({
      loggedIn : true,
      user : {
        name: req.user.name,
      email: req.user.email,
      }
    })
  }
  else{
    res.json({
      loggedIn : false
    })
  }
})


app.get("/allHoldings",isloggedIn, async (req, res) => {
  const id = req.user._id
  let allHoldings = await HoldingModel.find({userId : id});
  res.json(allHoldings);
});

app.get("/allPositons",isloggedIn, async (req, res) => {
  const id = req.user._id
  let allPositons = await PositionModel.find({userId : id});
  res.json(allPositons);
});

app.post("/newOrder", isloggedIn, async (req, res) => {
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
});

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const newUser = new User({
      name: name.trim(),
      email: email.trim(),
    });

    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Login failed after signup",
        });
      }

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
          id: registeredUser._id,
          name: registeredUser.name,
          email: registeredUser.email,
        },
      });
    });
  } catch (err) {
    console.error("Signup Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
});

app.post("/login", (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Login failed",
          });
        }

        return res.json({
          success: true,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
          },
        });
      });
    })(req, res, next);
  } catch (err) {
    console.error("Login Error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});
app.get("/orders",isloggedIn,async (req,res)=>{
   const id = req.user._id
  let allorders = await OrdersModel.find({userId : id});
  res.json(allorders);
})

app.post("/logout", (req, res) => {

  req.logout((err) => {

    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }

    req.session.destroy((err) => {

      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      res.clearCookie("connect.sid");

      res.json({
        success: true
      });

    });

  });

});


app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});


// ================================================

app.listen(5405, () => {
  console.log("listing at port http://localhost:5405");
});
