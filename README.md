# Warranty Vault Project

This project is a web application for managing product warranties.

## Features

*   Track warranty expiration dates
*   Store purchase receipts and warranty documents
*   Get reminders for expiring warranties
*   Categorize and search warranties

## Tech Stack

*   React
*   TypeScript
*   Vite
*   Tailwind CSS
*   Shadcn UI

## Getting Started

### Prerequisites

*   Node.js (v18 or later recommended)
*   Bun (https://bun.sh/)

### Installation

1.  Clone the repository:
    ```bash
    git clone <your-repo-url>
    cd <your-repo-name>
    ```
2.  Install dependencies:
    ```bash
    bun install
    ```

### Running the Development Server

```bash
bun run dev
```

This will start the Vite development server, typically at `http://localhost:5173`.

### Building for Production

```bash
bun run build
```

This command bundles the application for production deployment into the `dist` directory.

### Linting

```bash
bun run lint
```

Checks the codebase for linting errors using ESLint.

## Deployment

You can deploy the contents of the `dist` folder to any static hosting provider (e.g., Vercel, Netlify, GitHub Pages).
