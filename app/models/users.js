const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user = new Schema({
    fullname: {type: String},
    email: {type: String, unique: true},
    password: {type: String},
    role: {type: String, default: 'user'},
    avt: {type: String, default: 'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png'}
  },{
    timestamps: true
  });

module.exports = mongoose.model('User', user);