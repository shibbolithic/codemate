# Railway Deployment CORS Fix

## 🚨 Problem
Railway deployment was returning 404 errors for OPTIONS requests (CORS preflight requests) because the backend didn't have explicit OPTIONS handlers for all the endpoints the frontend was trying to access.

## ✅ Solution Applied

### 1. Updated CORS Configuration
- Changed `allow_origins` to `["*"]` for Railway deployment
- Set `allow_credentials=False` (required when using `allow_origins=["*"]`)
- Added explicit `allow_methods` including OPTIONS
- Added `expose_headers=["*"]`

### 2. Added Explicit OPTIONS Handlers
Added OPTIONS handlers for all endpoints the frontend tries to access:
- `/api/pull-requests`
- `/api/pull-requests/{pr_id}`
- `/api/reviews/{pr_id}`
- `/api/reviews/{pr_id}/trigger`
- `/webhook`
- `/webhook/pull-requests`
- `/pull-requests`
- `/api/prs`
- `/prs`
- `/health`

### 3. Updated Frontend Configuration
- Created environment-aware API configuration
- Default to Railway URL for production
- Fallback to localhost for development

## 🔧 Files Modified

### Backend (`src/codemate/webhook/server.py`)
```python
# Updated CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for Railway
    allow_credentials=False,  # Required with allow_origins=["*"]
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Added OPTIONS handlers for all endpoints
@app.options("/api/pull-requests")
async def options_pull_requests():
    return {"message": "OK"}
# ... (more OPTIONS handlers)
```

### Frontend (`frontend/holo-pr-vision-main/src/lib/api.ts`)
```typescript
// Updated to use environment-aware configuration
import { API_CONFIG } from '../config/api';
const CONFIG = API_CONFIG;
```

### New Configuration File (`frontend/holo-pr-vision-main/src/config/api.ts`)
```typescript
const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (import.meta.env.DEV) {
    return 'http://localhost:8000';
  }
  
  return 'https://codemate-production.up.railway.app';
};
```

## 🧪 Testing

### Test Script
Run the test script to verify Railway deployment:
```bash
python test_railway_deployment.py
```

### Manual Testing
1. **Health Check:**
   ```bash
   curl https://codemate-production.up.railway.app/health
   ```

2. **API Endpoints:**
   ```bash
   curl https://codemate-production.up.railway.app/api/pull-requests
   ```

3. **CORS Preflight:**
   ```bash
   curl -X OPTIONS https://codemate-production.up.railway.app/api/pull-requests
   ```

## 🚀 Deployment Steps

1. **Commit and push changes:**
   ```bash
   git add .
   git commit -m "Fix CORS issues for Railway deployment"
   git push
   ```

2. **Railway will automatically redeploy** with the new changes

3. **Verify deployment:**
   - Check Railway logs for successful startup
   - Run the test script
   - Test frontend connection

## 🔍 Expected Results

After deployment, you should see:
- ✅ No more 404 errors for OPTIONS requests
- ✅ Frontend can successfully connect to backend
- ✅ CORS preflight requests handled properly
- ✅ All API endpoints accessible from frontend

## 🐛 Troubleshooting

### If CORS errors persist:
1. Check Railway logs for any startup errors
2. Verify all OPTIONS handlers are properly defined
3. Test individual endpoints with curl
4. Check browser developer tools for specific error messages

### If frontend can't connect:
1. Verify Railway URL is correct
2. Check if backend is running (health endpoint)
3. Test API endpoints directly
4. Check browser console for network errors

## 📝 Notes

- The CORS configuration allows all origins (`["*"]`) for Railway deployment
- For production, consider restricting origins to specific domains
- OPTIONS handlers return simple `{"message": "OK"}` responses
- Frontend automatically detects environment and uses appropriate API URL
