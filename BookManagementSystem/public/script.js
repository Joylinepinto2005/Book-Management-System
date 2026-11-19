
const bookForm = document.getElementById('bookForm');
const bookList = document.getElementById('bookList');
const message = document.getElementById('message');

const bookId = document.getElementById('bookId');
const title = document.getElementById('title');
const author = document.getElementById('author');
const price = document.getElementById('price');

const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');

// Display success and error messages
function showMessage(text, type) {
    message.textContent = text;
    message.className = type;

    setTimeout(() => {
        message.textContent = '';
        message.className = '';
    }, 3000);
}

// Fetch API helper
async function apiRequest(url, options = {}) {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Request failed');
    }

    return data;
}

// Display all books
async function loadBooks() {
    try {
        const books = await apiRequest('/books');
        displayBooks(books);
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Display books dynamically
function displayBooks(books) {
    bookList.replaceChildren();

    if (books.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');

        cell.colSpan = 5;
        cell.textContent = 'No books available';

        row.appendChild(cell);
        bookList.appendChild(row);
        return;
    }

    books.forEach(book => {
        const row = document.createElement('tr');

        const idCell = document.createElement('td');
        idCell.textContent = book.id;

        const titleCell = document.createElement('td');
        titleCell.textContent = book.title;

        const authorCell = document.createElement('td');
        authorCell.textContent = book.author;

        const priceCell = document.createElement('td');
        priceCell.textContent = '₹' + book.price;

        const actionCell = document.createElement('td');

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'edit-btn';

        editButton.onclick = () => editBook(book);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-btn';

        deleteButton.onclick = () => deleteBook(book.id);

        actionCell.append(editButton, deleteButton);

        row.append(
            idCell,
            titleCell,
            authorCell,
            priceCell,
            actionCell
        );

        bookList.appendChild(row);
    });
}

// Add and update books
bookForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const bookData = {
        title: title.value.trim(),
        author: author.value.trim(),
        price: Number(price.value)
    };

    if (!bookData.title || !bookData.author ||
        price.value.trim() === '' ||
        !Number.isFinite(bookData.price) ||
        bookData.price < 0) {
        showMessage('Please enter valid book details', 'error');
        return;
    }

    try {
        let result;

        if (bookId.value) {
            result = await apiRequest(`/books/${bookId.value}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookData)
            });
        } else {
            result = await apiRequest('/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookData)
            });
        }

        showMessage(result.message, 'success');

        bookForm.reset();
        resetForm();
        loadBooks();

    } catch (error) {
        showMessage(error.message, 'error');
    }
});

// Edit book
function editBook(book) {
    bookId.value = book.id;
    title.value = book.title;
    author.value = book.author;
    price.value = book.price;

    document.getElementById('formTitle').textContent =
        'Update Book Details';

    submitBtn.textContent = 'Update Book';
    cancelBtn.hidden = false;

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Reset form
function resetForm() {
    bookId.value = '';

    document.getElementById('formTitle').textContent =
        'Add New Book';

    submitBtn.textContent = 'Add Book';
    cancelBtn.hidden = true;
}

// Cancel update
cancelBtn.addEventListener('click', () => {
    bookForm.reset();
    resetForm();
});

// Delete book
async function deleteBook(id) {
    if (!confirm('Are you sure you want to delete this book?')) {
        return;
    }

    try {
        const result = await apiRequest(`/books/${id}`, {
            method: 'DELETE'
        });

        showMessage(result.message, 'success');
        loadBooks();

    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Search book by ID
document.getElementById('searchBtn')
.addEventListener('click', async () => {

    const id = document.getElementById('searchId').value;

    if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
        showMessage('Enter a valid book ID', 'error');
        return;
    }

    try {
        const book = await apiRequest(`/books/${id}`);

        displayBooks([book]);
        showMessage('Book found successfully', 'success');

    } catch (error) {
        displayBooks([]);
        showMessage(error.message, 'error');
    }
});

// Show all books
document.getElementById('showAllBtn')
.addEventListener('click', () => {
    document.getElementById('searchId').value = '';
    loadBooks();
});

// Load books when page opens
loadBooks();
