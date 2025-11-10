const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

// All payment routes require authentication
router.use(auth);

// Create and manage escrow
router.post('/escrow', paymentController.createEscrow);
router.post('/:transactionId/confirm', paymentController.confirmEscrow);
router.post('/:transactionId/release', paymentController.releasePayment);
router.post('/:transactionId/refund', paymentController.refundPayment);

// Get transactions
router.get('/transactions', paymentController.getUserTransactions);
router.get('/transactions/:transactionId', paymentController.getTransaction);
router.get('/task/:taskId/transaction', paymentController.getTaskTransaction);
router.get('/stats', paymentController.getPaymentStats);

module.exports = router;
