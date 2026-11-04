# AptiForge

**Aptitude Practice & Assessment Platform**

AptiForge is a full-stack web application that helps users practice aptitude questions topic-wise and allows administrators to manage users, topics, and questions.

## 🚀 Features

### User

* User registration and login
* OTP verification
* JWT authentication
* Topic-wise aptitude practice
* Quiz results and performance tracking
* Protected user profile

### Admin

* Admin dashboard
* User management
* Topic management
* Question management
* Platform statistics

## 📚 Topics

* Percentage
* Profit & Loss
* Time & Work
* Time, Speed & Distance
* Ratio & Proportion
* Average
* Simple & Compound Interest
* Probability
* Permutation & Combination

## 🛠️ Tech Stack

**Frontend**

* React.js
* Vite
* Tailwind CSS
* Axios

**Backend**

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* JWT
* Argon2

**Database**

* PostgreSQL
* Neon (*production)

**Deployment**

* Vercel — Frontend
* Render — Backend
* Neon — Database

## 🏗️ Architecture

```text
React + Tailwind
       ↓
    REST API
       ↓
     FastAPI
       ↓
   SQLAlchemy
       ↓
   PostgreSQL
```

## ⚙️ Setup

### Backend

```bash
cd backend

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload
```

### Frontend

```bash
cd frontend

npm install

npm run dev
```

Create a `.env` file for the backend:

```env
DATABASE_URL=your_database_url
SECRET_KEY=your_secret_key
```

For the frontend:

```env
VITE_API_URL=http://127.0.0.1:8000
```

## 🌐 Deployment

**Backend:** `https://aptiforge.onrender.com`

The frontend is deployed on Vercel and communicates with the FastAPI backend through REST APIs.

## 🔮 Future Improvements

* AI-powered question generation
* Timed aptitude tests
* Difficulty-based questions
* Detailed performance analytics
* Personalized practice

## 👨‍💻 Developer

**Shyam Chavda**

**React • FastAPI • Python • PostgreSQL • JavaScript**

## ⭐ Support

* If you find this project useful, consider giving the repository a ⭐ on GitHub.
