# Artique Co.

A complete handmade-crafts e-commerce experience built with Next.js, Tailwind CSS, and a Supabase-ready architecture.

## Features
- Responsive storefront with live search and category filters
- Product customization options plus a cart and checkout flow
- WhatsApp-friendly digital receipt flow
- Admin dashboard for shop settings, product CRUD, categories, users, and orders

## Run locally
1. Install dependencies with `npm install`
2. Start the development server with `npm run dev`
3. Open http://localhost:3000

## Notes
- The current version uses browser storage for demo data and can be wired to Supabase and Cloudinary by adding the relevant environment variables.
 - Default demo admin password: `artique123`. For production, change this password and secure admin endpoints. See `src/lib/shop-data.ts` for where demo settings are seeded.
