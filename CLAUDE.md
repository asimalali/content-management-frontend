# React Frontend Guide - Content Management Platform

> **Frontend-specific documentation.** For project overview and shared domain model, see [root CLAUDE.md](../CLAUDE.md).

---

## Tech Stack

**React 18** | **TypeScript** | **Vite** | **TanStack Query** | **Zustand** | **Tailwind CSS v4**

---

## Frontend Architecture

**Feature-Based Clean Architecture (Bulletproof React Pattern)**

```
src/
├── app/           # App-level: router, providers, global error boundary
├── components/    # Shared: UI primitives, layout components
├── config/        # Constants, environment variables
├── features/      # Feature modules (auth, projects, content, etc.)
├── hooks/         # Global custom hooks
├── lib/           # Third-party configs (axios, react-query)
├── pages/         # Route page components
├── styles/        # Design tokens & global CSS
├── types/         # Shared TypeScript types
└── utils/         # Pure utility functions
```

### Feature Module Structure

Each feature is self-contained with its own API, components, hooks, store, and types.

```
features/auth/
├── api/           # API calls (auth-api.ts)
├── components/    # Feature-specific components
├── hooks/         # Feature-specific hooks (use-login.ts, use-register.ts)
├── store/         # Zustand store (authStore.ts) for client state
├── types/         # Feature types (User, AuthResponse, etc.)
└── index.ts       # Public exports

features/projects/
├── api/           # projects-api.ts
├── components/    # ProjectCard.tsx, ProjectForm.tsx
├── hooks/         # use-projects.ts, use-create-project.ts
├── types/         # Project, BrandDna types
└── index.ts

features/admin/    # Admin feature module (completely separated)
├── api/           # admin-dashboard-api.ts, admin-users-api.ts, admin-feature-flags-api.ts
├── components/    # AdminSidebar.tsx
├── hooks/         # use-admin-dashboard.ts, use-admin-users.ts, use-admin-feature-flags.ts
├── types/         # AdminUser, AdminPlan, FeatureFlag types
└── index.ts
```

---

## Theming System (Design Tokens)

**3-Layer Token Architecture:** Primitives → Semantic → Component

### Changing Brand Colors

Edit **ONE file**: `src/styles/tokens.css`

```css
/* === BRAND COLORS - CHANGE THESE TO UPDATE THEME === */
--color-brand-500: #0ea5e9;    /* Primary brand color */
--color-brand-600: #0284c7;    /* Hover state */
--color-brand-700: #0369a1;    /* Active state */
```

**All components automatically update** when these variables change. No need to touch component files.

### Token Layers

| Layer | Purpose | Example |
|-------|---------|---------|
| **Primitives** | Raw color/size values | `--color-sky-500: #0ea5e9` |
| **Semantic** | Purpose-based aliases | `--color-primary: var(--color-brand-500)` |
| **Component** | Context-specific | `--btn-primary-bg: var(--color-primary)` |

### Dark Mode

Automatic via `prefers-color-scheme` + manual toggle. Dark tokens defined in `[data-theme="dark"]` selector.

**Toggle Dark Mode**:

```typescript
// src/hooks/use-theme.ts
const { theme, setTheme } = useTheme();

// Toggle between 'light' and 'dark'
setTheme(theme === 'light' ? 'dark' : 'light');
```

**Dark Mode Colors**: Defined in `src/styles/tokens.css`

```css
[data-theme="dark"] {
  --color-bg-primary: #0f172a;
  --color-text-primary: #f1f5f9;
  /* ... all dark mode overrides */
}
```

---

## Brand Identity / Rebranding

See **[`docs/BRAND_IDENTITY_GUIDE.md`](../docs/BRAND_IDENTITY_GUIDE.md)** for complete guide on changing:
- Brand colors (primary, secondary, accent)
- Fonts (custom font families)
- Logo (SVG/image replacement)
- Favicon (multiple sizes)

**Key Files for Rebranding**:
1. `src/config/brand.config.ts` - Single source of truth
2. `src/styles/tokens.css` - Color token overrides
3. `public/logo.svg` - Logo file
4. `public/favicon.ico` - Favicon files

The system is designed so most changes only require editing these 3-4 files.

---

## Frontend Key Files

