const mongoose = require('mongoose');

const brandsSchema = new mongoose.Schema({
    name : {type : String , required : true , unique : true },
    logo : {type : String}
})
module.exports = mongoose.model('Brand', brandsSchema);