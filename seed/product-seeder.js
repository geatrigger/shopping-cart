const Product = require("../models/product");
const mongoose = require("mongoose");

mongoose.connect('mongodb://localhost:27017/shopping');

const products = [
    new Product({
        imagePath: "http://file3.instiz.net/data/file3/2018/10/19/e/5/8/e583e1cee7c85c54046ad7a09807d383.jpg",
        title: "Computa",
        description: "Awesome!!!",
        price: 1
    }),
    new Product({
        imagePath: "http://file3.instiz.net/data/file3/2018/10/19/e/5/8/e583e1cee7c85c54046ad7a09807d383.jpg",
        title: "Computa",
        description: "Awesome!!!",
        price: 2
    }),
    new Product({
        imagePath: "http://file3.instiz.net/data/file3/2018/10/19/e/5/8/e583e1cee7c85c54046ad7a09807d383.jpg",
        title: "Computa",
        description: "Awesome!!!",
        price: 3
    }),
    new Product({
        imagePath: "http://file3.instiz.net/data/file3/2018/10/19/e/5/8/e583e1cee7c85c54046ad7a09807d383.jpg",
        title: "Computa",
        description: "Awesome!!!",
        price: 4
    }),
    new Product({
        imagePath: "http://file3.instiz.net/data/file3/2018/10/19/e/5/8/e583e1cee7c85c54046ad7a09807d383.jpg",
        title: "Computa",
        description: "Awesome!!!",
        price: 5
    })
];
/*
products.map((value, index) => {
    value.save((err, result) => {
        if(index === products.length - 1)
            quitMongo();
    });
});
*/

for(let i = 0;i<products.length;i++){
    products[i].save(function(err, result){
        if(i === products.length - 1) {
            quitMongo();
        }
    });
}

//js의 asynchronous실행 방식 이해하기
//함수를 만나면 실행시키지말고 그 때마다 큐에 문맥저장
//함수빼고 끝까지 실행시키면 큐에서 하나꺼내 끝까지 실행
//반복
/*
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
*/
console.log("after for");
const quitMongo = () => {
    //console.log("disconnected before");
    mongoose.disconnect();
    //console.log("disconnected");
};