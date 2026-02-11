## Blog Api

Description: This Api provides endpoints to view all articles, view a single article, create a new article, update an existing article, update the state of an article (draft or published), and delete an article. It uses Express.js as the web framework and MongoDB as the database. The Api provides endpoints to sign up and log in users, allowing them to create and manage their articles. The Api also includes authentication and authorization features to ensure that only authorized users can access certain endpoints.

### Endpoints

#### Endpoints that require authentication are protected and can only be accessed by authenticated users. The following endpoints are available:

- `GET /articles/me`: Retrieve a list of articles created by the authenticated user (both published and draft articles).
- `POST /articles`: Create a new article.
- `PUT /articles/:id`: Update an existing article by its ID.
- `PATCH /articles/:id/publish`: Update the state of an article (draft or published).
- `DELETE /articles/:id`: Delete an article by its ID.
- `POST /auth/logout`: Log out the current user.

#### Endpoints that do not require authentication are publicly accessible and can be accessed by anyone. The following endpoints are available:

- `GET /articles`: Retrieve a list of all published articles.
- `GET /articles/:id`: Retrieve a single published article by its ID.
- `POST /auth/signup`: Sign up a new user.
- `POST /auth/login`: Log in an existing user.

### Technologies Used

- Express.js: A web framework for Node.js.
- MongoDB: A NoSQL database for storing articles.
- Mongoose: An ODM (Object Data Modeling) library for MongoDB and Node.js.
- dotenv: A module to load environment variables from a .env file.
- Jest: A testing framework for JavaScript.
- Supertest: A library for testing HTTP servers.

### More Information about each endpoint

#### Articles Endpoints

- `GET /articles`: This endpoint retrieves a list of all published articles in the database. It returns an object having a `data` property that contains an array of article objects, each containing the article's title, content, author, and publication state. Does not require authentication.

###### Query parameters can be used to filter the articles by author, title, tag and get articles by pages with a limit of 20 articles per page and sort the articles by timestamp, read count and reading time. For example, `GET /articles?author=John&page=1&sort=timestamp:desc` will return the published articles created by John, first page, sorted by timestamp in descending order. The acceptable values for the sort query parameter are as follows:

| Field        | Default Direction   | Acceptable Values | Rationale                                                                                |
| ------------ | ------------------- | ----------------- | ---------------------------------------------------------------------------------------- |
| timestamp    | desc (Newest first) | desc,asc          | Readers generally expect to see the most recent content at the top of their feed.        |
| read_count   | desc (High to low)  | desc,asc          | Allows users to easily discover "Trending" or the most popular articles on the platform. |
| reading_time | asc                 | asc,desc          | Provides flexibility; users can search for "Quick Reads" (Short) or "Deep Dives" (Long). |

- `GET /articles/:id`: This endpoint retrieves a single published article by its ID. It returns an object having a `data` property that contains the article object with the specified ID. Does not require authentication. Please note that the ID is passed as a URL parameter. It also increments the read count of the article by 1 each time it is accessed. It also returns the author information (first name, last name and email) along with the article details.
  `{
  "status": "success",
  "data": {
    "title": "My First Blog",
    "author": { "first_name": "John", "last_name": "Doe", "email": "john@example.com" },
    "read_count": 5,
    "reading_time": 2,
    ...
  }
}`
- `GET /articles/me`: This endpoint retrieves a list of both published and draft articles created by the authenticated user. It requires authentication and returns an object having a `data` property that contains an array of article objects created by the authenticated user, each containing the article's title, content, author, and publication state.

###### Query parameters can be used to filter the articles by publication state (published or draft) and get articles by pages with a limit of 20 articles per page. For example, `GET /articles/me?state=published&page=1` will return only the published articles created by the authenticated user, first page.

- `POST /articles`: This endpoint creates a new article. It requires authentication and expects a JSON object in the request body containing the article's title, description, content, and tags. It returns an object having a `data` property that contains the newly created article object.
- `PUT /articles/:id`: This endpoint updates an existing article by its ID. It requires authentication and expects a JSON object in the request body containing the updated article's title, description, content, and tags. It returns an object having a `data` property that contains the updated article object. Please note that the ID is passed as a URL parameter.
- `PATCH /articles/:id/publish`: This endpoint updates the state of an article to published. It requires authentication. It returns an object having a `data` property that contains the updated article object. Please note that the ID is passed as a URL parameter.
- `DELETE /articles/:id`: This endpoint deletes an article by its ID. It requires authentication and returns an object having a `data` property that contains a success message. Please note that the ID is passed as a URL parameter.

#### Authentication Endpoints

- `POST /auth/signup`: This endpoint allows a new user to sign up. It expects a JSON object in the request body containing the user's first name, last name, email, and password. It returns an object having a `data` property that contains the newly created user object.
- `POST /auth/login`: This endpoint allows an existing user to log in. It expects a JSON object in the request body containing the user's email and password. It returns an object having a `data` property that contains a success message and a JSON Web Token (JWT) for authentication.
- `POST /auth/logout`: This endpoint allows the current user to log out. It requires authentication and returns an object having a `data` property that contains a success message.

### Running the Api

To run the Api, follow these steps:

1. Clone the repository to your local machine.
2. Navigate to the project directory and run `npm install` to install the dependencies.
3. Create a `.env` file in the root directory and add the following environment variables:

```MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=your_port_number
```

4. Run `npm start` to start the server.
5. The Api will be available at `http://localhost:your_port_number`.

### Running Tests

To run the tests, follow these steps:

1. Make sure you have the dependencies installed by running `npm install`.
2. Run `npm test` to execute the tests.
3. The test results will be displayed in the console.

### Reading Time Algorithm

I implemented a custom algorithm that calculates reading time based on an average reading speed of 200 words per minute ($T = \frac{totalWords}{200}$).

### Authorization

Tokens are used to authenticate users and protect certain endpoints. When a user logs in, they receive a JSON Web Token (JWT) that they can use to access protected endpoints. The token is included in the Authorization header of the request as a Bearer token. The server verifies the token and grants access to the protected endpoint if the token is valid.
`Authorization: Bearer <token>`

- Please note that the token is valid for 1 hour, and users will need to log in again to obtain a new token after it expires.
