## Product Requirements Document: ML Visualization Suite (Revised)

**Version:** 2.0 (Proposed Revision: 2025-03-30)

### 1. Introduction/Overview

This document outlines the requirements for the "ML Visualization Suite," a web application designed to provide interactive visualizations for fundamental Machine Learning algorithms: Linear Regression, Logistic Regression, and K-Means Clustering. Users will be able to interactively add data points to a 2D plot and observe how these algorithms process the data and generate results (e.g., regression lines, decision boundaries, cluster assignments). The primary goal is to serve as an educational tool for visually understanding these core ML concepts using a modern, performant web stack.

### 2. Goals/Objectives

*   Provide a clean, intuitive, and responsive user interface for visualizing ML algorithms.
*   Visually demonstrate the process and outcome of Linear Regression on user-provided 2D data.
*   Visually demonstrate the process and outcome of Logistic Regression for binary classification on user-provided 2D data.
*   Visually demonstrate the iterative process and outcome of K-Means Clustering on user-provided 2D data.
*   Allow users to interactively add/remove data points and control relevant algorithm parameters (e.g., polynomial degree, learning rate, number of iterations, number of clusters).
*   Deliver clear visual and textual feedback on the algorithm's state, progress, and results (e.g., convergence status, cost/loss values, calculated parameters).
*   Build the application using a modern, maintainable, and scalable tech stack (React frontend, FastAPI backend).

### 3. Target Audience

*   Students learning Machine Learning fundamentals.
*   Educators demonstrating ML algorithms.
*   Developers and enthusiasts exploring visual representations of ML models.

### 4. Features & Functionality

**4.1. Core Architecture:**

*   **Frontend:** React for building the user interface.
*   **Backend:** FastAPI (Python framework) for serving API endpoints and performing ML computations.
*   **Communication:** Frontend communicates with the backend via asynchronous RESTful API calls (JSON).

**4.2. Main Navigation / Landing Page:**

*   A central landing page providing an overview of the available visualization modules (Linear Regression, Logistic Regression, K-Means).
*   Clear navigation links/cards to access each specific visualization module.

**4.3. Common Interactive Plot Component:**

*   A reusable React component displaying a 2D plot (using a library like Chart.js, Plotly.js, or D3.js).
*   Functionality to add data points by clicking on the plot. Class/label selection UI integrated where applicable (e.g., Logistic Regression).
*   Functionality to clear all data points from the plot and reset the associated algorithm state.
*   Visual rendering of algorithm results (lines, boundaries, cluster assignments, centroids) updated dynamically.

**4.4. Linear Regression Module:**

*   **UI:** Dedicated view/component within the React application.
*   **Controls:** Inputs for polynomial degree, learning rate (optional, potentially auto-tuned), number of iterations/steps. Button to trigger Gradient Descent.
*   **Backend Endpoint (`/api/linreg/compute`):**
    *   Accepts current data points, degree, and iteration parameters via POST request (using Pydantic models for validation).
    *   Performs feature engineering (polynomial features).
    *   Runs Gradient Descent (potentially step-by-step or full run).
    *   Returns JSON containing calculated line/curve points, convergence status, cost (e.g., MSE), and model coefficients.
*   **Visualization:** Plot updates dynamically to show the regression line evolving during iterations (optional) or the final result.

**4.5. Logistic Regression Module:**

*   **UI:** Dedicated view/component. UI for selecting class labels when adding points.
*   **Controls:** Inputs for polynomial degree, learning rate (optional), number of iterations/steps. Button to trigger Gradient Descent.
*   **Backend Endpoint (`/api/logreg/compute`):**
    *   Accepts current data points (with labels), degree, and iteration parameters via POST request (Pydantic validation).
    *   Performs feature engineering.
    *   Runs Gradient Descent using a suitable Logistic Regression cost function (e.g., Log Loss) and gradient updates.
    *   Calculates decision boundary points (e.g., using a mesh grid and prediction).
    *   Returns JSON containing boundary points, convergence status, cost, and model coefficients.
*   **Visualization:** Plot updates to show the decision boundary. Data points colored by class.

**4.6. K-Means Clustering Module:**

*   **UI:** Dedicated view/component.
*   **Controls:** Input for the number of clusters (`k`). Buttons for:
    *   Initialize/Reinitialize Centroids (randomly).
    *   Run Assignment Step.
    *   Run Update Centroids Step.
    *   Run Full Iteration.
    *   Run Until Convergence.
