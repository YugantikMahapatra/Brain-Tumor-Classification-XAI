# NeuroScan AI - System Architecture & Deployment Guide

## Overview
NeuroScan AI is a containerized, Explainable AI (XAI) Clinical Decision Support System for multi-class brain tumor classification from axial MRI scans.

### Target Classes
1. Glioma
2. Meningioma
3. Pituitary Tumor
4. No Tumor (Healthy)

### Architecture
- **Frontend:** React 18, Vite, Tailwind CSS (Port 5173)
- **Backend:** FastAPI, Python 3.11, Uvicorn ASGI (Port 8000)
- **Deep Learning:** EfficientNetB0 (`brain_tumor_model.keras`)
- **XAI:** Grad-CAM via `tf.GradientTape` hooking layer `top_conv`
- **Deployment:** Docker (`brain-tumor-backend:latest`)
