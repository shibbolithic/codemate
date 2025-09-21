# CodeMate Frontend-Backend Connection Setup

This guide explains how to connect and run the CodeMate frontend with the backend API.

## 🏗️ Architecture Overview

- **Backend**: FastAPI server running on `http://localhost:8000`
- **Frontend**: React + Vite application running on `http://localhost:5173`
- **Communication**: RESTful API with CORS enabled

## 🚀 Quick Start

### Prerequisites

1. **Python 3.8+** with virtual environment
2. **Node.js 16+** and npm
3. **Git** (for version control)

### Backend Setup

1. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Linux/MacOS
   source venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the backend server:**
   ```bash
   python start_backend.py
   ```
   
   Or manually:
   ```bash
   python -m uvicorn src.codemate.webhook.server:app --host 0.0.0.0 --port 8000 --reload
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend/holo-pr-vision-main
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the frontend development server:**
   
   **Windows:**
   ```cmd
   ..\..\start_frontend.bat
   ```
   
   **Linux/MacOS:**
   ```bash
   ../../start_frontend.sh
   ```
   
   Or manually:
   ```bash
   npm run dev
   ```

## 🔗 API Endpoints

The backend provides the following endpoints for the frontend:

### Core Endpoints

- `GET /` - Server status
- `GET /health` - Health check
- `GET /api/pull-requests` - List all pull requests
- `GET /api/pull-requests/{id}` - Get specific pull request
- `GET /api/reviews/{id}` - Get AI review for pull request
- `POST /api/reviews/{id}/trigger` - Trigger new review

### Webhook Endpoints

- `POST /webhook` - GitHub webhook handler (original functionality)

## 🌐 CORS Configuration

The backend is configured to allow requests from:
- `http://localhost:3000`
- `http://localhost:5173`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:5173`

## 🔧 Configuration

### Backend Configuration

The backend uses environment variables for configuration. Create a `.env` file in the project root:

```env
GITHUB_TOKEN=your_github_token_here
WEBHOOK_SECRET=your_webhook_secret_here
```

### Frontend Configuration

The frontend API URL can be configured via environment variables:

```env
VITE_API_URL=http://localhost:8000
```

## 🧪 Testing the Connection

1. **Start both servers** (backend on port 8000, frontend on port 5173)

2. **Test backend health:**
   ```bash
   curl http://localhost:8000/health
   ```

3. **Test API endpoints:**
   ```bash
   curl http://localhost:8000/api/pull-requests
   ```

4. **Open frontend:** Navigate to `http://localhost:5173`

## 📊 Data Flow

1. **Frontend** makes API calls to backend endpoints
2. **Backend** processes requests and returns JSON responses
3. **Frontend** displays the data in the React components
4. **CORS middleware** ensures cross-origin requests work properly

## 🐛 Troubleshooting

### Common Issues

1. **CORS errors:**
   - Ensure backend is running on port 8000
   - Check CORS configuration in `server.py`

2. **API connection failed:**
   - Verify backend is running: `curl http://localhost:8000/health`
   - Check frontend API configuration in `api.ts`

3. **Port conflicts:**
   - Backend: Change port in `start_backend.py` or `uvicorn` command
   - Frontend: Change port in `vite.config.ts`

4. **Dependencies issues:**
   - Backend: `pip install -r requirements.txt`
   - Frontend: `npm install`

### Debug Mode

Enable debug logging by setting environment variables:

```bash
# Backend
export DEBUG=1
python start_backend.py

# Frontend
export VITE_DEBUG=1
npm run dev
```

## 🔄 Development Workflow

1. **Make backend changes** → Server auto-reloads
2. **Make frontend changes** → Vite hot-reloads
3. **Test API changes** → Use browser dev tools or curl
4. **Deploy** → Use provided Docker configuration

## 📝 Next Steps

- [ ] Add real GitHub API integration
- [ ] Implement database storage
- [ ] Add authentication
- [ ] Create production deployment scripts
- [ ] Add comprehensive error handling
- [ ] Implement real-time updates via WebSockets

## 🆘 Support

If you encounter issues:

1. Check the console logs for both frontend and backend
2. Verify all dependencies are installed
3. Ensure ports 8000 and 5173 are available
4. Check the API documentation at `http://localhost:8000/docs`