| Purpose | Path |
|---------|------|
| **Design Tokens** | `src/styles/tokens.css` |
| **Global Styles** | `src/styles/globals.css` |
| **Axios Config** | `src/lib/axios.ts` |
| **Query Client** | `src/lib/query-client.ts` |
| **Router** | `src/app/router.tsx` |
| **Providers** | `src/app/providers.tsx` |
| **Auth Store** | `src/features/auth/store/authStore.ts` |
| **Auth API** | `src/features/auth/api/auth-api.ts` |
| **Constants** | `src/config/constants.ts` |
| **Platform Config** | `src/config/platform.ts` |
| **Shared Utils** | `src/utils/index.ts` |
| **Empty State Component** | `src/components/empty-state.tsx` |
| **Page Header Component** | `src/components/page-header.tsx` |
| **Confirm Dialog Component** | `src/components/confirm-dialog.tsx` |
| **Feature Gate Component** | `src/components/feature-gate.tsx` |
| **Admin Feature** | `src/features/admin/` |
| **Admin Pages** | `src/pages/admin/` |
| **Admin Route Guard** | `src/components/admin-route.tsx` |
| **Admin Layout** | `src/components/layout/admin-layout.tsx` |
| **Content Optimization Feature** | `src/features/content-optimization/` |
| **Optimization Dialog** | `src/features/content-optimization/components/OptimizationDialog.tsx` |
| **Brand Config** | `src/config/brand.config.ts` |
| **Brand Provider** | `src/components/brand-provider.tsx` |
| **Brand Logo** | `src/components/brand-logo.tsx` |
| **Brand Hooks** | `src/hooks/use-brand.ts` |

---

## Frontend Conventions

### 1. State Management

Choose the right tool for the job:

| Type | Solution | When | Example |
|------|----------|------|---------|
| **Server State** | TanStack Query | API data, caching, loading states | Projects, posts, user data |
| **Client State** | Zustand | Auth, UI state, user preferences | Auth token, theme, sidebar open/close |
| **Component State** | useState/useReducer | Local UI logic | Form inputs, modal visibility |

**TanStack Query** (Server State):

```typescript
// Query hook for fetching
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getAll(),
  });
}

// Mutation hook for actions
export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// Usage in component
const { data: projects, isLoading, error } = useProjects();
const createProject = useCreateProject();
```

**Zustand** (Client State):

```typescript
// src/features/auth/store/authStore.ts
interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: null,
  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    set({ token, user });
  },
  clearAuth: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },
}));

// Usage in component
const { token, setAuth, clearAuth } = useAuthStore();
```

---

### 2. API Calls

**Location**: `features/{feature}/api/`

**Pattern**: Use axios instance from `lib/axios.ts`

```typescript
// src/features/auth/api/auth-api.ts
import { api } from '@/lib/axios';
import type { LoginRequest, LoginResponse, AuthResponse } from '../types';

export const authApi = {
  login: (email: string) =>
    api.post<LoginResponse>('/auth/login', { email }),

  verifyOtp: (data: VerifyOtpRequest) =>
    api.post<AuthResponse>('/auth/verify-otp', data),

  getCurrentUser: () =>
    api.get<User>('/auth/me'),
};
```

**Axios Instance** (`lib/axios.ts`):

- Automatically adds auth token to requests
- Handles token refresh on 401
- Converts errors to proper format

---

### 3. Custom Hooks

**Location**: `features/{feature}/hooks/`

**File Naming**: `use-{name}.ts` (kebab-case)

```typescript
// src/features/projects/hooks/use-projects.ts
import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '../api/projects-api';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getAll,
  });
}

// src/features/projects/hooks/use-create-project.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api/projects-api';

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
```

---

### 4. Component Structure

**Pattern**: Named exports (not default exports), except for pages

```typescript
// src/components/ui/button.tsx
import { cn } from '@/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'btn', // Base styles
        `btn-${variant}`, // Variant styles
        `btn-${size}`, // Size styles
        className // Custom overrides
      )}
      {...props}
    />
  );
}
```

**Exporting**:

```typescript
// src/components/ui/index.ts
export { Button } from './button';
export { Input } from './input';
export { Card } from './card';
```

---

### 5. Path Aliases

