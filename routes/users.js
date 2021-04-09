const express = require('express');
const User = require('./../models/User');
const router = express.Router();

router.get('/', (request, response) => {
    User.find({}).exec(function (err, users) {
        response.send(users);
    });
});

module.exports = userRouter;