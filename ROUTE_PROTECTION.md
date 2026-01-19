# Route Protection Architecture

## Current Implementation (Development)

### Client-Side Protection
The portfolio uses **layout-based authentication** with the following components:

1. **AuthGuard Component** (`components/AuthGuard.tsx`)
   - Client component that wraps protected content
   - Checks localStorage for auth state
   - Redirects to login if not authenticated
   - Shows loading state during check
   - Preserves intended destination URL

2. **Admin Layout** (`app/admin/layout.tsx`)
   - Wraps all `/admin/*` routes
   - Applies AuthGuard automatically
   - Single point of protection

3. **Login Flow**
   - User tries to access `/admin/projects`
   - AuthGuard detects no auth
   - Redirects to `/admin/login?returnUrl=/admin/projects`
   - After successful login, redirects back to intended page

### Limitations (Development Only)
- ⚠️ Client-side only - runs after component mounts
- ⚠️ Brief content flash possible on slow connections
- ⚠️ Can be bypassed by disabling JavaScript
- ⚠️ localStorage can be manipulated
- ⚠️ No server-side security boundary

---

## Production Upgrade Path

### Option 1: Next.js Middleware (Recommended)

**File:** `middleware.ts` (template provided)

**How it works:**
```typescript
export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session_token');
  
  if (!sessionCookie && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  
  // Validate cookie...
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
```

**Benefits:**
- Runs at the Edge before any page renders
- No content flash - true SSR protection
- Works without JavaScript
- Can protect API routes too
- Single point of truth for auth

**Implementation Steps:**
1. Replace localStorage with HTTP-only cookies
2. Set cookie on login from API route
3. Uncomment middleware code
4. Add cookie validation logic
5. Test protected routes

---

### Option 2: Server Components

**Convert admin pages to async Server Components:**

```typescript
// app/admin/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

async function getSession() {
  const cookieStore = cookies();
  const session = cookieStore.get('session_token');
  return session?.value;
}

export default async function AdminPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/admin/login');
  }
  
  // Render protected content
  return <div>Admin Dashboard</div>;
}
```

**Benefits:**
- No client-side code needed
- Auth check before any HTML is sent
- Leverage React Server Components
- Type-safe with TypeScript

---

### Option 3: NextAuth.js (Auth.js)

**Most robust solution for production:**

```bash
npm install next-auth
```

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Verify credentials against database
        const user = await verifyUser(credentials);
        return user || null;
      }
    })
  ],
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      
      if (isOnAdmin && !isLoggedIn) {
        return false; // Redirect to login
      }
      return true;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

**Benefits:**
- Battle-tested auth solution
- Built-in CSRF protection
- Session management handled
- Multiple auth providers support
- Automatic middleware protection
- TypeScript types included

---

## Migration Checklist

### Step 1: Server-Side Sessions
- [ ] Install bcrypt for password hashing
- [ ] Create API route for login: `POST /api/auth/login`
- [ ] Hash password, verify against stored hash
- [ ] Generate signed JWT or session token
- [ ] Set HTTP-only, Secure cookie with token
- [ ] Update login page to call API

### Step 2: Middleware Protection
- [ ] Uncomment `middleware.ts` code
- [ ] Add cookie validation logic
- [ ] Test redirects work correctly
- [ ] Add returnUrl preservation

### Step 3: API Route Protection
- [ ] Create auth helper for API routes
- [ ] Protect all `/api/admin/*` routes
- [ ] Return 401 for unauthenticated requests
- [ ] Test CRUD operations require auth

### Step 4: Remove Client-Side Auth
- [ ] Keep AuthGuard as UI optimization (optional)
- [ ] Remove localStorage usage
- [ ] Update auth.ts to use cookies/sessions
- [ ] Test entire flow end-to-end

### Step 5: Production Hardening
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS only
- [ ] Add rate limiting on login
- [ ] Implement session expiration
- [ ] Add CSRF tokens
- [ ] Security audit

---

## Current File Structure

```
app/
  admin/
    layout.tsx          ← Applies AuthGuard to all admin routes
    page.tsx            ← Dashboard (no auth check, relies on layout)
    login/
      page.tsx          ← Login form (checks if already auth'd)
    projects/
      page.tsx          ← Projects CRUD (no auth check, relies on layout)

components/
  AuthGuard.tsx         ← Client-side route protection component

lib/
  auth.ts               ← Auth functions (localStorage-based, temp)

middleware.ts           ← Template for production (currently disabled)
```

All admin pages are automatically protected by the layout-based AuthGuard without individual auth checks.