Configured in `tsconfig.json` and `vite.config.ts`:

```typescript
// Use path aliases for cleaner imports
import { Button } from '@/components/ui';     // src/components/ui
import { useAuth } from '@/features/auth';    // src/features/auth
import { api } from '@/lib/axios';            // src/lib/axios
import { formatDate } from '@/utils';         // src/utils
import { API_BASE_URL } from '@/config/constants'; // src/config/constants
```

**Never use relative imports** across feature boundaries:

```typescript
// ❌ Don't:
import { Button } from '../../../components/ui/button';

// ✅ Do:
import { Button } from '@/components/ui';
```

---

## Before Committing (MANDATORY)

> **CRITICAL: Every commit MUST pass these checks. No exceptions.**

```bash
cd content-management-frontend

# 1. TypeScript type check (must have 0 errors)
npx tsc --noEmit

# 2. Production build (must succeed)
npm run build

# 3. Run tests (if applicable)
npm run test

# 4. Lint check (catch code quality issues)
npm run lint
```

**Before pushing:**
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npm run build` succeeds (no build warnings)
- [ ] All tests pass (`npm run test`)
- [ ] No hardcoded URLs or API keys in code
- [ ] No `any` types (use proper interfaces)
- [ ] All shared components used (no UI duplication)
- [ ] All constants used (no magic numbers/strings)
- [ ] Feature flags tested (toggle on/off if added)
- [ ] No console.log or debug code left in

**If a check fails:**
- Fix the code immediately — **don't commit with errors**
- Understand the root cause, not just the error message
- Test locally before pushing

---

## Development Commands

```bash
# Navigate to frontend directory
cd content-management-frontend

# Install dependencies
npm install

# Development server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint

# TypeScript type check
npx tsc --noEmit

