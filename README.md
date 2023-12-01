# ai-powered-web-library
The goal here is to develop a simple mock web app book library for demonstrating a possible use of AI for aiding users. Currently the app is very minimal in terms of functionality, but the goal is to keep expanding it, including even more AI-based features to test their capabilities and integrability in such kind of application.


## Table of Contents

- [Requirements](#Requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)


## Requirements

- [NodeJs](https://nodejs.org/en/)
- All the libraries imported in the server.mjs file.
- [Express](https://expressjs.com/) for NodeJs
- [Python 3.11](https://www.python.org/)
- [PyTorch](https://pytorch.org/)
- [Transformers](https://huggingface.co/docs/transformers/installation) library.
- [XAMPP](https://www.apachefriends.org/it/index.html) with Apache and MySQL.


## Installation

- Install XAMPP with MySQL and Apache, and configure Apache to listen on 0.0.0.0:80 with a server name like this 192.168.1.177:80, to make the web app accessible from external networks using this URL: http://YOUR_IPV4_ADDRESS/books/index.html. The JS files are configured to work with said IPV4 address, so you'll need to change them to run it on your machine.
- Create Firewall or Router rules if needed to allow connections on the port 80. If you choose to use anothre port (e.g., 443).
- Load all the files in the 'htdocs' folder of XAMPP to make them accessible.
- Modify the MySQL config file to allow access as 'root', as currently no multi user is supported, and change the password to another one (considering that the used one is public on this repo).
- Configure a MySQL database on XAMPP to include the tables:
    - books:
        - id: Auto-incremental primary key.
        - Title: varchar(50), not-null.
        - Author: varchar(100), not-null.
        - Year: smallint(4), not-null.
        - Price: float, not-null.
        - Description: varchar(700) -- Still to be used.
    - reviews:
        - id: Auto-incremental primary key.
        - Title: varchar(50), not-null.
        - Description: varchar(200), not-null.
        - Rating: tinyint(3), not-null.
        - Ai_rating: tinyint(3), not-null.
        - Book_id: Foreign-key pointed to book.id.

- Perform a nodeJS init for the server.mjs to load the required libraries (core, express, ...).

## Usage

- XAMPP needs to be running, with the servies Apache and MySQL running.
- The NodeJs module 'server.mjs' needs to be running:
```bash
node server.mjs
```
- The page can be accessed at the URL described in the [Installation](#Installation) section.

## Contributing

Many improvements are possible:
- Introduce the use of the Description field for the books.
- Introduce the use of another LLM to summarize large books descriptions for interested users.
- Introduce mult-user, and hence:
    - Make reviews user-related, meaning that each user can create just one review per each book.
    - Only admins should be able to insert new books.
    - Each user should have a profile page, to check all its related records.
- Introduce purchasable books.
- Introduce genre category for the books.
- Introduce an AI Chatbot, which according to your history and preferences can advice to you some new books to buy.


## License

MIT License

Copyright (c) 2023 Jurgen Gurakuqi

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS," WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

