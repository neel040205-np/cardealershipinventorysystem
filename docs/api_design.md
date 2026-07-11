# REST API Design Specification
## Car Dealership Inventory System

---

## 1. Global REST API Conventions

This API is designed following industry-standard REST practices.

### Versioning & Base Path
*   **Version Scheme**: URI versioning.
*   **Base URL**: `http://localhost:5000/api/v1`

### Global Request Headers
All mutating request bodies must specify the content type:
*   `Content-Type: application/json`

For authenticated endpoints, clients must attach the Access Token:
*   `Authorization: Bearer <Access_Token>`

### Global JSend Response Envelopes
To enforce consistent output parsing, the server wraps all responses.

#### 1. Success Envelope (2xx HTTP Status)
```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "2026-07-11T09:43:00Z"
  }
}
```

#### 2. Fail/Client-Error Envelope (4xx HTTP Status)
Used when validation fails or request preconditions are not met.
```json
{
  "success": false,
  "error": {
    "statusCode": 400,
    "code": "VALIDATION_FAILED",
    "message": "The request payload did not pass validation checks.",
    "details": [
      {
        "field": "price",
        "message": "Price must be a positive number"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-07-11T09:43:00Z"
  }
}
```

#### 3. System-Error Envelope (5xx HTTP Status)
Used when a database crash or unhandled programmer error occurs. Sensitive stack traces are scrubbed in production.
```json
{
  "success": false,
  "error": {
    "statusCode": 500,
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred on the server."
  },
  "meta": {
    "timestamp": "2026-07-11T09:43:00Z"
  }
}
```

---

## 2. Authentication & Session Endpoints (`/auth`)

### 1. Register User Profile
*   **HTTP Method**: `POST`
*   **URL**: `/auth/register`
*   **Authentication Required**: Yes (Bearer Token)
*   **Authorization Level**: `ADMIN`, `MANAGER`
*   **Headers**:
    *   `Content-Type: application/json`
    *   `Authorization: Bearer <Access_Token>`
*   **Request Body Validation (Zod)**:
    *   `email`: String, must be a valid email format, required.
    *   `password`: String, minimum 8 characters, must contain 1 uppercase letter, 1 number, and 1 special character, required.
    *   `role`: String, must be one of `ADMIN`, `MANAGER`, `SALES_REP`, required.
*   **Success Response**: `201 Created`
*   **Error Responses**:
    *   `400 Bad Request` (Validation fails)
    *   `401 Unauthorized` (Missing or invalid access token)
    *   `403 Forbidden` (User is a `SALES_REP` attempting to register someone)
    *   `409 Conflict` (Email already registered in PostgreSQL database)
*   **Example Request**:
    ```bash
    curl -X POST http://localhost:5000/api/v1/auth/register \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer admin-jwt-token" \
      -d '{
        "email": "new.rep@dealership.com",
        "password": "SecurePassword123!",
        "role": "SALES_REP"
      }'
    ```
*   **Example Response**:
    ```json
    {
      "success": true,
      "data": {
        "user": {
          "id": "7ac2e196-857e-4b47-ba21-eb33d59ff37a",
          "email": "new.rep@dealership.com",
          "role": "SALES_REP",
          "createdAt": "2026-07-11T09:43:00Z"
        }
      },
      "meta": {
        "timestamp": "2026-07-11T09:43:00Z"
      }
    }
    ```

---

### 2. Login User Session
*   **HTTP Method**: `POST`
*   **URL**: `/auth/login`
*   **Authentication Required**: No
*   **Authorization Level**: Guest
*   **Headers**:
    *   `Content-Type: application/json`
*   **Request Body Validation (Zod)**:
    *   `email`: String, must be a valid email format, required.
    *   `password`: String, required.
*   **Success Response**: `200 OK`
    *   *Set-Cookie Response Header*: `refreshToken=<JWT>; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth; Max-Age=604800`
*   **Error Responses**:
    *   `400 Bad Request` (Missing fields or malformed payload)
    *   `401 Unauthorized` (Invalid email or password combination)
*   **Example Request**:
    ```bash
    curl -X POST http://localhost:5000/api/v1/auth/login \
      -H "Content-Type: application/json" \
      -d '{
        "email": "manager@dealership.com",
        "password": "Password123!"
      }'
    ```
*   **Example Response**:
    ```json
    {
      "success": true,
      "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
        "user": {
          "id": "e67503f0-32df-4279-b1d5-2fa7848e02d6",
          "email": "manager@dealership.com",
          "role": "MANAGER"
        }
      },
      "meta": {
        "timestamp": "2026-07-11T09:43:00Z"
      }
    }
    ```

