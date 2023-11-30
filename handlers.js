import {
    API_BASE_URL,
    update_book_details,
    get_book_by_id,
    fetch_books,
    compare_strings
} from './helper.js';


/**
 * Check whether the title and author of the new book (or of an edited one) coincide with another book.
 * If yes, return false, indicating the cancellation of the CRUD operation, otherwise allow.
 * @param {object} app_context 
 * @param {string} new_title 
 * @param {string} new_author 
 * @returns 
 */
function check_book_duplicates(app_context, new_title, new_author, curr_book_id = null) {
    console.log("ENTER: app_context.all_books: " + JSON.stringify(app_context.all_books));

    for (const book of app_context.all_books) {
        console.log("curr_book_id: ", curr_book_id, ", book.id: ", book.id);
        console.log("curr_book_id: ", typeof curr_book_id, ", book.id: ", typeof book.id);
        if (curr_book_id && curr_book_id === book.id) {
            // Editing book
            console.log("ENTER 1");
            if (compare_strings(book.Title, new_title) && compare_strings(book.Author, new_author)) {
                // Title and author are the same
                console.log("ENTER 2");
                return true;
            }
            // else: CHECK IF ANOTHER BOOKS EXISTS WITH SAME TITLE AND AUTHOR
            console.log("ENTER 3");
        }
        else if (compare_strings(book.Title, new_title) && compare_strings(book.Author, new_author)) {
            console.log("ENTER 4");
            return false
        }
    }


    return true;
}


/**
 * Retrieve the data from the compiled form and invoke a POST operation to
 * push the new book.
 * TODO: Lacks of sanitization and input correctness check.
 * @param {object} app_context 
 */
export function add_book_handler(app_context) {
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const year = document.getElementById('year').value;
    const price = document.getElementById('price').value;

    if (check_book_duplicates(app_context, title, author)) {    // Use Fetch API to make a POST request to the server.
        fetch(API_BASE_URL + "books", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, author, year, price }),
        }) // Retrieve the books again to keep the list updated.
            .then(() => {
                fetch_books(app_context, true);
                return true;
            })
            .catch(error => {
                console.error('Error:', error);
                return undefined;
            });
        return true;
    }
    else {
        return false;
    }
}


/**
 * Start the submit of the edited book informaton.First retrieve such information
 * from the form, then start the update/PUT, and eventually refresh the books.
 * @param {object} app_context 
 */
export function edit_submit_handler(app_context) {

    if (check_book_duplicates(app_context, edit_title.value, edit_author.value, parseInt(edited_book_id.value))) {

        const book = get_book_by_id(app_context.books, app_context.selected_book_id);

        // Update the book details in the main list
        book.Title = edit_title.value;
        book.Author = edit_author.value;
        book.Year = edit_year.value;
        book.Price = edit_price.value;

        // Update the book details in the database
        update_book_details(
            app_context.selected_book_id,
            {
                title: edit_title.value,
                author: edit_author.value,
                year: edit_year.value,
                price: edit_price.value,
            }
        ).then(response => {
            if (response.ok) {
                fetch_books(app_context, true); // Refresh the book list after updating
                // Close the modal
                edit_book_modal.style = 'display: none !important;';
                return true;
            }
            else {
                console.error('Failed to update book details.');
                return undefined;
            }
        })
            .catch(error => console.error('UPDATE ERROR:', error));

    }
    else
        return false;
}


export function sort_table(column_index) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("books_list");
    switching = true;
    dir = "asc";

    while (switching) {
        switching = false;
        rows = table.rows;

        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;

            x = rows[i].getElementsByTagName("td")[column_index];
            y = rows[i + 1].getElementsByTagName("td")[column_index];

            if (dir === "asc") {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            } else if (dir === "desc") {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            }
        }

        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount++;
        } else {
            if (switchcount === 0 && dir === "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }

    // Aggiorna le classi per mostrare l'indicatore di ordinamento corrente
    var headers = document.querySelectorAll(".sortable");
    headers.forEach(function (header) {
        header.classList.remove("asc", "desc");
    });
    var currentHeader = headers[column_index];
    currentHeader.classList.add(dir);
}