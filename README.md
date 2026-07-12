# 🚗 WheelDeal

A production-grade, full-stack Car Dealership Inventory System engineered with **Clean Architecture** principles and verified through robust **Test-Driven Development (TDD)** practices.

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.19-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.16-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.0-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-1.6-7E9F35?logo=vitest&logoColor=white)](https://vitest.dev/)

---

# Live Demo

* **Web Application (Vercel)**: [https://cardealershipinventorysystem.vercel.app](https://cardealershipinventorysystem.vercel.app)
* **Backend API (Render)**: [https://cardealershipinventorysystem.onrender.com](https://cardealershipinventorysystem.onrender.com)

---

# Project Overview

**WheelDeal** is a comprehensive, enterprise-level digital solution for car dealerships. Managing automotive inventory, processing sales, and auditing stock levels can often result in operational bottlenecks, data inconsistencies, and out-of-stock purchase attempts. 

### The Problem It Solves
Traditional Model-View-Controller (MVC) or monolithic inventory trackers often mix database queries, route handlers, and business validation, leading to brittle codebases that are difficult to scale, test, or migrate. 

WheelDeal solves this by applying **Clean Architecture** to isolate core business rules from external frameworks. It enforces absolute domain invariants—such as blocking purchases on depleted stock and restricting administrative configurations—ensuring the dealership's records remain synchronized, robust, and safe.

### Target Users
* **System Administrators**: Manage database records, create/modify vehicle specifications, perform inventory restocks, and audit sales logs.
* **Sales Representatives**: Access the catalog, view live stock counts, and execute vehicle purchase transactions on behalf of customers.
* **Dealership Managers**: Oversee general inventory, check reservations, and audit metrics.

---

# Features

* **Role-Based Access Control (RBAC)**: Strict role gates (`ADMIN`, `MANAGER`, `SALES_REP`) applied at the routing middleware level and domain level.
* **Live Inventory Catalog**: Real-time listing of active vehicle stocks with instant visual status indicators (e.g., *Out of Stock*, *Available*).
* **Automated Transactions**: Processes purchases that atomically reduce stock levels by `1`, protecting against concurrency races.
* **Advanced Multi-Filter Search**: Instantly query catalog inventories by make, model, category, minimum price, and maximum price.
* **Stateless Authentication**: High-security token setup utilizing short-lived JSON Web Tokens (JWT) combined with secure, rotation-based refresh tokens.
* **Robust Input Validation**: Strict type checking and request validation implemented via Zod schemas at API boundaries.
* **Clean Modern UI**: Fully responsive Dashboard built with React, Tailwind CSS, Lucide Icons, and support for system-wide Dark/Light mode switching.

---

# Tech Stack

### Frontend
* **Core Library**: React 19 (TypeScript)
* **Build Tool**: Vite
* **Routing**: React Router DOM (v6)
* **Data Fetching / State Sync**: TanStack Query (React Query v5)
* **Form Handling**: React Hook Form
* **Schema Validation**: Zod
* **Styling**: Tailwind CSS & Pure CSS Variables

### Backend
* **Runtime Environment**: Node.js (TypeScript)
* **Web Framework**: Express.js
* **Process Watcher**: Tsx (TypeScript Execute)

### Database
* **Database**: PostgreSQL (Hosted via Supabase)
* **ORM**: Prisma Client v5

### Authentication
* **Token Standard**: JSON Web Tokens (JWT) via `jsonwebtoken`
* **Password Encryption**: Bcrypt (12 rounds)
* **Token Storage**: Secure HTTP-only cookies

### Testing
* **Runner & Framework**: Vitest
* **HTTP Assertions**: Supertest
* **Mocking Utility**: Vitest standard mocks (`vi.mock`)

### Deployment
* **Client Hosting**: Vercel
* **Server Hosting**: Render
* **Database Hosting**: Supabase

---

# Architecture

WheelDeal is designed around Uncle Bob's **Clean Architecture** principles. The application is divided into distinct, decoupled conceptual rings:

```
               ┌────────────────────────────────────────────────────────┐
               │              Frameworks & Drivers                      │
               │      [Express]  [Prisma ORM]  [PostgreSQL]  [React]    │
               │   ┌────────────────────────────────────────────────┐   │
               │   │              Interface Adapters                │   │
               │   │      [Prisma Repositories]  [Controllers]      │   │
               │   │   ┌────────────────────────────────────────┐   │   │
               │   │   │            Use Case Layer              │   │   │
               │   │   │      [Interactors]  [Port Interfaces]  │   │   │
               │   │   │   ┌────────────────────────────────┐   │   │   │
               │   │   │   │          Domain Layer          │   │   │   │
               │   │   │   │      [Entities]  [Invariants]  │   │   │   │
               │   │   │   └────────────────────────────────┘   │   │   │
               │   │   └────────────────────────────────────────┘   │   │
               │   └────────────────────────────────────────────────┘   │
               └────────────────────────────────────────────────────────┘
```

1. **Domain Layer (Core)**: Holds enterprise entities (`User`, `Vehicle`) and business rules. It is pure TypeScript and has no external dependencies.
2. **Use Case Layer**: Contains application-specific business logic (e.g., `RegisterUser`, `PurchaseVehicle`). It specifies abstract contracts (Ports) for database dependencies.
3. **Interface Adapters Layer**: Bridges the use cases with database tools. Repositories (like `PrismaUserRepository`) implement Use Case ports to query PostgreSQL, keeping use cases database-agnostic.
4. **Frameworks & Drivers Layer**: Concrete tools (Express, Prisma, React) interact only with the adapters. Express routers call controllers, which delegate execution to use cases.

---

# Folder Structure

```text
car-dealership-inventory-system/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma             # Prisma Database Models
│   │   └── seed.ts                   # DB Seed Data Script
│   ├── src/
│   │   ├── domain/                   # Layer 1: Pure Domain Entities & Invariants
│   │   │   ├── entities/
│   │   │   └── exceptions/
│   │   ├── use-cases/                # Layer 2: Business Logic Interactors & Interfaces
│   │   │   ├── auth/
│   │   │   ├── vehicle/
│   │   │   └── ports/                # Repository Port Contracts
│   │   ├── adapters/                 # Layer 3: Controllers & Repositories Mapping
│   │   │   ├── controllers/
│   │   │   ├── repositories/
│   │   │   ├── mappers/
│   │   │   └── services/
│   │   └── infrastructure/           # Layer 4: Express Server, Routing, Middlewares
│   │       ├── config/
│   │       ├── database/
│   │       └── express/
│   └── tests/                        # Vitest Suites
│       ├── unit/                     # Domain & Use Case Isolated Tests
│       └── integration/              # Supertest Route & Mock DB Integration Tests
│
├── frontend/
│   ├── src/
│   │   ├── core/                     # Central Axios API Configurations
│   │   ├── adapters/                 # State Providers & React Context
│   │   ├── presentation/             # App Layouts, Components, Routing, & Views
│   │   │   ├── components/
│   │   │   ├── layouts/
│   │   │   ├── pages/
│   │   │   └── router/
│   │   └── infrastructure/           # Environment Variable Mapping
│   └── public/                       # Static Assets & Icons
│
└── docs/                             # System Design & Architecture specs
```

---

# Screenshots

### Login Page
![Login Page](docs/screenshots/login.png)

### Dashboard / Vehicle Catalog
![Dashboard / Vehicle Catalog](docs/screenshots/dashboard.png)

### Search Catalog
![Search Catalog](docs/screenshots/search.png)

### Admin Panel
![Admin Panel](docs/screenshots/admin_panel.png)

### Add New Vehicle Modal
![Add New Vehicle](docs/screenshots/add_vehicle.png)

### Restock Vehicle Modal
![Restock Vehicle](docs/screenshots/restock.png)

### Mobile Responsive View
![Mobile Responsive View](docs/screenshots/mobile_view.png)

### Testing Suite
![Testing Suite](docs/screenshots/testing.png)

---

# Installation

Follow these instructions to clone, configure, and execute the WheelDeal application locally.

## Prerequisites
Before starting, ensure you have the following installed on your machine:
* **Node.js** (v20.x or higher)
* **npm** (v10.x or higher)
* **PostgreSQL** instance (hosted on Supabase, ElephantSQL, or running locally)
* **Git** installed on your terminal path

## Clone Repository
```bash
git clone https://github.com/neel040205-np/cardealershipinventorysystem.git
cd cardealershipinventorysystem
```

## Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Set up the environment variables:
   ```bash
   cp .env.example .env
   # Open .env and populate your PostgreSQL DATABASE_URL and JWT secrets
   ```
4. Generate the Prisma Client schema:
   ```bash
   npm run prisma:generate
   ```
5. Apply database migrations and seed default users/catalog:
   ```bash
   npm run prisma:migrate
   ```
6. Start the local Express server in development watch mode:
   ```bash
   npm run dev
   ```
   *The API will listen at `http://localhost:5001`.*

## Frontend Setup
1. Open a new terminal tab and navigate to the `frontend` directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *The interface will run locally at `http://localhost:3000`.*

---

# Environment Variables

### Backend Configurations (`backend/.env`)

| Variable Name | Description | Example Value |
| :--- | :--- | :--- |
| `NODE_ENV` | Mode of operation | `development` |
| `PORT` | Listening port for Express backend | `5001` |
| `DATABASE_URL` | PostgreSQL pooler URL | `postgresql://postgres:pass@localhost:5432/db?pgbouncer=true` |
| `JWT_ACCESS_SECRET` | Cryptographic signature key for short-lived Access tokens | `9bc16da1c71665f47537c7b3cb7a056ca...` |
| `JWT_REFRESH_SECRET`| Cryptographic signature key for long-lived Refresh tokens | `32949b41dc76f59beb4f74f19156393b...` |
| `CORS_ORIGIN` | Whitelisted origin allowed to make cross-origin requests | `http://localhost:3000` |
| `LOG_LEVEL` | Minimum log logging threshold for Winston | `debug` |

### Frontend Configurations (`frontend/.env`)

| Variable Name | Description | Example Value |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Endpoint path pointing to the backend API | `http://localhost:5001/api` |

---

# Running Tests

We implement automated Test-Driven Development loops via **Vitest** to isolate logic validation and route integrations.

### Unit Tests
Tests domain entities and use case business logic (isolated from Express and databases):
```bash
# Inside /backend
npm run test
```

### Integration Tests
Tests Express routing structures, authentication gate logic, error interceptors, and database queries using Supertest and Prisma API mocks:
```bash
# Inside /backend
npm run test
```
*Note: All API routes and controller responses are fully verified through mocked layers for execution speed.*

### Coverage Commands
Checks code coverage report across statements, conditions, functions, and lines:
```bash
# Inside /backend (Requires @vitest/coverage-v8 package)
npm run test:coverage
```

---

# Test Report

The following test suites were successfully run and certified passing:

| Metric | Details / Count | Status |
| :--- | :--- | :--- |
| **Total Test Files** | 8 | Passed |
| **Total Executed Tests**| 59 | Passed |
| **Passed Tests** | 59 | Passed |
| **Failed Tests** | 0 | None |
| **Overall Coverage** | 85%+ | Certified |

---

# API Documentation

All request payloads, queries, and headers are structured in standard **JSend-compliant envelopes**.

### Authentication Endpoints (Prefix: `/api/v1/auth`)

| Method | Endpoint | Description | Authentication Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/register` | Registers a new sales rep user account | No |
| `POST` | `/login` | Validates credentials, sets Secure HTTP-Only Refresh cookie, returns Access JWT | No |

### Vehicle Inventory Endpoints (Prefix: `/api/vehicles`)

| Method | Endpoint | Description | Authentication Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/` | Retrieves a paginated list of catalog vehicles | No |
| `GET` | `/search` | Filters vehicles by make, model, category, and pricing limits | No |
| `POST` | `/` | Creates a new vehicle record in catalog | Yes (`ADMIN` only) |
| `PUT` | `/:id` | Updates a specific vehicle attributes | Yes (`ADMIN` only) |
| `DELETE`| `/:id` | Deletes a vehicle permanently | Yes (`ADMIN` only) |
| `POST` | `/:id/purchase` | Decreases vehicle stock by 1; creates transaction | Yes (`Authenticated` only) |
| `POST` | `/:id/restock` | Restocks vehicle catalog quantities | Yes (`ADMIN` only) |

---

# Database

We use PostgreSQL as our database engine. Schema schemas, keys, constraints, and tables are managed and generated using **Prisma ORM**.

```
  ┌──────────────┐          ┌──────────────────┐          ┌─────────────────────┐
  │    users     │          │  refresh_tokens  │          │ sales_transactions  │
  ├──────────────┤          ├──────────────────┤          ├─────────────────────┤
  │ id (PK)      │◄─────────│ user_id (FK)     │    ┌────    sales_rep_id (FK)   │
  │ email (UK)   │          │ token_hash (UK)  │    │     │ vehicle_id (FK)     │
  │ role         │          └──────────────────┘    │     └──────────┬──────────┘
  └──────┬───────┘                                  │                │
         │                                          │                │
         │          ┌──────────────────┐            │                │
         ├─────────►│   reservations   │            │                │
         │          ├──────────────────┤            │                │
         │          │ sales_rep_id (FK)│            │                │
         │          │ vehicle_id (FK)  │◄───────────┼────────────────┘
         │          └────────┬─────────┘            │
         │                   │                      │
         ▼                   ▼                      ▼
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                                  vehicles                                   │
  └─────────────────────────────────────────────────────────────────────────────┘
```

### Table Definitions & Relationships
* **`users`**: Stores user identity, hashed passwords, and credentials (ADMIN, MANAGER, SALES_REP).
* **`refresh_tokens`**: Stores active cryptographically hashed refresh tokens linked to a user to implement secure token rotations and revoking logic.
* **`vehicles`**: Holds the catalog specifications (make, model, category, price, quantity) for the car dealership.
* **`reservations`**: Tracks vehicle reservations made by sales reps on behalf of customers. Relates `vehicles` to `users`.
* **`sales_transactions`**: Records completed car purchases, capturing sale price and tracking the buyer info and sales agent.

---

# Authentication

Security is configured to guard routes, encrypt passwords, and block cross-site vulnerabilities.

* **JWT (JSON Web Tokens)**: Short-lived Access Tokens (expired in 15 minutes) are sent in request authorization headers. 
* **Silent Refresh Token Rotation**: Long-lived Refresh Tokens (expired in 7 days) are stored inside Secure, HTTP-Only, `SameSite=Strict` cookies. The Axios client automatically catches `401 Unauthorized` responses, calls the token refresh endpoint to rotate both keys, and retries the failed requests seamlessly without user intervention.
* **Password Hashing**: Implemented via Bcrypt with a high work factor of 12 rounds to safeguard data from rainbow table/dictionary attacks.
* **Protected Routes**: Custom Express middlewares (`authMiddleware`, `adminMiddleware`) verify incoming authorization tokens and validate the user's role before forwarding request calls to route handlers. On the frontend, `ProtectedRoute.tsx` prevents unauthorized view changes.

---

# Deployment

* **Frontend Hosting**: Deployed on **Vercel** configured with client-side routing rewrites for React SPA support.
* **Backend Hosting**: Deployed on **Render** utilizing automated Dockerized or native Node runtime environments.
* **Database Hosting**: Deployed on **Supabase** providing hosted Postgres environments.
* **Live Link**: [https://cardealershipinventorysystem.vercel.app](https://cardealershipinventorysystem.vercel.app)

---

# My AI Usage (MANDATORY)

## AI Tools Used
* **ChatGPT**: Used for general concept exploration and writing documentation outlines.
* **Antigravity**: An agentic coding assistant used as a pair programmer directly in the terminal workspace to build features, write tests, search logs, and troubleshoot code.

## How I Used AI
* **Brainstorming Architecture**: Utilized AI to structure the boundary folders (Domain, Use Cases, Adapters) to ensure they comply with Clean Architecture rules.
* **Generating Boilerplate**: Generated TypeScript interfaces for Use Cases, Prisma mappings, and React form schemas.
* **Writing Unit Tests**: Employed AI to draft mock structures (`vi.mock`) to test user registries and authentication controllers.
* **Refactoring Code**: Helped format the Axios response interceptors for silent token rotations.
* **Fixing Deployment Issues**: Used AI to troubleshoot Render path mapping issues by configuring `tsc-alias` and adapting `.gitignore` patterns.

## Reflection
AI served as a powerful productivity multiplier. Instead of spending hours writing redundant CRUD models or typing mock data structures, I was able to generate code blueprints instantly. 

However, critical software engineering still rested entirely on human judgment. AI often generated code that violated the strict inward-pointing dependency rules of Clean Architecture (for instance, trying to import Prisma clients or validation decorators into domain entities). I had to verify every generated component, catch these boundary violations, configure routing integrations manually, and design the error recovery pipeline. AI accelerated the speed of implementation, but validating correctness and ensuring logical structure required rigorous developer intervention.

---

# Challenges Faced

* **TypeScript Path Aliases in Production**: While development executed flawlessly using `tsconfig-paths`, compilation outputs compiled to JavaScript and lost path mappings (e.g., `@domain/*`). Resolved this by installing and configuring `tsc-alias` inside the production build script (`tsc && tsc-alias`).
* **Silent JWT Token Rotation Race Conditions**: If a page fired multiple API requests simultaneously with an expired access token, it triggered multiple concurrent refresh token requests, causing rotation key validations to fail (reuse detection). Resolved by wrapping the token refresh logic in a single pending promise queue to share the token refresh request across all pending calls.
* **Testing Isolation with Prisma**: Integrating route verification with database actions can corrupt test state. Overcame this by creating a mocked Prisma client registry, mapping Vitest mock routines (`vi.mock`) to isolate controllers.

---

# Future Improvements

* **Automated Customer Notifications**: Integrate Twilio or SendGrid APIs to dispatch SMS/Email receipts containing buyer transaction vouchers immediately on vehicle purchases.
* **Interactive Customer Booking Panels**: Add customer registration portals allowing buyers to view reservation deadlines, extend reservations, or pay deposits online.
* **Advanced Metrics Dashboard**: Provide interactive sales reports detailing top-performing sales representatives and category-based sales trends using charts.

---

# License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

# Author

* **Name**: Neel Patel
* **GitHub**: [@neel040205-np](https://github.com/neel040205-np)
* **LinkedIn**: [Neel Patel](https://www.linkedin.com/in/neel-patel-182643415/)
* **Email**: [neelpatelnp.0402@gmail.com](mailto:neelpatelnp.0402@gmail.com)
