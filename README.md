# FoundersKick

## 1. Project Overview
FoundersKick is a dedicated platform connecting startup founders, creators, and entrepreneurs. It serves as a centralized hub to build networks, showcase startups, access launchpad resources, share insights, and communicate efficiently. By unifying these features within a luxury, performance-focused interface, FoundersKick empowers founders to scale their ventures and find the right collaborators and mentors.

---

## 2. Tech Stack

### Frontend
- **React 18** — Core UI library
- **Vite** — Extremely fast build tool and development server
- **Tailwind CSS (v4)** — Utility-first styling framework for rapid UI development
- **Framer Motion & GSAP** — Fluid, robust animations and premium interactions
- **Lenis** — Smooth, luxurious scrolling experiences
- **React Router DOM** — Client-side routing

### Backend
- **Node.js & Express.js** — API server and routing
- **Morgan** — HTTP request logger middleware
- **Cors & Dotenv** — Security and environment configuration

### Database & Authentication
- **Supabase** — Postgres database, authentication provider, and storage solution

---

## 3. Project Structure

```text
founderskick/
├── .env                  # Frontend environment variables
├── package.json          # Frontend dependencies and scripts
├── vercel.json           # Vercel deployment rewrite rules
├── vite.config.js        # Vite build configuration
├── public/               # Static assets (images, icons)
├── src/                  # Frontend source code
│   ├── components/       # Reusable React components (UI elements, layouts)
│   ├── lib/              # Third-party wrapper scripts and utilities
│   ├── pages/            # Page components (Dashboard, Startups, Network, etc.)
│   ├── services/         # Frontend API/Supabase service calls
│   ├── utils/            # Frontend helper functions
│   ├── App.jsx           # Main routing entry point
│   └── main.jsx          # React DOM mounting
└── backend/              # Node.js backend root
    ├── .env.example      # Backend environment variables template
    ├── package.json      # Backend dependencies and scripts
    ├── server.js         # Express server entry point
    ├── config/           # Backend configurations
    ├── controllers/      # Route controllers (Auth, Posts, Network, etc.)
    ├── middleware/        # Express middlewares (Auth guards, error handlers)
    ├── routes/           # Express router definitions
    ├── services/         # Supabase data access layer
    └── utils/            # Backend helpers (response formatters, async handlers)
```

---

## 4. Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- npm (or yarn/pnpm)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd founderskick
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   cd ..
   ```

### Running the Application

1. **Start the frontend dev server** (from root):
   ```bash
   npm run dev
   ```
   Runs on `http://localhost:3000`

2. **Start the backend dev server** (in a new terminal):
   ```bash
   cd backend
   npm run dev
   ```
   Runs on the port defined in `backend/.env` (default: `5000`)

---

## 5. Environment Variables

### Frontend (`/.env`)
| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous/public API key |

### Backend (`/backend/.env`)
Copy `backend/.env.example` and fill in the values:

| Variable | Description |
|---|---|
| `PORT` | Port for the Express server (default: `5000`) |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anonymous/public API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key — bypasses Row Level Security. Handle with care. |
| `CLIENT_URL` | Frontend URL for CORS (e.g., `http://localhost:3000`) |

> **Never commit real secrets to version control.**

---

## 6. Features

- **Authentication** — Secure signup and login workflows
- **Landing Page** — Premium animated marketing site (GSAP + Lenis)
- **Dashboard** — Unified control center with metrics and activity overview
- **Network** — Connect with other founders and build professional relationships
- **Startups** — Directory for showcasing, tracking, and exploring ventures
- **Launchpad** — Tools and progress tracking for validating and launching products
- **Messages** — Direct communication between registered users
- **Insights** — Data-driven metrics and shared posts/articles
- **Resources** — Curated library of tools, documents, and links
- **Notifications** — Real-time system updates and engagement alerts
- **Profile & Settings** — User profile customization and account preferences

---

## 7. Deployment

### Frontend — Vercel
1. Connect your GitHub repository to [Vercel](https://vercel.com)
2. Set framework to **Vite**, build command to `npm run build`, output directory to `dist`
3. Add environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
4. Deploy — the included `vercel.json` handles SPA route rewrites automatically

### Backend — Render / Railway / Fly.io
1. Create a new Node.js web service pointing to the `backend/` directory
2. Set build command: `npm install` — start command: `npm start`
3. Add all backend environment variables
4. After deployment, update `CLIENT_URL` to your live Vercel frontend domain

---

## 8. Scripts

### Frontend (root)
| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build with extended memory (`--max-old-space-size=4096`) |
| `npm run preview` | Preview the production build locally |
| `npm run start` | Serve the built `dist` folder via `serve` on `$PORT` |

### Backend (`/backend`)
| Script | Description |
|---|---|
| `npm run dev` | Start server with `nodemon` (auto-restart on changes) |
| `npm run start` | Start server with `node server.js` for production |

---

## 9. Contributing

1. Fork the project
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

Please test changes on both frontend and backend locally before submitting.

---

## 10. License

Distributed under the MIT License. See `LICENSE` for more information.
