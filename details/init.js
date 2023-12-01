/**
 * Initialize all the basic handlers and retrieve the context data.
 */
document.addEventListener('DOMContentLoaded', function () {

    const API_BASE_URL = 'http://192.168.1.177:3000/';


    /**
     * Extract the Id parameter in the URL.
     * @param {string} name 
     * @returns 
     */
    function get_url_parameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    /**
     * Fetch the details of the book matching the given id. 
     * @param {string} book_id 
     */
    function fetch_book_details(book_id) {
        fetch(API_BASE_URL + "books/" + book_id)
            .then(response => response.json())
            .then(data => {
                document.getElementById('title').value = data.Title;
                document.getElementById('author').value = data.Author;
                document.getElementById('year').value = data.Year;
                document.getElementById('price').value = data.Price;
                // document.getElementById('description').value = data.description;
            })
            .catch(error => {
                console.error('Error fetching book details:', error);
            });
    }

    /**
     * Handle the page loading by retrieving the details of the book whose Id was given
     * as parameter.
     */
    function on_page_load() {
        const book_id = get_url_parameter('bookId');

        if (book_id) {
            fetch_book_details(book_id);
        }
    }

    on_page_load();


    // const edit_book_button = document.getElementById("edit_book");
    // edit_book_button.addEventListener('click', function (event) {
    //     event.preventDefault();
    //     console.log("START EDIT");
    // });
});