# 📝 To-Do List App

A full-stack, cloud-integrated To-Do List application built with modern web technologies. This project includes authentication, premium features, payment integration, caching, and scalable deployment.

---

## 🚀 Live Demo

🔗 https://v0-to-do-list-app-eta-six.vercel.app/

---

## ✨ Features

* 🔐 Authentication (Email & Google via Supabase)
* 📝 Task Management (Create, Update, Delete)
* 📊 Dashboard with categorized tasks
* 💳 Premium Upgrade via Razorpay
* ⏰ Reminder & Alarm (Premium Feature)
* ⚡ Redis Caching for performance optimization
* 🐳 Docker Containerization
* ☸️ Kubernetes Deployment & Scaling

---

## 🏗️ System Architecture

```
Frontend (Next.js)
        ↓
Backend API (Next.js)
        ↓
Supabase Auth + PostgreSQL Database
        ↓
Razorpay (Payment Gateway)
        ↓
Redis (Caching Layer)
        ↓
Docker (Containerization)
        ↓
Kubernetes (Scaling & Orchestration)
        ↓
Deployment (Vercel / Local Cluster)
```

---

## 🛠️ Tech Stack

* **Frontend:** Next.js, Tailwind CSS
* **Backend:** Next.js API Routes
* **Database:** Supabase (PostgreSQL)
* **Authentication:** Supabase Auth
* **Payments:** Razorpay
* **Caching:** Redis
* **Containerization:** Docker
* **Orchestration:** Kubernetes
* **Deployment:** Vercel

---

## ⚙️ Installation

```bash
npm install
npm run dev
```

---

## 🐳 Docker

```bash
docker build -t todo-app .
docker run -p 3000:3000 todo-app
```

---

## ☸️ Kubernetes

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl get pods
```

---

## 🔒 Premium Feature

Reminder & Alarm system is available only for premium users.
Users can upgrade using Razorpay integration.

---

## 📌 Key Learnings

* Full Stack Development
* Cloud & Deployment
* Docker & Kubernetes
* Payment Gateway Integration
* Redis Caching

---

## 👩‍💻 Author

**Moukthika**
