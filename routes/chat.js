const express = require('express');
const router = express.Router();

router.get('/', (req, res) =>{
    res.render('pages/admin-chat')
})

router.get('/user', (req, res) =>{
    const user = req.session.account;
    res.render('pages/user-chat', {
        user
    })
})


module.exports = router;