# Format code (if Prettier is configured)
npm run format
```

---

## Code Patterns

### Adding a New Feature

Follow this 10-step checklist:

1. **Create feature folder**: `src/features/{name}/`

2. **Add types**: `src/features/{name}/types/index.ts`
   ```typescript
   export interface NewFeature {
     id: string;
     name: string;
     createdAt: string;
   }

   export interface CreateNewFeatureRequest {
     name: string;
   }

   export interface CreateNewFeatureResponse {
     id: string;
   }
   ```

3. **Add API**: `src/features/{name}/api/{name}-api.ts` (**kebab-case**)
   ```typescript
   import { api } from '@/lib/axios';
   import type { NewFeature, CreateNewFeatureRequest } from '../types';

   export const newFeatureApi = {
     getAll: () => api.get<NewFeature[]>('/new-features'),
     create: (data: CreateNewFeatureRequest) =>
       api.post<CreateNewFeatureResponse>('/new-features', data),
   };
   ```

4. **Add store (if needed)**: `src/features/{name}/store/{name}-store.ts`
   ```typescript
   import { create } from 'zustand';

   interface NewFeatureState {
     selectedId: string | null;
     setSelectedId: (id: string | null) => void;
   }

   export const useNewFeatureStore = create<NewFeatureState>((set) => ({
     selectedId: null,
     setSelectedId: (selectedId) => set({ selectedId }),
   }));
   ```

5. **Add hooks**: `src/features/{name}/hooks/use-{action}.ts` (**kebab-case**)
   ```typescript
   import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
   import { newFeatureApi } from '../api/new-feature-api';

   export function useNewFeatures() {
     return useQuery({
       queryKey: ['new-features'],
       queryFn: newFeatureApi.getAll,
     });
   }

   export function useCreateNewFeature() {
     const queryClient = useQueryClient();
     return useMutation({
       mutationFn: newFeatureApi.create,
       onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['new-features'] });
       },
     });
   }
   ```

6. **Add components**: `src/features/{name}/components/`
   ```typescript
   // NewFeatureCard.tsx
   export function NewFeatureCard({ feature }: { feature: NewFeature }) {
     return (
       <Card>
         <h3>{feature.name}</h3>
         <p>{formatDate(feature.createdAt)}</p>
       </Card>
     );
   }
   ```

7. **Export from feature**: `src/features/{name}/index.ts`
   ```typescript
   export * from './api/new-feature-api';
   export * from './hooks/use-new-features';
   export * from './types';
   ```

8. **Use shared constants** from `@/config/constants` — **no magic numbers**

9. **Use shared utils** from `@/utils` — **no inline date formatting or copy logic**

10. **Use shared components** (`EmptyState`, `PageHeader`, `ConfirmDialog`) — **no duplicating UI patterns**

---

### Adding a New Page

1. **Create page**: `src/pages/{name}.tsx` (**kebab-case**)
   ```typescript
   // src/pages/new-feature.tsx
   import { PageHeader } from '@/components/page-header';
   import { EmptyState } from '@/components/empty-state';
   import { useNewFeatures } from '@/features/new-feature';

   export default function NewFeaturePage() {
     const { data: features, isLoading } = useNewFeatures();

     if (isLoading) return <div>Loading...</div>;

     return (
       <div className="container">
         <PageHeader
           title="New Feature"
           description="Manage your new feature items"
         />

         {features?.length === 0 ? (
           <EmptyState
             title="No items yet"
             description="Get started by creating your first item"
           />
         ) : (
           <div className="grid">{/* Render features */}</div>
         )}
       </div>
     );
   }
   ```

2. **Add lazy import** in `src/app/router.tsx`:
   ```typescript
   const NewFeaturePage = lazy(() => import('@/pages/new-feature'));
   ```

3. **Add route** with `ProtectedRoute` wrapper:
   ```typescript
   {
     path: '/new-feature',
     element: (
       <ProtectedRoute>
         <NewFeaturePage />
       </ProtectedRoute>
     ),
   }
   ```

4. **Use `<PageHeader>`** for consistent page header pattern

5. **Use `<EmptyState>`** for empty/error states

**Important**: Suspense wrapper is already included in `ProtectedRoute`, no need to add it manually.

---

### Adding a New UI Component

1. **Create component**: `src/components/ui/{Name}.tsx`
   ```typescript
   // src/components/ui/badge.tsx
   import { cn } from '@/utils';

   interface BadgeProps {
     variant?: 'default' | 'success' | 'warning' | 'danger';
     children: React.ReactNode;
   }

   export function Badge({ variant = 'default', children }: BadgeProps) {
     return (
       <span
         className={cn(
           'badge',
           `badge-${variant}`
         )}
       >
         {children}
       </span>
     );
   }
   ```

2. **Export from index**: `src/components/ui/index.ts`
   ```typescript
   export { Badge } from './badge';
   ```

3. **Add CSS variables** (if needed) in `src/styles/tokens.css`:
   ```css
   /* Badge component tokens */
   --badge-bg-default: var(--color-gray-100);
   --badge-text-default: var(--color-gray-700);

   [data-theme="dark"] {
     --badge-bg-default: var(--color-gray-800);
     --badge-text-default: var(--color-gray-300);
   }
   ```

---

## Frontend Quick Tips

1. **Server state** → TanStack Query (never useState for API data)
2. **Client state** → Zustand stores (auth, theme, UI preferences)
3. **Styling** → Tailwind utility classes + CSS variables from tokens.css
4. **Forms** → React Hook Form (when complex validation needed)
5. **Loading** → Suspense + lazy() for code splitting (all pages except Landing/Auth)
6. **Error handling** → Error boundaries for UI, try-catch for API calls
7. **Icons** → Lucide React (tree-shakeable, consistent style)
8. **Dates** → Use `formatDate()` / `formatDateObject()` from `@/utils` (never inline `toLocaleDateString`)

---

## Frontend Best Practices (MANDATORY)

> **CRITICAL: These rules MUST be followed for all frontend code — new features, bug fixes, and enhancements.**

---

### 1. NO HARDCODED VALUES

Never hardcode magic numbers, strings, or configuration values. Always use shared constants.

```typescript
// ❌ Don't:
if (credits < 5) { ... }
text.substring(0, 50)
setTimeout(() => setCopied(false), 2000)
const maxLength = 280;

// ✅ Do:
import {
  LOW_CREDIT_THRESHOLD,
  POST_PREVIEW_LENGTH,
  COPY_FEEDBACK_DURATION,
  X_MAX_LENGTH,
} from '@/config/constants';

