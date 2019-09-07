# Shopping Cart 만들기
1. Intro & Setup
  * express generator
  * 링크 : <https://expressjs.com/ko/starter/generator.html>
  * 설치방법
  ```
  npm install express-generator -g
  ```
  * set up express project
  ```
  express shopping-cart --hbs
  ```
    * hbs란? Express handlebars template engine with multiple layouts, blocks and cached partials.
  * install all dependencies required to the project, and start(localhost:3000)
  ```
  cd shopping-cart
  npm install
  SET DEBUG=shopping-cart:* & npm start
  ```
  * bootstrap, jquery 링크 복사
2. Product Index View
  * bootstrap navbar 링크 : <https://getbootstrap.com/docs/4.3/components/navbar/>
  * handlebar 설치
  ```
  npm install --save express-handlebars
  ```
  ```
  //app.js
  const expressHsb = require("express-handlebars");
  // view engine setup
  app.engine('.hbs', expressHbs({defaultLayout: 'layout', extname: '.hbs'}));
  app.set('view engine', '.hbs');
  ```
  * header.hbs가 layout.hbs body안에 띄우기
  ```
  //layout.hbs
  <body>
    {{> header}}
  </body>
  ```
  * icon(font awesome)
  ```
  //css 추가
  <link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN" crossorigin="anonymous">
  //쇼핑 카트 아이콘 추가
  <i class="fa fa-shopping-cart" aria-hidden="true"></i>
  ```
3. MongoDB & Mongoose Setup
  * add Mongoose, shopping이라는 데이터베이스에 연결(shopping 데이터베이스는 mongodb에서 저절로 생성)
  ```
  const mongoose = require("mongoose");
  mongoose.connect('localhost:27017/shopping');
  ```
4. Seeding Product Data
  * models/products.js
  ```
  const mongoose = require("mongoose");
  const Schema = mongoose.Schema;
  const schema = new Schema({
    imagePath: {type: String, required: true},
    title: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true}
  });
  module.exports = mongoose.model("Product", schema);
  ```
  * seed/product-seeder.js, 처음 한 번만 데이터를 넣기 위해 실행(node seed/product-seeder.js)
  ```
  const Product = require("../models/product");
  const mongoose = require("mongoose");
  //
  mongoose.connect('mongodb://localhost:27017/shopping');
  //
  const products = [
    new Product({
      imagePath: "http://file3.instiz.net/data/file3/2018/10/19/e/5/8/e583e1cee7c85c54046ad7a09807d383.jpg",
      title: "Computa",
      description: "Awesome!!!",
      price: 10
    })
  ];
  //각 product를 shopping에 저장, 비동기 실행(각각의 task(함수)를 큐에 적재해두고 순서대로 처리하기 때문에)에서 마지막 save가 끝난 후 콜백함수에서 실행
  //동기 실행일 때는 for문 뒤에 disconnect하면 된다.
  for(let i = 0;i<products.length;i++){
    products[i].save(function(err, result){
      if(i === products.length - 1) {
        quitMongo();
      }
    });
  }
  const quitMongo = () => mongoose.disconnect();
  ```
  * mongoDB에서 삽입된 데이터 확인 방법
  ```
  //mongo.exe에서 실행
  //shopping database 사용
  use shopping
  //products들을 찾음
  db.products.find()
  ```
  * js 비동기 실행 이해
  ```
  //js의 asynchronous실행 방식 이해하기
  //함수를 만나면 실행시키지말고 그 때마다 큐에 task저장(+js의 캡처 규칙에 의해 이 때 프리미티브 타입 값들도 저장됨)
  //함수빼고 끝까지 실행시키면 큐에서 하나꺼내 끝까지 실행
  //반복
  //before for, after for, 0out, 1out, 2out, ... , 0in, 2in, 1in, ...
  console.log("before for");
  for(let i = 0;i<products.length;i++){
    console.log(i + "out")
    products[i].save(function(err, result){
      console.log(i + "in");
      if(i === products.length - 1) {
        quitMongo();
      }
    });
  }
  console.log("after for");
  const quitMongo = () => {
    mongoose.disconnect();
  };
  ```

