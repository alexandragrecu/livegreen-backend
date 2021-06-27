const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router
  .get('/user-data', authController.protectRoute, userController.getUser)
  .get('/', userController.getAllUsers);

router.patch(
  '/validatePoints',
  authController.protectRoute,
  authController.restrictTo('admin'),
  userController.validatePoints
);

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.get('/rewards', authController.protectRoute, userController.getRewards);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword', authController.resetPassword);

router.patch(
  '/updatePassword',
  authController.protectRoute,
  authController.updatePassword
);

router.patch(
  '/updateMyData',
  authController.protectRoute,
  userController.updateMyData
);

router.delete(
  '/deleteAccount',
  authController.protectRoute,
  userController.deleteAccount
);

module.exports = router;