if (credits < LOW_CREDIT_THRESHOLD) { ... }
truncateText(text, POST_PREVIEW_LENGTH)
setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION)
const maxLength = X_MAX_LENGTH;
```

**Constants file**: `src/config/constants.ts`
**Platform config**: `src/config/platform.ts` (platform icons, names, status colors/labels)

**Why**: Centralized constants make it easy to update values across the entire app without hunting through code.

---

### 2. USE SHARED UTILITIES — NEVER DUPLICATE LOGIC

Always use existing utilities instead of writing inline logic.

```typescript
// ❌ Don't:
new Date(dateString).toLocaleDateString('ar-SA')
navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000);
text.length > 50 ? text.substring(0, 50) + '...' : text

// ✅ Do:
import { formatDate, copyToClipboard, truncateText } from '@/utils';

formatDate(dateString)
copyToClipboard(text, setCopied)
truncateText(text, POST_PREVIEW_LENGTH)
```

**Utilities file**: `src/utils/index.ts`

**Available helpers**:
- `formatDate(date)` - Format date as YYYY-MM-DD (ar-SA locale)
- `formatDateTime(date)` - Format date with time
- `formatDateObject(date)` - Parse string to Date object
- `copyToClipboard(text, setCopied)` - Copy with feedback (2s)
- `truncateText(text, maxLength)` - Truncate with ellipsis
- `cn(...classes)` - Merge Tailwind classes conditionally

**Why**: DRY principle. If logic changes (e.g., locale change), update once in utils instead of everywhere.

---

### 3. USE SHARED COMPONENTS — NEVER COPY-PASTE UI PATTERNS

Use existing shared components instead of recreating common UI patterns.

```typescript
// ❌ Don't: Copy-paste AlertDialog blocks for confirmations
<AlertDialog>
  <AlertDialogTrigger>Delete</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

// ✅ Do: Use shared ConfirmDialog
import { ConfirmDialog } from '@/components/confirm-dialog';

<ConfirmDialog
  title="Delete Project"
  description="Are you sure you want to delete this project? This action cannot be undone."
  confirmText="Delete"
  onConfirm={handleDelete}
  variant="danger"
/>
```

**Shared components**:
- `<ConfirmDialog>` - Confirmation dialogs (delete, archive, etc.)
- `<EmptyState>` - Empty state screens (no data, errors)
- `<PageHeader>` - Consistent page headers (title + description + actions)
- `<FeatureGate>` - Feature flag gating (hide features based on flags)

**Why**: Consistency, maintainability, and no duplication. Update the shared component once to fix bugs everywhere.

---

### 4. USE PLATFORM CONFIG — NEVER DUPLICATE PLATFORM MAPS

All platform-related display config (icons, names, status colors) must come from the shared config.

```typescript
// ❌ Don't: Define local platformIcons, statusColors, statusLabels maps
const statusColors = {
  Connected: 'bg-green-100 text-green-800',
  Expired: 'bg-yellow-100 text-yellow-800',
  Revoked: 'bg-red-100 text-red-800',
};

// ✅ Do: Use shared platform config
import {
  PLATFORM_CONFIG,
  getConnectionStatusClass,
  getConnectionStatusLabel,
  CONTENT_STATUS_CONFIG,
} from '@/config/platform';

const statusClass = getConnectionStatusClass(account.status);
const statusLabel = getConnectionStatusLabel(account.status);
```

**Platform config file**: `src/config/platform.ts`

**Exception**: `platformIcons` using React component nodes like `<Instagram />` can stay local (React components can't be in plain config objects).

**Why**: Single source of truth for platform-related UI. Update once to change colors/labels everywhere.

---

### 5. FILE NAMING CONVENTION

**All files use kebab-case** — no camelCase or PascalCase for file names.

```
✅ Good:
- optimization-api.ts
- use-optimization.ts
- calendar-api.ts
- auth-api.ts
- admin-users-api.ts

❌ Bad:
- optimizationApi.ts
- useOptimization.ts
- calendarApi.ts
- authApi.ts
- AdminUsersApi.ts
```

**Why**: Consistency with modern web conventions. Easier to find files when they all follow the same pattern.

---

### 6. TYPE ORGANIZATION

- **Global types** (used across features): `src/types/` (e.g., `auth.ts`, `common.ts`)
- **Feature-scoped types**: `src/features/{feature}/types/` (preferred for feature-specific types)
- **Never duplicate types** in both locations — if a type exists in a feature module, import from the feature
- **Platform type**: Import `Platform` from `@/features/integrations`, NOT from `@/types/integration`

```typescript
// ✅ Import from feature
import type { Platform } from '@/features/integrations';

