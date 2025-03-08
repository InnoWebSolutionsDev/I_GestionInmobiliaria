const express = require('express');
const { createLease, getLeasesByIdClient, getAllLeases, terminateLease, savePdf } = require('../controllers');
const router = express.Router();

// Add logging middleware
router.use((req, res, next) => {
    console.log('Lease Route:', {
        method: req.method,
        path: req.path,
        body: req.body
    });
    next();
});

// POST route for creating a new lease
router.post('/', createLease);
router.post('/savePdf', savePdf);
// GET routes
router.get('/client/:idClient', getLeasesByIdClient);
router.get('/all', getAllLeases);
router.put('/:leaseId/terminate', terminateLease); // Changed to PUT for terminating

module.exports = router;