# 🚗 Car Dealership Inventory System

A production-grade, full-stack application built using **Clean Architecture** principles. This system provides a comprehensive vehicle catalog and inventory manager with role-based access controls, JWT-based silent token rotation, and robust validation structures.

---

## 🏗️ Architectural Overview & Design Pattern

The codebase adheres strictly to Robert C. Martin's (**Clean Architecture**) principles, separating business rules from infrastructure concerns. Dependencies point inward only, meaning compile-time dependencies in core business logic have no knowledge of databases, web frameworks, or front-end libraries.

```
                  ┌──────────────────────────────────────────────┐
                  │          Frameworks & Drivers (Outer)        │
                  │        (Express, Prisma, PostgreSQL, React)  │
                  ├──────────────────────────────────────────────┤
                  │ ┌──────────────────────────────────────────┐ │
                  │ │        Interface Adapters (Controllers)  │ │
                  │ ├──────────────────────────────────────────┤ │
                  │ │ ┌──────────────────────────────────────┐ │ │
                  │ │ │       Application Use Cases          │ │ │
                  │ │ ├──────────────────────────────────────┤ │ │
                  │ │ │ ┌──────────────────────────────────┐ │ │ │
                  │ │ │ │   Domain Layer (Entities)        │ │ │ │
                  │ │ │ └──────────────────────────────────┘ │ │ │
                  │ │ └──────────────────────────────────────┘ │ │
                  │ └──────────────────────────────────────────┘ │
                  └──────────────────────────────────────────────┘
```

### Core Architecture Layers:
1. **Domain Layer (`backend/src/domain`)**: Core business entities (e.g., `Car`, `User`) and value objects (e.g., `Vin`, `Email`). It has zero outer dependencies (no Express, no Prisma).
2. **Use Cases Layer (`backend/src/use-cases`)**: Orchestrates the flow of data to and from the domain. Defines port interfaces (`ICarRepository`, `IUserRepository`) to invert dependencies.
3. **Interface Adapters (`backend/src/adapters`)**: Controllers mapping HTTP requests to Use Cases, and Repositories (`PrismaCarRepository`) implementing Use Case port interfaces.
4. **Infrastructure Layer (`backend/src/infrastructure`)**: Express routers, database configurations (Prisma client singleton), global middlewares, rate limiters, and the Winston logging pipeline.

---

## 🛠️ Technology Stack

### Backend Stack
- **Runtime**: Node.js & TypeScript
- **Web Framework**: Express.js
- **ORM / Database**: Prisma Client connected to PostgreSQL (Supabase Connection Pooler)
- **Security**: Helmet, CORS Whitelisting, Express Rate Limit
- **Validation**: Zod (Input schema & Environment verification)
- **Auth**: JWT (Access and Refresh token rotation) & Bcrypt password hashing
- **Logging**: Winston Structured JSON logger
- **Testing**: Vitest & Supertest

### Frontend Stack
- **Framework**: React 19 & TypeScript (Vite bundler)
- **Routing**: React Router DOM (v6) with Protected route wrappers
- **State Management / Async Query**: React Query (TanStack Query v5) for server-state synchronization
- **Styling**: Tailwind CSS & Pure CSS Theme variables
- **Form Management**: React Hook Form with Zod schema resolvers
- **Icons**: Lucide React

---

## 👤 Seed Credentials & User Roles

By default, the database is seeded with two roles to easily test access control restrictions.

| Role | Default Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **System Administrator (ADMIN)** | `admin@dealership.com` | `AdminPassword123!` | Full inventory operations, user/settings management, deleting entries |
| **Sales Representative (SALES_REP)** | `sarah@dealership.com` | `SalesPassword123!` | View catalog, process sales purchases, manage own entries |

### Role-Based Access Control (RBAC) Matrix

| Action | Guest / Unauthenticated | Sales Representative | Manager | Admin |
| :--- | :---: | :---: | :---: | :---: |
| **View Catalog** | No | Yes | Yes | Yes |
| **Search Inventory** | No | Yes | Yes | Yes |
| **Add Car to Stock** | No | No | Yes | Yes |
| **Modify Vehicle Info** | No | No | Yes | Yes |
| **Delete Vehicle** | No | No | No | Yes |
| **Purchase / Transact** | No | Yes | Yes | Yes |
| **Restock Stock Quantity**| No | No | Yes | Yes |

---

## ⚙️ Environment Configuration

### Backend Environment Variables (`backend/.env`)

Create a `.env` file in the `backend/` directory by copying `.env.example` and configuring the variables below:

```ini
# Execution Node Environment (development, test, production)
NODE_ENV=development

# Server Port
PORT=5001

# Database Connection URL (PostgreSQL Connection Pooler Link)
DATABASE_URL="postgresql://username:password@hostname:port/dbname?pgbouncer=true"

# Secret Keys (Min 32 Characters)
JWT_ACCESS_SECRET="0c0bbd0e6f1b9616da1c71665f47537c7b3cb7a056ca5d2000b432afba1c8703"
JWT_REFRESH_SECRET="32949b41dc76f59beb4f74f19156393b390ba19add4e901fe0617d82af911034"

# Allowed Cross-Origin Origins
CORS_ORIGIN="http://localhost:3000"

# Winston Logger Level (error, warn, info, debug)
LOG_LEVEL=debug
```

### Frontend Environment Variables (`frontend/.env`)

If you want to configure a custom backend endpoint, you can create a `.env` in the `frontend/` directory:

```ini
VITE_API_BASE_URL="http://localhost:5001/api"
```
*(If omitted, the frontend automatically falls back to `http://localhost:5001/api`).*

---

## 🚀 Setup & Local Execution Guide

### Prerequisites
- **Node.js**: v20 or higher
- **Database**: A PostgreSQL instance (local or hosted, e.g., Supabase)

