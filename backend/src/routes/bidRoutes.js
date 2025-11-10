const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bidController');
const { authenticate } = require('../middleware/auth');

// All bid routes require authentication
router.use(authenticate);

router.post('/', bidController.createBid);
router.get('/my-bids', bidController.getMyBids);
router.get('/task/:taskId', bidController.getTaskBids);
router.put('/:id', bidController.updateBid);
router.post('/:id/accept', bidController.acceptBid);
router.post('/:id/withdraw', bidController.withdrawBid);

module.exports = router;
