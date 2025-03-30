import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import (LinRegRequest, LinRegResponse, 
                     LogRegRequest, LogRegResponse, 
                     KMeansInitRequest, KMeansStepRequest, KMeansResponse, Point, PointWithLabel)
from algorithms import (compute_linear_regression, compute_logistic_regression,
                         initialize_kmeans, step_kmeans)

app = FastAPI(
    title="ML Visualization Suite Backend",
    description="API for performing ML computations for visualization.",
    version="1.0.0"
)

# Configure CORS
origins = [
    "http://localhost:3000",  # Allow Next.js dev server
    "localhost:3000" # Sometimes needed without http
    # Add deployed frontend URL here later
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to the ML Visualization Suite Backend!"}

# Placeholder endpoints - to be implemented later
@app.post("/api/linreg/compute", response_model=LinRegResponse, tags=["Linear Regression"])
async def handle_linear_regression(request: LinRegRequest):
    try:
        result = compute_linear_regression(
            request.points,
            request.degree,
            request.iterations,
            request.learning_rate
        )
        return LinRegResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Log the exception e
        raise HTTPException(status_code=500, detail="Internal server error during linear regression.")

@app.post("/api/logreg/compute", response_model=LogRegResponse, tags=["Logistic Regression"])
async def handle_logistic_regression(request: LogRegRequest):
    try:
        result = compute_logistic_regression(
            request.points,
            request.degree,
            request.iterations,
            request.learning_rate
        )
        return LogRegResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Log the exception e
        raise HTTPException(status_code=500, detail="Internal server error during logistic regression.")

@app.post("/api/kmeans/initialize", response_model=KMeansResponse, tags=["K-Means"])
async def handle_kmeans_initialize(request: KMeansInitRequest):
    try:
        # Directly call step_kmeans with 'initialize' type
        result = step_kmeans(
            points=request.points,
            k=request.k,
            centroids_in=None, # Not needed for init
            assignments_in=None, # Not needed for init
            step_type='initialize',
            max_iterations=1 # Not used for init
        )
        return KMeansResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Log the exception e
        raise HTTPException(status_code=500, detail="Internal server error during K-Means initialization.")

@app.post("/api/kmeans/step", response_model=KMeansResponse, tags=["K-Means"])
async def handle_kmeans_step(request: KMeansStepRequest):
    try:
        result = step_kmeans(
            points=request.points,
            k=request.k,
            centroids_in=request.centroids,
            assignments_in=request.assignments,
            step_type=request.step_type,
            max_iterations=request.max_iterations
        )
        return KMeansResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Log the exception e
        raise HTTPException(status_code=500, detail=f"Internal server error during K-Means step ({request.step_type}).")

# Example of how to run locally (though typically done via uvicorn command)
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)
