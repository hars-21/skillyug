# Skillyug 2.0 - Next.js Frontend

This is the Next.js frontend for the Skillyug 2.0 learning platform, migrated from React.js.

## Features

- **Next.js 15** with App Router
- **Tailwind CSS 4** (no config file needed)
- **TypeScript** for type safety
- **Auth.js (NextAuth.js)** for authentication
- **React Hook Form** with Zod validation
- **Lucide React** for icons
- **Responsive design** with mobile-first approach

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
Create a `.env.local` file with the following variables:
```
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── login/             # Login page
│   ├── sign-up/           # Sign up page
│   ├── dashboard/         # Dashboard page
│   ├── courses/           # Courses listing
│   ├── about-us/          # About us page
│   ├── contactus/         # Contact page
│   ├── join-our-team/     # Join our team page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── ExtraComponents/   # Additional components
│   ├── Navbar.tsx         # Navigation component
│   ├── ProtectedRoute.tsx # Route protection
│   └── DashboardSelector.tsx # Dashboard routing
├── hooks/                 # Custom React hooks
│   ├── AuthContext.tsx    # Authentication context
│   ├── useCourse.ts       # Course management hook
│   ├── usePurchase.ts     # Purchase management hook
│   └── checkoutHandlers.ts # Payment handlers
├── lib/                   # Utility libraries
│   ├── supabase.ts        # Supabase client
│   └── validation.ts      # Form validation schemas
└── pages/                 # Dashboard pages
    ├── AdminDashboard.tsx
    ├── StudentDashboard.tsx
    └── MentorsDashboard.tsx
```

## Key Features

### Authentication
- User registration and login with Auth.js
- Credentials-based authentication
- Protected routes
- Role-based dashboard routing
- Session management

### Dashboard System
- Student dashboard with course management
- Admin dashboard with platform analytics
- Mentor dashboard with student management
- Responsive sidebar navigation

### Course Management
- Course listing and details
- Purchase integration with Razorpay
- User purchase tracking
- Course enrollment system

### UI/UX
- Modern gradient design
- Glassmorphism effects
- Responsive mobile-first design
- Smooth animations and transitions
- Accessible form components

## Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **Auth.js (NextAuth.js)** - Authentication library
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications

## Migration Notes

This project was migrated from React.js to Next.js with the following changes:

1. **Routing**: Converted from React Router to Next.js App Router
2. **Components**: Added 'use client' directive for client components
3. **Images**: Replaced img tags with Next.js Image component
4. **Links**: Replaced Link from react-router-dom with Next.js Link
5. **Authentication**: Migrated from Supabase Auth to Auth.js (NextAuth.js)
6. **Styling**: Maintained Tailwind CSS 4 without config file
7. **TypeScript**: Added proper type definitions throughout

## Development

- **ESLint** configured for code quality
- **TypeScript** for type checking
- **Tailwind CSS 4** for styling (no config needed)
- **Hot reload** for development

## Deployment

The project is ready for deployment on Vercel, Netlify, or any other Next.js-compatible platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Skillyug 2.0 learning platform.