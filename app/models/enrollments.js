const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EnrollmentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseSlug: { type: String, required: true },
  enrolledAt: { type: Date, default: Date.now }
},{
    timestamps: true
});

module.exports = mongoose.model('enrollment', EnrollmentSchema);
