const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
const Schema = mongoose.Schema;
mongoose.plugin(slug);

const Course = new Schema({
    name: {type: String, unique: true},
    des: {type: String},
    img: {type: String,},
    teacher: {type: String},
    level: {type: String},
    learnd: {type: String},
    value: {type: Number, default: 0},
    status: {type: String},
    slug: {type: String, slug: 'name', unique: true}
  },{
    timestamps: true
  });

module.exports = mongoose.model('Course', Course);