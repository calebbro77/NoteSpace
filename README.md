# NoteSpace

NoteSpace is a full-stack note-taking application developed as a software development bootcamp project using Node.js, Express, MongoDB, Mongoose, and EJS.

The application allows users to create and manage their own private notes, format notes using a rich-text editor, attach images, and optionally publish notes to a shared community area where other authenticated users can contribute.

## Features

- User registration and login
- JWT-based authentication
- Personalized note collections
- Create, read, update, and delete notes
- Rich-text note editing
- Server-side input validation
- HTML sanitization
- Private and published notes
- Community Explore page
- Contributions to published notes
- Image attachments
- Note ownership and authorization
- Responsive user interface
- REST API
- Centralized error handling

## Technologies Used

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JSON Web Tokens
- bcrypt
- Multer
- sanitize-html

### Frontend

- EJS
- HTML
- CSS
- JavaScript
- Quill rich-text editor
- Lucide icons

## Project Structure

```text
NoteSpace/
├── config/          # Database configuration
├── controllers/     # Application and API logic
├── middleware/      # Authentication, uploads, and error handling
├── models/          # Mongoose data models
├── public/          # Static CSS and assets
├── routes/          # API and website routes
├── utils/           # Note sanitization and helper functions
├── views/           # EJS templates
├── .env.example     # Example environment configuration
├── index.js         # Application entry point
└── package.json
```
## Installation

### 1. Clone the Repository

Clone the NoteSpace repository and navigate into the project folder:

```bash
git clone YOUR_REPOSITORY_URL
cd NoteSpace
```

### 2. Install Dependencies

Install the required Node.js packages:

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root of the project.

Use `.env.example` as a template:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Replace the example values with your own MongoDB connection string and JWT secret.

### 4. Configure MongoDB

Make sure MongoDB is running and accessible using the connection string provided in `MONGODB_URI`.

NoteSpace does not require pre-existing users or notes. MongoDB collections will be populated as users register and create notes.

### 5. Start the Application

For development with Nodemon:

```bash
npm run dev
```

Or start the application normally:

```bash
npm start
```

By default, NoteSpace will run at:

```text
http://localhost:3000
```

## Using NoteSpace

1. Register a new user account.
2. Log in to access your personal dashboard.
3. Create a note using the rich-text editor.
4. View, edit, or delete notes from your dashboard.
5. After creating a note, use the Edit page to add image attachments.
6. Publish a note to make it available in the Explore section.
7. View notes published by other users through Explore.
8. Add contributions to published notes.

Private notes remain accessible only to their owner. Published notes can be viewed by other authenticated users, but only the original owner can edit or delete the note.

## Image Attachments

NoteSpace supports the following image formats:

- JPEG
- PNG
- WebP
- GIF

Each image is limited to 2 MB, with a maximum of 5 images per note.

Images are stored in MongoDB as attachment data associated with their note. Images can be added after the initial note has been created by opening the note's Edit page.

## REST API

NoteSpace provides a REST API for authentication and note management.

Protected API routes require a JSON Web Token (JWT) in the `Authorization` header:

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

A JWT can be obtained by logging in through the `/api/auth/login` endpoint.

### Authentication Routes

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in and receive a JWT |

### Note Routes

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/notes` | Get all notes owned by the authenticated user |
| POST | `/api/notes` | Create a new note |
| GET | `/api/notes/published` | Get published notes |
| GET | `/api/notes/:id` | Get a note by ID |
| PUT | `/api/notes/:id` | Update an owned note |
| DELETE | `/api/notes/:id` | Delete an owned note |
| PATCH | `/api/notes/:id/publish` | Publish an owned note |
| POST | `/api/notes/:id/contributions` | Add a contribution to a published note |

### Example Registration Request

```json
{
  "username": "exampleuser",
  "email": "example@example.com",
  "password": "password123"
}
```

### Example Login Request

```json
{
  "username": "exampleuser",
  "password": "password123"
}
```

A successful login returns a JWT that can be used to access protected API routes.

### Example Create Note Request

```json
{
  "title": "My First Note",
  "content": "<p>This is my first NoteSpace note.</p>"
}
```

## Authentication and Authorization

NoteSpace uses bcrypt to hash user passwords before they are stored in MongoDB.

The REST API uses JSON Web Tokens for authentication. Protected API requests must provide a valid JWT using the Bearer authentication scheme.

The website also uses JWT authentication, with the token stored in an HTTP-only cookie.

Notes are associated with their owner. Users can edit and delete only their own notes. Published notes can be viewed by other authenticated users, but publishing a note does not give other users permission to modify or delete the original note.

## Validation and Security

NoteSpace includes several validation and security measures:

- Password hashing with bcrypt
- JWT verification
- Authentication middleware
- Note ownership checks
- Mongoose schema validation
- Server-side input validation
- HTML sanitization for rich-text note content
- File type restrictions for image uploads
- 2 MB image size limit
- Maximum of 5 images per note
- Centralized API error handling
- Environment variables for sensitive configuration

The `.env` file is excluded from Git and should never be committed to the repository. The included `.env.example` file documents the environment variables required to run the application without exposing credentials.

## Known Limitations

NoteSpace was developed as a bootcamp project and is designed for small-scale use.

Current limitations include:

- Images can only be uploaded after the initial note has been created.
- NoteSpace currently supports image attachments but not other attachment types.
- Published notes do not currently have an unpublish option.
- Image data is stored directly in MongoDB rather than a dedicated file storage service.
- The application is configured for local development and has not been deployed to a production environment.

## Disclaimer

NoteSpace was created as an educational project for a software development bootcamp. It is not a commercial product and is not affiliated with, endorsed by, or associated with any other application, company, or service using the NoteSpace name.

## Author

**Caleb Gaudio**

Software Development Bootcamp Midterm Project