---

### Step 1: Clone and Set Up Backend

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the environment file:
   ```bash
   cp .env.example .env
   # Open .env and insert your database credentials and secrets.
   ```
4. Generate the Prisma Client schema mapping:
   ```bash
   npm run prisma:generate
   ```
5. Apply database schema migrations and run the database seed script:
   ```bash
   npm run prisma:migrate
   ```
6. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server will start listening at `http://localhost:5001`.*

---

### Step 2: Set Up Frontend

1. Open a new terminal window and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *The client web app will be accessible at `http://localhost:3000` (or the URL output in your terminal).*

---

## 📂 Project Directory Structure

```text
car-dealership-inventory-system/
├── backend/
│   ├── prisma/                  # Prisma Database Schema and Seed Scripts
│   ├── src/
│   │   ├── domain/              # Entities & Domain Exceptions
│   │   ├── use-cases/           # Use Cases & Port Interfaces
│   │   ├── adapters/            # Controllers, Repositories, Services
│   │   └── infrastructure/      # Express app setup, routing, and configurations
│   └── tests/                   # Automated Vitest unit & integration tests
│
├── frontend/
│   ├── src/
│   │   ├── core/                # Core clean architecture configuration (API clients)
│   │   ├── adapters/            # Business State adapters (React Context / API services)
│   │   ├── presentation/        # Router, layouts, UI components, and pages
│   │   └── infrastructure/      # Configuration (Env configurations, setup)
│   └── public/                  # Public static assets
│
└── docs/                        # Architectural specifications and diagrams
```

---

## 🌐 API Reference Map

### Authentication Endpoints

#### `POST /api/v1/auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123!"
  }
  ```
- **Description**: Registers a new user with the default role `SALES_REP`.

#### `POST /api/v1/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "admin@dealership.com",
    "password": "AdminPassword123!"
  }
  ```
- **Description**: Authenticates user, returns an access token in the JSON body, and sets a secure `httpOnly` cookie for the refresh token.

---

### Vehicle Inventory Endpoints

#### `GET /api/vehicles`
- **Access**: Public
- **Query Params**: `page` (number), `limit` (number)
- **Description**: Lists paginated vehicle inventories.

#### `GET /api/vehicles/search`
- **Access**: Public
- **Query Params**: `make`, `model`, `category`, `minPrice`, `maxPrice`
- **Description**: Filters and searches vehicles inside the catalog matching parameters.

#### `POST /api/vehicles`
- **Access**: Restricted (`ADMIN` only)
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
  ```json
  {
    "make": "Toyota",
    "model": "RAV4",
    "category": "SUV",
    "price": 3500000.00,
    "quantity": 10
  }
  ```
- **Description**: Adds a new vehicle entry to the database inventory catalog.

#### `PUT /api/vehicles/:id`
- **Access**: Restricted (`ADMIN` only)
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**: Includes fields to modify (make, model, category, price, quantity).
- **Description**: Updates vehicle specification attributes.

#### `DELETE /api/vehicles/:id`
- **Access**: Restricted (`ADMIN` only)
- **Headers**: `Authorization: Bearer <access_token>`
- **Description**: Deletes a vehicle entry entirely from the stock catalog database.

#### `POST /api/vehicles/:id/purchase`
- **Access**: Authenticated Users
- **Headers**: `Authorization: Bearer <access_token>`
- **Description**: Processes a vehicle purchase, reducing the inventory stock count by `1`. Returns an error if stock is out of inventory (`quantity <= 0`).

#### `POST /api/vehicles/:id/restock`
- **Access**: Restricted (`ADMIN` only)
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
  ```json
  {
    "quantity": 5
  }
  ```
- **Description**: Restocks a specific vehicle inventory.

---

## 🗄️ Database Schema Representation

We use a standard relation schema configured inside PostgreSQL via Prisma ORM:

```mermaid
erDiagram
    users {
        uuid id PK
        varchar name
        varchar email UK
        varchar password_hash
        enum role
        timestamptz created_at
        timestamptz updated_at
    }

    refresh_tokens {
        uuid id PK
        varchar token_hash UK
        uuid user_id FK
        timestamptz expires_at
        boolean is_revoked
        timestamptz created_at
    }

    vehicles {
        uuid id PK
        varchar make
        varchar model
        varchar category
        decimal price
        int quantity
        timestamptz created_at
        timestamptz updated_at
    }

    reservations {
        uuid id PK
        uuid vehicle_id FK
        varchar customer_name
        varchar customer_email
        varchar customer_phone
        timestamptz reserved_until
        enum status
        uuid sales_rep_id FK
        timestamptz created_at
        timestamptz updated_at
    }

    sales_transactions {
        uuid id PK
        uuid vehicle_id FK
        varchar buyer_name
        varchar buyer_email
        varchar buyer_phone
        decimal sale_price
        uuid sales_rep_id FK
        timestamptz sold_at
    }

    users ||--o{ refresh_tokens : owns
    users ||--o{ reservations : manages
    users ||--o{ sales_transactions : performs
    vehicles ||--o{ reservations : has
    vehicles ||--|| sales_transactions : completes
```

---

## 🧪 Testing and Formatting Commands

Execute these scripts inside the `backend/` directory to run verification operations:

- **Run Tests (Vitest)**:
  ```bash
  npm run test
  ```
- **Continuous Watch Testing**:
  ```bash
  npm run test:watch
  ```
- **Run Tests Coverage**:
  ```bash
  npm run test:coverage
  ```
- **Lint Codebase**:
  ```bash
  npm run lint
  ```
- **Auto-Fix Linting Issues**:
  ```bash
  npm run lint:fix
  ```
- **Format Codebase (Prettier)**:
  ```bash
  npm run format
  ```
