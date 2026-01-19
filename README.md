# Portfolio Website

Data science portfolio website built with Next.js 15 and Tailwind CSS.

## Tech Stack

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with navbar/footer
│   ├── page.tsx            # Home page
│   ├── projects/           # Projects section
│   ├── contact/            # Contact page
│   ├── admin/              # Admin dashboard (protected)
│   └── api/                # API routes
├── components/             # Reusable components
├── lib/                    # Utilities and data layer
└── content/                # Project data (JSON/MDX)
```

## Features

- ✅ Single Page Application feeling with proper routing
- ✅ Bright theme (white background, blue accents)
- ✅ Responsive design
- ⏳ Project detail pages (dynamic routes)
- ⏳ Admin panel with authentication
- ⏳ Project management CRUD

## Next Steps

1. Set up project data structure
2. Implement authentication
3. Create admin dashboard
4. Add project detail pages
