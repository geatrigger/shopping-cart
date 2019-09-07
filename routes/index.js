var express = require('express');
var router = express.Router();
const Product = require("../models/product");
const csrf = require("csurf");
const passport = require("passport");

const csrfProtection = csrf();
router.use(csrfProtection);

/* GET home page. */
router.get('/', function(req, res, next) {
  //synchronous하다는 가정하의 코드
  /*
  const products = Product.find();
  res.render('shop/index', { title: 'Shopping Cart', products: products });
  */
  //asynchronous한 걸 고려한 코드
  Product.find((err, res2) => {
    const productChunks = [];
    const chunkSize = 4;
    for(let i = 0;i<res2.length;i += chunkSize) {
      productChunks.push(res2.slice(i, i+chunkSize));
    }
    res.render("shop/index", { title: "Shopping Cart", products: productChunks});
  });
});

router.get("/user/signup", (req, res, next) => {
  const messages = req.flash("error");
  res.render("user/signup", {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post("/user/signup", passport.authenticate("local.signup", {
  //user폴더 기준
  successRedirect: "profile",
  failureRedirect: "signup",
  failureFlash: true
}));

router.get("/user/profile", (req, res, next) => {
  res.render("user/profile")
});

router.get("/user/signin", (req, res, next) => {
  const messages = req.flash("error");
  res.render("user/signin", {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post("/user/signin", passport.authenticate("local.signin", {
  successRedirect: "profile",
  failureRedirect: "signin",
  failureFlash: true
}));

module.exports = router;
