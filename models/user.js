const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt-nodejs");

const userSchema = new Schema({
    email: {type: String, required: true},
    password: {type: String, required: true}
});
//method를 정의할 때 arrow function을 쓰면 여기서 this가 global object를 가리키기 때문에 일반함수 사용
userSchema.methods.encryptPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};
module.exports = mongoose.model("User", userSchema);