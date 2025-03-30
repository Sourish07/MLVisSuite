# ML Visualization Suite

This project provides interactive visualizations for fundamental Machine Learning algorithms: Linear Regression, Logistic Regression, and K-Means Clustering. It serves as an educational tool to visually understand these core ML concepts.

## Overview

The application consists of two main parts:

1.  **Backend:** A FastAPI (Python) application that handles the ML computations.
2.  **Frontend:** A Next.js (React/TypeScript) application that provides the user interface and interactive plots.

## Prerequisites

Before you begin, ensure you have the following installed:

*   **Python:** Version 3.8 or higher. ([Download Python](https://www.python.org/downloads/))
*   **Node.js:** Version 18.x or higher (includes npm). ([Download Node.js](https://nodejs.org/))
*   **pip:** Python package installer (usually comes with Python).
*   **uv:** Optional, but recommended for faster environment and package management ([Install uv](https://github.com/astral-sh/uv#installation))

## Setup

Follow these steps to set up both the backend and frontend environments.

### 1. Backend Setup

Navigate to the `backend` directory and set up a Python environment using `uv` (recommended) or standard `venv`.

**Using uv (Recommended):**

```bash
cd backend

# Create virtual environment and install dependencies
uv venv
uv pip install -r requirements.txt

# Activate the environment (needed for running uvicorn directly)
# On macOS/Linux:
source .venv/bin/activate 
# On Windows:
# .\.venv\Scripts\activate
```

**Using venv:**

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# .\venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

### 2. Frontend Setup

Navigate to the `frontend` directory and install Node.js dependencies:

```bash
cd ../frontend 

# Install dependencies using npm or yarn
npm install
# or
# yarn install
```

## Running the Application

Both the backend and frontend servers need to be running simultaneously.

### 1. Start the Backend Server

Make sure you are in the `backend` directory with your virtual environment activated.

**If using uv:**

```bash
cd ../backend # Or navigate to the backend directory if not already there
source .venv/bin/activate # Or .\.venv\Scripts\activate on Windows

# Run the FastAPI server (port 8000 by default)
uvicorn main:app --reload --port 8000
# Alternatively, run directly using uv without activating:
# uv run uvicorn main:app --reload --port 8000
```

**If using venv:**
```bash
cd ../backend # Or navigate to the backend directory if not already there
source venv/bin/activate # Or .\venv\Scripts\activate on Windows

# Run the FastAPI server (port 8000 by default)
uvicorn main:app --reload --port 8000
```

### 2. Start the Frontend Development Server

Open a *new* terminal window/tab. Navigate to the `frontend` directory.

```bash
cd ../frontend # Or navigate to the frontend directory

# Run the Next.js development server (port 3000 by default)
npm run dev
# or
# yarn dev
```

### 3. Access the Application

Once both servers are running, open your web browser and navigate to:

[http://localhost:3000](http://localhost:3000)

You should see the ML Visualization Suite landing page.

## Technology Stack

*   **Frontend:** Next.js, React, TypeScript, Plotly.js, Tailwind CSS, Axios
*   **Backend:** FastAPI, Python, Pydantic, NumPy, Scikit-learn, Uvicorn
