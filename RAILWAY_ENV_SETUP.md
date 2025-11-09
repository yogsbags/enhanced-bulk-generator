# Railway Environment Variables Setup

## Required Environment Variables

Copy these to your Railway project dashboard:
**Settings → Variables → Add Variable**

### 1. AI Models (Required)
```
GROQ_API_KEY=your-groq-api-key-from-env-file
OPENAI_API_KEY=your-openai-api-key-from-env-file
```
⚠️ Copy the actual values from your local `.env` file

### 2. **CRITICAL: Module Resolution Fix**
```
NODE_PATH=/app/node_modules
```
⚠️ **Without this, the app will fail with "Cannot find module" errors**

### 3. WordPress Publishing (UAT Server)
```
UAT_WP_BASE_URL=https://uat.plindia.com
UAT_WP_USERNAME=your-wordpress-username
UAT_WP_APPLICATION_PASSWORD=your-wordpress-app-password
UAT_PUBLISH_STATUS=publish
```
⚠️ Copy the actual credentials from your local `.env` file

### 4. Sanity CMS (Required)
```
SANITY_PROJECT_ID=1eg1vt8d
SANITY_DATASET=production
SANITY_TOKEN=your-sanity-write-token
```
⚠️ Copy the actual Sanity token from your local `.env` file

### 5. Image Hosting (Optional but Recommended)
```
IMGBB_API_KEY=your-imgbb-api-key
```
⚠️ Copy the actual API key from your local `.env` file

### 6. Frontend URL (Set after deployment)
```
NEXT_FRONTEND_BASE_URL=https://your-railway-app.railway.app
```
Note: Update this after Railway generates your deployment URL

## Railway Configuration Steps

### Step 1: Set Root Directory
In Railway Dashboard:
1. Go to **Settings → Service Settings**
2. Set **Root Directory** to: `frontend`
3. Railway will use `frontend/railway.toml` for configuration

### Step 2: Add Environment Variables
1. Go to **Variables** tab
2. Click **+ New Variable**
3. Add each variable from the list above
4. Click **Add** after each one

### Step 3: Verify Build Settings
Railway should auto-detect from `railway.toml`:
- **Build Command**: Auto-detected from package.json
- **Start Command**: `npm start`
- **Install Command**: `npm install`

### Step 4: Deploy
1. Click **Deploy** or wait for auto-deployment from GitHub push
2. Monitor logs in **Deployments** tab
3. Once deployed, copy the Railway URL and update `NEXT_FRONTEND_BASE_URL`

## Deployment Verification Checklist

After deployment, verify:
- [ ] App starts without "Cannot find module" errors
- [ ] Health check passes (if configured)
- [ ] Backend workflow can be triggered
- [ ] AI models are accessible (check logs for API calls)
- [ ] WordPress publishing works (test with UAT credentials)
- [ ] Sanity CMS integration works

## Troubleshooting

### "Cannot find module" Error
- ✅ Ensure `NODE_PATH=/app/node_modules` is set
- ✅ Verify root directory is set to `frontend`
- ✅ Check that `npm install` ran successfully

### Build Failures
- Check Railway build logs
- Verify `package.json` has all dependencies
- Ensure Node.js version is compatible (check `engines` in package.json)

### Runtime Errors
- Check Railway deployment logs
- Verify all required environment variables are set
- Test API endpoints manually

## Support Resources

- Railway Docs: https://docs.railway.com
- Project Dashboard: https://railway.app/project/[your-project-id]
- GitHub Repo: https://github.com/yogsbags/enhanced-bulk-generator
