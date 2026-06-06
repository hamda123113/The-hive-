const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getRoles, createRole, deleteRole } = require('../controllers/roleController');

const router = express.Router();
router.use(authMiddleware);

router.get('/', getRoles);
router.post('/', createRole);
router.delete('/:id', deleteRole);

module.exports = router;
