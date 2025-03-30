# ML Visualization Suite

An interactive web application for visualizing fundamental Machine Learning algorithms: Linear Regression, Logistic Regression, and K-Means Clustering. This educational tool allows users to add data points to a 2D plot and observe how these algorithms process data and generate results.

## Features

- **Linear Regression**: Add data points and visualize the best-fit line/curve
  - Adjust polynomial degree for non-linear relationships
  - Set learning rate and iterations for gradient descent
  - View model coefficients and error metrics
  
- **Logistic Regression**: Create binary classification datasets and see the decision boundary
  - Add points with different class labels
  - Adjust polynomial degree to create non-linear decision boundaries
  - Visualize the optimal decision boundary
  
- **K-Means Clustering**: Watch how data points get clustered in an iterative process
  - Add data points and select the number of clusters (k)
  - Step through the algorithm one iteration at a time
  - View cluster assignments and centroid positions

## Project Structure

```
mlviz2/
├── backend/            # FastAPI backend
│   ├── app/            # Python package for application
│   │   ├── algorithms/ # Implementation of ML algorithms
│   │   └── main.py     # FastAPI application entry point
│   └── requirements.txt # Python dependencies
├── frontend/           # React frontend
│   ├── src/            # Source code
│   │   ├── components/ # Reusable React components
│   │   ├── pages/      # Page components for each algorithm
│   │   └── utils/      # Utility functions and API client
│   └── package.json    # JavaScript dependencies
└── README.md           # This file
```

## Prerequisites

- Node.js (v16 or later)
- Python (v3.9 or later)
- npm or yarn
- pip

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```
     source venv/bin/activate
     ```

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Start the backend server:
   ```
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   The backend will be available at http://localhost:8000

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and go to http://localhost:5173

## Usage Guide

### Linear Regression

1. Navigate to the Linear Regression page
2. Click on the plot to add data points
3. Adjust the polynomial degree using the slider (1 for a straight line, >1 for curves)
4. Set the learning rate and maximum iterations if needed
5. Click "Run Linear Regression" to compute and visualize the regression line
6. View the results including coefficients and cost (MSE)

### Logistic Regression

1. Navigate to the Logistic Regression page
2. Select a class label (blue or red) using the toggle buttons
3. Click on the plot to add data points for each class
4. Adjust the polynomial degree to create more complex decision boundaries
5. Click "Run Logistic Regression" to compute and visualize the decision boundary
6. View the results including model coefficients and cost (Log Loss)

### K-Means Clustering

1. Navigate to the K-Means Clustering page
2. Click on the plot to add data points
3. Select the number of clusters (K) using the slider
4. Click "Initialize Centroids" to randomly place initial cluster centers
5. Use the step buttons to see the algorithm in action:
   - "Assignment Step": Assign each point to the nearest centroid
   - "Update Step": Move each centroid to the mean of its assigned points
   - "Full Iteration": Perform both steps in sequence
   - "Run Until Convergence": Complete the entire clustering process
6. Observe how the clusters evolve and eventually converge

## Technologies Used

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Plotly.js
- **Backend**: FastAPI, NumPy, Python
- **API Communication**: RESTful JSON API

## Development

- Frontend development server includes hot module replacement for rapid development
- Backend includes auto-reload when code changes are detected
- API documentation available at http://localhost:8000/docs when backend is running

## License

MIT 