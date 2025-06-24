// Import the routes
const home = require('./home');
const course = require('./course');
const user = require('./user')
const comment = require('./comment')
const payment = require('./payment')



function router(app) {
  // Use the routes
    app.use('/', home);
    app.use('/course' , course);
    app.use('/user', user);
    app.use('/comment', comment);
    app.use('/payment', payment);
}


module.exports = router;