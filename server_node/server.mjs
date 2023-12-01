// @author: Jurgen Gurakuqi.
// ? To run the server use "node server.js"
import express from 'express';
import cors from 'cors';
import mysql from 'mysql';
import child_process from 'child_process';
// Non-module imports.
// const express = require('express');
// const cors = require('cors');

const app = express();

// Set up server to listen on a specific port.
// const PORT = process.env.PORT || 3000;
const PORT = 3000
const HOST = '0.0.0.0'; // This allows external access

app.use(cors());
app.use(express.json());

app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});

/**
 * Using a fine-tuned BERT model perform a Zero-shot sentiment classification over
 * the given string. 
 * @param {string} text_to_classify 
 * @returns 
 */
function run_inference(text_to_classify) {
    const command = `python tuned_model_interface.py "${text_to_classify}"`;
    try {
        const result = child_process.execSync(command, { encoding: 'utf-8' });
        return result.trim();
    } catch (error) {
        console.error('Error during script execution:', error.message);
        return 'Error during inference';
    }
}


const reviews_value_dict = {
    "very bad": 1,
    "slightly bad": 2,
    "mixed": 3,
    "slightly good": 4,
    "very good": 5
};


// Connect to the DB
// ! Required credentials.
// !  -- 'root' in case of generic user.

// ? Multi connection 
const connection_pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mysql'
})


connection_pool.getConnection((err) => {
    if (err)
        throw err;
    else
        console.log('Connected to the MySQL server.');
});

console.log("--Init completed--\n");

// Define API calls to the DB


