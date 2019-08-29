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


-------------------------------
<http://www.naver.com>
![Alt text](https://camo.githubusercontent.com/202c9ae1d457d6109be6c4cf13db9cac5fd708a6/687474703a2f2f6366696c65362e75662e746973746f72792e636f6d2f696d6167652f32343236453634363534334339423435333243374230 "alt title")
