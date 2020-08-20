const express = require("express");

const reviewController = require("../controller/reviewController");
const authController = require("../controller/authController");

const router = express.Router();

router
  .route("/")
  .post(
    authController.protect,
    authController.restrictTo("user"),
    reviewController.createReview
  )
  .get(reviewController.getAllReview);

// router.post('/',reviewController.createReview)
// router.get('/',reviewController.getAllReview)

module.exports = router;
