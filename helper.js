
export const API_BASE_URL = 'http://192.168.1.177:3000/';
const DETAIL_PAGE_URL = 'details/index.html'

/**
 * Retrieve the books that matches the given Id, or undefined if not found.
 * @param {Array} books 
 * @param {number} bookId 
 * @returns book object or undefined
 */
export function get_book_by_id(books, bookId) {
    // Assuming 'books' is an array of books fetched from the server
    var parsed_book_id = parseInt(bookId, 10);
    return books.find(book => parseInt(book.id, 10) === parsed_book_id);
}


/**
 * Open the edit modal to edit the selected book's information.
 * @param {object} book 
 */
function open_edit_modal(book) {
    const edit_title = document.getElementById('edit_title');
    const edit_author = document.getElementById('edit_author');
    const edit_year = document.getElementById('edit_year');
    const edit_price = document.getElementById('edit_price');
    const edited_book_id = document.getElementById('edited_book_id');

    // Set the current book details in the modal
    edit_title.value = book.Title;
    edit_author.value = book.Author;
    edit_year.value = book.Year;
    edit_price.value = book.Price;
    edited_book_id.value = book.id;
    // Show the modal
    edit_book_modal.style = 'display: block !important;';
}


/**
 * Start the DELETE CRUD operation for the given book id.
 * @param {object} app_context 
 * @param {number} bookId 
 */
function delete_book_handler(app_context, bookId) {
    fetch(API_BASE_URL + 'books/' + bookId, {
        method: 'DELETE',
    })
        .then(response => {
            if (response.ok) {
                fetch_books(app_context, true); // Refresh the book list after deletion
            } else {
                console.error('Failed to delete book.');
            }
        })
        .catch(error => console.error('DELETE ERROR:', error));
}


/**
 * Check whether the first string includes the second one.
 * @param {string} main_string 
 * @param {string} search_string 
 * @returns True if the second string is included in the first one.
 */
function contains_string_ignoring_case(main_string, search_string) {

    return main_string.toLowerCase().includes(search_string);
}


export function compare_strings(str1, str2) {
    // console.log("COMPARING: " + str1 + " and " + str2);
    return str1.toLowerCase() === str2.toLowerCase();
}


/**
 * Filter away the books whose fields don't include the search_query.
 * @param {Array} books 
 * @param {string} search_query 
 * @returns The filtered array of books.
 */
function filter_by_search_query(books, search_query) {
    var filtered_books = [];
    books.forEach(book => {

        if (contains_string_ignoring_case(book.Title + "", search_query) ||
            contains_string_ignoring_case(book.Author + "", search_query) ||
            contains_string_ignoring_case(book.Price + "", search_query) ||
            contains_string_ignoring_case(book.Year + "", search_query)) {
            filtered_books.push(book);
        }
    });
    return filtered_books
}

/**
 * 
 * @param {object} app_context 
 */
export function fetch_books(app_context, db_modified) {
    // if (app_context.search_query)
    if (app_context.all_books === null || db_modified !== undefined) {
        // Books still not retrieved or delete performed.
        fetch(API_BASE_URL + "books/")
            .then(response => {
                return response.json();
            })
            .then(books => {
                // Display and store retrieved books.
                app_context.all_books = books;
                var filtered_books = filter_by_search_query(books, app_context.search_query);
                display_retrieved_books(app_context, filtered_books);
                app_context.books = filtered_books;
            })
            .catch(error => console.error('handler::fetch_books: ', error));
    }
    else {
        // Books already retrieved: just filter them.
        var filtered_books = filter_by_search_query(app_context.all_books, app_context.search_query);
        display_retrieved_books(app_context, filtered_books);
        app_context.books = filtered_books;
    }
}


/**
 * Start the edit operation by retrieving the selected book information and loading them on
 * the edit modal.
 * @param {object} app_context 
 * @param {number} book_id 
 */
function start_edit_handler(app_context, book_id) {
    const book = get_book_by_id(app_context.books, book_id);
    if (book) {
        app_context.selected_book_id = book_id;
        open_edit_modal(book);
    }
}


/**
 * Create an html button and attach the given css classes and js handler.
 * @param {string} html_content 
 * @param {string} class_name 
 * @param {object} click_handler 
 * @returns html button
 */
function create_button(html_content, class_name, click_handler) {
    const button = document.createElement('button');
    button.innerHTML = html_content;
    button.classList.add(class_name);
    button.addEventListener('click', click_handler);
    return button;
}


/**
 * Start the PUT CRUD operation to update the details of the given bookId.
 * @param {number} bookId 
 * @param {object} updatedDetails 
 * @returns 
 */
export function update_book_details(bookId, updatedDetails) {
    return fetch(API_BASE_URL + 'books/' + bookId, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDetails),
    })
}

function close_reviews_modal() {
    document.getElementById('close_reviews_modal').click();
}


