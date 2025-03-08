const express = require('express');
const { createClient, getAllClients, getClientById, updateClient } = require('../controllers');
const router = express.Router();

router.post('/', createClient);
router.get('/', getAllClients);
router.get('/:idClient', getClientById);
router.put('/:idClient', updateClient);

module.exports = router;