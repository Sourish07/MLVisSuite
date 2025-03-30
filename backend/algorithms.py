# Core ML algorithm implementations
import numpy as np
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import mean_squared_error, log_loss
from sklearn.cluster import KMeans
from sklearn.exceptions import ConvergenceWarning
import warnings
from models import Point, PointWithLabel

# --- Helper Functions ---

def points_to_numpy(points_list):
    """Convert list of Pydantic Point models to NumPy array."""
    if not points_list:
        return np.empty((0, 2))
    return np.array([[p.x, p.y] for p in points_list])

def points_with_labels_to_numpy(points_list):
    """Convert list of Pydantic PointWithLabel models to NumPy arrays X and y."""
    if not points_list:
        return np.empty((0, 2)), np.empty((0,))
    X = np.array([[p.x, p.y] for p in points_list])
    y = np.array([p.label for p in points_list])
    return X, y

def numpy_to_points(np_array):
    """Convert NumPy array back to list of Pydantic Point models."""
    return [{'x': row[0], 'y': row[1]} for row in np_array]

# --- Linear Regression ---

def compute_linear_regression(points, degree, iterations, learning_rate):
    """Computes linear (or polynomial) regression."""
    X = points_to_numpy(points)
    if X.shape[0] < 2 or X.shape[0] <= degree:
        # Not enough points to fit the model reliably
        return {
            "line_points": [],
            "coefficients": [],
            "cost": None,
            "converged": False
        }
    
    y = X[:, 1] # In this setup, we predict y from x
    X_feat = X[:, 0].reshape(-1, 1)

    poly = PolynomialFeatures(degree=degree, include_bias=False)
    X_poly = poly.fit_transform(X_feat)

    # Using scikit-learn's implementation for simplicity and robustness
    # Note: Scikit-learn's LinearRegression uses analytical solution (Normal Equation) or SVD,
    # not Gradient Descent by default. GD is more illustrative but less efficient here.
    # If GD is strictly required, we'd implement it manually.
    model = LinearRegression()
    model.fit(X_poly, y)

    # Generate points for the line/curve
    x_range = np.linspace(X_feat.min(), X_feat.max(), 100).reshape(-1, 1)
    x_range_poly = poly.transform(x_range)
    y_pred_range = model.predict(x_range_poly)
    line_points = numpy_to_points(np.hstack((x_range, y_pred_range.reshape(-1, 1))))

    # Calculate cost (MSE)
    y_pred = model.predict(X_poly)
    cost = mean_squared_error(y, y_pred)

    coeffs = list(model.coef_)
    if hasattr(model, 'intercept_'):
        coeffs.insert(0, model.intercept_) # Add intercept if it exists

    return {
        "line_points": line_points,
        "coefficients": coeffs,
        "cost": cost,
        "converged": True # Scikit-learn's fit always 'converges' for LinearRegression
    }

# --- Logistic Regression ---

def compute_logistic_regression(points_with_labels, degree, iterations, learning_rate):
    """Computes logistic regression and decision boundary."""
    X, y = points_with_labels_to_numpy(points_with_labels)

    if X.shape[0] < 2 or len(np.unique(y)) < 2:
        # Not enough points or only one class present
        return {
            "decision_boundary": [],
            "boundary_x_coords": [],
            "boundary_y_coords": [],
            "coefficients": [],
            "cost": None,
            "converged": False
        }

    poly = PolynomialFeatures(degree=degree, include_bias=False)
    X_poly = poly.fit_transform(X)

    # Using scikit-learn's LogisticRegression.
    # We can potentially use SGDClassifier(loss='log_loss', max_iter=iterations, learning_rate='constant', eta0=learning_rate)
    # for a closer match to manual GD, but LogisticRegression is often more stable.
    model = LogisticRegression(solver='liblinear', max_iter=iterations) # liblinear is good for small datasets
    # Suppress ConvergenceWarning if max_iter is reached
    with warnings.catch_warnings():
        warnings.filterwarnings("ignore", category=ConvergenceWarning)
        model.fit(X_poly, y)

    converged = model.n_iter_[0] < model.max_iter if hasattr(model, 'n_iter_') else None

    # Generate mesh grid for decision boundary
    x_min, x_max = X[:, 0].min() - 1, X[:, 0].max() + 1
    y_min, y_max = X[:, 1].min() - 1, X[:, 1].max() + 1
    xx, yy = np.meshgrid(np.linspace(x_min, x_max, 100),
                       np.linspace(y_min, y_max, 100))

    grid_points = np.c_[xx.ravel(), yy.ravel()]
    grid_points_poly = poly.transform(grid_points)
    Z = model.predict_proba(grid_points_poly)[:, 1] # Probability of class 1
    Z = Z.reshape(xx.shape)

    # Calculate cost (Log Loss)
    try:
        y_pred_proba = model.predict_proba(X_poly)
        cost = log_loss(y, y_pred_proba)
    except Exception:
        cost = None # May fail if only one class predicted

    coeffs = list(model.coef_[0])
    if hasattr(model, 'intercept_'):
        coeffs.insert(0, model.intercept_[0])

    return {
        "decision_boundary": Z.tolist(),
        "boundary_x_coords": xx[0, :].tolist(), # First row of x coordinates
        "boundary_y_coords": yy[:, 0].tolist(), # First column of y coordinates
        "coefficients": coeffs,
        "cost": cost,
        "iterations_run": model.n_iter_[0] if hasattr(model, 'n_iter_') else None,
        "converged": converged
    }

