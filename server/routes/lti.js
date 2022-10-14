//Copyright 2022 under MIT License
const bodyParser = require('body-parser');
const express = require('express');
const lti = require('ims-lti');
const path = require('path');

const router = express.Router();

router.get('/', (req, res, next) => {
    console.log("made it inside get");
})


/* Handles a POST request from the LTI consumer, in this case Canvas */
router.post('/', (req, res, next) => {
    //creates an LTI provider object with the hardcoded key and secret
    const provider = new lti.Provider('Codekey', 'Keysecret');

    //sets the requests encrypted connection property to true since the app is running through a proxy
    req.connection.encrypted = true;
    provider.valid_request(req, (err, isValid) => {
        //if the request is invalid, the console logs an error, else it returns a message to the LTI provider
        if (!isValid) {
            console.log("request was not valid");
        }
        else {
            res.sendFile(path.join(__dirname, "../../../client/build/index.html"));
        }
    });
});

module.exports = router;
