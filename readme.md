# 🪄 NoteMentor

> **Your Smart Note Companion ✨**  
> Transform handwritten or mixed-language notes into structured summaries, quizzes, and study materials — powered by AI.  
> Designed for Indian students & teachers, NoteMentor bridges the gap between learning and intelligent automation.  

---

## 🚀 Tech Stack

> NoteMentor is built using a powerful, secure, and modern full-stack setup.

### 🧠 **AI & Cloud**
[![Google Generative AI](https://img.shields.io/badge/AI-Google_Generative_AI-4285F4?logo=google&logoColor=white)](https://www.npmjs.com/package/@google/generative-ai)
[![Cloudinary](https://img.shields.io/badge/Storage-Cloudinary-3448C5?logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![Sharp](https://img.shields.io/badge/Image_Processing-Sharp-23A5DB?logo=sharp&logoColor=white)](https://www.npmjs.com/package/sharp)
[![Streamifier](https://img.shields.io/badge/Stream-Streamifier-008080)](https://www.npmjs.com/package/streamifier)

---

### ⚙️ **Backend Framework & Middleware**
[![Express.js](https://img.shields.io/badge/Backend-Express.js-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Mongoose](https://img.shields.io/badge/Database-Mongoose-47A248?logo=mongoose&logoColor=white)](https://mongoosejs.com/)
[![JWT](https://img.shields.io/badge/Auth-JSON_Web_Token-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Passport](https://img.shields.io/badge/Auth-Passport-34E27A?logo=passport&logoColor=white)](http://www.passportjs.org/)
[![Google OAuth](https://img.shields.io/badge/Login-Google_OAuth-4285F4?logo=google&logoColor=white)](https://www.npmjs.com/package/passport-google-oauth20)

---

### 🧩 **Utilities & Middlewares**
[![Cors](https://img.shields.io/badge/Security-CORS-5A29E4)](https://www.npmjs.com/package/cors)
[![Helmet](https://img.shields.io/badge/Security-Helmet-000000)](https://helmetjs.github.io/)
[![Multer](https://img.shields.io/badge/Upload-Multer-FFCA28?logo=multer&logoColor=white)](https://www.npmjs.com/package/multer)
[![Zod](https://img.shields.io/badge/Validation-Zod-3E67B1)](https://zod.dev/)
[![Dotenv](https://img.shields.io/badge/Config-Dotenv-00C853)](https://www.npmjs.com/package/dotenv)
[![Cookie Parser](https://img.shields.io/badge/Cookies-Parser-795548)](https://www.npmjs.com/package/cookie-parser)
[![Express Rate Limit](https://img.shields.io/badge/Security-Rate_Limit-6A1B9A)](https://www.npmjs.com/package/express-rate-limit)
[![Express Session](https://img.shields.io/badge/Session-Express_Session-1E88E5)](https://www.npmjs.com/package/express-session)
[![Morgan](https://img.shields.io/badge/Logger-Morgan-607D8B)](https://www.npmjs.com/package/morgan)
[![Winston](https://img.shields.io/badge/Logger-Winston-4DB6AC)](https://www.npmjs.com/package/winston)
[![bcryptjs](https://img.shields.io/badge/Library-bcryptjs-FF6A00)](https://www.npmjs.com/package/bcryptjs)
---

### ⚡ **Real-time & Caching**
[![Socket.io](https://img.shields.io/badge/Realtime-Socket.io-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![Redis](https://img.shields.io/badge/Cache-Redis-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![ioredis](https://img.shields.io/badge/Client-ioredis-FF6F00)](https://www.npmjs.com/package/ioredis)

---
### 🚀 DevOps Implementation — NoteMentor

This document outlines the **DevOps stack**, **tools**, and **automation pipeline** used in NoteMentor’s backend for reliable CI/CD, containerization, and deployment.

---

## 🧩 CI/CD Pipeline

[![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)](https://github.com/features/actions)
[![Node.js](https://img.shields.io/badge/Runtime-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![NPM](https://img.shields.io/badge/Package-NPM-CB3837?logo=npm&logoColor=white)](https://www.npmjs.com/)
[![Lint](https://img.shields.io/badge/Code%20Quality-ESLint-4B32C3?logo=eslint&logoColor=white)](https://eslint.org/)

- Continuous Integration (CI) via **GitHub Actions**
- Automatic build & test pipeline on every `dev` branch push
- Auto Docker image build and push to DockerHub after successful tests

---

## 🐳 Containerization

[![Docker](https://img.shields.io/badge/Container-Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Node](https://img.shields.io/badge/Base%20Image-node%3A20--alpine-026E00?logo=node.js&logoColor=white)](https://hub.docker.com/_/node)
[![DockerHub](https://img.shields.io/badge/DockerHub-rahulkumar9142%2Fnotementor--dev-2496ED?logo=docker&logoColor=white)](https://hub.docker.com/r/rahulkumar9142/notementor-dev)

**Dockerfile Stages**
1. **Builder Stage** → Installs dependencies, builds app  
2. **Runner Stage** → Copies build output, installs only production deps  
3. Lightweight container (based on Node Alpine)  
4. Healthcheck for container uptime  

```bash
docker build -t rahulkumar9142/notementor-dev:latest .
docker push rahulkumar9142/notementor-dev:latest

```

## 🧰 Features

✅ AI-powered note summarization  
✅ Quiz & question generation  
✅ Multi-language (English, Hindi, Hinglish)  
✅ Smart topic classification  
✅ Real-time collaboration with Socket.io  
✅ Secure authentication (JWT + Google OAuth)  
✅ Cloud-based image & file management (Cloudinary + Sharp)  
✅ Role-based permissions  
✅ Optimized rate limiting, caching, and session control  

---

## 💡 Short Description

**NoteMentor** is an AI-powered platform that turns **handwritten or mixed-language notes** into structured **summaries, quizzes, and question sets**.  
It empowers both **students and teachers** to collaborate, learn, and evaluate efficiently — combining the power of **Generative AI**, **Google Vision**, and **intelligent adaptive engines**.

---

click below to know how ai generates questions and store in DB 👇
[Click here ](./src/shared/ai/ai.readme.md)
[Docker Image Json detail ](https://hub.docker.com/v2/repositories/rahulkumar9142/notementor-dev/tags)

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/your-username/NoteMentor.git

# Navigate to project directory
cd NoteMentor

# Install dependencies
npm install

# Add your .env file (API keys, MongoDB URI, Cloudinary, etc.)

# Run the development server
npm run dev