// ❌ Don't import from global types if it exists in feature
import type { Platform } from '@/types/integration'; // WRONG
```

**Why**: Colocate types with their features. Easier to refactor and maintain.

---

### 7. LAZY LOADING FOR ALL NEW PAGES

All new page imports in `src/app/router.tsx` MUST use lazy loading.

```typescript
// ✅ Always use lazy loading for pages:
const NewPage = lazy(() => import('@/pages/new-page'));

// Then in routes:
{
  path: '/new-page',
  element: (
    <ProtectedRoute>
      <NewPage />
    </ProtectedRoute>
  ),
}

// ❌ Never eager import pages (except LandingPage and AuthPage):
import NewPage from '@/pages/new-page'; // WRONG
```

**Why**: Lazy loading reduces initial bundle size. Each page is loaded only when needed, improving performance.

---

### 8. NO `any` TYPES

Never use `any` type. Use proper interfaces, `unknown`, or specific types.

```typescript
// ❌ Don't:
const [data, setData] = useState<any>(null);
function handleChange(event: any) { ... }

// ✅ Do:
interface MyDataType {
  id: string;
  name: string;
}
const [data, setData] = useState<MyDataType | null>(null);

function handleChange(event: React.ChangeEvent<HTMLInputElement>) { ... }
```

**Why**: Type safety. TypeScript can't help you if you use `any` everywhere.

---

### 9. NO HARDCODED URLS OR SECRETS

Never hardcode URLs, API keys, or secrets. Use environment variables.

```typescript
// ❌ Don't:
const apiUrl = 'https://some-tunnel.loca.lt';
const apiKey = 'sk-1234567890abcdef';

// ✅ Do:
const apiUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;
const apiKey = import.meta.env.VITE_API_KEY;
```

**Environment variables**: Create `.env.development` for local development

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_API_KEY=your-dev-api-key
```

**Why**: Security and flexibility. Different environments (dev, staging, prod) need different URLs.

---

### 10. BEFORE COMMITTING — VERIFY BUILD

Always run these checks before committing frontend changes:

```bash
cd content-management-frontend

# 1. TypeScript type check (MUST pass with 0 errors)
npx tsc --noEmit

# 2. Production build (MUST succeed)
npm run build

# 3. Lint (optional but recommended)
npm run lint
```

**Why**: Catches build-time errors before they reach production. Ensures code quality.

---

## TypeScript Patterns

### Interface Organization

**Prefer interfaces over types** for object shapes:

```typescript
// ✅ Use interface for object shapes
interface User {
  id: string;
  email: string;
  role: 'User' | 'Admin';
}

// ✅ Use type for unions, intersections, primitives
type UserRole = 'User' | 'Admin';
type Status = 'idle' | 'loading' | 'success' | 'error';
```

### Type Inference Best Practices

**Let TypeScript infer when possible**:

```typescript
// ✅ Let TypeScript infer simple types
const [isOpen, setIsOpen] = useState(false); // boolean inferred

// ✅ Explicitly type when inference isn't clear
const [user, setUser] = useState<User | null>(null);

// ✅ Infer function return types
function getUser(id: string) {
  return api.get<User>(`/users/${id}`); // Return type inferred as Promise<User>
}
```

### Generic Types

```typescript
// Reusable response wrapper
interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// Usage
type UserResponse = ApiResponse<User>;
type ProjectsResponse = ApiResponse<Project[]>;
```

---

## TanStack Query Patterns

### Query Keys

**Use consistent query key structure**:

```typescript
// ✅ Good: Hierarchical query keys
const queryKeys = {
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  projectContent: (id: string) => ['projects', id, 'content'] as const,
};

// Usage
useQuery({
  queryKey: queryKeys.projects,
  queryFn: projectsApi.getAll,
});

useQuery({
  queryKey: queryKeys.project(projectId),
  queryFn: () => projectsApi.getById(projectId),
});
```

