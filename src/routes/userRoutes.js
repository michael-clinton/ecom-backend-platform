const express = require('express');
const router = express.Router();
const { getUserById } = require('../controllers/userController'); // adjust path

router.get('/:id', getUserById);

module.exports = router;
