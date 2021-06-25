const express = require('express');

const offerController = require('../controllers/offerController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(authController.protectRoute, offerController.getOffers)
  .post(offerController.createOffer);

router.route('/search').get(offerController.getSpecificOffer);

router
  .route('/:id')
  .get(authController.protectRoute, offerController.getOffer)
  .patch(
    authController.protectRoute,
    authController.restrictTo('admin'),
    offerController.updateOffer
  )
  .delete(
    authController.protectRoute,
    authController.restrictTo('admin'),
    offerController.deleteOffer
  );

module.exports = router;
