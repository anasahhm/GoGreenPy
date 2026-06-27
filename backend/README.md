# GoGreenPy Backend API

FastAPI backend for GoGreenPy Environmental Impact Analyzer.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create `.env` file:
```
MONGODB_URL=mongodb://localhost:27017
SECRET_KEY=your-secret-key-change-in-production
```

3. Run development server:
```bash
uvicorn app.main:app --reload --port 8000
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Deployment (Render)

1. Push code to GitHub
2. Create new Web Service on Render
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables
```

---

## 3. FRONTEND FULL CODE

### Directory Structure
```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── ScoreCard.jsx
│   │   ├── TrendChart.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── LoadingSpinner.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Analyzer.jsx
│   │   ├── History.jsx
│   │   ├── AdminPanel.jsx
│   │   └── NotFound.jsx
│   ├── features/
│   │   └── auth/
│   │       └── authSlice.js
│   ├── services/
│   │   └── api.js
│   ├── store/
│   │   └── store.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md