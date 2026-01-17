# ServiceWalla - Service Marketplace

ServiceWalla is a modern, full-stack web application that serves as a marketplace connecting users with local service professionals. It's built with a powerful, production-ready tech stack designed for scalability and a great developer experience.

## Features

- **User & Worker Authentication:** Secure sign-up and login for both customers and service professionals using Firebase Authentication (Email/Password & Phone).
- **Service & Worker Discovery:** Users can browse services and find professionals based on location and specialty.
- **Booking System:** A multi-step booking process with date, time, and professional selection.
- **User & Worker Dashboards:** Dedicated profile pages for customers and workers to manage their information and bookings.
- **Real-time Updates:** Powered by Firestore for live data synchronization.
- **AI-Powered Features:**
  - **Bio Generation:** Workers can automatically generate a professional bio using AI.
  - **FAQ Generation:** An intelligent help center that can answer user questions.
- **Modern UI:** Built with ShadCN UI components and styled with Tailwind CSS for a clean, responsive interface.

---

## Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- A [Firebase Project](https://console.firebase.google.com/) with Firestore and Firebase Authentication enabled.
- A [Google AI API Key](https://aistudio.google.com/app/apikey) for Genkit features.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/prafulla2121/servicewalla.git
    cd servicewalla
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a file named `.env.local` in the root of the project and add your Google AI API key.
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```

4.  **Connect to Your Firebase Project:**
    Update the Firebase configuration in `src/firebase/config.ts` with your own project's credentials.

### Running the Development Servers

You need to run two separate processes in two different terminals for the full application to work.

**Terminal 1: Start the AI Service (Genkit)**
```bash
npm run genkit:dev
```
This will start the Genkit development server, usually on port `3400`, which handles the AI-powered flows.

**Terminal 2: Start the Web Application (Next.js)**
```bash
npm run dev
```
This starts the main application server, which will be available at `http://localhost:9002`.

---

## Available Scripts

- `npm run dev`: Starts the Next.js development server with Turbopack.
- `npm run build`: Creates a production-ready build of the application.
- `npm run start`: Starts the production server from the build artifacts.
- `npm run lint`: Lints the codebase for errors and style issues.
- `npm run genkit:dev`: Starts the Genkit AI flows in development mode.
- `npm run genkit:watch`: Starts the Genkit server with auto-reloading on file changes.

---

## Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (with App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
- **AI Integration:** [Genkit](https://firebase.google.com/docs/genkit)
- **Backend & Database:** [Firebase](https://firebase.google.com/)
  - **Authentication:** Firebase Authentication
  - **Database:** Cloud Firestore
  - **File Storage:** Firebase Storage
- **Form Management:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) for validation.
