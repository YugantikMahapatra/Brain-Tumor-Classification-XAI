# Brain Tumor Classification Using Metaheuristic AI

## 1. Project Abstract & Synopsis
Brain tumors are one of the most severe and life-threatening conditions, requiring early and accurate diagnosis for effective treatment. Magnetic Resonance Imaging (MRI) is the primary technique used for detecting brain tumors, but manual interpretation is time-consuming and prone to human error. 

This project presents a robust, end-to-end web application that leverages Deep Learning combined with advanced Metaheuristic Algorithms (Particle Swarm Optimization - PSO, and Grey Wolf Optimizer - GWO) to automatically classify MRI scans into four distinct categories: **Glioma, Meningioma, Pituitary, and No Tumor (Healthy)**. 

By integrating a state-of-the-art AI model with a modern, user-friendly frontend (React.js) and a high-performance containerized backend (FastAPI, Docker), this system empowers medical professionals to receive instant, highly accurate diagnostic reports, track patient history via dynamic dashboards, and download comprehensive PDF medical reports.

---

## 2. System Architecture & Workflow

The application follows a modern decoupled architecture, ensuring scalability, security, and performance.

### **Technology Stack**
* **Frontend:** React.js, Tailwind CSS, Framer Motion (for fluid animations), Chart.js (for probability visualization).
* **Backend:** Python, FastAPI, SQLAlchemy (SQLite Database).
* **AI/ML Engine:** TensorFlow / Keras, OpenCV, NumPy.
* **Infrastructure:** Docker (Containerized backend to ensure environment reproducibility and solve complex ML dependency trees).

### **System Workflow**
1. **Authentication:** The Doctor/User logs into the secure portal using JWT-based authentication.
2. **Dashboard:** The user is greeted by a dynamic dashboard that fetches their historical scan statistics directly from the SQLite database.
3. **Upload Phase:** The user uploads a patient's MRI scan via a drag-and-drop interface. The frontend securely POSTs the image to the FastAPI backend.
4. **Inference Phase:** The backend intercepts the image, preprocesses it (resizing, scaling), and feeds it into the `MetaHeuristic_best_model.keras` AI engine.
5. **Idempotency & Storage:** The backend processes the image, saves the inference results (prediction class and confidence probabilities) to the database, and ensures duplicate uploads are ignored.
6. **Result Generation:** The React frontend receives the results and dynamically renders a professional medical report, which can be downloaded as a PDF using `jsPDF` and `html2canvas`.

---

## 3. Dataset, Model & Metaheuristic Details

### **Dataset**
The model was trained on a comprehensive Brain Tumor MRI Dataset containing thousands of scans divided into four distinct classes:
1. **Glioma Tumor**
2. **Meningioma Tumor**
3. **Pituitary Tumor**
4. **No Tumor (Healthy Brain)**

### **Deep Learning Model**
The core engine is a Convolutional Neural Network (CNN) built with TensorFlow/Keras. CNNs are highly effective for spatial data like images, utilizing convolutional layers to automatically extract features (edges, textures, shapes) from the MRI scans.

### **PSO & GWO Integration**
To achieve maximum accuracy and overcome the limitations of traditional gradient descent algorithms (like getting stuck in local minima), this project integrates **Metaheuristic Optimization Algorithms**:
* **Particle Swarm Optimization (PSO):** Inspired by the social foraging behavior of birds, PSO is used to globally optimize the hyperparameters of the CNN (such as learning rate, batch size, and dropout rates), ensuring the model converges at the optimal global minimum.
* **Grey Wolf Optimizer (GWO):** Inspired by the leadership hierarchy and hunting mechanism of grey wolves, GWO acts in tandem with the CNN for advanced feature selection—identifying the most critical pixels in the MRI scan that correlate to a tumor, thereby massively reducing computational overhead and increasing prediction accuracy.

---

## 4. UI Design & User Experience (UX)

The user interface was designed to be enterprise-grade, clean, and highly intuitive for medical professionals. 
*(Note for PPT: You can take screenshots of these screens to include in your presentation).*

* **Login/Register:** Secure glassmorphism entry portals.
* **Analytics Dashboard (`Dashboard.jsx`):** Features dynamic Chart.js bar graphs representing weekly analysis activity, animated statistics cards for Total Scans and Average Confidence, and a live-feed of Recent Findings.
* **Upload Portal (`Upload.jsx`):** A drag-and-drop zone with animated progress bars, giving the user immediate visual feedback during the AI analysis phase.
* **Prediction Report (`PredictionResult.jsx`):** The crown jewel of the UI. It displays the original MRI scan, the primary diagnosis in a color-coded verdict card (Red for Tumors, Emerald for Healthy), a Doughnut chart breaking down the exact probability matrix for all 4 classes, and a 1-click "Download PDF Report" functionality.
* **History Log (`History.jsx`):** A tabular record of all past diagnoses. Includes functional "View Details" and "Download PDF" action buttons that seamlessly fetch historical data from the server's static file mounts.

---

## 5. Software Requirements Specification (SRS) & User Stories

### **Epic 1: User Management**
* **User Story 1.1:** As a doctor, I want to securely register and log into the system so that my patient data and scan history are kept private and secure.

### **Epic 2: MRI Upload & Analysis**
* **User Story 2.1:** As a doctor, I want to drag and drop an MRI image into the browser so that I can easily submit it for AI analysis.
* **User Story 2.2:** As a doctor, I want to see a loading progress bar so that I know the AI is actively processing the MRI scan.
* **User Story 2.3:** As a doctor, I want the system to reject invalid file types (e.g., PDFs or Word Docs) so that I don't accidentally submit the wrong file to the AI.

### **Epic 3: AI Diagnostics & Reporting**
* **User Story 3.1:** As a doctor, I want to see the AI's exact prediction (e.g., Pituitary Tumor) and its confidence score (e.g., 95.3%) so that I can make an informed secondary diagnosis.
* **User Story 3.2:** As a doctor, I want to see the probability breakdown of all 4 potential classes in a visual chart to understand the AI's "thought process".
* **User Story 3.3:** As a doctor, I want to download the final diagnostic report as a PDF so that I can attach it to the patient's official electronic health record (EHR).

### **Epic 4: Historical Tracking & Dashboard**
* **User Story 4.1:** As a doctor, I want to view a dashboard of my total scans and average AI accuracy so that I can track my department's weekly diagnostic volume.
* **User Story 4.2:** As a doctor, I want to view a tabular history of all my past uploads so that I can quickly reference a past patient's scan.
* **User Story 4.3:** As a doctor, I want to click a button in the history table to instantly re-view or re-download a past PDF report without having to upload the image again.
