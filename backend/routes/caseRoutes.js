const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getCases, getCaseById, createCase, updateCase, deleteCase } = require('../controllers/caseController');

const router = express.Router();
router.use(authMiddleware);

router.get('/', getCases);
router.get('/:id', getCaseById);
router.post('/', createCase);
router.put('/:id', updateCase);
router.delete('/:id', deleteCase);

module.exports = router;
