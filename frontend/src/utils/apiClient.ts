import axios from 'axios'

// Common types used across the application
export interface Point {
  x: number
  y: number
}

export interface LabeledPoint extends Point {
  label: number
}

export interface ClusteredPoint extends Point {
  cluster: number
}

export interface Centroid extends Point {
  cluster: number
}

// Linear Regression Types
export interface LinearRegressionRequest {
  points: Point[]
  degree: number
  learning_rate: number
  iterations: number
}

export interface LinearRegressionResponse {
  line_points: Point[]
  coefficients: number[]
  cost: number
  converged: boolean
  iterations_run: number
  message?: string
}

// Logistic Regression Types
export interface LogisticRegressionRequest {
  points: LabeledPoint[]
  degree: number
  learning_rate: number
  iterations: number
}

export interface LogisticRegressionResponse {
  boundary_points: Point[]
  coefficients: number[]
  cost: number
  converged: boolean
  iterations_run: number
  message?: string
}

// K-Means Types
export interface KMeansRequest {
  points: Point[]
  k: number
}

export interface KMeansStepRequest {
  points: Point[]
  centroids: Centroid[]
  step_type: 'assignment' | 'update'
}

export interface KMeansResponse {
  centroids: Centroid[]
  assignments: ClusteredPoint[]
  converged: boolean
  iterations?: number
  message?: string
}

// API client instance
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// API methods
export const api = {
  // Linear Regression
  linearRegression: {
    compute: (data: LinearRegressionRequest) => 
      apiClient.post<LinearRegressionResponse>('/linreg/compute', data),
  },
  
  // Logistic Regression
  logisticRegression: {
    compute: (data: LogisticRegressionRequest) => 
      apiClient.post<LogisticRegressionResponse>('/logreg/compute', data),
  },
  
  // K-Means Clustering
  kMeans: {
    initialize: (data: KMeansRequest) => 
      apiClient.post<KMeansResponse>('/kmeans/initialize', data),
    
    step: (data: KMeansStepRequest) => 
      apiClient.post<KMeansResponse>('/kmeans/step', data),
    
    run: (data: KMeansRequest) => 
      apiClient.post<KMeansResponse>('/kmeans/run', data),
  },
}

export default api 