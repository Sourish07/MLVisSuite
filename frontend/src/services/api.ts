import axios from 'axios';
import type {
    LinRegRequestPayload, LinRegResponsePayload,
    LogRegRequestPayload, LogRegResponsePayload,
    KMeansStepRequestPayload, KMeansResponsePayload
} from '../types';

const apiClient = axios.create({
    baseURL: '/api', // Simpler approach: just use relative URL that our Vite proxy will handle
    headers: {
        'Content-Type': 'application/json',
    },
});

// Error Handling Helper
const handleApiError = (error: unknown, context: string) => {
    console.error(`API Error (${context}):`, error);
    if (axios.isAxiosError(error)) {
        // Handle specific Axios error details (e.g., response status, data)
        const message = error.response?.data?.detail || error.message || 'An unknown API error occurred';
        alert(`Error: ${message}`); // Simple alert for user feedback, could be improved
        return Promise.reject(new Error(message));
    } else {
        // Handle non-Axios errors
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        alert(`Error: ${message}`);
        return Promise.reject(new Error(message));
    }
};

// --- API Functions ---

export const computeLinearRegression = async (
    payload: LinRegRequestPayload
): Promise<LinRegResponsePayload> => {
    try {
        const response = await apiClient.post<LinRegResponsePayload>('/linreg/compute', payload);
        return response.data;
    } catch (error) {
        return handleApiError(error, 'Linear Regression');
    }
};

export const computeLogisticRegression = async (
    payload: LogRegRequestPayload
): Promise<LogRegResponsePayload> => {
    try {
        const response = await apiClient.post<LogRegResponsePayload>('/logreg/compute', payload);
        return response.data;
    } catch (error) {
        return handleApiError(error, 'Logistic Regression');
    }
};

export const initializeKMeans = async (
    payload: KMeansStepRequestPayload
): Promise<KMeansResponsePayload> => {
    try {
        // Note: The backend uses the /kmeans/step endpoint even for initialization
        const stepPayload: KMeansStepRequestPayload = {
            ...payload,
            step_type: 'initialize',
        };
        const response = await apiClient.post<KMeansResponsePayload>('/kmeans/step', stepPayload);
        return response.data;
    } catch (error) {
        return handleApiError(error, 'K-Means Initialization');
    }
};

export const stepKMeans = async (
    payload: KMeansStepRequestPayload
): Promise<KMeansResponsePayload> => {
    try {
        const response = await apiClient.post<KMeansResponsePayload>('/kmeans/step', payload);
        return response.data;
    } catch (error) {
        return handleApiError(error, `K-Means Step (${payload.step_type})`);
    }
};

export default apiClient;
