# Dubcast UI

This is the frontend application for Dubcast, a web-based audio streaming platform. It is built with Angular and provides a user-facing interface for listening to radio streams and a backend interface for administration.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20.x or higher)
- [npm](https://www.npmjs.com/) (version 10.x or higher)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd dubcast-ui
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```

### Running the Application

- **Development Server:**
  To start the development server, run:
  ```bash
  npm start
  ```
  Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

- **Build:**
  To build the project for production, run:
  ```bash
  npm run build
  ```
  The build artifacts will be stored in the `dist/` directory.

- **Linting:**
  To lint the code, run:
  ```bash
  npm run lint
  ```

- **Testing:**
  - **Unit Tests:**
    ```bash
    npm test
    ```
  - **End-to-End (E2E) Tests:**
    The project uses Playwright for E2E testing.
    ```bash
    npm run e2e
    ```
    To run the E2E tests with the UI:
    ```bash
    npm run e2e:ui
    ```

## 🛠️ Technologies Used

- **Framework:** [Angular](https://angular.io/) v21
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [SCSS](https://sass-lang.com/)
- **UI Components:** [PrimeNG](https://primeng.org/) v21 & [PrimeIcons](https://primeflex.org/primeicons)
- **State Management/Reactivity:** [RxJS](https://rxjs.dev/)
- **Real-time Communication:** [StompJS](https://stomp-js.github.io/) and [SockJS](https://github.com/sockjs) for WebSocket communication.
- **E2E Testing:** [Playwright](https://playwright.dev/)

## Project Structure

The project follows a standard Angular CLI structure. The main application code is located in the `src/app` directory.

- **`core/`:** Contains core, singleton services, models, and interceptors. This includes services for authentication, user management, and audio playback.
- **`shared/`:** Contains shared components, directives, and pipes that are used across multiple feature modules. A key component here is the `GlobalPlayerComponent`.
- **`features/`:** Contains the main feature modules of the application, which are lazy-loaded.
  - **`admin/`:** The admin-facing part of the application, which includes an admin dashboard.
  - **`public/`:** The public-facing part of the application. This includes:
    - `RadioPage`: The main page for listening to the radio stream.
    - `LoginPage`: For user authentication.
    - `RegisterPage`: For user registration.
    - `ProfilePage`: For user profiles.

## Key Features

- **Public Radio Stream:** Users can listen to the main audio stream.
- **User Authentication:** Users can register, log in, and manage their profiles.
- **Real-time Updates:** The application uses WebSockets to receive real-time information, such as what's currently playing and online listener stats.
- **Global Audio Player:** A persistent audio player that allows users to control playback from anywhere in the application.
- **Admin Dashboard:** A separate area for administrators to manage the application.