---

### 3. Logout Session
*   **HTTP Method**: `POST`
*   **URL**: `/auth/logout`
*   **Authentication Required**: No (Authenticates via Refresh Token cookie)
*   **Authorization Level**: Authenticated User
*   **Headers**: None (Reads Cookie)
*   **Request Body**: Empty
*   **Success Response**: `200 OK`
    *   *Set-Cookie Response Header*: `refreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth; Max-Age=0` (expired)
*   **Example Request**:
    ```bash
    curl -X POST http://localhost:5000/api/v1/auth/logout \
      -H "Cookie: refreshToken=active-refresh-token-jwt"
    ```
*   **Example Response**:
    ```json
    {
      "success": true,
      "data": {
        "message": "Session logged out successfully."
      },
      "meta": {
        "timestamp": "2026-07-11T09:43:00Z"
      }
    }
    ```

---

### 4. Refresh Access Token
*   **HTTP Method**: `POST`
*   **URL**: `/auth/refresh`
*   **Authentication Required**: No (Authenticates via Refresh Token cookie)
*   **Authorization Level**: Guest
*   **Headers**: None (Reads Cookie)
*   **Request Body**: Empty
*   **Success Response**: `200 OK`
    *   *Set-Cookie Response Header*: Rotates and sets a new `refreshToken` cookie.
*   **Error Responses**:
    *   `401 Unauthorized` (Missing refresh token cookie)
    *   `403 Forbidden` (Token is expired, revoked, or has a signature mismatch)
*   **Example Request**:
    ```bash
    curl -X POST http://localhost:5000/api/v1/auth/refresh \
      -H "Cookie: refreshToken=active-refresh-token-jwt"
    ```
*   **Example Response**:
    ```json
    {
      "success": true,
      "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsIn..."
      },
      "meta": {
        "timestamp": "2026-07-11T09:43:00Z"
      }
    }
    ```

---

### 5. Get Current User Profile
*   **HTTP Method**: `GET`
*   **URL**: `/auth/me`
*   **Authentication Required**: Yes (Bearer Token)
*   **Authorization Level**: Authenticated User (`ADMIN`, `MANAGER`, `SALES_REP`)
*   **Headers**:
    *   `Authorization: Bearer <Access_Token>`
*   **Request Body**: Empty
*   **Success Response**: `200 OK`
*   **Error Responses**:
    *   `401 Unauthorized` (Missing or malformed token payload)
*   **Example Request**:
    ```bash
    curl -H "Authorization: Bearer valid-jwt-token" \
      http://localhost:5000/api/v1/auth/me
    ```
*   **Example Response**:
    ```json
    {
      "success": true,
      "data": {
        "user": {
          "id": "e67503f0-32df-4279-b1d5-2fa7848e02d6",
          "email": "manager@dealership.com",
          "role": "MANAGER",
          "createdAt": "2026-07-11T09:43:00Z"
        }
      },
      "meta": {
        "timestamp": "2026-07-11T09:43:00Z"
      }
    }
    ```

---

## 3. Car Inventory Endpoints (`/cars`)

### 1. List & Filter Cars
*   **HTTP Method**: `GET`
*   **URL**: `/cars`
*   **Authentication Required**: No (Public inventory lookup)
*   **Authorization Level**: Guest
*   **Headers**: None
*   **Query Parameters Validation (Zod)**:
    *   `make`: String, optional.
    *   `model`: String, optional.
    *   `minYear`: Integer, optional (>= 1886).
    *   `maxYear`: Integer, optional.
    *   `minPrice`: Decimal, optional (>= 0).
    *   `maxPrice`: Decimal, optional.
    *   `status`: One of `AVAILABLE`, `RESERVED`, `SOLD`, optional. Defaults to `AVAILABLE` for public listings.
    *   `transmission`: One of `AUTOMATIC`, `MANUAL`, optional.
    *   `fuelType`: One of `PETROL`, `DIESEL`, `ELECTRIC`, `HYBRID`, optional.
    *   `sortBy`: One of `price`, `year`, `createdAt`, optional. Defaults to `createdAt`.
    *   `sortOrder`: One of `asc`, `desc`, optional. Defaults to `desc`.
    *   `page`: Integer, minimum 1, optional. Defaults to `1`.
    *   `limit`: Integer, minimum 1, maximum 100, optional. Defaults to `10`.
