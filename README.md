# Partner Portal - Premium SaaS Prototype

A high-end, visually exceptional frontend prototype for an affiliate access portal. This is a **visual prototype only** - no real authentication, backend, APIs, or security logic. Everything is simulated with mock state for client demonstration purposes.

## 🎯 Project Overview

This frontend acts as a unified partner entry point for multiple affiliate tools:
- **Rebatetools** — Broker commission analytics (https://rebatetools.com)
- **Telebulk** — Telegram bulk messaging (https://telebulk.com)
- **MsgChat** — WhatsApp bulk messaging (https://www.msgchat.com)

## ✨ Design Philosophy

Designed with a premium SaaS aesthetic inspired by top-tier products (Stripe / Linear / Vercel):
- Clean, modern, premium visual design
- Near-white background, dark neutral text
- Subtle borders, soft shadows, calm gradients
- Clear typography scale (labels → body → headings)
- Micro-interactions (hover, focus, transitions)
- Smooth but restrained animations
- Intentional, calm, and professional feel

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
partner-launchpad/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── layout/          # Layout components (Header, Footer)
│   │   ├── ToolCard.tsx     # Tool card component
│   │   ├── Stepper.tsx      # Multi-step wizard stepper
│   │   └── Skeleton.tsx     # Loading skeletons
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Mock authentication state
│   ├── pages/               # Page components
│   │   ├── Index.tsx        # Landing page
│   │   ├── Register.tsx    # Registration form
│   │   ├── Login.tsx        # Login form
│   │   ├── ResetPassword.tsx # Password reset
│   │   ├── Onboarding.tsx    # Multi-step onboarding
│   │   ├── Dashboard.tsx    # Partner dashboard
│   │   └── ToolPlaceholder.tsx # Tool integration placeholder
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities
│   └── App.tsx             # Main app component
├── public/                  # Static assets
└── tailwind.config.ts       # Tailwind configuration
```

## 🎨 Pages & Routes

### `/` - Landing Page
- Hero section with clear value proposition
- Tool showcase cards
- Call-to-action buttons
- Minimal footer

### `/register` - Create Account
- Full registration form with validation
- Visual password strength indicator
- Optional fields (company, Telegram, WhatsApp)
- Terms & conditions checkbox
- Auto-navigates to onboarding on success

### `/login` - Sign In
- Email and password fields
- Forgot password link
- Mock authentication (accepts any credentials)
- Auto-navigates to dashboard on success

### `/reset` - Reset Password
- Email input
- Success confirmation state
- Back to login navigation

### `/onboarding` - Setup Wizard
**Step 1: Select Tools**
- Checkbox cards for each tool
- Visual selection feedback
- At least one tool required

**Step 2: Profile Confirmation**
- Company name
- Region selection
- Timezone selection

**Step 3: Review**
- Summary of selected tools
- Profile information review
- Finish setup button

### `/dashboard` - Partner Dashboard
- Welcome message with user name
- **Your Access** section:
  - Tool cards with status badges (Active/Pending/Disabled)
  - Action buttons for active tools
- **Credentials** panel:
  - Generated username (mock)
  - Temporary password (masked/revealable)
  - Copy buttons
  - Regenerate password with confirmation modal
- **Quick Stats** card:
  - Active tools count
  - Pending tools count
  - Total tools count

### `/tool/:toolId` - Tool Placeholder
- Integration coming soon message
- Link to external tool website
- Back to dashboard navigation

## 🎭 Mock Authentication

All authentication is simulated:

- **Login**: Accepts any email/password combination
- **Register**: Creates a mock user with provided information
- **State**: Stored in localStorage for persistence
- **Default User**: Starts unauthenticated (can be changed in `AuthContext.tsx`)

### AuthContext Features

- `login(email, password)` - Mock login
- `register(data)` - Mock registration
- `logout()` - Clear auth state
- `completeOnboarding(data)` - Save onboarding preferences
- `updateUser(updates)` - Update user information

## 🎨 Design System

### Colors
- **Primary**: Deep navy for authority
- **Accent**: Soft blue for CTAs and highlights
- **Success**: Green for positive states
- **Warning**: Orange for pending states
- **Muted**: Subtle grays for secondary content

### Typography
- **Headings**: Bold, tight tracking
- **Body**: Regular weight, comfortable line height
- **Labels**: Medium weight, uppercase for form labels

### Components
- Premium card designs with subtle shadows
- Smooth hover transitions
- Focus states with ring indicators
- Loading skeletons for async states
- Toast notifications for feedback

## 🔧 Technologies

- **Vite** - Build tool and dev server
- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **Lucide React** - Icon library
- **React Query** - Data fetching (for future API integration)

## 📝 Key Features

### Visual Excellence
- ✅ Premium SaaS aesthetic
- ✅ Smooth animations and transitions
- ✅ Micro-interactions
- ✅ Loading states with skeletons
- ✅ Responsive design

### User Experience
- ✅ Clear visual hierarchy
- ✅ Intuitive navigation flow
- ✅ Form validation with visual feedback
- ✅ Success/error states
- ✅ Accessible components

### Mock Functionality
- ✅ Simulated authentication
- ✅ LocalStorage persistence
- ✅ Onboarding state management
- ✅ Tool selection and preferences
- ✅ Credentials generation (mock)

## 🎯 Client Demo Flow

1. **Landing** (`/`) - Show value proposition and tools
2. **Register** (`/register`) - Demonstrate signup flow
3. **Onboarding** (`/onboarding`) - Multi-step setup wizard
4. **Dashboard** (`/dashboard`) - Partner portal with tools and credentials
5. **Tool Access** (`/tool/:toolId`) - Integration placeholder

## 🚧 Future Enhancements

When connecting to a real backend:
- Replace mock auth with API calls
- Add real credential generation
- Implement actual tool integrations
- Add analytics tracking
- Connect to real user database

## 📄 License

This is a prototype/demo project for client presentation.

---

**Note**: This is a visual prototype. All authentication, data, and integrations are simulated for demonstration purposes only.