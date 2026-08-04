# Brain Tumor Classification using Metaheuristic-Optimized Deep Learning

This repository contains the source code for our major college project: a full-stack medical diagnostic tool designed to classify brain tumors from MRI scans. 

The core of this project is a Convolutional Neural Network (CNN) whose hyperparameters were optimized using metaheuristic algorithms to improve accuracy. To make this model actually usable in a real-world scenario, we built a complete web application around it.

## The Architecture

When designing this system, we wanted to ensure the deep learning model didn't bottleneck the web application. We split the architecture into two distinct microservices:

1. **Backend (Python / FastAPI):** We chose FastAPI over Flask/Django because of its asynchronous capabilities. Image preprocessing (using OpenCV) and AI inference (TensorFlow) are computationally heavy, and FastAPI handles these I/O bound tasks efficiently. We also implemented JWT authentication and role-based access control (RBAC) to separate admin accounts from standard doctor accounts.
2. **Frontend (React / Vite):** The client-side is built with React. We focused heavily on perceived performance. Since AI inference can take a few seconds, we implemented skeleton loaders and asynchronous state management to ensure the UI never feels frozen.

## Key Features

- **Automated Tumor Detection:** Identifies Glioma, Meningioma, Pituitary tumors, or healthy scans from uploaded MRIs.
- **Dynamic Model Loading:** The backend is designed to automatically detect and load the `.keras` model file on startup, failing over to mock data gracefully if the file isn't present during development.
- **Client-Side Report Generation:** To save server CPU cycles, diagnostic PDF reports are generated directly in the user's browser using `html2canvas` and `jspdf`.
- **Dockerized Environment:** TensorFlow can have tricky dependency issues across different operating systems. We containerized the backend using Docker so that the Python 3.11 environment is perfectly reproducible anywhere.

## Running the Project Locally

### 1. Starting the Backend (Docker)
You will need Docker Desktop installed to run the backend, as it requires a specific Python environment for TensorFlow.

```bash
cd backend
# Build the image
docker build -t brain-tumor-backend .
# Run the container
docker run -p 8000:8000 brain-tumor-backend
```
The API will be available at `http://localhost:8000`.

### 2. Starting the Frontend
You will need Node.js installed. Open a separate terminal:

```bash
cd frontend
npm install
npm run dev
```
The application will be available at `http://localhost:5173`.

## Adding or Updating the Model
If you are collaborating on this project and have trained a new version of the metaheuristic model:
1. Export your model as a `.keras` file.
2. Name it exactly `brain_tumor_model.keras`.
3. Drop it into the `backend/` directory. The backend will automatically pick it up the next time the Docker container starts.

## Future Improvements
- Currently, the database uses SQLite. For a production deployment, we plan to migrate to PostgreSQL (Neon).
- We want to implement real GradCAM overlay generation in the Python backend to provide visual explainability for *why* the AI made its classification.
