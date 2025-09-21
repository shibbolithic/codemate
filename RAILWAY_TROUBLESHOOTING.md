# Railway Deployment Troubleshooting Guide

## 🚨 Current Issue
Railway deployment is not serving the new API endpoints we added. The basic endpoint (`/`) works, but the new endpoints like `/health`, `/api/pull-requests` are returning 404 errors.

## 🔍 Diagnosis Steps

### 1. Check Railway Deployment Status
1. Go to your Railway dashboard: https://railway.app/dashboard
2. Find your `codemate-production` project
3. Check the "Deployments" tab to see if the latest commit was deployed
4. Look for any deployment errors in the logs

### 2. Verify Latest Commit Was Deployed
The latest commit should be: `1d2ed0d Fix CORS issues for Railway deployment`

### 3. Check Railway Logs
1. In Railway dashboard, go to your project
2. Click on "View Logs" or "Deployments"
3. Look for any error messages during deployment
4. Check if the server started successfully

## 🔧 Possible Issues & Solutions

### Issue 1: Deployment Not Triggered
**Symptoms:** Railway shows old deployment, new endpoints not available
**Solution:**
```bash
# Force a new deployment by making a small change
echo "# Railway deployment trigger" >> README.md
git add README.md
git commit -m "Trigger Railway redeploy"
git push
```

### Issue 2: Build/Startup Errors
**Symptoms:** Railway logs show errors during build or startup
**Common causes:**
- Missing dependencies
- Python version mismatch
- Import errors
- Port binding issues

**Solution:**
1. Check Railway logs for specific error messages
2. Verify `requirements.txt` has all dependencies
3. Check if Python version is compatible
4. Ensure the startup command is correct

### Issue 3: Server Not Starting
**Symptoms:** Basic endpoint works but new endpoints don't
**Possible causes:**
- Server crashed after startup
- Routes not properly registered
- CORS middleware issues

**Solution:**
1. Check Railway logs for server startup messages
2. Verify all routes are registered
3. Test individual endpoints

## 🧪 Testing Commands

### Test Railway Deployment
```bash
# Test basic endpoint
curl https://codemate-production.up.railway.app/

# Test health endpoint
curl https://codemate-production.up.railway.app/health

# Test API endpoints
curl https://codemate-production.up.railway.app/api/pull-requests

# Test CORS preflight
curl -X OPTIONS https://codemate-production.up.railway.app/api/pull-requests
```

### PowerShell Testing
```powershell
# Test basic endpoint
Invoke-WebRequest -Uri "https://codemate-production.up.railway.app/" -Method GET

# Test health endpoint
Invoke-WebRequest -Uri "https://codemate-production.up.railway.app/health" -Method GET

# Test API endpoints
Invoke-WebRequest -Uri "https://codemate-production.up.railway.app/api/pull-requests" -Method GET
```

## 🔄 Manual Redeploy

If automatic deployment isn't working:

1. **Trigger via Railway Dashboard:**
   - Go to Railway dashboard
   - Find your project
   - Click "Deploy" or "Redeploy"

2. **Trigger via Git:**
   ```bash
   # Make a small change to trigger deployment
   echo "# $(Get-Date)" >> README.md
   git add README.md
   git commit -m "Trigger Railway redeploy - $(Get-Date)"
   git push
   ```

3. **Check Railway Settings:**
   - Verify the correct branch is selected
   - Check if auto-deploy is enabled
   - Verify the build command and start command

## 📋 Railway Configuration Check

### Required Settings:
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `python -m uvicorn src.codemate.webhook.server:app --host 0.0.0.0 --port $PORT`
- **Python Version:** 3.8+ (check in Railway settings)

### Environment Variables:
- `GITHUB_TOKEN` (optional)
- `WEBHOOK_SECRET` (optional)
- `PORT` (automatically set by Railway)

## 🐛 Debug Steps

1. **Check if server is running:**
   ```bash
   curl https://codemate-production.up.railway.app/
   ```
   Should return: `{"message":"Codemate webhook server running"}`

2. **Check if new endpoints exist:**
   ```bash
   curl https://codemate-production.up.railway.app/health
   ```
   Should return: `{"status":"healthy","timestamp":"..."}`

3. **Check CORS:**
   ```bash
   curl -X OPTIONS https://codemate-production.up.railway.app/api/pull-requests
   ```
   Should return: `{"message":"OK"}`

## 📞 Next Steps

1. **Check Railway Dashboard** for deployment status
2. **Review Railway Logs** for any errors
3. **Test endpoints** using the commands above
4. **If still failing**, check Railway support or try manual redeploy

## 🔗 Useful Links

- Railway Dashboard: https://railway.app/dashboard
- Railway Documentation: https://docs.railway.app/
- FastAPI Documentation: https://fastapi.tiangolo.com/

## 📝 Expected Results After Fix

Once the deployment is working correctly, you should see:
- ✅ `GET /` returns server status
- ✅ `GET /health` returns health check
- ✅ `GET /api/pull-requests` returns mock PR data
- ✅ `OPTIONS /api/pull-requests` returns CORS OK
- ✅ Frontend can connect without CORS errors
