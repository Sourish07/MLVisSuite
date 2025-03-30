import type { PlotData } from 'plotly.js';

// --- Common Types ---

export interface Point {
    x: number;
    y: number;
}

export interface PointWithLabel extends Point {
    label: number; // 0 or 1
}

// --- API Request Payloads ---

export interface LinRegRequestPayload {
    points: Point[];
    degree: number;
    iterations?: number;
    learning_rate?: number;
}

export interface LogRegRequestPayload {
    points: PointWithLabel[];
    degree: number;
    iterations?: number;
    learning_rate?: number;
}

export interface KMeansInitRequestPayload {
    points: Point[];
    k: number;
}

export interface KMeansStepRequestPayload {
    points: Point[];
    k: number;
    centroids?: Point[];
    assignments?: { [pointIndex: string]: number }; // JSON keys are strings
    step_type: 'initialize' | 'assign_points' | 'update_centroids' | 'full_iteration' | 'run_to_convergence';
    max_iterations?: number;
}

// --- API Response Payloads ---

export interface LinRegResponsePayload {
    line_points: Point[];
    coefficients: number[];
    cost?: number | null;
    iterations_run?: number | null;
    converged?: boolean | null;
}

export interface LogRegResponsePayload {
    decision_boundary: number[][];
    boundary_x_coords: number[];
    boundary_y_coords: number[];
    coefficients: number[];
    cost?: number | null;
    iterations_run?: number | null;
    converged?: boolean | null;
}

export interface KMeansResponsePayload {
    centroids: Point[];
    assignments: { [pointIndex: string]: number }; // JSON keys are strings
    converged: boolean;
    iterations_run?: number | null;
}

// --- Frontend Specific Types ---

// Extend Plotly's PlotData type if needed, or use it directly
export type PlotlyTrace = Partial<PlotData>;

export type AlgorithmType = 'linear-regression' | 'logistic-regression' | 'kmeans';

