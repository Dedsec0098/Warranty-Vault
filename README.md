# Warranty Vault

Warranty Vault is a full-stack web application designed to help users manage their product warranties efficiently. Users can store warranty information, upload receipts (with OCR capabilities to attempt auto-filling forms), and receive timely reminders before warranties expire.

## Key Features

*   **User Authentication:** Secure user registration and login system using JWT.
*   **Warranty Management:** Easily add, view, edit, and delete warranty entries.
*   **Receipt & Document Upload:** Upload images or PDFs of receipts and warranty documents.
*   **OCR Text Extraction:** Leverages Tesseract.js to automatically extract text from uploaded images, attempting to pre-fill warranty details like purchase date, expiry date, and serial number.
*   **Automated Email Reminders:** Users can set preferences (e.g., 1 day, 1 week, 1 month before expiry, or never) to receive email notifications for expiring warranties.
*   **Dashboard Overview:** A central dashboard to view a summary of active, soon-to-expire, and recently expired warranties.
*   **Responsive Design:** User-friendly interface built with Tailwind CSS and Shadcn/ui, accessible on various devices.
*   **Search and Categorization:** (Future enhancement - current structure supports adding categories)

## Technology Stack

*   **Frontend:**
    *   React (with Vite)
    *   TypeScript
    *   Tailwind CSS
    *   Shadcn/ui (UI components)
    *   Tesseract.js (for OCR)
    *   Axios (for API requests)
    *   `date-fns` (for date manipulation)
    *   React Router (for navigation)
*   **Backend:**
    *   Node.js
    *   Express.js
    *   MongoDB (with Mongoose ODM)
    *   JSON Web Tokens (JWT) for authentication
    *   Nodemailer (for sending email notifications)
    *   `node-cron` (for scheduling daily reminder tasks)
*   **Development Tools:**
    *   Bun (optional, `bun.lockb` present; `npm` is the primary documented method below)
    *   ESLint (for code linting)
    *   Prettier (for code formatting - assumed)

## Prerequisites

Before you begin, ensure you have the following installed on your system (Mac, Windows, or Linux):

