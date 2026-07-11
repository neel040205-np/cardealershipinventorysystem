# Database Architecture Design Specification
## Car Dealership Inventory System

---

## 1. Entity Relationship Diagram (ERD)

The following diagram defines the relational structure of the database. The tables are normalized and leverage PostgreSQL features like UUIDs and custom Enums.

```mermaid
erDiagram
    User {
        uuid id PK
        string email UK
        string password_hash
        Role role
        datetime created_at
        datetime updated_at
    }

    RefreshToken {
        uuid id PK
        string token_hash UK
        uuid user_id FK
        datetime expires_at
        boolean is_revoked
        datetime created_at
    }

    Car {
        uuid id PK
        string make
        string model
        int year
        string vin UK
        decimal price
        CarStatus status
        int mileage
        Transmission transmission
        FuelType fuel_type
        string color
        uuid created_by_id FK
        datetime created_at
        datetime updated_at
    }

    Reservation {
        uuid id PK
        uuid car_id FK
        string customer_name
        string customer_email
        string customer_phone
        datetime reserved_until
        ReservationStatus status
        uuid sales_rep_id FK
        datetime created_at
        datetime updated_at
    }

    SalesTransaction {
        uuid id PK
        uuid car_id FK UK "1:1 Relation"
        string buyer_name
        string buyer_email
        string buyer_phone
        decimal sale_price
        uuid sales_rep_id FK
        datetime sold_at
        datetime created_at
        datetime updated_at
    }

    %% Relationships
    User ||--o{ RefreshToken : "has"
    User ||--o{ Car : "creates"
    User ||--o{ Reservation : "manages"
    User ||--o{ SalesTransaction : "processes"
    Car ||--o{ Reservation : "undergoes"
    Car ||--|| SalesTransaction : "completes (1:1)"
```

---

## 2. Database Normalization Explanation

Our database is designed to comply strictly with **Third Normal Form (3NF)** rules to prevent data anomalies (insertion, update, and deletion anomalies) and maintain referential integrity.

### First Normal Form (1NF)
*   **Requirements**: Data must be stored in flat tables with atomic columns (no repeating groups, comma-separated lists, or composite fields), and each row must be uniquely identifiable.
*   **Application**: 
    *   All tables contain a primary key `id` defined as a unique `uuid`.
    *   Attributes like `vin`, `make`, `model`, `price` are scalar values. 
    *   Customer contacts are separated into atomic fields (`customer_name`, `customer_email`, `customer_phone`) rather than composite fields.

### Second Normal Form (2NF)
*   **Requirements**: Must satisfy 1NF, and all non-key attributes must be fully functionally dependent on the entire primary key (no partial dependencies).
*   **Application**: 
    *   Since every table in our schema uses a single, non-composite surrogate key (`id` of type UUID), there can be no partial dependency issues.
    *   Non-key attributes in `Car` (e.g., `make`, `price`) depend on the single `Car.id`. They do not depend on any subset of the primary key.

### Third Normal Form (3NF)
*   **Requirements**: Must satisfy 2NF, and all non-key attributes must be non-transitively dependent on the primary key (no transitive dependencies, i.e., "no non-key attribute depends on another non-key attribute").
*   **Application**:
    *   In the `Car` table, attributes such as `make`, `model`, and `price` depend directly on the car's `id`. If we had a `dealership_address` column in this table, it would violate 3NF since `dealership_address` depends on `dealership_name`, which depends on `id`. We keep tables logically isolated.
    *   In `SalesTransaction`, customer details (`buyer_name`, `buyer_email`) depend directly on the transaction's unique `id`. We do not reference customer addresses or details through secondary entities unless a separate `Customer` master table is introduced, which prevents transitive dependencies.

---

## 3. Database Tables & Field Analysis

### 1. `User` Table
Holds authentication credentials, security context, and RBAC roles.