function update_ai_review_stars(reviews) {
    let total_ai_reviews = 0;
    reviews.forEach(review => {
        total_ai_reviews += review.Ai_rating;
    });
    total_ai_reviews = parseInt(total_ai_reviews / reviews.length);



    let ai_stars = document.querySelectorAll('[id^="ai-rating-"]')

    // Replace the class attribute for each star_icon
    ai_stars.forEach((star_icon, index) => {
        // FAS: selected
        // FAR: unselected
        if (index < total_ai_reviews)
            star_icon.classList.replace('far', 'fas');
        else
            star_icon.classList.replace('fas', 'far');
    });

}


/**
 * Open the reviews modal to view and manage book reviews.
 * @param {object} app_context 
 * @param {number} book_id 
 */
function open_reviews_modal(app_context, book_id) {
    const reviews_modal = document.getElementById('reviews_modal');
    const close_reviews_modal = document.getElementById('close_reviews_modal');

    // Handle the close button
    close_reviews_modal.addEventListener('click', function () {
        reviews_modal.style = 'display: none !important;';
    });

    // Store the book id in the context object for possible new reviews
    app_context.bookid_reviewed = book_id;

    // Fetch reviews for the selected book from the server
    fetch(API_BASE_URL + 'reviews/' + book_id)
        .then(response => {
            return response.json();
        })
        .then(reviews => {
            display_reviews(app_context, reviews);
            reviews_modal.style = 'display: block !important;'; // Show the modal
            update_ai_review_stars(reviews);
        })
        .catch(error => console.error('Error fetching reviews:', error));
}

/**
 * Display the reviews in the reviews modal.
 * @param {Array} reviews 
 */
function display_reviews(app_context, reviews) {
    const reviews_list = document.getElementById('reviews_list');
    const reviews_per_page = 2; // Set the number of reviews to display per page
    const total_pages = Math.ceil(reviews.length / reviews_per_page);

    // Clear existing reviews in the modal
    reviews_list.innerHTML = '';

    if (app_context.current_page === null) {
        app_context.current_page = 1;
    }

    // Get the current page number from the app context
    const current_page = app_context.current_page;

    // Calculate the start and end index for the current page
    const start_index = (current_page - 1) * reviews_per_page;
    const endIndex = start_index + reviews_per_page;

    // Display reviews for the current page
    const reviews_to_show = reviews.slice(start_index, endIndex);

    reviews_to_show.forEach(review => {
        const review_item = document.createElement('div');
        review_item.classList.add('review-item'); // Add a class for styling

        const contentWrapper = document.createElement('div');
        contentWrapper.classList.add('content-wrapper'); // Add a class for styling

        contentWrapper.innerHTML = `
            <div class="review-card">
                <p><strong>Title:</strong> ${review.Title}</p>
                <p><strong>Description:</strong> ${review.Description}</p>
                <p><strong>User Rating:</strong> ${create_star_rating(review.Rating)}</p>
                <p><strong>AI Rating:</strong> ${create_star_rating(review.Ai_rating, 'green')}</p>
            </div>
        `;

        // Add a delete button for each review
        const delete_button = create_button('<i class="fas fa-trash-alt"></i>',
            'delete-button',
            () => delete_review_handler(app_context, review.id)
        );

        review_item.appendChild(contentWrapper);
        review_item.appendChild(delete_button);

        reviews_list.appendChild(review_item);
    });

    // Display pagination controls
    display_pagination_controls(app_context, total_pages);
}




function display_pagination_controls(app_context, total_pages) {
    const reviews_list = document.getElementById('reviews_list');
    const pagination_controller = document.createElement('div');
    pagination_controller.classList.add('pagination-container-horizontal'); // Add a class for styling

    // Create Previous button
    const prev_button = create_button('Previous', 'pagination-button', () => navigate_to_page(app_context, total_pages, -1));
    pagination_controller.appendChild(prev_button);

    // Create page number buttons
    for (let i = 1; i <= total_pages; i++) {
        const page_button = create_button(i.toString(), 'pagination-button', () => navigate_to_page(app_context, total_pages, i, true));
        // Add a class to the selected page button
        if (i === app_context.current_page) {
            page_button.classList.add('selected-page');
        }
        pagination_controller.appendChild(page_button);
    }

    // Create Next button
    const next_button = create_button('Next', 'pagination-button', () => navigate_to_page(app_context, total_pages, 1));
    pagination_controller.appendChild(next_button);

    reviews_list.appendChild(pagination_controller);
}


function navigate_to_page(app_context, total_pages, offset, is_direct) {
    const current_page = app_context.current_page;
    const new_page = (is_direct) ? offset : current_page + offset;

    // Update the app context with the new page number
    app_context.current_page = Math.max(1, Math.min(new_page, total_pages));

    // Fetch reviews for the new page and then refresh the reviews
    fetch_review_per_current_page(app_context, () => {
        display_reviews(app_context, app_context.reviews);
    });
}