*   **Success Response**: `200 OK` (Returns standard JSend Paginated Envelope)
*   **Example Request**:
    ```bash
    curl "http://localhost:5000/api/v1/cars?make=Toyota&status=AVAILABLE&minPrice=20000&page=1&limit=2"
    ```
*   **Example Response**:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "bfd254b7-df39-4458-9ff7-b64ce6ee7049",
          "make": "Toyota",
          "model": "RAV4",
          "year": 2024,
          "vin": "1FM5K8GC8KGB00001",
          "price": "34500.00",
          "status": "AVAILABLE",
          "mileage": 1500,
          "transmission": "AUTOMATIC",
          "fuelType": "HYBRID",
          "color": "Silver",
          "createdAt": "2026-07-11T09:43:00Z"
        }
      ],
      "meta": {
        "page": 1,
        "limit": 2,
        "totalCount": 1,
        "totalPages": 1,
        "timestamp": "2026-07-11T09:43:00Z"
      }
    }
    ```

---

### 2. Get Car Details
*   **HTTP Method**: `GET`
*   **URL**: `/cars/:id`
*   **Authentication Required**: No
*   **Authorization Level**: Guest
*   **Parameters**: `id` must be a valid UUID.
*   **Success Response**: `200 OK`
*   **Error Responses**:
    *   `400 Bad Request` (Malformed UUID)
    *   `404 Not Found` (Car record not found in PostgreSQL)
*   **Example Request**:
    ```bash
    curl http://localhost:5000/api/v1/cars/bfd254b7-df39-4458-9ff7-b64ce6ee7049
    ```
*   **Example Response**:
    ```json
    {
      "success": true,
      "data": {
        "car": {
          "id": "bfd254b7-df39-4458-9ff7-b64ce6ee7049",
          "make": "Toyota",
          "model": "RAV4",
          "year": 2024,
          "vin": "1FM5K8GC8KGB00001",
          "price": "34500.00",
          "status": "AVAILABLE",
          "mileage": 1500,
          "transmission": "AUTOMATIC",
          "fuelType": "HYBRID",
          "color": "Silver",
          "createdByUserId": "e67503f0-32df-4279-b1d5-2fa7848e02d6",
          "createdAt": "2026-07-11T09:43:00Z",
          "updatedAt": "2026-07-11T09:43:00Z"
        }
      },
      "meta": {
        "timestamp": "2026-07-11T09:43:00Z"
      }
    }
    ```

---

### 3. Add Car to Inventory
*   **HTTP Method**: `POST`
*   **URL**: `/cars`
*   **Authentication Required**: Yes (Bearer Token)
*   **Authorization Level**: `ADMIN`, `MANAGER`
*   **Headers**:
    *   `Content-Type: application/json`
    *   `Authorization: Bearer <Access_Token>`
*   **Request Body Validation (Zod)**:
    *   `make`: String, max length 100, required.
    *   `model`: String, max length 100, required.
    *   `year`: Integer, range 1886 to current year + 1, required.
    *   `vin`: String, exactly 17 characters, uppercase alphanumeric only, required.
    *   `price`: Positive decimal value (number/string), scale 2, required.
    *   `mileage`: Non-negative integer, required.
    *   `transmission`: One of `AUTOMATIC`, `MANUAL`, required.
    *   `fuelType`: One of `PETROL`, `DIESEL`, `ELECTRIC`, `HYBRID`, required.
    *   `color`: String, max length 50, required.
*   **Success Response**: `201 Created`
*   **Error Responses**:
    *   `400 Bad Request` (Validation errors, e.g. price <= 0, invalid VIN format)
    *   `401 Unauthorized` (Missing/expired access token)
    *   `403 Forbidden` (Sales rep role attempting to create inventory)
    *   `409 Conflict` (A car with this VIN already exists in the system)
*   **Example Request**:
    ```bash
    curl -X POST http://localhost:5000/api/v1/cars \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer manager-jwt-token" \
      -d '{
        "make": "Honda",
        "model": "Civic",
        "year": 2023,
        "vin": "1HGCR2F8XDA000002",
        "price": 26500.00,
        "mileage": 5000,
        "transmission": "AUTOMATIC",
        "fuelType": "PETROL",
        "color": "Black"
      }'
    ```
*   **Example Response**:
    ```json
    {
      "success": true,
      "data": {
        "car": {
          "id": "e229c159-b1d5-45d2-a7bc-c68e1c66708b",
          "make": "Honda",
          "model": "Civic",
          "year": 2023,
          "vin": "1HGCR2F8XDA000002",
          "price": "26500.00",
          "status": "AVAILABLE",
          "mileage": 5000,
          "transmission": "AUTOMATIC",
          "fuelType": "PETROL",
          "color": "Black",
          "createdByUserId": "e67503f0-32df-4279-b1d5-2fa7848e02d6",
          "createdAt": "2026-07-11T09:43:00Z",
          "updatedAt": "2026-07-11T09:43:00Z"
        }
      },
      "meta": {
        "timestamp": "2026-07-11T09:43:00Z"
      }
    }
    ```

---

### 4. Update Car Details
*   **HTTP Method**: `PUT`
*   **URL**: `/cars/:id`
*   **Authentication Required**: Yes (Bearer Token)
*   **Authorization Level**: `ADMIN`, `MANAGER`
*   **Parameters**: `id` must be a valid UUID.
*   **Headers**:
    *   `Content-Type: application/json`
    *   `Authorization: Bearer <Access_Token>`
*   **Request Body Validation (Zod)**: Same fields as `POST /cars` but all fields are optional (partial updates allowed via schema logic, mapping to PUT controller).
*   **Success Response**: `200 OK`
*   **Error Responses**:
    *   `400 Bad Request` (Validation errors, e.g. price <= 0)
    *   `401 Unauthorized` (Missing/expired access token)
    *   `403 Forbidden` (User lacks necessary role permissions)
    *   `404 Not Found` (Car record not found in PostgreSQL)
*   **Example Request**:
    ```bash
    curl -X PUT http://localhost:5000/api/v1/cars/e229c159-b1d5-45d2-a7bc-c68e1c66708b \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer manager-jwt-token" \
      -d '{
        "price": 25900.00,
        "mileage": 5200
      }'
    ```
*   **Example Response**:
    ```json
    {
      "success": true,
      "data": {
        "car": {
          "id": "e229c159-b1d5-45d2-a7bc-c68e1c66708b",
          "make": "Honda",
          "model": "Civic",
          "year": 2023,
          "vin": "1HGCR2F8XDA000002",
          "price": "25900.00",
          "status": "AVAILABLE",
          "mileage": 5200,
          "transmission": "AUTOMATIC",
          "fuelType": "PETROL",
          "color": "Black",
          "createdByUserId": "e67503f0-32df-4279-b1d5-2fa7848e02d6",
          "createdAt": "2026-07-11T09:43:00Z",
          "updatedAt": "2026-07-11T09:43:00Z"
        }
      },
      "meta": {
        "timestamp": "2026-07-11T09:43:00Z"
      }
    }
    ```

---

### 5. Delete Car from Inventory
*   **HTTP Method**: `DELETE`
*   **URL**: `/cars/:id`
*   **Authentication Required**: Yes (Bearer Token)
*   **Authorization Level**: `ADMIN`
*   **Parameters**: `id` must be a valid UUID.
*   **Headers**:
    *   `Authorization: Bearer <Access_Token>`
*   **Success Response**: `200 OK`
*   **Error Responses**:
    *   `401 Unauthorized` (Missing/expired access token)
    *   `403 Forbidden` (User lacks Admin privileges)
    *   `404 Not Found` (Car record not found in PostgreSQL)
    *   `409 Conflict` (Car is linked to reservations or sales transactions, deletion restricted)
*   **Example Request**:
    ```bash
    curl -X DELETE http://localhost:5000/api/v1/cars/e229c159-b1d5-45d2-a7bc-c68e1c66708b \
      -H "Authorization: Bearer admin-jwt-token"
    ```
*   **Example Response**:
    ```json
    {
      "success": true,
      "data": {
        "message": "Car record deleted successfully."
      },
      "meta": {
        "timestamp": "2026-07-11T09:43:00Z"
      }
    }
    ```

---

## 4. Reservation Endpoints (`/reservations`)

### 1. Create Reservation
*   **HTTP Method**: `POST`
*   **URL**: `/reservations`
*   **Authentication Required**: Yes (Bearer Token)
*   **Authorization Level**: `ADMIN`, `MANAGER`, `SALES_REP`
*   **Headers**:
    *   `Content-Type: application/json`
    *   `Authorization: Bearer <Access_Token>`
*   **Request Body Validation (Zod)**:
    *   `carId`: String, UUID format, required.
    *   `customerName`: String, max length 100, required.
    *   `customerEmail`: String, valid email format, required.
    *   `customerPhone`: String, valid phone format, required.
    *   `durationHours`: Integer, positive, max value 72 (default 48 hours), optional.
*   **Success Response**: `201 Created`
*   **Error Responses**:
    *   `400 Bad Request` (Validation errors, e.g. duration > 72 hours)
    *   `401 Unauthorized` (Missing/expired access token)
    *   `404 Not Found` (Car not found)
    *   `409 Conflict` (Car is not in `AVAILABLE` status)
*   **Example Request**:
    ```bash
    curl -X POST http://localhost:5000/api/v1/reservations \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer rep-jwt-token" \
      -d '{
        "carId": "bfd254b7-df39-4458-9ff7-b64ce6ee7049",
        "customerName": "John Doe",
        "customerEmail": "johndoe@email.com",
        "customerPhone": "+15551234567"
      }'
    ```
*   **Example Response**:
    ```json
    {
      "success": true,
      "data": {
        "reservation": {
          "id": "a90de589-7cfc-49f3-8f0a-4fb48d1c9bfa",
          "carId": "bfd254b7-df39-4458-9ff7-b64ce6ee7049",
          "customerName": "John Doe",
          "customerEmail": "johndoe@email.com",
          "customerPhone": "+15551234567",
          "reservedUntil": "2026-07-13T09:43:00Z",
          "status": "ACTIVE",
          "salesRepId": "7ac2e196-857e-4b47-ba21-eb33d59ff37a",
          "createdAt": "2026-07-11T09:43:00Z",
          "updatedAt": "2026-07-11T09:43:00Z"
        }
      },
      "meta": {
        "timestamp": "2026-07-11T09:43:00Z"
      }
    }
    ```

---

### 2. Cancel Reservation
*   **HTTP Method**: `PATCH`
*   **URL**: `/reservations/:id/cancel`
*   **Authentication Required**: Yes (Bearer Token)
*   **Authorization Level**: `ADMIN`, `MANAGER`, or the `SALES_REP` who created it (Enforced by Resource Policy interceptor).
*   **Parameters**: `id` must be a valid UUID.
*   **Headers**:
    *   `Authorization: Bearer <Access_Token>`
*   **Success Response**: `200 OK` (Reverts Car status to `AVAILABLE`)
*   **Error Responses**:
    *   `401 Unauthorized` (Missing/expired access token)
    *   `403 Forbidden` (A Sales Rep attempting to cancel a reservation belonging to another user)
    *   `404 Not Found` (Reservation not found)
    *   `409 Conflict` (Reservation is already cancelled, expired, or completed)
*   **Example Request**:
    ```bash
    curl -X PATCH http://localhost:5000/api/v1/reservations/a90de589-7cfc-49f3-8f0a-4fb48d1c9bfa/cancel \
      -H "Authorization: Bearer rep-jwt-token"
    ```
*   **Example Response**:
    ```json
    {
      "success": true,
      "data": {
        "reservation": {
          "id": "a90de589-7cfc-49f3-8f0a-4fb48d1c9bfa",
          "status": "CANCELLED",
          "updatedAt": "2026-07-11T09:45:00Z"
        }
      },
      "meta": {
        "timestamp": "2026-07-11T09:45:00Z"
      }
    }
    ```

---

### 3. List Reservations
*   **HTTP Method**: `GET`
*   **URL**: `/reservations`
*   **Authentication Required**: Yes (Bearer Token)
*   **Authorization Level**: `ADMIN`, `MANAGER`, `SALES_REP` (Sales Reps are restricted to their own reservations only by use case query logic).
*   **Headers**:
    *   `Authorization: Bearer <Access_Token>`
*   **Query Parameters Validation (Zod)**:
    *   `status`: One of `ACTIVE`, `COMPLETED`, `CANCELLED`, `EXPIRED`, optional.
    *   `carId`: UUID, optional.
    *   `page`: Integer, >= 1, optional.
    *   `limit`: Integer, 1 to 100, optional.
*   **Success Response**: `200 OK` (Paginated)
*   **Example Request**:
    ```bash
    curl -H "Authorization: Bearer rep-jwt-token" \
      "http://localhost:5000/api/v1/reservations?status=ACTIVE&page=1&limit=5"
    ```
*   **Example Response**:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "a90de589-7cfc-49f3-8f0a-4fb48d1c9bfa",
          "carId": "bfd254b7-df39-4458-9ff7-b64ce6ee7049",
          "customerName": "John Doe",
          "status": "ACTIVE",
          "reservedUntil": "2026-07-13T09:43:00Z"
        }
      ],
      "meta": {
        "page": 1,
        "limit": 5,
        "totalCount": 1,
        "totalPages": 1,
        "timestamp": "2026-07-11T09:43:00Z"
      }
    }
    ```