| Field Name | Data Type | Key | Nullable | Default | Description & Business Rationale |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | UUID | PK | No | `uuid_generate_v4()` | Unique user identifier. Using UUIDs prevents enumeration attacks. |
| `email` | VARCHAR(255) | UK | No | None | User's system login email. Must be unique. |
| `password_hash` | VARCHAR(255) | - | No | None | Safe bcrypt hashed representation of user's password. |
| `role` | Role (Enum) | - | No | `SALES_REP` | Role-Based Access Control identifier (ADMIN, MANAGER, SALES_REP). |
| `created_at` | TIMESTAMPTZ | - | No | `NOW()` | Audit timestamp marking user registration. |
| `updated_at` | TIMESTAMPTZ | - | No | `NOW()` | Audit timestamp marking last configuration update. |

### 2. `RefreshToken` Table
Tracks active sessions, enabling secure sliding-sessions and token rotation.

| Field Name | Data Type | Key | Nullable | Default | Description & Business Rationale |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | UUID | PK | No | `uuid_generate_v4()` | Unique session row identifier. |
| `token_hash` | VARCHAR(255) | UK | No | None | Cryptographic SHA-256 hash of the Refresh Token. Storing hashes prevents session hijacking if the DB is compromised. |
| `user_id` | UUID | FK | No | None | Reference to `User.id`. Determines session ownership. |
| `expires_at` | TIMESTAMPTZ | - | No | None | Expiration boundary. Tokens are automatically rejected after this time. |
| `is_revoked` | BOOLEAN | - | No | `false` | Used to mark revoked tokens. Supports token reuse detection flows. |
| `created_at` | TIMESTAMPTZ | - | No | `NOW()` | Audit timestamp marking session initiation. |

### 3. `Car` Table
The primary inventory ledger.

| Field Name | Data Type | Key | Nullable | Default | Description & Business Rationale |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | UUID | PK | No | `uuid_generate_v4()` | Unique vehicle identifier. |
| `make` | VARCHAR(100) | - | No | None | Manufacturer (e.g., Toyota, Honda). |
| `model` | VARCHAR(100) | - | No | None | Specific model designation (e.g., RAV4, Civic). |
| `year` | INT | - | No | None | Model year. Used for vehicle valuation. |
| `vin` | VARCHAR(17) | UK | No | None | Vehicle Identification Number. Standardized 17-character unique key. |
| `price` | DECIMAL(12,2) | - | No | None | Selling price. `DECIMAL` prevents floating-point rounding errors. |
| `status` | CarStatus (Enum) | - | No | `AVAILABLE` | Inventory status (AVAILABLE, RESERVED, SOLD). |
| `mileage` | INT | - | No | None | Total distance traveled. |
| `transmission` | Transmission | - | No | None | Gear type (MANUAL, AUTOMATIC). |
| `fuel_type` | FuelType | - | No | None | Engine power source (PETROL, DIESEL, ELECTRIC, HYBRID). |
| `color` | VARCHAR(50) | - | No | None | Exterior color. |
| `created_by_id` | UUID | FK | No | None | Audit link pointing to the `User.id` who registered the car. |
| `created_at` | TIMESTAMPTZ | - | No | `NOW()` | Timestamp indicating when the car was added to inventory. |
| `updated_at` | TIMESTAMPTZ | - | No | `NOW()` | Timestamp indicating the last update to details or pricing. |

### 4. `Reservation` Table
Tracks vehicle holds.

