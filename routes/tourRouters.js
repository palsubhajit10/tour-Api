const express = require('express')
const router = express.Router()

const tourController = require('../controller/tourController')
const authController=require('../controller/authController')

router.get('/top-5-cheapTour',tourController.aliasTopTours,tourController.getAllTours)
router.get('/tour-stats',tourController.getTourStats)
router.get('/monthly-plan/:year',tourController.getMonthlyPlan)

router.route('/')
    .get(authController.protect,tourController.getAllTours)
    .post(tourController.createTour)

router.route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(
        authController.protect,
        authController.restrictTo('admin','lead-guide'),
        tourController.deleteTour
        )

module.exports = router