# --- K-Means Clustering ---

def initialize_kmeans(points, k):
    """Initializes K-Means: selects initial centroids and performs first assignment."""
    X = points_to_numpy(points)
    if X.shape[0] < k:
        raise ValueError("Not enough points to form k clusters")

    kmeans = KMeans(n_clusters=k, init='k-means++', n_init=1, max_iter=1) # Use k-means++ and run only initialization
    kmeans.fit(X)

    centroids = numpy_to_points(kmeans.cluster_centers_)
    assignments = {i: int(label) for i, label in enumerate(kmeans.labels_)}

    return {
        "centroids": centroids,
        "assignments": assignments,
        "converged": False, # Initialization is just the start
        "iterations_run": 0
    }

def step_kmeans(points, k, centroids_in, assignments_in, step_type, max_iterations):
    """Performs a step or full run of the K-Means algorithm."""
    X = points_to_numpy(points)
    if X.shape[0] == 0:
        raise ValueError("No points provided for K-Means")

    if step_type == 'initialize':
        return initialize_kmeans(points, k)

    # --- Steps requiring existing state ---
    if centroids_in is None:
         raise ValueError(f"Centroids required for step type '{step_type}'")
    initial_centroids = points_to_numpy(centroids_in)
    if initial_centroids.shape[0] != k:
         raise ValueError(f"Number of centroids ({initial_centroids.shape[0]}) does not match k ({k})")

    # Use scikit-learn's KMeans, potentially manipulating it for single steps
    if step_type == 'assign_points':
        # Calculate distances and assign points to nearest centroid
        kmeans = KMeans(n_clusters=k, init=initial_centroids, n_init=1, max_iter=1)
        kmeans.cluster_centers_ = initial_centroids # Set the centroids
        labels = kmeans.predict(X) # Perform assignment
        assignments = {i: int(label) for i, label in enumerate(labels)}
        # Centroids don't change in this step
        return {
            "centroids": centroids_in,
            "assignments": assignments,
            "converged": False,
            "iterations_run": None
        }

    elif step_type == 'update_centroids':
        if assignments_in is None:
            raise ValueError("Assignments required for step type 'update_centroids'")
        if len(assignments_in) != X.shape[0]:
            raise ValueError("Number of assignments does not match number of points")
        
        labels = np.array([assignments_in[str(i)] for i in range(X.shape[0])]) # Ensure keys are handled correctly (JSON keys are strings)
        
        new_centroids = np.zeros((k, X.shape[1]))
        for i in range(k):
            cluster_points = X[labels == i]
            if len(cluster_points) > 0:
                new_centroids[i, :] = cluster_points.mean(axis=0)
            else:
                # Handle empty cluster - reassign centroid (e.g., to furthest point, or keep old one)
                # Keep old one for simplicity here
                 new_centroids[i, :] = initial_centroids[i, :]

        # Check for convergence (if centroids didn't change)
        converged = np.allclose(initial_centroids, new_centroids)
        
        return {
            "centroids": numpy_to_points(new_centroids),
            "assignments": assignments_in, # Assignments don't change in this step
            "converged": converged,
            "iterations_run": None
        }

    elif step_type == 'full_iteration':
         # Perform assignment step then update step
        kmeans = KMeans(n_clusters=k, init=initial_centroids, n_init=1, max_iter=1)
        kmeans.cluster_centers_ = initial_centroids
        labels = kmeans.predict(X)
        
        new_centroids = np.zeros((k, X.shape[1]))
        for i in range(k):
            cluster_points = X[labels == i]
            if len(cluster_points) > 0:
                new_centroids[i, :] = cluster_points.mean(axis=0)
            else:
                 new_centroids[i, :] = initial_centroids[i, :] # Keep old centroid if cluster empty

        converged = np.allclose(initial_centroids, new_centroids)
        assignments = {i: int(label) for i, label in enumerate(labels)}

        return {
            "centroids": numpy_to_points(new_centroids),
            "assignments": assignments,
            "converged": converged,
            "iterations_run": 1
        }

    elif step_type == 'run_to_convergence':
        kmeans = KMeans(n_clusters=k, init=initial_centroids, n_init=1, max_iter=max_iterations, tol=1e-4)
        kmeans.fit(X)
        
        converged = kmeans.n_iter_ < max_iterations
        centroids = numpy_to_points(kmeans.cluster_centers_)
        assignments = {i: int(label) for i, label in enumerate(kmeans.labels_)}

        return {
            "centroids": centroids,
            "assignments": assignments,
            "converged": converged,
            "iterations_run": kmeans.n_iter_
        }

    else:
        raise ValueError(f"Unknown K-Means step type: {step_type}")