5. Output Product Data
  * routes/index.js
  ```
  const Product = require("../models/product");
  //router.get의 콜백함수 안에 작성
  //asynchronous한 걸 고려한 코드
  Product.find((err, res2) => {
    const productChunks = [];
    const chunkSize = 4;
    for(let i = 0;i<res2.length;i += chunkSize) {
      productChunks.push(res2.slice(i, i+chunkSize));
    }
    res.render("shop/index", { title: "Shopping Cart", products: productChunks});
  });
  ```
  * views/shop/index.hbs
  ```
<!-- 각 products(productCunks) 원소별로 loop를 돌림-->
{{# each products}}
<div class="row">
  <!-- 각 row에 속하는 array의 원소별(총 4개)로 loop를 돌림-->
  {{# each this}}
  <div class="col-sm-6 col-md-4 col-lg-3">
    <div class="card" style="width: 230px;">
      <img src="{{this.imagePath}}"
        class="card-img-top" alt="...">
      <div class="card-body">
        <h5 class="card-title">{{this.title}}</h5>
        <p class="card-text">{{this.description}}</p>
        <div class="clearfix">
          <div class="price pull-left">${{this.price}}</div>
          <a href="#" class="btn btn-success pull-right">Add to Cart</a>
        </div>
      </div>
    </div>
  </div>
  {{/each}}
</div>
{{/each}}
```

6. Sign Up View, CSRF Protection & User Model
  * views/user/signup.hbs
  ```
<div class="row">
    <div class="col-md-4 col-md-offset-4">
        <h1>Sign Up</h1>
        Validation Errors
        <form action="/user/signup" method="POST">
            <div class="form-group">
                <label for="email">E-Mail</label>
                <input type="text" id="email" name="email" class="form-control">
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" class="form-control">
            </div>
            <input type="hidden" name="_csrf" value="{{csrfToken}}">
            <button type="submit" class="btn btn-primary">Sign Up</button>
        </form>
    </div>
</div>
  ```
  * models/user.js
  ```
//user schema생성
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
    email: {type: String, required: true},
    password: {tyoe: String, required: true}
});
module.exports = mongoose.model("User", userSchema);
  ```
  * routes/index.js
  ```
const csrf = require("csurf");
const csrfProtection = csrf();
router.use(csrfProtection);
//csrfToken이 같은 세션?임을 보장
router.get("/user/signup", (req, res, next) => {
  res.render("user/signup", {csrfToken: req.csrfToken()});
});
router.post("/user/signup", (req, res, next) => {
  res.redirect('/');
});
  ```
  * app.js
  ```
const session = require("express-session");
app.use(session({secret: "mysupersecret", resave: false, saveUninitialized: false}));
  ```
7. User Sign Up with Passport
  * 설치할 것 : passport, passport-local(facebook, twitter 등 다양한 종류가 있음), connect-flash, bcrypt-nodejs
  * app.js
  ```
const passport = require("passport");
const flash = require("connect-flash");
//
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
// 한 번만 실행
require("./config/passport");
  ```
  * config/passport.js
  ```
const passport = require("passport");
const User = require("../models/user");
const LocalStrategy = require("passport-local").Strategy;
passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});
passport.use("local.signup", new LocalStrategy({
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true
},(req, email, password, done) => {
    req.checkBody("email", "Invalid email").notEmpty().isEmail();
    req.checkBody("password", "Invalid password").notEmpty().isLength({min:4});
    const errors = req.validationErrors();
    if(errors) {
        const messages = [];
        errors.forEach((error) => {
            messages.push(error.msg);
        });
        return done(null, false, req.flash("error", messages));
    }
    User.findOne({"email": email}, (err, user)=> {
        if(err) {
            return done(err);
        }
        if(user) {
            return done(null, false, {message: "Email is already in use."});
        }
        const newUser = new User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.save((err, result)=>{
            if(err) {
                return done(err);
            }
            return done(null, newUser);
        });
    });
}));
  ```
  * models/user.js
  ```
const bcrypt = require("bcrypt-nodejs");
//method를 정의할 때 arrow function을 쓰면 여기서 this가 global object를 가리키기 때문에 일반함수 사용
userSchema.methods.encryptPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};
  ```
  * routes/index.js
  ```
const passport = require("passport");
//기존의 router.get(/user/signup)의 두번째 인자 수정함
router.get("/user/signup", (req, res, next) => {
  const messages = req.flash("error");
  res.render("user/signup", {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});
//기존의 router.post(/user/signup)의 두번째 인자 교체함
router.post("/user/signup", passport.authenticate("local.signup", {
  //user폴더 기준
  successRedirect: "profile",
  failureRedirect: "signup",
  failureFlash: true
}));
// /profile 라우팅
router.get("/user/profile", (req, res, next) => {
  res.render("user/profile")
})
  ```
  * views/user/profile.hbs
  ```
  <h1>User Profile</h1>
  ```
  * views/user/signup.hbs
  ```
  <!-- form위에 validation error자리에 넣음 -->
        {{#if hasErrors}}
            <div class="alert alert-danger">
                {{# each messages}}
                    <p>{{this}}</p>
                {{/each}}
            </div>
        {{/if}}
  ```
