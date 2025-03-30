# Pydantic models for API request/response validation
from typing import List, Tuple, Optional, Literal, Dict
from pydantic import BaseModel, Field

# --- Common Types ---

class Point(BaseModel):
    x: float
    y: float

class PointWithLabel(BaseModel):
    x: float
    y: float
    label: int # e.g., 0 or 1 for logistic regression

# --- Linear Regression ---

class LinRegRequest(BaseModel):
    points: List[Point] = Field(..., description="List of 2D data points")
    degree: int = Field(1, ge=1, le=5, description="Polynomial degree for features")
    iterations: Optional[int] = Field(1000, ge=1, le=10000, description="Number of gradient descent iterations")
    learning_rate: Optional[float] = Field(0.01, gt=0, le=1, description="Learning rate for gradient descent")

class LinRegResponse(BaseModel):
    line_points: List[Point] = Field(..., description="Points defining the calculated regression line/curve")
    coefficients: List[float] = Field(..., description="Calculated model coefficients")
    cost: Optional[float] = Field(None, description="Final cost (e.g., Mean Squared Error)")
    iterations_run: Optional[int] = Field(None, description="Actual iterations run (if stopped early)")
    converged: Optional[bool] = Field(None, description="Whether the algorithm converged")

# --- Logistic Regression ---

class LogRegRequest(BaseModel):
    points: List[PointWithLabel] = Field(..., description="List of 2D data points with binary labels (0 or 1)")
    degree: int = Field(1, ge=1, le=5, description="Polynomial degree for features")
    iterations: Optional[int] = Field(1000, ge=1, le=10000, description="Number of gradient descent iterations")
    learning_rate: Optional[float] = Field(0.01, gt=0, le=1, description="Learning rate for gradient descent")

class LogRegResponse(BaseModel):
    decision_boundary: List[List[float]] = Field(..., description="Grid values for plotting the decision boundary contour")
    boundary_x_coords: List[float] = Field(..., description="X coordinates corresponding to the grid")
    boundary_y_coords: List[float] = Field(..., description="Y coordinates corresponding to the grid")
    coefficients: List[float] = Field(..., description="Calculated model coefficients")
    cost: Optional[float] = Field(None, description="Final cost (e.g., Log Loss)")
    iterations_run: Optional[int] = Field(None, description="Actual iterations run (if stopped early)")
    converged: Optional[bool] = Field(None, description="Whether the algorithm converged")

# --- K-Means Clustering ---

class KMeansInitRequest(BaseModel):
    points: List[Point] = Field(..., description="List of 2D data points")
    k: int = Field(..., gt=0, le=10, description="Number of clusters")

class KMeansStepRequest(BaseModel):
    points: List[Point] = Field(..., description="List of 2D data points")
    k: int = Field(..., gt=0, le=10, description="Number of clusters")
    centroids: Optional[List[Point]] = Field(None, description="Current centroid coordinates (required for 'update_centroids' and 'assign_points' steps)")
    assignments: Optional[Dict[int, int]] = Field(None, description="Current assignment of point index to cluster index (required for 'update_centroids' step)")
    step_type: Literal['initialize', 'assign_points', 'update_centroids', 'full_iteration', 'run_to_convergence'] = Field(..., description="Type of K-Means step to perform")
    max_iterations: Optional[int] = Field(100, ge=1, le=1000, description="Maximum iterations for 'run_to_convergence'")

class KMeansResponse(BaseModel):
    centroids: List[Point] = Field(..., description="Current/final centroid coordinates")
    assignments: Dict[int, int] = Field(..., description="Assignment of point index to cluster index")
    converged: bool = Field(False, description="Whether the algorithm converged (relevant for 'run_to_convergence')")
    iterations_run: Optional[int] = Field(None, description="Number of iterations performed (relevant for 'run_to_convergence')")

