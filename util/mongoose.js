module.exports = {
    multipleMongooseToObject: function (mongooses) {
    return mongooses.map(m => m.toObject());
    },

    mongooseToObject: function (mongoose) {
        return mongoose ? mongoose.toObject(): mongoose
    }
}