8. Validation
  * express-validator 설치(2.20.5버전, 최근에는 사용법이 달라짐)
  * app.js
  ```
const validator = require("express-validator");
//app.use(express.urlencoded({ extended: false }));
app.use(validator()); //body가 parse한 후에 실행되어야 함
  ```
  * routes/index.js에서 passport.authenticate()를 쓰기 때문에 passport.js에서 validation을 해야 함
  * config/passport.js
  ```
  passport.use("local.signup", new LocalStrategy({
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true
},(req, email, password, done) => {
    //추가된 부분
    //email이 비어있지는 않은지, email형식인지 체크하고 에러가 나면 에러메시지 출력
    req.checkBody("email", "Invalid email").notEmpty().isEmail();
    //password이 비어있지는 않은지, 최소길이가 4인지 체크하고 에러가 나면 에러메시지 출력
    req.checkBody("password", "Invalid password").notEmpty().isLength({min:4});
    const errors = req.validationErrors();
    if(errors) {
        const messages = [];
        errors.forEach((error) => {
            messages.push(error.msg);
        });
        return done(null, false, req.flash("error", messages));
    }
    //
    User.findOne({"email": email}, (err, user)=> {
      ...
    });
}));
  ```
9. Sign in
  * config/passport.js
  ```
passport.use("local.signin", new LocalStrategy({
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true
}, (req, email, password, done) => {
    req.checkBody("email", "Invalid email").notEmpty().isEmail();
    req.checkBody("password", "Invalid password").notEmpty();
    const errors = req.validationErrors();
    if(errors) {
        const messages = [];
        errors.forEach((error) => {
            messages.push(error.msg);
        });
        return done(null, false, req.flash("error", messages));
    }
    User.findOne({"email": email}, (err, user)=> {
        if(err) {
            return done(err);
        }
        if(!user) {
            return done(null, false, {message: "No user found."});
        }
        if(!user.validPassword(password)){
            return done(null, false, {message: "Wrong password."})
        }
        return done(null, user);
    });
}));
  ```
  * routes/index.js
  ```
router.get("/user/signin", (req, res, next) => {
  const messages = req.flash("error");
  res.render("user/signin", {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});
router.post("/user/signin", passport.authenticate("local.signin", {
  successRedirect: "profile",
  failureRedirect: "signin",
  failureFlash: true
}));
  ```
  * views/user/signin.hbs signup내용 복사
  ```
  <div class="row">
    <div class="col-md-4 col-md-offset-4">
        <h1>Sign In</h1>
        {{#if hasErrors}}
            <div class="alert alert-danger">
                {{# each messages}}
                    <p>{{this}}</p>
                {{/each}}
            </div>
        {{/if}}
        <form action="/user/signin" method="POST">
            <div class="form-group">
                <label for="email">E-Mail</label>
                <input type="text" id="email" name="email" class="form-control">
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" class="form-control">
            </div>
            <input type="hidden" name="_csrf" value="{{csrfToken}}">
            <button type="submit" class="btn btn-primary">Sign In</button>
        </form>
    </div>
</div>
  ```
10. Route Protection & Grouping
  * 
-------------------------------
<http://www.naver.com>
![Alt text](https://camo.githubusercontent.com/202c9ae1d457d6109be6c4cf13db9cac5fd708a6/687474703a2f2f6366696c65362e75662e746973746f72792e636f6d2f696d6167652f32343236453634363534334339423435333243374230 "alt title")