// CRUD POST to insert a new books.
app.post('/books', (req, res) => {
    // console.log("INSERT Book");
    const { title, author, year, price } = req.body;

    // Ensure all required fields are provided
    if (!title || !author || !year || !price) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // console.log("INSERTING BOOK: YEAR: " + year);

    // Insert the new book into the 'books' table
    const query = 'INSERT INTO books (Title, Author, Year, Price) VALUES (?, ?, ?, ?)';

    connection_pool.getConnection((err, connection) => {
        if (err) {
            throw err;
        }

        connection.query(query, [title, author, year, price], (error, results, fields) => {
            connection.release();
            if (error) {
                console.error('Error inserting book:', error.message);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            return res.status(201).json({ message: 'Book successfully added.' });
        });
    });

});



// CRUD GET to retrieve all books.
app.get('/books', (req, res) => {
    // console.log("GET Books");
    // Retrieve all books from the 'books' table
    const query = 'SELECT * FROM books';


    connection_pool.getConnection((err, connection) => {
        if (err) {
            throw err;
        }

        connection.query(query, (error, results, fields) => {
            connection.release();
            if (error) {
                console.error('Error retrieving books:', error.message);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            // Retrieved books
            // console.log('result: ' + JSON.stringify(results));
            return res.status(200).json(results);
        });
    });
});

// app.use((req, res, next) => {
//     console.log('Received request:', req.method, req.url);
//     next();
// });

// CRUD GET to retrieve book details by ID
app.get('/books/:id', (req, res) => {
    const bookId = req.params.id;
    // console.log("RETRIEVED BOOK: " + bookId);

    // Query the database to retrieve book details by ID
    const query = 'SELECT Title, Author, Price, Year FROM books WHERE id = ?';

    connection_pool.getConnection((err, connection) => {
        if (err) {
            throw err;
        }

        connection.query(query, [bookId], (error, results, fields) => {
            connection.release();
            if (error) {
                console.error('Error fetching book details:', error.message);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Book not found' });
            }

            const bookDetails = results[0];
            return res.status(200).json(bookDetails);
        });
    });
});

// CRUD DELETE for books.
app.delete('/books/:id', (req, res) => {
    const bookId = req.params.id;

    if (!bookId) {
        return res.status(400).json({ error: 'Book ID is required for deletion.' });
    }

    // Perform the delete operation in the database
    const query = 'DELETE FROM books WHERE id = ?';

    connection_pool.getConnection((err, connection) => {
        if (err) {
            throw err;
        }

        connection.query(query, [bookId], (error, results, fields) => {
            connection.release();
            if (error) {
                console.error('Error deleting book:', error.message);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (results.affectedRows > 0) {
                return res.status(200).json({ message: 'Book deleted successfully.' });
            } else {
                return res.status(404).json({ error: 'Book not found.' });
            }
        });
    });


});



// CRUD UPDATE for Books.
app.put('/books/:id', (req, res) => {
    const bookId = req.params.id;
    const { title, author, year, price } = req.body;

    // Ensure all required fields are provided
    if (!title || !author || !year || !price) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Update the details of the book in the 'books' table
    const query = 'UPDATE books SET Title = ?, Author = ?, Year = ?, Price = ? WHERE id = ?';

    connection_pool.getConnection((err, connection) => {
        if (err) {
            throw err;
        }

        connection.query(query, [title, author, year, price, bookId], (error, results, fields) => {
            connection.release();
            // console.log("UPDATE: " + query + "\n" + [title, author, year, price, bookId]);
            if (error) {
                console.error('Error updating book:', error.message);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (results.affectedRows > 0) {
                return res.status(200).json({ message: 'Book details updated successfully.' });
            } else {
                return res.status(404).json({ error: 'Book not found.' });
            }
        });
    });

});



// * ----------------------------------------------------------------------------------------------------------------
// * ----------------------------------------------------------------------------------------------------------------
// *
// *                                           REVIEWS' CRUD SECTION    
// * 
// * ----------------------------------------------------------------------------------------------------------------
// * ----------------------------------------------------------------------------------------------------------------


// CRUD GET to retrieve all reviews related to a specific book.
app.get('/reviews/:bookId', (req, res) => {
    // console.log("GET Reviews for Book");

    const bookId = req.params.bookId;

    // console.log("REVIEWS::GET BY BOOK::bookId: " + bookId);

    // Retrieve all reviews for the specified book_id from the 'review' table
    const query = 'SELECT * FROM reviews WHERE book_id = ?';

    connection_pool.getConnection((err, connection) => {
        if (err) {
            throw err;
        }

        connection.query(query, [bookId], (error, results, fields) => {
            connection.release();
            if (error) {
                console.error('Error retrieving reviews:', error.message);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            // Retrieved reviews
            return res.status(200).json(results);
        });
    });



});



// CRUD POST to insert a new review related to a specific book.
app.post('/reviews', (req, res) => {  // Keep the route as /reviews
    // console.log("INSERT Review");

    const { book_id, title, description, rating } = req.body;

    // Ensure all required fields are provided
    if (!book_id || !description || !rating) {
        return res.status(400).json({ error: 'Book ID, title, description, and rating are required.' });
    }

    // Insert the new review into the 'review' table
    const query = 'INSERT INTO reviews (book_id, title, description, rating, ai_rating) VALUES (?, ?, ?, ?, ?)';

    const ai_rating = reviews_value_dict[run_inference(description)];

    connection_pool.getConnection((err, connection) => {
        if (err) {
            throw err;
        }

        connection.query(query, [book_id, title, description, rating, ai_rating], (error, results, fields) => {
            connection.release();
            if (error) {
                console.error('Error inserting review:', error.message);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            return res.status(201).json({ message: 'Review successfully added.' });
        });
    });


});



// CRUD DELETE to delete a specific review related to a books.
app.delete('/reviews/:reviewId', (req, res) => {
    const reviewId = req.params.reviewId;

    if (!reviewId) {
        return res.status(400).json({ error: 'Review ID is required for deletion.' });
    }

    // Perform the delete operation in the 'review' table
    const query = 'DELETE FROM reviews WHERE id = ?';

    connection_pool.getConnection((err, connection) => {
        if (err) {
            throw err;
        }

        connection.query(query, [reviewId], (error, results, fields) => {
            connection.release();
            if (error) {
                console.error('Error deleting review:', error.message);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (results.affectedRows > 0) {
                return res.status(200).json({ message: 'Review deleted successfully.' });
            } else {
                return res.status(404).json({ error: 'Review not found.' });
            }
        });
    });


});