| Field Name | Data Type | Key | Nullable | Default | Description & Business Rationale |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | UUID | PK | No | `uuid_generate_v4()` | Unique reservation record identifier. |
| `car_id` | UUID | FK | No | None | References `Car.id`. Links the reservation to a vehicle. |
| `customer_name` | VARCHAR(100) | - | No | None | Name of the prospective buyer. |
| `customer_email`| VARCHAR(255) | - | No | None | Email of the prospective buyer. |
| `customer_phone`| VARCHAR(50) | - | No | None | Phone number of the prospective buyer. |
| `reserved_until`| TIMESTAMPTZ | - | No | None | Expiration limit of the hold. Usually set to 48 hours. |
| `status` | ResStatus (Enum) | - | No | `ACTIVE` | Reservation lifecycle status (ACTIVE, COMPLETED, CANCELLED, EXPIRED). |
| `sales_rep_id` | UUID | FK | No | None | References `User.id`. Identifies the representative managing the hold. |
| `created_at` | TIMESTAMPTZ | - | No | `NOW()` | Timestamp indicating when the reservation was created. |
| `updated_at` | TIMESTAMPTZ | - | No | `NOW()` | Timestamp indicating when the reservation was last modified. |

### 5. `SalesTransaction` Table
The revenue ledger. Once committed, records are immutable to maintain financial consistency.

| Field Name | Data Type | Key | Nullable | Default | Description & Business Rationale |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | UUID | PK | No | `uuid_generate_v4()` | Unique transaction invoice identifier. |
| `car_id` | UUID | FK, UK | No | None | References `Car.id`. Must be unique to ensure a car is sold only once (1:1). |
| `buyer_name` | VARCHAR(100) | - | No | None | Full legal name of the purchaser. |
| `buyer_email` | VARCHAR(255) | - | No | None | Contact email of the purchaser. |
| `buyer_phone` | VARCHAR(50) | - | No | None | Contact phone of the purchaser. |
| `sale_price` | DECIMAL(12,2) | - | No | None | Agreed purchase price. |
| `sales_rep_id` | UUID | FK | No | None | References `User.id`. Identifies the representative who completed the sale. |
| `sold_at` | TIMESTAMPTZ | - | No | `NOW()` | Official date and time of sale closure. |
| `created_at` | TIMESTAMPTZ | - | No | `NOW()` | Internal timestamp indicating when the sale was logged. |
| `updated_at` | TIMESTAMPTZ | - | No | `NOW()` | Internal audit timestamp. |

---

## 4. Why Each Relationship Exists

