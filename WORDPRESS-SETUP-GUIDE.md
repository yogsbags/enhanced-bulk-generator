# WordPress Application Password Setup Guide

**Issue**: Cannot publish to WordPress - authentication error
**Error**: `"Sorry, you are not allowed to create posts as this user."`
**Cause**: Need WordPress Application Password (not regular password)

---

## Quick Fix Steps

### 1. Open WordPress Admin
```
http://localhost:8080/wp-admin/
```

**Login Credentials**:
- Username: `admin`
- Password: `RbHsZmPyCmdEKhp8IJ2mqHb1`

### 2. Navigate to User Profile
- Click on **Users** → **Profile** (or your username in top right)
- Scroll down to the **Application Passwords** section

### 3. Create Application Password
- **Application Name**: Enter `Bulk Generator API` or any name you prefer
- Click **Add New Application Password** button
- WordPress will generate a password like: `xxxx xxxx xxxx xxxx xxxx xxxx`

### 4. Copy the Application Password
⚠️ **IMPORTANT**: Copy this password immediately - it's only shown once!

The password will look like: `AbCd 1234 EfGh 5678 IjKl 9012`

### 5. Update .env.local File

Add or update this line in `/Users/yogs87/Downloads/sanity/enhanced-bulk-generator/.env.local`:

```bash
WP_APPLICATION_PASSWORD=AbCd1234EfGh5678IjKl9012
```

**Note**: Remove spaces from the password when adding to .env.local

### 6. Alternative: Use Existing Password Variable

If you prefer to keep using `WP_PASSWORD`, update content-publisher.js to recognize it:

Find this line in `content/content-publisher.js` (around line 25):
```javascript
wpPassword: config.wordpressPassword || process.env.WP_APPLICATION_PASSWORD
```

Change to:
```javascript
wpPassword: config.wordpressPassword || process.env.WP_APPLICATION_PASSWORD || process.env.WP_PASSWORD
```

---

## Verification

After setting up the application password, test it:

```bash
cd /Users/yogs87/Downloads/sanity/enhanced-bulk-generator
node test-publish.js
```

You should see:
```
✅ WordPress: http://localhost:8080/your-article-slug/
```

---

## Troubleshooting

### Problem: Can't find Application Passwords section

**Solution**: Ensure you're using HTTPS or localhost
- Application Passwords require HTTPS or localhost
- If not visible, WordPress might not support REST API authentication

### Problem: "Application Passwords are not available"

**Solution 1**: Check if plugins are blocking REST API
- Go to **Plugins** → Check for security plugins
- Temporarily disable security plugins like Wordfence, iThemes Security

**Solution 2**: Enable Application Passwords in wp-config.php
Add this line to `wp-config.php`:
```php
define( 'WP_APPLICATION_PASSWORDS', true );
```

### Problem: Still getting 401 error after setting app password

**Solution**: Check user permissions
```bash
# Login to WordPress admin
# Go to Users → All Users
# Click on "admin" user
# Check "Role" = Administrator
```

---

## Alternative: Use XML-RPC (Not Recommended)

If REST API doesn't work, you can enable XML-RPC:

1. Add to `wp-config.php`:
```php
add_filter('xmlrpc_enabled', '__return_true');
```

2. Update content-publisher.js to use XML-RPC endpoint

---

## Quick Test Command

After setup, test WordPress publishing:

```bash
curl -X POST 'http://localhost:8080/?rest_route=/wp/v2/posts' \
  -u 'admin:YOUR_APPLICATION_PASSWORD_HERE' \
  -H 'Content-Type: application/json' \
  -d '{"title":"API Test","content":"<p>Test</p>","status":"draft"}'
```

Expected response:
```json
{
  "id": 123,
  "link": "http://localhost:8080/api-test/",
  "status": "draft"
}
```

---

## Next Steps After Setup

Once application password is configured:

1. **Test Publishing**:
   ```bash
   node test-publish.js
   ```

2. **Bulk Publish from CSV**:
   ```bash
   node main.js stage publication
   ```

3. **Verify Posts**:
   - Open: http://localhost:8080/wp-admin/edit.php
   - Check for newly published drafts

---

## Expected .env.local Configuration

Complete WordPress configuration should look like:

```bash
# WordPress Publishing (Port 8080)
WP_BASE_URL=http://localhost:8080/
WP_USERNAME=your-username
WP_APPLICATION_PASSWORD=AbCd1234EfGh5678IjKl9012

# Or keep both for compatibility
WP_PASSWORD=RbHsZmPyCmdEKhp8IJ2mqHb1
WP_APPLICATION_PASSWORD=AbCd1234EfGh5678IjKl9012

# Sanity Publishing (Port 3333)
SANITY_PROJECT_ID=1eg1vt8d
SANITY_DATASET=your-dataset
SANITY_TOKEN=skGLxW3XG6LMTFp55nJDFXjZrW2GqIIJXu5BKI3NEawfk9IBurOala1wzxwBrmRQgoVccUd5QhSPHg6yuR3BXZQuvXFY2Ed5sbjeQxwW3JPP6XNyehDm1BD6AQpN26ZaXHnLVqtUnGILiceNANWuW5n4065kcYlCaQPsiss5HcCeNVCSP1OJ

# Next.js Frontend (Port 3001)
NEXT_FRONTEND_BASE_URL=http://localhost:3001
```

---

## WordPress Admin URLs

**Dashboard**: http://localhost:8080/wp-admin/
**Posts**: http://localhost:8080/wp-admin/edit.php
**Users**: http://localhost:8080/wp-admin/users.php
**Profile**: http://localhost:8080/wp-admin/profile.php

---

**Created**: 2025-10-10
**Status**: Awaiting application password creation
**Next Action**: Create application password in WordPress admin
