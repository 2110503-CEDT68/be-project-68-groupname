'use strict';

const express = require('express');

const {
    getBooks,
    getBook,
    addBook,
    updateBook,
    deleteBook
} = require('../controllers/books');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

router.route('/')
    .get(protect, getBooks)
    .post(protect, authorize('admin', 'user'), addBook);

router.route('/:id')
    .get(protect, getBook)
    .put(protect, authorize('admin', 'user'), updateBook)
    .delete(protect, authorize('admin', 'user'), deleteBook);

module.exports = router;