const express = require('express');

const {getbooks, getbook, addbook, updatebook, deletebook} = require('../controllers/books');

const router = express.Router({mergeParams: true});

const {protect, authorize} = require('../middleware/auth');

router.route('/')
    .get(protect, getbooks)
    .post(protect, authorize('admin', 'user'), addbook);
router.route('/:id')
    .get(protect, getbook)
    .put(protect, authorize('admin', 'user'), updatebook)
    .delete(protect, authorize('admin', 'user'), deletebook);

module.exports = router;