/**
 * Fetches the reviews, stores them and calles the display function.
 * @param {object} app_context 
 * @param {Function} callback 
 */
function fetch_review_per_current_page(app_context, callback) {
    const book_id = app_context.bookid_reviewed;

    // Fetch reviews for the selected book from the server
    fetch(API_BASE_URL + 'reviews/' + book_id)
        .then(response => {
            return response.json();
        })
        .then(reviews => {

            // Update the app context with the fetched reviews
            app_context.reviews = reviews;

            // Invoke the callback function
            if (callback && typeof callback === 'function') {
                callback();
            }
        })
        .catch(error => console.error('Error fetching reviews:', error));
}



// Helper function to create star rating representation
function create_star_rating(rating, color = null) {
    const max_stars = 5;
    if (color === null)
        color = '';
    else
        color = 'ai-stars-review';
    let stars_html = '';
    for (let i = 1; i <= max_stars; i++) {
        const filled_start_class = i <= rating ? 'fas' : 'far';
        const start_color_class = color ? ` ${color}` : ''; // Add color class if specified
        stars_html += `<i class="${filled_start_class} fa-star ${start_color_class}"></i>`;
    }
    return stars_html;
}



/**
 * Enables or disables the splash screen.
 * @param {boolean} enable 
 */
function switch_splash_screen(enable) {
    document.getElementById('splash-screen').style.display = (enable) ? 'flex' : 'none';
}

/**
 * Invokes the CRUD POST operation for pushing a new review, and also refreshes the front-end
 * components to exhibit the new record. 
 * @param {object} app_context 
 */
export function add_review_handler(app_context) {
    const book_id = app_context.bookid_reviewed;
    const review_title = document.getElementById('review_title').value;
    const review_description = document.getElementById('review_description').value;
    const review_rating = document.getElementById('hidden-rating').value;

    switch_splash_screen(true);
    // Use Fetch API to make a POST request to add a new review
    fetch(API_BASE_URL + 'reviews', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            book_id: book_id,
            title: review_title,
            description: review_description,
            rating: review_rating
        }),
    })
        .then(() => {
            // Refresh the reviews after adding a new one
            close_reviews_modal();
            open_reviews_modal(app_context, book_id);
            switch_splash_screen(false);
        })
        .catch(error => console.error('Error adding review:', error));
}



/**
 * Handle the deletion of a review. After the delete, the modal is refreshed.
* @param {number} app_context
* @param {number} review_id 
 */
function delete_review_handler(app_context, review_id) {
    // Use Fetch API to make a DELETE request to remove the review
    fetch(API_BASE_URL + 'reviews/' + review_id, {
        method: 'DELETE',
    })
        .then(response => {
            if (response.ok) {
                // Refresh the modal after deletion.
                close_reviews_modal();
                open_reviews_modal(app_context, app_context.bookid_reviewed);

            } else {
                console.error('Failed to delete review.');
            }
        })
        .catch(error => console.error('DELETE REVIEW ERROR:', error));
}


/**
 * Display the retrieved array of books in the related table, showing the related info and
 * providing for each book Edit, Delete and Review options.
 * @param {object} app_context 
 * @param {Array} books 
 */
export function display_retrieved_books(app_context, books) {
    const table_body = document.querySelector('#books_list tbody');

    // Clear existing rows in the table body
    table_body.innerHTML = '';

    // Iterate through books and append rows to the table body
    books.forEach(book => {
        const book_item = document.createElement('tr');
        const edit_button = create_button('<i class="fas fa-pencil-alt"></i>',
            'edit-button',
            () => start_edit_handler(app_context, book.id)
        );
        const delete_button = create_button('<i class="fas fa-trash-alt"></i>',
            'delete-button',
            () => delete_book_handler(app_context, book.id)
        );

        const reviews_button = create_button('<i class="fas fa-star"></i>',
            'reviews-button',
            () => open_reviews_modal(app_context, book.id)
        );
        let complete_url = '<td><a href="' + DETAIL_PAGE_URL + '?bookId=' + book.id + '">';
        book_item.innerHTML = `${complete_url}${book.Title}</a></td>${complete_url}${book.Author}</a></td><td>${book.Price}</td><td>${book.Year}</td>`;

        // Add separate cells for Edit, Delete and Review buttons
        const edit_cell = document.createElement('td');
        edit_cell.appendChild(edit_button);
        book_item.appendChild(edit_cell);

        const delete_cell = document.createElement('td');
        delete_cell.appendChild(delete_button);
        book_item.appendChild(delete_cell);

        const reviews_cell = document.createElement('td');
        reviews_cell.appendChild(reviews_button);
        book_item.appendChild(reviews_cell);

        // Append the row to the table body
        table_body.appendChild(book_item);
    });
}