---

## 5. Sales & Transaction Endpoints (`/sales`)

### 1. Process Sale Transaction
*   **HTTP Method**: `POST`
*   **URL**: `/sales`
*   **Authentication Required**: Yes (Bearer Token)
*   **Authorization Level**: `ADMIN`, `MANAGER`, `SALES_REP`
*   **Headers**:
    *   `Content-Type: application/json`
    *   `Authorization: Bearer <Access_Token>`
*   **Request Body Validation (Zod)**:
    *   `carId`: String, UUID format, required.
    *   `buyerName`: String, max length 100, required.
    *   `buyerEmail`: String, valid email format, required.
    *   `buyerPhone`: String, valid phone format, required.
    *   `salePrice`: Positive decimal value, required.
*   **Success Response**: `201 Created`
    *   *Transaction Behavior*: Updates associated Car status to `SOLD`. Automatically marks any active Reservation for this car as `COMPLETED`. Writes a new record to the immutable `sales_transactions` ledger.
*   **Error Responses**:
    *   `400 Bad Request` (Validation errors, e.g. salePrice <= 0)
    *   `401 Unauthorized` (Missing/expired access token)
    *   `404 Not Found` (Car not found)
    *   `409 Conflict` (Car is already `SOLD`, or car is `RESERVED` by another customer's hold)
*   **Example Request**:
    ```bash
    curl -X POST http://localhost:5000/api/v1/sales \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer rep-jwt-token" \
      -d '{
        "carId": "bfd254b7-df39-4458-9ff7-b64ce6ee7049",
        "buyerName": "John Doe",
        "buyerEmail": "johndoe@email.com",
        "buyerPhone": "+15551234567",
        "salePrice": 34000.00
      }'
    ```
*   **Example Response**:
    ```json
    {
      "success": true,
      "data": {
        "transaction": {
          "id": "f8c5b0df-bc39-40c2-b52b-42fa17cb129a",
          "carId": "bfd254b7-df39-4458-9ff7-b64ce6ee7049",
          "buyerName": "John Doe",
          "buyerEmail": "johndoe@email.com",
          "buyerPhone": "+15551234567",
          "salePrice": "34000.00",
          "salesRepId": "7ac2e196-857e-4b47-ba21-eb33d59ff37a",
          "soldAt": "2026-07-11T09:48:00Z",
          "createdAt": "2026-07-11T09:48:00Z"
        }
      },
      "meta": {
        "timestamp": "2026-07-11T09:48:00Z"
      }
    }
    ```

---

### 2. List Sales Ledger
*   **HTTP Method**: `GET`
*   **URL**: `/sales`
*   **Authentication Required**: Yes (Bearer Token)
*   **Authorization Level**: `ADMIN`, `MANAGER`
*   **Headers**:
    *   `Authorization: Bearer <Access_Token>`
*   **Query Parameters Validation (Zod)**:
    *   `salesRepId`: UUID, optional.
    *   `startDate`: DateTime ISO-8601, optional.
    *   `endDate`: DateTime ISO-8601, optional.
    *   `page`: Integer, >= 1, optional.
    *   `limit`: Integer, 1 to 100, optional.
*   **Success Response**: `200 OK` (Paginated)
*   **Error Responses**:
    *   `401 Unauthorized` (Missing/expired access token)
    *   `403 Forbidden` (Sales Rep role attempting to access full database ledger)
*   **Example Request**:
    ```bash
    curl -H "Authorization: Bearer manager-jwt-token" \
      "http://localhost:5000/api/v1/sales?startDate=2026-07-01T00:00:00Z&limit=10"
    ```
*   **Example Response**:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "f8c5b0df-bc39-40c2-b52b-42fa17cb129a",
          "carId": "bfd254b7-df39-4458-9ff7-b64ce6ee7049",
          "buyerName": "John Doe",
          "salePrice": "34000.00",
          "salesRepId": "7ac2e196-857e-4b47-ba21-eb33d59ff37a",
          "soldAt": "2026-07-11T09:48:00Z"
        }
      ],
      "meta": {
        "page": 1,
        "limit": 10,
        "totalCount": 1,
        "totalPages": 1,
        "timestamp": "2026-07-11T09:48:00Z"
      }
    }
    ```
