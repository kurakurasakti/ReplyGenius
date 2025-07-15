Below is a detailed technical breakdown for building the MVP of **ReplyGenius**, your AI agent platform for automating e-commerce customer service chats on Tokopedia and Shopee. Since you're aiming for an MVP (Minimum Viable Product), we'll focus on core features: a modern landing page for user acquisition, user authentication, a simple dashboard for API integrations (e.g., connecting to Tokopedia/Shopee APIs), chat history upload/training, and basic AI response generation. This keeps it lean—validate with users before adding complexity like real-time chat handling or advanced AI.

I'll start with an overall architecture overview, then my tech stack recommendations with reasoning. After that, I'll provide detailed UI/UX specifications (including fonts and color scheme). Finally, I'll outline a step-by-step build plan, starting with the frontend as you requested. Each step includes:

- A **TODO description** for clarity.
- A **Prompt for Cursor AI** that you can copy-paste into Cursor to generate code or set up TODOs. These prompts follow your user rules: they emphasize Functional React JavaScript, simplicity, readability, and strategic solutions. They'll guide Cursor to create strategic, step-by-step code with console debugging if needed.

Assume we're building for quick deployment (e.g., on Vercel for frontend, Heroku/Render for backend). Total MVP build time estimate: 1-2 weeks for a senior frontend dev like you, focusing on frontend first.

### Overall Architecture Breakdown