**Why**: Hierarchical keys make cache invalidation easier. Invalidating `['projects']` invalidates all project-related queries.

---

### Cache Invalidation

```typescript
// Invalidate all projects queries
queryClient.invalidateQueries({ queryKey: ['projects'] });

// Invalidate specific project
queryClient.invalidateQueries({ queryKey: ['projects', projectId] });

// Invalidate multiple related queries
queryClient.invalidateQueries({ queryKey: ['projects'] });
queryClient.invalidateQueries({ queryKey: ['user'] });
```

---

### Optimistic Updates

```typescript
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectRequest }) =>
      projectsApi.update(id, data),

    // Optimistic update
    onMutate: async ({ id, data }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['projects', id] });

      // Snapshot current value
      const previous = queryClient.getQueryData(['projects', id]);

      // Optimistically update
      queryClient.setQueryData(['projects', id], (old: Project) => ({
        ...old,
        ...data,
      }));

      return { previous };
    },

    // Rollback on error
    onError: (err, variables, context) => {
      queryClient.setQueryData(['projects', variables.id], context?.previous);
    },

    // Refetch on success
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.id] });
    },
  });
}
```

---

### Pagination

```typescript
export function useProjects(page: number = 1, pageSize: number = 10) {
  return useQuery({
    queryKey: ['projects', { page, pageSize }],
    queryFn: () => projectsApi.getAll({ page, pageSize }),
    keepPreviousData: true, // Keep old data while fetching new page
  });
}
```

---

## Zustand Store Patterns

### Store Organization

**Keep stores focused and feature-scoped**:

```typescript
// src/features/auth/store/authStore.ts
interface AuthState {
  // State
  token: string | null;
  user: User | null;

  // Actions
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: null,

  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    set({ token, user });
  },

  clearAuth: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },
}));
```

---

### Selectors

**Use selectors for derived state**:

```typescript
// Select only what you need
const token = useAuthStore((state) => state.token);
const user = useAuthStore((state) => state.user);

// Derived selector
const isAuthenticated = useAuthStore((state) => !!state.token);
```

---

### Middleware (Persist, DevTools)

```typescript
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        theme: 'light',
        sidebarOpen: true,

        setTheme: (theme) => set({ theme }),
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      }),
      {
        name: 'ui-storage', // localStorage key
      }
    )
  )
);
```

---

## Form Handling (React Hook Form)

### Basic Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(1000).optional(),
});

type FormData = z.infer<typeof schema>;

