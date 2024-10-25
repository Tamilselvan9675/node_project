const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Book = require('../models/Book');
const User = require('../models/User');

const router = express.Router();

// Task 1: Get the book list available in the shop
router.get('/books', async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Task 2: Get the books based on ISBN
router.get('/books/:isbn', async (req, res) => {
    try {
        const book = await Book.findOne({ isbn: req.params.isbn });
        if (!book) return res.status(404).json({ message: 'Book not found' });
        res.json(book);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Task 3: Get all books by Author
router.get('/books/author/:author', async (req, res) => {
    try {
        const books = await Book.find({ author: req.params.author });
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Task 4: Get all books based on Title
router.get('/books/title/:title', async (req, res) => {
    try {
        const books = await Book.find({ title: req.params.title });
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Task 5: Get book Review
router.get('/books/:isbn/review', async (req, res) => {
    try {
        const book = await Book.findOne({ isbn: req.params.isbn });
        if (!book) return res.status(404).json({ message: 'Book not found' });
        res.json(book.reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Task 6: Register New user
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Task 7: Login as a Registered user
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token });
});

// Task 8: Add/Modify a book review (only for registered users)
router.post('/books/:isbn/review', async (req, res) => {
    const { token } = req.headers;
    const { review } = req.body;

    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const book = await Book.findOne({ isbn: req.params.isbn });

        if (!book) return res.status(404).json({ message: 'Book not found' });

        const existingReview = book.reviews.find(r => r.user === decoded.id);

        if (existingReview) {
            existingReview.review = review; // Modify existing review
        } else {
            book.reviews.push({ user: decoded.id, review }); // Add new review
        }

        await book.save();
        res.json({ message: 'Review added/modified successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Task 9: Delete book review added by that particular user
router.delete('/books/:isbn/review', async (req, res) => {
    const { token } = req.headers;

    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const book = await Book.findOne({ isbn: req.params.isbn });

        if (!book) return res.status(404).json({ message: 'Book not found' });

        book.reviews = book.reviews.filter(r => r.user !== decoded.id);
        await book.save();
        res.json({ message: 'Review deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
