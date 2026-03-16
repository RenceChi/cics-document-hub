# 🏛️ CICS Document Hub

A centralized academic resource management platform designed for the College of Informatics and Computing Sciences (CICS) at New Era University. This application provides a secure environment for administrators to upload course materials and for students to easily filter, search, and download verified resources based on their specific degree programs.

## 🚀 Live Demo
**View the live application here:**(e.g., https://cics-document-hub.vercel.app)](https://cics-document-hub.vercel.app)*

## ✨ Key Features
* **Role-Based Access Control (RBAC):** Distinct interfaces and permissions for Students and Administrators.
* **Smart Student Hub:** Dynamic document filtering by category (Lecture Notes, Lab Manuals, Past Exams) and degree program (Computer Science, Information Systems, Cybersecurity, etc.).
* **Admin Analytics Dashboard:** Visualized metrics tracking total documents, active students, and real-time login engagement.
* **Streamlined Document Management:** Secure PDF uploading directly to cloud storage with automatic file size calculation and metadata tagging.
* **Automated Onboarding:** Seamless profile creation that directs new users to select their academic program upon first login.

## 🛠️ Tech Stack
* **Frontend:** React (Vite), Tailwind CSS
* **Backend as a Service (BaaS):** Firebase
  * **Authentication:** Secure user login and registration.
  * **Firestore:** NoSQL database managing user roles, document metadata, and analytical tracking.
  * **Cloud Storage:** Secure hosting for PDF files.
* **Data Visualization:** Recharts
* **Deployment:** Vercel
