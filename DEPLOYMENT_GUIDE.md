# 🚀 Deployment Guide - Vercel

## ✅ Pre-Deployment Checklist

Before deploying, ensure:
- [ ] Build passes locally: `npm run build` ✅
- [ ] No TypeScript errors: `npm run build` ✅
- [ ] All environment variables set in `.env.local`
- [ ] Admin password set correctly in `ADMIN_PASSWORD`
- [ ] Supabase credentials verified

---

## 📋 **Step-by-Step Deployment**

### Step 1: Commit Your Changes

```powershell
cd "c:\Users\musad\OneDrive\Desktop\curson new"
git add .
git commit -m "Feat: Mobile-first UI redesign and order sync fix

- Added mobile bottom navigation bar with live cart badge
- Redesigned shop home with app-like product cards
- Completely revamped cart page with premium design
- Fixed order syncing issue - orders now sync reliably
- Implemented modal/bottom sheet experience
- Added tap animations and micro-interactions
- Mobile-first responsive design throughout"
```

### Step 2: Verify Everything Builds

```powershell
npm run build
```

Expected output:
```
✅ Compiled successfully in 7.0s
✅ TypeScript checks passed
```

### Step 3: Deploy to Vercel

```powershell
vercel --prod
```

**Note:** If you don't have Vercel CLI:
```powershell
npm install -g vercel
vercel login
vercel --prod
```

### Step 4: Verify Deployment

1. Vercel will provide your deployment URL
2. Visit the URL in your browser
3. Test on mobile device

---

## 🔧 **Environment Variables**

Ensure these are set in Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://jfzazsqloziuoeiyrjne.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=xkbo14qt
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=gu_roL8Zft2qBiFYyvARa_vfec
ADMIN_PASSWORD=artique123
```

**Important:** Set these for **Production, Preview, AND Development** environments.

---

## 🧪 **Post-Deployment Testing**

### Mobile Testing (iPhone/Android)

1. **Bottom Navigation**
   - [ ] Home icon works
   - [ ] Shop icon works
   - [ ] Cart icon shows badge
   - [ ] Account/Admin icon works

2. **Shop Page**
   - [ ] Products display in 2 columns
   - [ ] Search bar works
   - [ ] Category filter works
   - [ ] "View Details" opens modal from bottom
   - [ ] Modal slides smoothly

3. **Product Modal**
   - [ ] Color selection works
   - [ ] Size selection works
   - [ ] Quantity +/- buttons work
   - [ ] "Add to Cart" button works
   - [ ] Modal closes when clicking X

4. **Cart Page**
   - [ ] Items display correctly
   - [ ] Quantity adjustors work
   - [ ] Remove button works
   - [ ] Form fields responsive
   - [ ] "Place Order" button works

5. **Order Placement**
   - [ ] Order submitted successfully
   - [ ] Receipt displays
   - [ ] Order appears in Admin Dashboard
   - [ ] Download receipt works
   - [ ] WhatsApp button works

### Desktop Testing

1. **Navigation**
   - [ ] Desktop nav is visible (mobile nav hidden)
   - [ ] Links work

2. **Shop Page**
   - [ ] Products display in 3-4 columns
   - [ ] Modal centered (not from bottom)
   - [ ] Hover effects work

3. **Cart**
   - [ ] Order summary sticky at bottom
   - [ ] All form fields visible
   - [ ] Checkout works

---

## 🛠️ **Troubleshooting**

### Issue: Orders not appearing in Admin

**Solution:**
1. Check Vercel environment variables are set
2. Check browser console for errors (F12)
3. Verify Supabase connection:
   - Go to Supabase dashboard
   - Check `orders` table
   - Look for recent entries

### Issue: Images not loading

**Solution:**
1. Verify Cloudinary credentials in env vars
2. Check image URLs in products
3. Upload new product with image

### Issue: Mobile layout broken

**Solution:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Test in incognito mode
4. Check viewport meta tag in HTML

### Issue: Cart badge not showing count

**Solution:**
1. Add item to cart
2. Check localStorage: `artique-cart`
3. Verify MobileNav component imports

---

## 📊 **Monitoring**

### Check Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project
3. View:
   - Recent deployments
   - Build logs
   - Performance metrics
   - Environment variables

### Monitor Supabase

1. Go to https://supabase.com/dashboard
2. Select your project
3. Check:
   - Orders table for recent entries
   - Product stock updates
   - Query performance

---

## 🔄 **Rollback (if needed)**

If deployment has issues:

```powershell
# View deployment history
vercel list

# Rollback to previous deployment
vercel rollback

# Or manually redeploy specific commit
git checkout <commit-hash>
npm run build
vercel --prod
```

---

## 🎯 **Performance Tips**

### Optimize Images
- Use WebP format when possible
- Compress before uploading
- Use Next.js Image component (already done ✅)

### Monitor Bundle Size
```powershell
npm run build
# Check .next/static for bundle sizes
```

### Enable Caching
- Vercel caches static assets automatically
- ISR (Incremental Static Regeneration) enabled

---

## 📞 **Support**

### Common Issues

**Q: Deployment stuck?**
A: Check Vercel logs → Redeploy → Clear build cache

**Q: Mobile layout wrong?**
A: Check viewport meta tag, clear cache, test in incognito

**Q: Orders not syncing?**
A: Verify Supabase env vars, check browser console, review Supabase table

**Q: Images broken?**
A: Verify Cloudinary credentials, test image upload

---

## ✅ **Final Checklist Before Going Live**

- [ ] Build passes: `npm run build` ✅
- [ ] All env vars set in Vercel
- [ ] Mobile navigation visible
- [ ] Product cards responsive
- [ ] Cart page works
- [ ] Orders sync to Supabase
- [ ] Admin can see orders
- [ ] Images load correctly
- [ ] Search works
- [ ] Category filter works
- [ ] Add to cart works
- [ ] Checkout completes
- [ ] Receipt displays
- [ ] WhatsApp link works
- [ ] No console errors

---

## 🎉 **You're Live!**

Your e-commerce shop is now live on Vercel with:
- ✅ Mobile-first premium UI
- ✅ Reliable order processing
- ✅ Cross-device order syncing
- ✅ Professional design
- ✅ Fast performance

**Next:** Monitor for the first week and gather user feedback.

---

## 📚 **Additional Resources**

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Cloudinary: https://cloudinary.com/documentation

---

**Deployment completed successfully! 🚀**
