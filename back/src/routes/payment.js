const express = require('express');
const { createPayment, getPaymentsByIdClient, getAllPayments, getPaymentsByLeaseId } = require('../controllers');
const router = express.Router();

router.post('/', createPayment);
router.get('/:leaseId', getPaymentsByLeaseId);
router.get('/:idClient', getPaymentsByIdClient);
router.get('/', getAllPayments);


module.exports = router;