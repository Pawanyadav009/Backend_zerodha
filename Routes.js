const express = require('express')
const passport = require("passport");
const {isloggedIn} = require("./middleWare")
const router = express.Router();
// ---------------------------------------------------------------------
const {me,signup,logout,login} = require('./controllers/UserController')
const {allHoldings} = require('./controllers/HoldingController')
const {allPositons} = require('./controllers/PositionsController')
const {newOrder,orders} = require('./controllers/Ordercontroller')

router.get("/me",me)
router.get("/allHoldings",isloggedIn, allHoldings);

router.get("/allPositons",isloggedIn,allPositons);

router.post("/newOrder", isloggedIn, newOrder);

router.get("/orders",isloggedIn,orders)

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);


module.exports = router;