1.  **`User` ||--o{ `RefreshToken`** (1:Many)
    *   *Why*: A single user can have multiple active sessions (e.g., logged in on a phone, a tablet, and a desktop browser). Storing these separately allows the user to revoke a specific session without logging out of all devices.
2.  **`User` ||--o{ `Car`** (1:Many)
    *   *Why*: Establishes an audit trail. We must track which employee (Manager or Admin) added a vehicle to the inventory for accountability.
3.  **`User` ||--o{ `Reservation`** (1:Many)
    *   *Why*: Assigns responsibility. Every reservation must be managed by a specific sales representative to coordinate client communication and follow-ups.
4.  **`User` ||--o{ `SalesTransaction`** (1:Many)
    *   *Why*: Tracks performance. Sales representatives must be linked to transactions to monitor commissions and calculate sales metrics.
5.  **`Car` ||--o{ `Reservation`** (1:Many)
    *   *Why*: Historical logging. While a vehicle can have only one **active** reservation at a time, it can be reserved, cancelled, and reserved again. A 1:Many relationship maintains a complete audit trail of all reservations associated with a vehicle.
6.  **`Car` ||--|| `SalesTransaction`** (1:1)
    *   *Why*: Physical reality. A physical vehicle is unique and can only be sold once. The 1:1 relationship (enforced by a `UNIQUE` constraint on `SalesTransaction.car_id`) prevents double-selling.

---

## 5. Constraints

### Primary and Unique Key Constraints
*   **Primary Keys**: All tables use a non-nullable `id` of type `UUID` as their primary key.
*   **Unique Constraints**:
    *   `User.email`: Prevents multiple accounts using the same email address.
    *   `RefreshToken.token_hash`: Prevents session collision or reuse of token identifiers.
    *   `Car.vin`: Enforces vehicle uniqueness. A physical vehicle has a unique 17-character VIN.
    *   `SalesTransaction.car_id`: Enforces the 1:1 relationship between vehicles and sales.

### Foreign Key Constraints (Referential Integrity)
*   **`RefreshToken.user_id` -> `User.id`**: `ON DELETE CASCADE`. If a user account is deleted, all active sessions and refresh tokens are removed immediately.
*   **`Car.created_by_id` -> `User.id`**: `ON DELETE RESTRICT`. Prevents deleting users who have registered active inventory, which preserves audit trails.
*   **`Reservation.car_id` -> `Car.id`**: `ON DELETE RESTRICT`. Prevents deleting a vehicle from the system if active or historical reservation records exist.
*   **`Reservation.sales_rep_id` -> `User.id`**: `ON DELETE RESTRICT`. Prevents deleting employee profiles associated with active reservations.
*   **`SalesTransaction.car_id` -> `Car.id`**: `ON DELETE RESTRICT`. Prevents removing vehicle records from completed transactions to preserve financial records.
*   **`SalesTransaction.sales_rep_id` -> `User.id`**: `ON DELETE RESTRICT`. Prevents deleting employee profiles associated with completed sales.

### PostgreSQL Check Constraints
Since Prisma does not support declaring SQL CHECK constraints in the `.prisma` schema file, these constraints are added via raw SQL migration files:
1.  **`car_price_positive`**: `CHECK (price > 0)` on table `Car`.
2.  **`car_mileage_positive`**: `CHECK (mileage >= 0)` on table `Car`.
3.  **`car_year_realistic`**: `CHECK (year >= 1886)` on table `Car` (enforces model years after the invention of the automobile).
4.  **`sale_price_positive`**: `CHECK (sale_price > 0)` on table `SalesTransaction`.
5.  **`vin_format_check`**: `CHECK (length(vin) = 17)` on table `Car` (standard VIN length validation).

---

## 6. Indexing Strategy

To maintain sub-millisecond query performance as the database grows, indexes are configured for key filtering and sorting patterns.

```text
Table: Car
 ├── Index: idx_car_status_make_model   --> Optimizes search queries: WHERE status = 'AVAILABLE' AND make = 'Toyota'
 ├── Index: idx_car_price               --> Optimizes sorting and pricing ranges: ORDER BY price ASC
 └── Index: idx_car_created_at          --> Optimizes default landing pages: ORDER BY created_at DESC

Table: RefreshToken
 └── Index: idx_token_hash (Unique)     --> Optimizes session verification on API refresh calls

Table: Reservation
 ├── Index: idx_res_car_status          --> Optimizes collision checks: WHERE car_id = X AND status = 'ACTIVE'
 └── Index: idx_res_reserved_until      --> Optimizes background jobs finding expired holds

Table: SalesTransaction
 └── Index: idx_sales_sold_at           --> Optimizes financial reports by date range
```

### Planned Indexes Summary
1.  **`idx_car_status_make_model`** (B-Tree Composite Index on `Car(status, make, model)`):
    *   *Rationale*: The most common query in the application is filtering available cars by manufacturer and model.
2.  **`idx_car_price`** (B-Tree Index on `Car(price)`):
    *   *Rationale*: Optimizes range queries (e.g., finding vehicles within a budget) and sorting by price.
3.  **`idx_car_created_at`** (B-Tree Index on `Car(created_at DESC)`):
    *   *Rationale*: The landing page shows the newest additions to the inventory, sorted by date.
4.  **`idx_res_car_status`** (B-Tree Composite Index on `Reservation(car_id, status)`):
    *   *Rationale*: Used when creating a new reservation to quickly check if the vehicle is currently reserved.
5.  **`idx_res_reserved_until`** (B-Tree Index on `Reservation(reserved_until)`):
    *   *Rationale*: Used by background cron tasks to identify and expire active holds.
6.  **`idx_sales_sold_at`** (B-Tree Index on `SalesTransaction(sold_at)`):
    *   *Rationale*: Optimizes dashboard metric calculations and monthly/yearly financial reporting.

---

## 7. Prisma Schema (`schema.prisma`)

Below is the complete database model declaration using Prisma ORM.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ==========================================
// Custom PostgreSQL Enums
// ==========================================

enum Role {
  ADMIN
  MANAGER
  SALES_REP
}

enum CarStatus {
  AVAILABLE
  RESERVED
  SOLD
}

enum Transmission {
  AUTOMATIC
  MANUAL
}

enum FuelType {
  PETROL
  DIESEL
  ELECTRIC
  HYBRID
}

enum ReservationStatus {
  ACTIVE
  COMPLETED
  CANCELLED
  EXPIRED
}

// ==========================================
// Database Models
// ==========================================

model User {
  id            String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email         String             @unique @db.VarChar(255)
  passwordHash  String             @map("password_hash") @db.VarChar(255)
  role          Role               @default(SALES_REP)
  createdAt     DateTime           @default(now()) @map("created_at") @db.Timestamptz
  updatedAt     DateTime           @updatedAt @map("updated_at") @db.Timestamptz
  
  // Relations
  refreshTokens     RefreshToken[]
  createdCars       Car[]
  managedReservations Reservation[]
  salesTransactions  SalesTransaction[]

  @@map("users")
}

model RefreshToken {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tokenHash String   @unique @map("token_hash") @db.VarChar(255)
  userId    String   @map("user_id") @db.Uuid
  expiresAt DateTime @map("expires_at") @db.Timestamptz
  isRevoked Boolean  @default(false) @map("is_revoked")
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([tokenHash], name: "idx_token_hash")
  @@map("refresh_tokens")
}

model Car {
  id           String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  make         String       @db.VarChar(100)
  model        String       @db.VarChar(100)
  year         Int
  vin          String       @unique @db.VarChar(17)
  price        Decimal      @db.Decimal(12, 2)
  status       CarStatus    @default(AVAILABLE)
  mileage      Int
  transmission Transmission
  fuelType     FuelType     @map("fuel_type")
  color        String       @db.VarChar(50)
  createdByUserId String    @map("created_by_id") @db.Uuid
  createdAt    DateTime     @default(now()) @map("created_at") @db.Timestamptz
  updatedAt    DateTime     @updatedAt @map("updated_at") @db.Timestamptz

  // Relations
  createdBy User               @relation(fields: [createdByUserId], references: [id], onDelete: Restrict)
  reservations Reservation[]
  salesTransaction SalesTransaction?

  @@index([status, make, model], name: "idx_car_status_make_model")
  @@index([price], name: "idx_car_price")
  @@index([createdAt(sort: Desc)], name: "idx_car_created_at")
  @@map("cars")
}

model Reservation {
  id            String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  carId         String            @map("car_id") @db.Uuid
  customerName  String            @map("customer_name") @db.VarChar(100)
  customerEmail String            @map("customer_email") @db.VarChar(255)
  customerPhone String            @map("customer_phone") @db.VarChar(50)
  reservedUntil DateTime          @map("reserved_until") @db.Timestamptz
  status        ReservationStatus @default(ACTIVE)
  salesRepId    String            @map("sales_rep_id") @db.Uuid
  createdAt     DateTime          @default(now()) @map("created_at") @db.Timestamptz
  updatedAt     DateTime          @updatedAt @map("updated_at") @db.Timestamptz

  // Relations
  car      Car  @relation(fields: [carId], references: [id], onDelete: Restrict)
  salesRep User @relation(fields: [salesRepId], references: [id], onDelete: Restrict)

  @@index([carId, status], name: "idx_res_car_status")
  @@index([reservedUntil], name: "idx_res_reserved_until")
  @@map("reservations")
}

model SalesTransaction {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  carId      String   @unique @map("car_id") @db.Uuid
  buyerName  String   @map("buyer_name") @db.VarChar(100)
  buyerEmail String   @map("buyer_email") @db.VarChar(255)
  buyerPhone String   @map("buyer_phone") @db.VarChar(50)
  salePrice  Decimal  @map("sale_price") @db.Decimal(12, 2)
  salesRepId String   @map("sales_rep_id") @db.Uuid
  soldAt     DateTime @default(now()) @map("sold_at") @db.Timestamptz
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt  DateTime @updatedAt @map("updated_at") @db.Timestamptz

  // Relations
  car      Car  @relation(fields: [carId], references: [id], onDelete: Restrict)
  salesRep User @relation(fields: [salesRepId], references: [id], onDelete: Restrict)

  @@index([soldAt], name: "idx_sales_sold_at")
  @@map("sales_transactions")
}
```

---

## 8. Suggested Migration Plan

To ensure standard database evolution, schema changes are executed in chronological phases using **Prisma Migrations** and custom SQL scripts.

### Phase 1: Enable Core Extensions & Schemas
Prisma requires PostgreSQL's UUID capability to generate default IDs.
```sql
-- Migration Step: Enable pgcrypto extension for random UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Phase 2: Table Declarations & Keys
The compiler runs the base schema migration generated by `npx prisma migrate dev --name init`. This generates:
*   Enums creation (`Role`, `CarStatus`, `Transmission`, `FuelType`, `ReservationStatus`).
*   Tables creation (`users`, `refresh_tokens`, `cars`, `reservations`, `sales_transactions`).
*   Primary Key and Foreign Key constraints mapping.
*   Default indexes creation.

### Phase 3: Check Constraints & Indexes
Because Prisma cannot define constraints like check rules directly, we write a **custom migration script** to apply check constraints:
```sql
-- Add custom domain value checks to maintain database integrity
ALTER TABLE "cars" 
  ADD CONSTRAINT "car_price_positive" CHECK (price > 0.00),
  ADD CONSTRAINT "car_mileage_positive" CHECK (mileage >= 0),
  ADD CONSTRAINT "car_year_realistic" CHECK (year >= 1886),
  ADD CONSTRAINT "vin_format_check" CHECK (length(vin) = 17);

ALTER TABLE "sales_transactions"
  ADD CONSTRAINT "sale_price_positive" CHECK (sale_price > 0.00);
```

### Phase 4: Database Seeding
To run system checks and support development, we seed the database with default roles:
*   Default Admin Profile: `admin@dealership.com` (Bcrypt encrypted password hash).
*   Default Manager Profile: `manager@dealership.com`.
*   A set of 10 mock vehicles (status: `AVAILABLE`) for API development.

---

## 9. Future Scalability Considerations

### Database Partitioning
As transaction volumes grow (e.g., millions of sales logs over several years), queries on the `sales_transactions` table can slow down.
*   *Solution*: Configure **Table Partitioning** by date range (e.g., yearly partitions of `sales_transactions` based on the `sold_at` field). This isolates active yearly records and speeds up database lookups.

### Database Read Replicas
Our application is **read-heavy** (customers searching inventory).
*   *Solution*: Configure Prisma to route read queries (e.g., `findMany` on `Car`) to a read-only database replica. Write transactions (`create`, `update`) are sent directly to the primary database.

### Supabase Row-Level Security (RLS)
If we migrate to direct client-side database calls (bypassing the Express backend) using the Supabase Client:
*   *Solution*: Enable RLS on all tables.
    *   Example: RLS Policy for `cars`: `CREATE POLICY "Allow public read" ON cars FOR SELECT USING (true);`
    *   Example: RLS Policy for `reservations`: `CREATE POLICY "Allow authenticated read" ON reservations FOR SELECT USING (auth.role() = 'authenticated');`
