
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Sample book details
let books = [
    {
        id: 1,
        title: "The Alchemist",
        author: "Paulo Coelho",
        price: 350
    },
    {
        id: 2,
        title: "Wings of Fire",
        author: "A.P.J. Abdul Kalam",
        price: 250
    },
    {
        id: 3,
        title: "Harry Potter",
        author: "J.K. Rowling",
        price: 450
    }
];

let nextId = 4;

// GET - Retrieve all books
app.get('/books', (req, res) => {
    res.json(books);
});

// GET - Retrieve book by ID
app.get('/books/:id', (req, res) => {
    const id = Number(req.params.id);
    const book = books.find(b => b.id === id);

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    res.json(book);
});

// POST - Add a new book
app.post('/books', (req, res) => {
    const { title, author, price } = req.body;

    if (!title || !author || price === undefined ||
        !Number.isFinite(Number(price)) || Number(price) < 0) {
        return res.status(400).json({
            message: "Invalid book details"
        });
    }

    const newBook = {
        id: nextId++,
        title: title.trim(),
        author: author.trim(),
        price: Number(price)
    };

    books.push(newBook);

    res.status(201).json({
        message: "Book added successfully",
        book: newBook
    });
});

// POST - Update book details
app.post('/books/:id', (req, res) => {
    const id = Number(req.params.id);
    const book = books.find(b => b.id === id);

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    const { title, author, price } = req.body;

    if (
        (title !== undefined &&
            (typeof title !== 'string' || !title.trim())) ||
        (author !== undefined &&
            (typeof author !== 'string' || !author.trim())) ||
        (price !== undefined &&
            (!Number.isFinite(Number(price)) || Number(price) < 0))
    ) {
        return res.status(400).json({
            message: "Invalid book details"
        });
    }

    if (title !== undefined) book.title = title.trim();
    if (author !== undefined) book.author = author.trim();
    if (price !== undefined) book.price = Number(price);

    res.json({
        message: "Book updated successfully",
        book
    });
});

// DELETE - Delete book
app.delete('/books/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = books.findIndex(b => b.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    const deletedBook = books.splice(index, 1)[0];

    res.json({
        message: "Book deleted successfully",
        book: deletedBook
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400) {
        return res.status(400).json({
            message: "Invalid JSON data"
        });
    }

    res.status(500).json({
        message: "Internal server error"
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