*   **Backend Endpoints (e.g., `/api/kmeans/initialize`, `/api/kmeans/step`):**
    *   Accept current data points and `k` (and potentially current centroids/assignments for stepping) via POST requests (Pydantic validation).
    *   `/initialize`: Randomly selects initial centroids from data points. Performs initial assignment.
    *   `/step`: Performs one step (assignment or update) based on request parameters. Tracks convergence.
    *   Endpoints return JSON containing current centroid coordinates, point assignments (cluster labels), and convergence status.
*   **Visualization:** Plot updates dynamically showing centroid movement and changes in point cluster assignments.

### 5. User Interface (UI) & User Experience (UX)

*   **Framework:** React.
*   **Styling:** Utilize a modern CSS framework (e.g., Tailwind CSS) or UI component library (e.g., Material UI, Chakra UI, Shadcn/ui) for a clean, consistent, and responsive design.
*   **Component-Based:** Structure the UI using reusable React components (Plot, Control Panel, Status Display, etc.).
*   **State Management:** Leverage React state management (e.g., `useState`, `useReducer`, Context API, or a library like Zustand/Redux Toolkit) to manage UI state, user inputs, and data fetched from the backend.
*   **Routing:** Use React Router for client-side routing between different visualization modules.
*   **Feedback:** Provide clear visual feedback during computations (e.g., loading indicators) and display results (cost, coefficients, convergence status) prominently.
*   **Responsiveness:** Ensure the layout adapts gracefully to different screen sizes (desktop, tablet, mobile).

### 6. Data Model & Management

*   **Frontend State:** The primary source of truth for current data points and UI control settings will reside in the React application's state.
*   **Backend:** FastAPI endpoints will be stateless. They receive data from the frontend, perform computations, and return results without persisting state between requests.
    *   Data validation using Pydantic models for all API inputs.
*   **Data Flow:**
    1.  User interacts with the React UI (adds points, changes parameters, clicks buttons).
    2.  Frontend state is updated.
    3.  Frontend sends relevant data (points, parameters) via API call to the FastAPI backend.
    4.  FastAPI endpoint validates input, performs ML calculation (using libraries like NumPy, Scikit-learn).
    5.  FastAPI returns results (plot coordinates, status, metrics) as JSON.
    6.  Frontend receives the response and updates its state, causing the UI (plot, status displays) to re-render.
*   **Persistence:** No requirement for persistent storage of user data or session state across browser refreshes in this version.

### 7. Non-Functional Requirements

*   **Performance:** Frontend should be responsive. Backend computations should be reasonably fast for typical educational dataset sizes (e.g., < 500 points). FastAPI's asynchronous capabilities can improve I/O handling if external resources were involved, but core ML computations remain CPU-bound.
*   **Scalability:** The stateless nature of the FastAPI backend makes it horizontally scalable (multiple instances can run behind a load balancer). Frontend scaling handled by standard web serving/CDN practices. Overall scalability limited by the single-user-session nature of the interaction model (no shared state).
*   **Maintainability:** Clean separation between frontend (React) and backend (FastAPI). Use of typed languages/features (TypeScript in React, Python type hints with Pydantic in FastAPI) improves code quality and maintainability.
*   **Security:** Basic input validation via Pydantic on the backend. Standard web security practices (e.g., HTTPS) should be applied during deployment. No authentication/authorization required for this version.
*   **Error Handling:** Graceful error handling on both frontend (e.g., displaying messages for failed API calls) and backend (returning appropriate HTTP error codes and messages).
*   **Testing:** Unit and integration tests are recommended for both backend API endpoints (e.g., using `pytest`) and frontend components (e.g., using Jest/React Testing Library).

### 8. Technology Stack Summary

*   **Frontend:** React (TypeScript recommended)
*   **Backend:** FastAPI (Python 3.x)
*   **ML Libraries:** NumPy, Scikit-learn (optional, but recommended for robust implementations)
*   **Plotting:** A JavaScript library compatible with React (e.g., Chart.js, Plotly.js, Recharts, D3.js)
*   **Routing:** React Router for client-side navigation
*   **Styling:** CSS Framework (e.g., Tailwind CSS) or Component Library (e.g., MUI, Chakra UI)
*   **Package Management:** `npm`/`yarn` (Frontend), `pip`/`poetry`/`uv` (Backend)
*   **API Specification:** OpenAPI (automatically generated by FastAPI)

### 9. Assumptions/Limitations

*   Designed for single-user sessions. State is not shared or persisted.
*   Focuses on visualization of the *results* and *key steps*, not necessarily a real-time, frame-by-frame animation of every single gradient update (though step-by-step execution is supported).
*   Dataset size and computational complexity are assumed to be within reasonable limits for interactive educational purposes.
