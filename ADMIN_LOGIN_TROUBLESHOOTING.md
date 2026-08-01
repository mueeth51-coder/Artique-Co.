# Admin Login & Mobile Experience Troubleshooting Guide

## 🔐 Admin Login Issues & Solutions

### Problem: "Invalid password" error when logging in

**Solution Steps:**
1. **Verify password is correct:**
   - Default: `artique123`
   - Or check your `.env.local` file for `ADMIN_PASSWORD` value
   - Ensure no extra spaces before/after password

2. **Check if server is running:**
   ```bash
   npm run dev
   ```
   - Should show "Ready in X ms"
   - Port should be visible (default: http://localhost:3000)

3. **Clear browser cache:**
   - Hard refresh: `Ctrl+Shift+R` (Chrome/Firefox) or `Cmd+Shift+R` (Mac)
   - Or use DevTools: Network → Disable cache, then refresh

4. **Check environment variables:**
   - Verify `.env.local` exists in project root
   - Contains: `ADMIN_PASSWORD=artique123`
   - For production (Vercel): Add to project settings

---

### Problem: Login successful but no redirect to dashboard

**Solution Steps:**
1. **Check cookies are being set:**
   - Open DevTools (`F12`)
   - Go to Application → Cookies
   - Look for `artique_admin_token` cookie
   - Should show `HttpOnly` flag

2. **Check middleware is working:**
   - Try navigating directly to `/admin/dashboard`
   - If redirected to `/admin/login`, middleware is working
   - If it loads, middleware might be skipped

3. **Clear all site cookies:**
   - DevTools → Application → Cookies → Right-click → Delete all
   - Try logging in again

4. **Check browser console for errors:**
   - Open DevTools (`F12`) → Console tab
   - Look for any error messages during login
   - Note the error and share with support

---

### Problem: Session drops after page refresh

**Solution Steps:**
1. **Verify cookie settings:**
   - Check: `secure: process.env.NODE_ENV === 'production'`
   - In development, should be `false` (allows `http://`)
   - In production, should be `true` (requires `https://`)

2. **For local development:**
   - Must use `http://localhost:3000`
   - NOT `http://192.168.x.x` (cookie scope issue)

3. **For production (Vercel):**
   - Ensure your domain uses `https://`
   - If using custom domain, configure in Vercel

4. **Check 7-day expiration:**
   - Cookie expires after 7 days of inactivity
   - Log in again after 7 days

---

### Problem: Login works on desktop but not mobile

**Solution Steps:**
1. **Check mobile browser privacy settings:**
   - Safari: Settings → Privacy → Cookies = "Always Allow"
   - Chrome: Settings → Cookies → Allow all cookies

2. **Verify mobile has network connection:**
   - Try accessing `/admin/login` first
   - Wait for page to fully load before entering password

3. **Check if cookies are blocked:**
   - iOS Safari: Settings → Safari → Cookies = "Allow from websites I visit"
   - Android Chrome: Settings → Site Settings → Cookies = "Allowed"

4. **Try incognito/private mode:**
   - Opens browser with default settings
   - If login works here, something is blocking cookies

---

## 📱 Mobile Experience Issues & Solutions

### Problem: Mobile navigation doesn't show cart badge

**Solution Steps:**
1. **Check cart is populated:**
   - Go to `/shop`
   - Click on a product, then "Add to Cart"
   - Badge should show number

2. **Check if JavaScript is enabled:**
   - Badge requires React (client-side)
   - Try refreshing the page

3. **Hard refresh browser cache:**
   - Mobile: Pull down to refresh, then hold
   - Or close and reopen browser completely

---

### Problem: Product modal doesn't open on mobile

**Solution Steps:**
1. **Check if JavaScript is enabled:**
   - Mobile browser settings → JavaScript enabled

2. **Try different browser:**
   - Safari, Chrome, Samsung Internet, Firefox
   - See if issue persists

3. **Check network connection:**
   - Modal loads product details
   - Slow connection might prevent loading

4. **Check console for errors:**
   - Desktop DevTools → Device toolbar (mobile view)
   - Console tab → Look for red errors

---

### Problem: Checkout button goes off-screen on mobile

**Solution Steps:**
1. **This is intentional** - Button is sticky above mobile nav
2. **Scroll down to see it** - It's there, just positioned above nav
3. **On tablet/desktop** - Button is in normal flow (no fixed positioning)

---

### Problem: Colors/Sizes selection confusing on mobile

**Solution Steps:**
1. **New button-based selection** (not dropdowns)
   - Tap color name → selected (turns slate-900)
   - Tap size name → selected (turns slate-900)
   - Shows selected value next to label (e.g., "Color - Red")

2. **Much easier than dropdowns** - No scroll needed, visual feedback

---

### Problem: Text input fields too small on mobile

**Solution Steps:**
1. **Check iPhone zoom:**
   - Settings → Accessibility → Display & Text Size
   - Adjust text size if needed

2. **Zoom in page:**
   - Pinch-zoom to enlarge form
   - Or double-tap to zoom specific area

3. **Note:** Form fields are already 48px minimum height
   - Follows accessibility standards

---

## ⚡ Performance Issues & Solutions

### Problem: Shop page loads slowly on mobile

**Solution Steps:**
1. **Check network speed:**
   - DevTools → Network tab → Check image sizes
   - Images should be optimized (Next.js handles this)

2. **Check Supabase connection:**
   - Is API responding?
   - Check Supabase dashboard for errors

3. **Try clearing cache:**
   - DevTools → Application → Clear site data
   - Then refresh page

---

### Problem: Modal is laggy when scrolling

**Solution Steps:**
1. **Check device performance:**
   - Try on different device (older vs newer)
   - Older devices may struggle with many products

2. **Reduce product count:**
   - Test with fewer products first
   - See if performance improves

3. **Check browser version:**
   - Update to latest version
   - Older browsers may have performance issues

---

## 🔧 Debugging Steps

### Enable Debug Logging

**For admin login, check server logs:**
```bash
npm run dev
# Look for "[Admin Login]" messages in terminal
```

Should see:
```
[Admin Login] Password check: { envHasPassword: true, passwordMatch: true, nodeEnv: 'development' }
[Admin Login] Cookie set successfully
```

### Check API Response

**In DevTools → Network tab:**
1. Try to login
2. Look for `/api/admin/login` request
3. Click it → Response tab
4. Should show: `{ "ok": true, "message": "Login successful" }`

### Verify Cookie Storage

**In DevTools → Application → Cookies:**
1. Click your domain
2. Look for `artique_admin_token`
3. Should see:
   - Name: `artique_admin_token`
   - Value: `artique-admin-verified-v1`
   - HttpOnly: ✓ (checked)
   - Expires: ~7 days from now

---

## 📋 Common Fixes Summary

| Issue | Fix | Time |
|-------|-----|------|
| Wrong password | Use `artique123` or check `.env.local` | 1 min |
| No redirect after login | Hard refresh browser | 2 min |
| Session drops | Check browser cookie settings | 3 min |
| Mobile nav not showing | Clear cache and refresh | 2 min |
| Modal doesn't open | Check JavaScript enabled | 1 min |
| Checkout button off-screen | It's intentional - scroll down | 0 min |
| Form fields too small | Pinch-zoom or adjust text size | 2 min |
| Slow loading | Check network speed | 3 min |

---

## 🆘 If Nothing Works

1. **Collect information:**
   - What browser/device?
   - What's the exact error message?
   - Screenshot of DevTools console
   - Screenshot of DevTools Network tab

2. **Try nuclear option:**
   - Delete all cookies for the site
   - Close browser completely
   - Reopen and try again

3. **Report to developer:**
   - Include all above information
   - Steps to reproduce
   - Expected vs actual behavior

---

## 📞 Support Contacts

- **GitHub Issues:** Report bugs or suggest features
- **Email:** Contact shop owner
- **Live Chat:** (if available on site)

---

## ✅ Testing Verification Checklist

Before deployment, verify:

- [ ] Admin login works with correct password
- [ ] Session persists after page refresh
- [ ] Logout works and clears session
- [ ] Mobile navigation shows cart badge
- [ ] Product modal opens on click
- [ ] Colors/sizes selection works
- [ ] "Add to Cart" button functional
- [ ] Checkout form loads
- [ ] Receipt displays correctly
- [ ] Mobile layout looks good on iPhone 12 mini (320px)
- [ ] Mobile layout looks good on iPad (768px)
- [ ] Desktop layout looks good on 1920px
- [ ] No console errors or warnings
- [ ] Build completes without errors
