# 🧑‍💼 Job Board Platform

A **full-stack Job Board application** with a **Spring Boot REST API** backend and a **React (Vite + Tailwind)** frontend.  
Employers can post and manage jobs, candidates can browse and apply, and admins get platform statistics.

---

## 🚀 Features

### Backend (Spring Boot API)
- 🔐 JWT Authentication (Admin, Employer, Candidate roles)
- 📄 CRUD for Jobs & Applications
- 📎 Resume & Cover Letter upload (Multipart files)
- 📊 Admin dashboard (user/job/application statistics)
- 🧭 API documentation with Swagger (OpenAPI 3)
- 🐬 MySQL + JPA/Hibernate integration
- ☁️ OAuth2 login with Google
- 🐳 Docker & Docker Compose support

### Frontend (React)
- 🎨 Modern UI with React, TailwindCSS, Heroicons
- 🔎 Job search with filters (keyword, location, category, salary)
- 👤 Candidate flow (apply with multi-step form, upload resume & cover letter)
- 🏢 Recruiter flow (post jobs, manage jobs, view applicants)
- 🛡️ Role-based views (Admin, Employer, Candidate)
- 🗺️ Address autocomplete (Google Places API)
- 📄 Rich text job descriptions (with editor)

---

## 🧰 Tech Stack

- **Backend:** Java 21, Spring Boot 3, Spring Security, JPA/Hibernate, MySQL  
- **Frontend:** React 19, Vite, TailwindCSS  
- **Other:** Docker, Swagger/OpenAPI, JWT, OAuth2 (Google)

---

## ⚙️ Getting Started

### 1️⃣ Clone the repo
```bash
git clone https://github.com/waildevil/job-board.git
cd job-board


### 2️⃣ Backend Setup (Spring Boot API)

**Configure your environment variables or `application-local.properties`:**

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/jobboard_db
spring.datasource.username=youruser
spring.datasource.password=yourpassword

jwt.secret=your-jwt-secret

** Run with Maven or your IDE:**

```bash
cd job-board-api
./mvnw spring-boot:run

API docs will be available at:
👉 http://localhost:8080/swagger-ui.html


### Frontend Setup (React + Vite)
**Install dependencies:**

```bash
cd job-board-frontend
npm install

**Create .env with your API + Google Maps key:**

```bash
VITE_API_URL=http://localhost:8080
VITE_GOOGLE_MAPS_KEY=your_google_maps_api_key

**Run the server:**

```bash
npm start

Visit 👉 http://localhost:3000
















































