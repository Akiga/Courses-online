const mongoose = require('mongoose');
// slug = require('mongoose-slug-updater');
const Schema = mongoose.Schema;
// mongoose.plugin(slug);

const videoSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  title: String,
  description: String,
  videoUrl: String,
  order: { type: Number},
  duration: Number
});

module.exports = mongoose.model('video', videoSchema);