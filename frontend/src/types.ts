// Basic Point type for 2D coordinates
export interface Point {
  x: number;
  y: number;
}

// Point with a label (for classification)
export interface PointWithLabel extends Point {
  label: number; // 0 or 1 typically for binary classification
}

// Linear Regression Response
export interface LinRegResponsePayload {
  coefficients: number[];
  predictions: number[];
  cost: number;
  points: Point[];
}

// Linear Regression Request
export interface LinRegRequestPayload {
  points: Point[];
  degree: number;
}

// Logistic Regression Response
export interface LogRegResponsePayload {
  coefficients: number[];
  decision_boundary: number[][];
  boundary_x_coords: number[];
  boundary_y_coords: number[];
  cost: number;
  predictions: {
    probabilities: number[];
    class_predictions: number[];
  };
}

// Logistic Regression Request
export interface LogRegRequestPayload {
  points: PointWithLabel[];
  degree: number;
  iterations: number;
  learning_rate: number;
}

// K-Means Request
export interface KMeansStepRequestPayload {
  points: Point[];
  k: number;
  centroids?: Point[];
  assignments?: { [pointIndex: string]: number };
  step_type: 'initialize' | 'assign_points' | 'update_centroids' | 'full_iteration' | 'run_to_convergence';
  max_iterations?: number;
}

// K-Means Response
export interface KMeansResponsePayload {
  centroids: Point[];
  assignments: { [pointIndex: string]: number };
  converged: boolean;
  iterations_run: number;
}

// Generic Chart Dataset type for Chart.js
export interface PlotlyTrace {
  x: number[];
  y: number[];
  z?: number[][];
  mode?: string;
  type?: string;
  name?: string;
  marker?: {
    color?: string;
    size?: number;
    opacity?: number;
  };
  line?: {
    width?: number;
    color?: string;
  };
  contours?: {
    coloring?: string;
    showlabels?: boolean;
    labelfont?: {
      family?: string;
      size?: number;
      color?: string;
    };
    start?: number;
    end?: number;
    size?: number;
  };
}
