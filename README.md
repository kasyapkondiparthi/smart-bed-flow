# Smart Hospital Bed Allocation System

A secure, intuitive, and dynamic hospital bed allocation management system designed for healthcare optimization.

## Features
- Real-time Dashboard
- Priority-Based Allocation (Critical > Moderate > Low)
- Automatic Bed & Floor Assignment
- Secure Authentication
- Waitlist Queue Management

## Getting Started
To get started locally:

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Ensure your `.env` contains:
```env
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Make sure you deploy the Edge Function for allocations:
```bash
supabase functions deploy allocate --no-verify-jwt
```
