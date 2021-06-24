const express = require('express');

const productController = require('../controllers/productController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(authController.protectRoute, productController.getAllProducts)
  .post(productController.createProduct);

router
  .route('/scanCode')
  .patch(authController.protectRoute, productController.scanBarCode);

router.route('/search').get(productController.getSpecificProduct);

router
  .route('/updatePointsAfterScan')
  .patch(authController.protectRoute, productController.updatePoints);

router
  .route('/:id')
  .get(productController.getProduct)
  .patch(productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router;
