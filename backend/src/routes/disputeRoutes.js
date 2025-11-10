const express = require('express');
const router = express.Router();
const disputeController = require('../controllers/disputeController');
const { authenticate } = require('../middleware/auth');

// All dispute routes require authentication
router.use(authenticate);

router.post('/', disputeController.createDispute);
router.get('/my-disputes', disputeController.getMyDisputes);
router.get('/:disputeId', disputeController.getDispute);
router.post('/:disputeId/message', disputeController.addDisputeMessage);
router.post('/:disputeId/close', disputeController.closeDispute);

module.exports = router;
