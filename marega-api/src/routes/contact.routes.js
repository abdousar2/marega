const express = require("express");

const {
    createContactRequest
} = require(
    "../controllers/contactRequest.controller"
);


const router = express.Router();


router.post(
    "/",
    createContactRequest
);


module.exports = router;