*   **Node.js:** Version 18.x or later is recommended. This includes `npm` (Node Package Manager). You can download it from [nodejs.org](https://nodejs.org/).
*   **MongoDB:** A running instance of MongoDB. This can be a local installation or a cloud-hosted service like MongoDB Atlas.
*   **Git:** For cloning the repository (if you're setting it up from a Git source).

## Installation and Setup Guide

Follow these steps to get the Warranty Vault project running on your local machine.

### 1. Clone the Repository (If Applicable)

If you're obtaining the code from a Git repository:

```bash
git clone <your-repository-url>
cd Project # Or your project's root directory name
```

If you already have the project files, navigate to the root directory: `/Users/shrishmishra/Desktop/Project`.

### 2. Backend Setup

The backend server is located in the `server` directory.

**a. Navigate to the Server Directory:**

```bash
cd server
```

**b. Install Backend Dependencies:**

Use `npm` to install the dependencies listed in `server/package.json`:

```bash
npm install
```

**c. Create Backend Environment File (`.env`):**

In the `server` directory, create a new file named `.env` (i.e., `server/.env`). Add the following environment variables, replacing the placeholder values with your actual configuration details:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/warranty_vault # Replace with your MongoDB connection string

# JWT Configuration
JWT_SECRET=your_very_strong_and_long_jwt_secret_key_here # Choose a strong, random secret

# Server Port
PORT=5001 # The port your backend server will run on

# Email (Nodemailer) Configuration for Reminders
EMAIL_HOST=smtp.example.com       # Your SMTP server hostname (e.g., smtp.gmail.com for Gmail)
EMAIL_PORT=587                    # SMTP port (587 for TLS, 465 for SSL)
EMAIL_SECURE=false                # true if using port 465 (SSL), false for 587 (TLS/STARTTLS)
EMAIL_USER=your_email@example.com # Your email address for sending notifications
EMAIL_PASS=your_email_password    # Your email password or an app-specific password (recommended for services like Gmail)
EMAIL_FROM="Warranty Vault <your_email@example.com>" # The "From" address that will appear in emails
```

**Important Notes for `.env`:**
*   **`MONGODB_URI`**: If your MongoDB instance requires authentication, include the username and password in the URI.
*   **`JWT_SECRET`**: Make this a long, random, and strong string. It's critical for security.
*   **Email Configuration**:
    *   For Gmail, if you have 2-Step Verification enabled, you'll likely need to generate an "App Password" to use in `EMAIL_PASS`.
    *   Ensure your email provider's SMTP settings are correct.

**d. Start the Backend Server:**

From the `server` directory, run:

```bash
npm start
```
This command typically executes `node server.js` (or similar, as defined in `server/package.json`). You should see a confirmation message that the MongoDB connection is successful and the server is listening on the specified port (e.g., 5001).

For development, if your `server/package.json` has a `dev` script using `nodemon` (e.g., `"dev": "nodemon server.js"`), you can use:
```bash
npm run dev
```
This will automatically restart the server when you make changes to backend files.

### 3. Frontend Setup

Navigate back to the project's root directory from the `server` directory:

```bash
cd ..
```

**a. Install Frontend Dependencies:**

From the project root directory (`/Users/shrishmishra/Desktop/Project`), use `npm` to install the frontend dependencies listed in the main `package.json`:

```bash
npm install
```
*(Note: Since a `bun.lockb` file is present, if you prefer `bun`, you could use `bun install`. This guide focuses on `npm` for broader compatibility as requested.)*

**b. Create Frontend Environment File (`.env`):**

In the project's root directory (e.g., `/Users/shrishmishra/Desktop/Project/.env`), create a new file named `.env`. Add the following variable:

```env
VITE_API_URL=http://localhost:5001/api
```
This tells your frontend application where to send API requests (it should match the host and port your backend server is running on, with `/api` appended if your backend routes are prefixed).

**c. Start the Frontend Development Server:**

From the project root directory, run:

```bash
npm run dev
```
This command starts the Vite development server. It will typically open in your default web browser at `http://localhost:5173` (Vite's default) or another port if specified in `vite.config.ts` or if 5173 is in use.

You should now have the backend server and frontend development server running. You can access the Warranty Vault application in your browser.

## Available NPM Scripts

These are common scripts you might find in the `package.json` files.

### Frontend (root `package.json`)

*   `npm run dev`: Starts the Vite development server for the frontend.
*   `npm run build`: Builds the frontend application for production (output typically in a `dist` folder).
*   `npm run lint`: Runs ESLint to check for code quality and style issues.
*   `npm run preview`: Serves the production build locally to test it before deployment.

### Backend (`server/package.json`)

*   `npm start`: Starts the backend server using Node.js.
*   `npm run dev`: (If configured) Starts the backend server using `nodemon` for automatic restarts during development.

## Project Structure Overview (Simplified)

```
/Project
|-- bun.lockb             # Bun lockfile (indicates Bun can be used)
|-- package.json          # Frontend dependencies and root project scripts
|-- vite.config.ts        # Vite configuration for frontend
|-- tailwind.config.ts    # Tailwind CSS configuration
|-- tsconfig.json         # TypeScript configuration
|-- README.md             # This file
|-- .env                  # Frontend environment variables (you create this)
|
|-- /public/              # Static assets for the frontend (e.g., favicon)
|
|-- /src/                 # Frontend React application source code
|   |-- main.tsx          # Entry point for the React application
|   |-- App.tsx           # Main application component with routing
|   |-- /components/      # Reusable UI components (layout, ui, feature-specific)
|   |-- /pages/           # Top-level page components
|   |-- /context/         # React Context providers (e.g., AuthContext)
|   |-- /lib/             # Utility functions (e.g., Shadcn utils)
|   `-- index.css         # Global styles
|
|-- /server/              # Backend Node.js/Express.js application
|   |-- package.json      # Backend dependencies and scripts
|   |-- server.js         # Main backend server entry point
|   |-- .env              # Backend environment variables (you create this)
|   |-- /models/          # Mongoose schemas (User.js, Warranty.js)
|   `-- /routes/          # API route definitions (auth.js, warranty routes in server.js)
```

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

---

Happy Hacking with Warranty Vault!
