# How to Find Your Railway Deployment URL

## Method 1: Settings Tab (Recommended)
1. Go to your Railway project dashboard
2. Click on your service (e.g., "frontend")
3. Click the **Settings** tab
4. Scroll to the **Networking** section
5. You'll see:
   - **Public Networking** toggle (make sure it's ON)
   - **Generate Domain** button (if no domain exists yet)
   - Your deployed URL will appear here (e.g., `yourapp-production.up.railway.app`)

## Method 2: Deployments Tab
1. Go to your Railway project dashboard
2. Click the **Deployments** tab
3. Click on the latest successful deployment (green checkmark ✓)
4. At the top of the deployment details, you'll see the deployment URL
5. Click the **View Logs** or **Open** button to access your app

## Method 3: Service Overview
1. From the Railway project dashboard
2. Click on your service card
3. Look for the **URL** section at the top
4. The public URL will be displayed if networking is enabled

## If No URL Exists Yet:

### Generate a Public Domain:
1. Go to **Settings** → **Networking**
2. Click **Generate Domain** button
3. Railway will create a URL like: `yourapp-production.up.railway.app`
4. This happens automatically after your first successful deployment

### Or Add a Custom Domain:
1. Go to **Settings** → **Networking**
2. Click **Custom Domain**
3. Enter your domain (e.g., `app.yourdomain.com`)
4. Follow DNS configuration instructions

## After Finding Your URL:

### Update Environment Variable:
1. Copy your Railway deployment URL
2. Go to **Variables** tab
3. Find `NEXT_FRONTEND_BASE_URL` variable
4. Update it with your Railway URL: `https://yourapp-production.up.railway.app`
5. Save changes
6. Railway will redeploy automatically

## Common Railway URL Formats:
- **Default**: `https://[service-name]-production-[hash].up.railway.app`
- **Example**: `https://frontend-production-a1b2.up.railway.app`
- **Custom**: `https://yourdomain.com` (if configured)

## Troubleshooting:

### "No public URL available"
- **Cause**: Public networking is disabled
- **Fix**: Go to Settings → Networking → Enable "Public Networking"

### "Service not exposed"
- **Cause**: No port is being listened to
- **Fix**: Ensure your app listens on the `PORT` environment variable Railway provides
- Check your start command in `package.json` or `railway.toml`

### "502 Bad Gateway"
- **Cause**: Service crashed or not responding
- **Fix**: Check deployment logs for errors
- Verify all environment variables are set correctly (especially `NODE_PATH`)

## Quick Access Commands:

Once you have the URL, you can:
- **View in browser**: Click the URL in Railway dashboard
- **Test API**: `curl https://your-railway-url.railway.app/api/health`
- **Monitor logs**: Railway dashboard → Deployments → View Logs
- **Check status**: Railway dashboard → Overview shows service status

## Next Steps:

1. ✅ Find your Railway URL using one of the methods above
2. ✅ Copy the URL
3. ✅ Update `NEXT_FRONTEND_BASE_URL` environment variable
4. ✅ Wait for automatic redeployment
5. ✅ Test your workflow at the new URL