export function ProjectForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}

      <textarea {...register('description')} />
      {errors.description && <span>{errors.description.message}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

---

### Form with TanStack Query Mutation

```typescript
export function ProjectForm() {
  const createProject = useCreateProject();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    createProject.mutate(data, {
      onSuccess: () => {
        toast.success('Project created successfully');
        navigate('/projects');
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* ... */}
      <button type="submit" disabled={createProject.isLoading}>
        {createProject.isLoading ? 'Creating...' : 'Create Project'}
      </button>
    </form>
  );
}
```

---

## Error Boundaries

**App-level error boundary** (`src/app/error-boundary.tsx`):

```typescript
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Usage** (`src/app/App.tsx`):

```typescript
<ErrorBoundary>
  <Router />
</ErrorBoundary>
```

---

## Feature Gates

**Use `<FeatureGate>` component** to hide features based on feature flags:

```typescript
// src/components/feature-gate.tsx
import { useFeatureFlags } from '@/hooks/use-feature-flags';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({ feature, children, fallback = null }: FeatureGateProps) {
  const { isEnabled } = useFeatureFlags();

  if (!isEnabled(feature)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

**Usage**:

```typescript
// Hide entire route
<FeatureGate feature="publishing">
  <Route path="/publishing" element={<PublishingPage />} />
</FeatureGate>

// Hide UI component
<FeatureGate feature="ai_optimization">
  <Button onClick={openOptimizationDialog}>
    Optimize Content
  </Button>
</FeatureGate>

// Show fallback
<FeatureGate
  feature="advanced_analytics"
  fallback={<p>This feature is coming soon!</p>}
>
  <AnalyticsChart />
</FeatureGate>
```

**Feature flags are cached** (10 min TTL). They refresh automatically from `/api/config` endpoint.

---

## Accessibility Best Practices

### Semantic HTML

```typescript
// ✅ Use semantic HTML
<main>
  <nav>
    <ul>
      <li><a href="/dashboard">Dashboard</a></li>
    </ul>
  </nav>

  <article>
    <h1>Page Title</h1>
    <section>
      <h2>Section Title</h2>
    </section>
  </article>
</main>

// ❌ Don't use divs for everything
<div>
  <div>
    <div><a href="/dashboard">Dashboard</a></div>
  </div>
</div>
```

---

### ARIA Attributes

```typescript
// Button with aria-label
<button aria-label="Delete project" onClick={handleDelete}>
  <TrashIcon />
</button>

// Hidden content
<div aria-hidden="true">
  {/* Decorative content */}
</div>

// Live region for dynamic content
<div role="status" aria-live="polite">
  {message}
</div>
```

---

### Keyboard Navigation

```typescript
// Keyboard-accessible dialog
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <button>Open Dialog</button>
  </DialogTrigger>
  <DialogContent>
    {/* Content */}
    <DialogClose asChild>
      <button>Close</button>
    </DialogClose>
  </DialogContent>
</Dialog>

// Keyboard-accessible dropdown
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <button>Open Menu</button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onSelect={handleAction}>
      Action
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

### Focus Management

```typescript
import { useEffect, useRef } from 'react';

export function Modal({ isOpen }: { isOpen: boolean }) {
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div>
      <button ref={firstFocusableRef}>First Button</button>
    </div>
  );
}
```

---

## Testing

### Unit Tests (Vitest)

```typescript
// src/utils/index.test.ts
import { describe, it, expect } from 'vitest';
import { truncateText, formatDate } from './index';

describe('truncateText', () => {
  it('should truncate text longer than maxLength', () => {
    expect(truncateText('Hello World', 5)).toBe('Hello...');
  });

  it('should not truncate text shorter than maxLength', () => {
    expect(truncateText('Hi', 5)).toBe('Hi');
  });
});
```

---

### Component Tests (React Testing Library)

```typescript
// src/components/button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);

    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

## Production Checklist

Before deploying to production:

- [ ] All TypeScript errors resolved (`npx tsc --noEmit` passes)
- [ ] Production build succeeds (`npm run build` passes)
- [ ] All tests pass (`npm run test` passes)
- [ ] No `any` types in new code
- [ ] All hardcoded values moved to constants
- [ ] All API URLs use environment variables
- [ ] Feature flags tested (toggle on/off)
- [ ] Dark mode tested
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] Accessibility tested (keyboard navigation, screen readers)
- [ ] Error boundaries in place
- [ ] Loading states for all async operations
- [ ] Empty states for all data lists
- [ ] Optimistic updates for critical actions

---

## Additional Resources

- **Shared Domain Model**: See [root CLAUDE.md § Shared Domain Model](../CLAUDE.md#shared-domain-model)
- **API Contract**: See [root CLAUDE.md § API Contract](../CLAUDE.md#api-contract)
- **Backend Guide**: See [ContentManagement/CLAUDE.md](../ContentManagement/CLAUDE.md)
- **Brand Identity Guide**: See [docs/BRAND_IDENTITY_GUIDE.md](../docs/BRAND_IDENTITY_GUIDE.md)
- **Feature Flags Implementation**: See [FEATURE_FLAG_IMPLEMENTATION_SUMMARY.md](../FEATURE_FLAG_IMPLEMENTATION_SUMMARY.md)

---

## Quick Reference

- **Need to fetch data from API?** → Use TanStack Query (`useQuery`)
- **Need to submit form data?** → Use TanStack Query mutation (`useMutation`)
- **Need to store client state?** → Use Zustand store
- **Need to format a date?** → Use `formatDate()` from `@/utils`
- **Need to copy text to clipboard?** → Use `copyToClipboard()` from `@/utils`
- **Need to truncate text?** → Use `truncateText()` from `@/utils`
- **Need to show empty state?** → Use `<EmptyState>` component
- **Need to show confirmation dialog?** → Use `<ConfirmDialog>` component
- **Need to hide feature based on flag?** → Use `<FeatureGate>` component
- **Need to get platform status color?** → Use `getConnectionStatusClass()` from `@/config/platform`