- **Frontend:** User-facing app (landing page, auth, dashboard). Handles UI for user sign-up, API key input (for Tokopedia/Shopee), chat history upload, and viewing AI-generated responses.
- **Backend:** Handles API integrations (consume Tokopedia/Shopee APIs for chats), AI logic (e.g., train on chat history using a simple model like OpenAI's API for MVP), data storage, and secure endpoints for the frontend.
- **Data Flow:** User signs up → Connects e-commerce API → Uploads chat history → AI trains/generates responses → Dashboard shows previews/escalations.
- **MVP Scope:** No full real-time chat bot yet—focus on proof-of-concept: simulate responses based on uploaded history. Use OpenAI API for AI (cheap for MVP, ~$0.02 per 1K tokens).
- **Security/Compliance:** Basic auth, encrypt API keys, comply with Indonesian data laws (e.g., store minimal PII).

### Tech Stack Recommendations

- **Frontend Framework: Next.js (over Vite.js)**  
  Reasoning: Next.js is best for our needs—it's great for MVPs with built-in SSR/SSG for fast landing pages, API routes for easy backend proxying, and seamless deployment on Vercel. Vite is faster for pure dev builds but lacks Next's routing and optimization out-of-the-box, which we'd need for a production-ready app with SEO (important for your landing page validation plan). Next.js keeps things simple and scalable.

- **UI Engine: Shadcn/ui (over Material or Hero UI)**  
  Reasoning: Shadcn/ui is modern, highly customizable with Tailwind CSS, and component-based—perfect for a clean, black-and-white design. It's lightweight and accessible. Material UI is more opinionated (harder to customize for monochromatic schemes), and Hero UI (assuming you mean Heroicons or similar) is too basic for full UI needs. Shadcn pairs well with Next.js and Framer Motion.

- **Animations: Framer Motion**  
  As requested, for smooth, modern landing page effects (e.g., subtle fades, hover animations).

- **Backend: Node.js (over Python)**  
  Reasoning: Node.js (with Express.js) is optimal for consistency with your JS expertise—easier to share code/logic between frontend/backend, faster for API-heavy tasks like integrating Tokopedia/Shopee APIs. Python (e.g., FastAPI) is great for AI/ML but overkill for MVP; Node.js is cheaper to host and sufficient for calling external AI APIs like OpenAI. If we go heavy on custom ML later, we can add Python microservices.

- **Database: Supabase (PostgreSQL-based)**  
  Reasoning: Cheapest and optimal—free tier (up to 500MB storage, unlimited users) with built-in auth, real-time features, and easy Node.js integration. It's scalable, handles structured data (e.g., user accounts, chat histories), and is cheaper than MongoDB Atlas or Firebase for our use case (no heavy unstructured data yet). Alternatives like SQLite are too basic for multi-user MVP.

- **Other Tools:**
  - Tailwind CSS for styling (pairs with Shadcn).
  - OpenAI API for AI response generation (train on chat history via fine-tuning or prompt engineering).
  - Deployment: Vercel (free for frontend), Render (free tier for backend).
  - Auth: Supabase Auth (JWT-based, simple).

This stack is strategic: simple, readable, cost-effective (~$0-10/month for MVP), and focused on your frontend strengths.

### Detailed UI/UX Specifications

**Overall UX Principles:**

- Simple, intuitive flow: Landing page → Sign-up → Dashboard. Prioritize mobile-first (Indonesia's e-commerce is phone-heavy). Use clean navigation, minimal forms, and progress indicators for tasks like API setup. Focus on trust-building (e.g., show AI response previews). Keep interactions readable—large buttons, clear error messages.

**Color Scheme: Black and White (Monochromatic)**  
UI/UX Specification: "ReplayGenius"
Theme: Minimalist Black & White. This conveys sophistication, focus, and modernity.

Background: hsl(0 0% 9%) (A very dark grey, almost black - #171717)

Foreground (Text): hsl(0 0% 98%) (A very light grey, almost white - #FAFAFA)

Primary/Accent (Buttons, Links, Active States): hsl(0 0% 100%) (Pure White). We'll use borders and subtle background changes on hover to differentiate.

Borders/Subtle UI: hsl(0 0% 20%) (A slightly lighter grey for separation - #333333)

Font Combination:

Primary (Headings & UI): Inter. It's a clean, highly-legible, modern sans-serif. We'll use different weights (e.g., font-bold for titles, font-medium for buttons, font-normal for body).

Monospace (for API keys, etc.): Use a standard system monospace stack.

**Font Combination:**

- Primary Font: Inter (sans-serif, modern, readable—use for body text, weights 400/500/600).
- Secondary Font: Space Grotesk (bold, futuristic for headings—weights 700 for titles, to evoke AI innovation).
- Fallback: System sans-serif.
- Sizes: Headings 24-48px, Body 16px, Small text 14px. Line height 1.5 for readability.

**UI Components (via Shadcn):** Buttons (rounded, hover animations), Cards (for dashboard panels), Forms (simple inputs with labels), Modals (for confirmations), Tables (for chat history). Use Framer Motion for entrances (e.g., fade-in on page load) and interactions (e.g., button scale on hover).

### Step-by-Step Build Plan with Prompts

We'll break this into phases: Frontend first (your focus), then Backend, then Integration/Deployment. Each step is sequential; complete one before the next. Use Functional React JS as per your rules. Prompts are designed for Cursor AI—paste them in to generate code/TODOs. If something's unclear (e.g., variables), the prompts instruct Cursor to ask or debug with console.

#### Phase 1: Frontend Setup (Next.js + Shadcn + Framer Motion)

**Step 1: Project Initialization**  
TODO: Set up a new Next.js project with Tailwind, Shadcn, and Framer Motion.  
Prompt for Cursor AI: "Using Functional React JavaScript, create a new Next.js project for an MVP AI chat automation app called ReplyGenius. Install and configure Tailwind CSS, Shadcn/ui components, and Framer Motion for animations. Keep the setup simple and readable. Add a basic folder structure: /app for pages, /components for UI, /lib for utils. Console log the app startup for debugging. If any variable is unclear, ask me. Output step-by-step TODOs in the code for building a landing page next."

**Step 2: Build Landing Page**  
TODO: Create a modern, animated landing page with hero section, features, CTA (sign-up button). Use black/white scheme, specified fonts.  
Prompt for Cursor AI: "In the Next.js project, build a functional React landing page component in /app/page.tsx. Use Shadcn/ui for layout (e.g., Hero section with Card), Framer Motion for fade-in animations on load and button hovers. Apply, Inter font for body, Space Grotesk for headings. Features: Explain problem (repetitive chats), solution (AI agent), CTA to /signup. Keep it simple, readable, mobile-first. Add console logs for animation debugging. If UX flow is vague, ask me. Output TODOs for auth integration next."

**Step 3: User Authentication Pages**  
TODO: Add sign-up/login pages with forms, integrating Supabase Auth.  
Prompt for Cursor AI: "Add functional React pages for sign-up and login in Next.js /app/signup.tsx and /app/login.tsx. Use Shadcn/ui Form and Input components, Framer Motion for form field animations.  Integrate Supabase Auth for email/password (install supabase/js). Handle errors with console logs. Redirect to /dashboard on success. Simple and readable code. If auth variables unclear, debug with console or ask. Output TODOs for dashboard."

**Step 4: Dashboard UI**  
TODO: Build a protected dashboard for API key input, chat upload, and response previews.  
Prompt for Cursor AI: "Create a functional React dashboard page in /app/dashboard.tsx (protected route). Use Shadcn/ui Tabs, Table, and Button for sections: API Integration (form for Tokopedia/Shopee keys), Chat History Upload (file input), AI Previews (table of sample responses). Framer Motion for card animations. Black/white scheme, specified fonts. Fetch dummy data via console logs for now. Keep strategic and simple. If data variables unclear, ask or console debug. Output TODOs for backend connection."

#### Phase 2: Backend Setup (Node.js + Express + Supabase)

**Step 5: Backend Initialization**  
TODO: Set up Node.js backend with Express and Supabase.  
Prompt for Cursor AI: "Create a Node.js backend project with Express.js for ReplyGenius MVP. Install Supabase for database/auth, and OpenAI for AI. Set up routes: /auth, /integrations (for API keys), /train (upload chat history), /generate (AI responses). Use environment variables for keys. Keep simple, readable. Console log requests for debugging. Output step-by-step TODOs for API endpoints."

**Step 6: API Endpoints for Core Features**  
TODO: Implement endpoints for auth, integrations, training, and generation.  
Prompt for Cursor AI: "In the Node.js Express backend, add functional endpoints: POST /integrations to store encrypted API keys in Supabase, POST /train to upload/parse chat history and fine-tune OpenAI model (use prompt engineering for MVP), POST /generate to create AI responses based on history. Handle errors with console logs. Simple and strategic code. If DB schema unclear, ask me. Output TODOs for frontend integration."

#### Phase 3: Integration and Deployment

**Step 7: Connect Frontend to Backend**  
TODO: Add API calls from frontend to backend (e.g., via fetch in Next.js API routes).  
Prompt for Cursor AI: "In the Next.js frontend, add functional React hooks/utils to call backend APIs (e.g., fetch API keys, upload chats). Use Next.js API routes as proxy for security. Integrate with dashboard components. Console debug API responses. Simple, readable. If endpoints vague, ask. Output TODOs for testing."

**Step 8: Testing and Deployment**  
TODO: Add basic tests, deploy to Vercel/Render.  
Prompt for Cursor AI: "Add simple functional tests in Next.js (e.g., console-based for auth flow) and Node.js (e.g., for API responses). Deploy instructions: Vercel for frontend, Render for backend. Keep minimal for MVP. If deployment vars unclear, debug or ask. Output final TODOs for MVP polish."

This plan is strategic: Start with your frontend strengths, build iteratively, and validate early (e.g., deploy landing page Day 1 for feedback). Total cost: ~$0 (free tiers). If any step feels off or you hit issues (e.g., API integrations), let's clarify—e.g., do you have Tokopedia/Shopee API docs handy? Let's start with Step 1!
