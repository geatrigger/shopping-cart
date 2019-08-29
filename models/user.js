const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {type: String, required: true},
    password: {tyoe: String, required: true}
});

module.exports = mongoose.model("User", userSchema);