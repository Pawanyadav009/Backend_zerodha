require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const { User } = require("./model/UserModel");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const express_session = require("express-session");
const { HoldingModel } = require("./model/HoldingsModel");
const { PositionModel } = require("./model/PositionsModel");
const bodyParser = require("body-parser");
const cors = require("cors");
const { OrdersModel } = require("./model/OrdersModel");
const { isloggedIn } = require("./middleWare");
const router = require("./Routes");

const PORT = process.env.PORT || 5405;
const URL = process.env.MONGO_URL;
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://zerodha-dashboard-ashy.vercel.app",
    ],
    credentials: true,
  }),
);
app.use(bodyParser.json());
// --------------------------------------------------
mongoose
  .connect(URL)
  .then(() => console.log("Connected"))
  .catch((err) => console.log(err));

// --------------------------------------------------
app.use(express.urlencoded({ extended: true }));

app.set("trust proxy", 1);

app.use(
  express_session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);
// ---------------------------------------------------
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy({ usernameField: "email" }, User.authenticate()),
);
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use("/", router);

// -------- all error handler --------
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});
// -----------------------------------
app.listen(5405, () => {
  console.log("listing at port http://localhost:5405");
});
