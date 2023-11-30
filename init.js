import { add_book_handler, edit_submit_handler, sort_table } from './handlers.js';
import { fetch_books, add_review_handler, close_reviews_modal, open_reviews_modal } from './helper.js';

/**
 * Initialize all the basic handlers and retrieve the context data.
 */
document.addEventListener('DOMContentLoaded', function () {

    const add_book_form = document.getElementById('add_book_form');
    const add_Book_title = document.getElementById('title');
    var app_context = { "books": null, "selected_book_id": null, "all_books": null, "search_query": "", "bookid_reviewed": null, "current_page": null };

    // Handle the book creation process.
    add_book_form.addEventListener('submit', function (event) {
        event.preventDefault();
        let insert_call_result = add_book_handler(app_context);
        if (insert_call_result) {
            add_book_form.reset();
        }
        else {
            if (insert_call_result === false) {
                add_Book_title.setCustomValidity("Book already existing!");
                add_Book_title.reportValidity();
            }
        }
    });

    // Handle the book edit process.
    const edit_book_form = document.getElementById('edit_book_form');
    const edit_book_title = document.getElementById('edit_title');
    edit_book_form.addEventListener('submit', function (event) {
        event.preventDefault();
        if (event.target.id === "add_book_submit")
            return;

        let edit_call_result = edit_submit_handler(app_context);
        console.log("edit_call_result: " + edit_call_result);
        if (edit_call_result === false) {
            edit_book_title.setCustomValidity("Book already existing!");
            edit_book_title.reportValidity();
        }

    });

    // Handle the book edit interruption.
    const close_modal = document.querySelector('.close');
    close_modal.addEventListener('click', function () {
        edit_book_modal.style = 'display: none !important;';
    });

    // Search filter
    const query_search_filter = document.getElementById('search_bar');
    query_search_filter.addEventListener('input', function (event) {
        event.preventDefault();
        app_context.search_query = query_search_filter.value.toLowerCase();
        if (app_context.search_query === undefined) {
            app_context.search_query = "";
        }
        fetch_books(app_context);
    });

    // Fetch books to populate the library.
    fetch_books(app_context);

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });



    // Handle rating by stars in new reviews.
    const star_rating = document.getElementById('star-rating');
    const hidden_rating = document.getElementById('hidden-rating');

    const star_rating_container = document.getElementById('star-rating');
    const all_stars = star_rating_container.querySelectorAll('i');

    star_rating.addEventListener('click', (event) => {
        const selected_rating = event.target.dataset.rating;
        hidden_rating.value = selected_rating;

        // Replace the class attribute for each star_icon
        all_stars.forEach((star_icon, index) => {
            // FAS: selected
            // FAR: unselected
            if (index < selected_rating)
                star_icon.classList.replace('far', 'fas');
            else
                star_icon.classList.replace('fas', 'far');
        });
    });

    // Makes columns sortable.
    const sortableHeaders = document.querySelectorAll('.sortable');
    sortableHeaders.forEach((header, index) => {
        header.addEventListener('click', () => {
            console.log("index: " + index);
            sort_table(index);
        });
    });


    // Allows to change the modal view from "Existing reviews" to "New review".
    const new_review_button = document.getElementById('new_review');
    const new_review_section = document.getElementById('new_review_section');
    const existing_reviews_section = document.getElementById('existing_reviews_section');

    new_review_button.addEventListener('click', (event) => {
        new_review_section.classList.replace('hidden', 'visible');
        existing_reviews_section.classList.replace('visible', 'hidden');


    });

    // Allows to go backto "Existing reviews" from "New review"
    const go_back_button = document.getElementById('go_back_button');

    go_back_button.addEventListener('click', (event) => {
        new_review_section.classList.replace('visible', 'hidden');
        existing_reviews_section.classList.replace('hidden', 'visible');
    });

    // Submit Review handler
    const review_submit_form = document.getElementById('add_review_form');
    review_submit_form.addEventListener('submit', function (event) {
        event.preventDefault();
        if (app_context.bookid_reviewed === null) {
            return;
        }
        add_review_handler(app_context);
        review_submit_form.reset();
        go_back_button.click();
    });


});