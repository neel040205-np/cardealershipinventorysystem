# Test-Driven Development (TDD) Execution Plan
## Car Dealership Inventory System

---

## 1. Global Testing Strategy & Architecture

This project strictly enforces **Test-Driven Development (TDD)**: writing failing tests (RED), implementing minimal code to pass (GREEN), and structural cleaning (REFACTOR) before moving to the next cycle.

```text
  [ RED STAGE ]       -->      [ GREEN STAGE ]      -->      [ REFACTOR STAGE ]
Write a failing test         Write minimal code           Improve code quality
(Compiles, but fails)         to make the test pass         (Ensure tests stay green)
```

### Testing Strategy
1.  **Domain Unit Tests**: Test Domain Entities and Value Objects in complete isolation. Zero dependencies, no network/database calls, and no mocks. High execution speed.
2.  **Use Case Unit Tests**: Test Use Cases by injecting **In-Memory Mock Repositories** (satisfying the port interfaces). Asserts use case output results and domain mutations without database calls.
3.  **Repository Integration Tests**: Test concrete database repositories (e.g., `PrismaCarRepository`) against an isolated PostgreSQL database instance (running in Docker). Verifies SQL mappings, database triggers, and check constraints.
4.  **Route Integration Tests (Supertest)**: Test routing, auth validation middlewares, and controllers in tandem. Runs complete request/response flows against the Express app instance.

---

### Testing Folder Structure

The test suite mirror-matches the application's source layouts to localize test assertions:

```text
backend/
├── src/
└── tests/
    ├── unit/
    │   ├── domain/
    │   │   ├── Car.spec.ts           # Car Entity Invariants Tests
    │   │   └── User.spec.ts          # User Entity Invariants Tests
    │   └── use-cases/
    │       ├── AddCar.spec.ts        # Car Creation Business Flow Tests
    │       ├── LoginUser.spec.ts     # Login Use Case Mocks Tests
    │       └── SellCar.spec.ts
    ├── integration/
    │   ├── repositories/
    │   │   ├── PrismaCarRepository.test.ts   # Database CRUD Tests
    │   │   └── PrismaUserRepository.test.ts
    │   └── api/
    │       ├── car.routes.test.ts    # Express Route & Auth Tests
    │       └── auth.routes.test.ts
    ├── mocks/
    │   ├── InMemoryCarRepository.ts          # Mock repository for Use Cases
    │   └── InMemoryUserRepository.ts
    └── setup.ts                      # Vitest Global Hooks & DB Cleanups
```

---

### Testing Naming Conventions & Coverage Goals

#### Naming Conventions
*   **Unit Tests**: Filename suffix `.spec.ts` (e.g., `Car.spec.ts`).
*   **Integration Tests**: Filename suffix `.test.ts` (e.g., `car.routes.test.ts`).
*   **Describe Blocks**: Structured as `describe('LayerName: TargetClass', () => { describe('methodName', () => { it('should expect behavior...') }) })`.

#### Coverage Goals
The CI/CD pipeline enforces the following coverage thresholds:
*   **Domain & Value Objects**: `100%` Statement and Branch coverage.
*   **Use Cases (Interactors)**: `>= 95%` Statement and Branch coverage.
*   **Controllers & Middlewares**: `>= 85%` Statement coverage.
*   **Repositories**: `>= 80%` Statement coverage.

---

## 2. Chronological TDD Execution Checklist

Features are implemented from the inner domain models outward.

---

### Feature 1: User Account Registration (Domain & Use Case)

#### 1. Business Rules
*   User email must be unique and properly formatted.
*   Password must be securely hashed before persistence.
*   Role must be validated (ADMIN, MANAGER, SALES_REP). Guests cannot register accounts.

#### 2. Test Specifications

*   **Unit Tests**:
    *   Verify `User` domain model constructor throws `DomainException` if email is malformed.
    *   Verify `User` model rejects password strings shorter than 8 characters.
    *   Verify `RegisterUser` use case hashes passwords using the injected `IHashService`.
*   **Integration Tests**:
    *   Verify duplicate emails trigger a database constraint violation error (409 Conflict).
*   **Edge Cases**:
    *   Input containing unicode characters or extra trailing spaces in email (must be sanitized).
*   **Negative Tests**:
    *   Registering an account with an unsupported role (e.g., `"SUPER_ADMIN"`).

#### 3. Expected Assertions
*   `expect(() => User.create(invalidEmailProps)).toThrow(DomainException);`
*   `expect(hashService.hash).toHaveBeenCalledWith(plainPassword);`
*   `expect(savedUser.passwordHash).not.toBe(plainPassword);`

#### 4. TDD Stages

##### RED Stage
Write `tests/unit/use-cases/RegisterUser.spec.ts` matching the interactors interface before the target class is defined.
```typescript
it('should hash password and persist user record', async () => {
  const mockRepo = new InMemoryUserRepository();
  const mockHash = new MockHashService();
  const useCase = new RegisterUser(mockRepo, mockHash);
  const result = await useCase.execute({ email: "test@email.com", password: "Password123!", role: "SALES_REP" });
  expect(result.passwordHash).toBe("hashed_Password123!");
});
```
*Run tests -> Fails (RegisterUser undefined / compile fails).*

##### GREEN Stage
Write the minimal `RegisterUser` use-case class to resolve compilation errors and make the test pass:
```typescript
export class RegisterUser {
  constructor(private userRepo: IUserRepository, private hashService: IHashService) {}
  async execute(dto: any) {
    const passwordHash = await this.hashService.hash(dto.password);
    return this.userRepo.create({ email: dto.email, passwordHash, role: dto.role });
  }
}
```
*Run tests -> Pass (GREEN).*

##### REFACTOR Stage
Introduce input validations using Zod. Extract the core model mapping logic into a static factory method: `User.create()`.
*Run tests -> Ensure they remain green.*

#### 5. Expected Git Commit
`feat(auth): tdd register user usecase and domain invariants`

---

### Feature 2: User Login & Session Management (Use Case & JWT Integration)

#### 1. Business Rules
*   User must present a registered email and matching password.
*   Upon login, verify the password hash using `bcrypt`.
*   Generate an access token (expires in 15m) and a refresh token (expires in 7d).
*   Save the refresh token hash in the database.

#### 2. Test Specifications

*   **Unit Tests**:
    *   Verify `LoginUser` use case returns a signed access token.
    *   Verify `LoginUser` throws `UnauthorizedError` if the password comparison fails.
*   **Integration Tests**:
    *   Verify `POST /auth/login` sets a secure cookie named `refreshToken` in response headers.
*   **Edge Cases**:
    *   Expired Access Token validation (must return 401).
*   **Negative Tests**:
    *   Attempting to log in with an email that does not exist in the database (must throw 401).

#### 3. Expected Assertions
*   `expect(result.accessToken).toBeDefined();`
*   `expect(result.user.email).toBe(loginEmail);`
*   `await expect(useCase.execute(wrongPasswordProps)).rejects.toThrow(UnauthorizedError);`

#### 4. TDD Stages

##### RED Stage
Write `tests/unit/use-cases/LoginUser.spec.ts` asserting that token values are returned:
```typescript
it('should verify password and return credentials', async () => {
  const mockRepo = new InMemoryUserRepository();
  await mockRepo.create({ email: "user@test.com", passwordHash: "hashed_Pass" });
  const useCase = new LoginUser(mockRepo, mockHashService, mockTokenService);
  const result = await useCase.execute({ email: "user@test.com", password: "Pass" });
  expect(result.accessToken).toBeDefined();
});
```
*Run tests -> Fails (LoginUser undefined).*

##### GREEN Stage
Implement a minimal use case logic to find user by email, compare passwords using mock encryption, and generate stub tokens.
*Run tests -> Pass (GREEN).*

##### REFACTOR Stage
Decouple token generation into an isolated `ITokenService` gateway. Validate that tokens contain user IDs and roles in their payload.
*Run tests -> Ensure they remain green.*

#### 5. Expected Git Commit
`feat(auth): tdd login and jwt session generation`

---

### Feature 3: Car Inventory Ledger (Domain Invariants & API)

#### 1. Business Rules
*   Every car must have a unique 17-character alphanumeric VIN.
*   Price must be a positive value. Mileage cannot be negative.
*   Model year cannot be older than 1886.

#### 2. Test Specifications

*   **Unit Tests**:
    *   Verify constructor throws `DomainException` if VIN length is not exactly 17 characters.
    *   Verify model throws if year is older than 1886.
*   **Integration Tests**:
    *   Verify `POST /cars` blocks access to guests and `SALES_REP` roles (returns 403 Forbidden).
    *   Verify `GET /cars` supports pagination query filters.
*   **Edge Cases**:
    *   Duplicate VIN collision validation in PostgreSQL.
*   **Negative Tests**:
    *   Attempting to set `price: -100` via route controller (must return 400 Bad Request).

#### 3. Expected Assertions
*   `expect(() => Car.create(negativePriceProps)).toThrow(DomainException);`
*   `expect(apiResponse.status).toBe(403);`
*   `expect(paginatedResponse.data.length).toBeLessThanOrEqual(limit);`

#### 4. TDD Stages

##### RED Stage
Write `tests/unit/domain/Car.spec.ts` to assert VIN and price validation rules:
```typescript
it('should throw DomainException if price is zero or negative', () => {
  const invalidProps = { vin: "1FM5K8GC8KGB00001", price: -10.00, year: 2024 };
  expect(() => Car.create(invalidProps)).toThrow(DomainException);
});
```
*Run tests -> Fails (Car entity not validated or undefined).*

##### GREEN Stage
Write a minimal `Car` domain entity class containing constraint validation checks in its creation factory:
```typescript
export class Car {
  static create(props: any) {
    if (props.price <= 0) throw new DomainException("Price must be positive");
    return new Car(props);
  }
}
```
*Run tests -> Pass (GREEN).*

##### REFACTOR Stage
Move validation checks into a private validator helper. Encapsulate properties by defining read-only getters for fields (`make`, `model`, `price`, `vin`).
*Run tests -> Ensure they remain green.*

#### 5. Expected Git Commit
`feat(inventory): tdd car domain model and invariants validation`

---

### Feature 4: Hold Reservations (State Machine Transitions)

#### 1. Business Rules
*   A car can be reserved only if its status is `AVAILABLE`.
*   A reservation status transitions from `ACTIVE` to `CANCELLED`, `EXPIRED`, or `COMPLETED`.
*   Reservations default to a 48-hour holds window.

#### 2. Test Specifications

*   **Unit Tests**:
    *   Verify reserving a car updates the `Car` status field to `RESERVED`.
    *   Verify reservations cannot exceed 72 hours.
*   **Integration Tests**:
    *   Verify database locks are set correctly to prevent race conditions during concurrent reservation attempts.
*   **Edge Cases**:
    *   Multiple requests attempting to reserve the same car at the same millisecond (only one must succeed, the other returns 409 Conflict).
*   **Negative Tests**:
    *   Attempting to reserve a car that is already `SOLD` or `RESERVED`.

#### 3. Expected Assertions
*   `expect(car.status).toBe(CarStatus.RESERVED);`
*   `await expect(useCase.execute(reservedCarProps)).rejects.toThrow(ConflictError);`

#### 4. TDD Stages

##### RED Stage
Write `tests/unit/use-cases/CreateReservation.spec.ts` asserting status changes:
```typescript
it('should update car status to RESERVED and create hold record', async () => {
  const car = await carRepo.create({ status: "AVAILABLE" });
  const useCase = new CreateReservation(resRepo, carRepo);
  await useCase.execute({ carId: car.id, customerName: "John" });
  const updatedCar = await carRepo.findById(car.id);
  expect(updatedCar.status).toBe("RESERVED");
});
```
*Run tests -> Fails (status changes logic missing or undefined).*

##### GREEN Stage
Implement a minimal interactors flow that fetches the vehicle, verifies it is available, flags it as reserved, and persists a hold record.
*Run tests -> Pass (GREEN).*

##### REFACTOR Stage
Implement database transactional checks (e.g., `$transaction` in Prisma) inside the repository layer to ensure the status change and hold creation succeed or fail together.
*Run tests -> Ensure they remain green.*

#### 5. Expected Git Commit
`feat(reservations): tdd create reservation and status machine`

---

### Feature 5: Sales Processing & Ledgers (Transactional Auditing)

#### 1. Business Rules
*   A car is flagged as `SOLD` once the transaction is completed.
*   The transaction record is immutable. Sale prices must be recorded as positive values.
*   Completing a sale automatically marks any active reservation on the vehicle as `COMPLETED`.

#### 2. Test Specifications

*   **Unit Tests**:
    *   Verify `ProcessSale` use case throws `ConflictError` if the car status is already `SOLD`.
*   **Integration Tests**:
    *   Verify `POST /sales` completes successfully and returns a transaction invoice receipt.
*   **Edge Cases**:
    *   Sale price differs from the inventory listing price (allowed, as negotiation is valid, but must be logged).
*   **Negative Tests**:
    *   Attempting to register a transaction for a non-existent vehicle ID.

#### 3. Expected Assertions
*   `expect(soldCar.status).toBe(CarStatus.SOLD);`
*   `expect(associatedReservation.status).toBe(ReservationStatus.COMPLETED);`
*   `await expect(useCase.execute(invalidCarIdProps)).rejects.toThrow(NotFoundError);`

#### 4. TDD Stages

##### RED Stage
Write tests asserting that active reservations are resolved automatically when a sale is completed:
```typescript
it('should resolve active reservation on vehicle when sold', async () => {
  const car = await carRepo.create({ status: "RESERVED" });
  const res = await resRepo.create({ carId: car.id, status: "ACTIVE" });
  const useCase = new ProcessSale(salesRepo, carRepo, resRepo);
  await useCase.execute({ carId: car.id, salePrice: 20000.00 });
  const updatedRes = await resRepo.findById(res.id);
  expect(updatedRes.status).toBe("COMPLETED");
});
```
*Run tests -> Fails (resolving reservation logic is missing).*

##### GREEN Stage
Write a minimal implementation block inside `ProcessSale` to query active reservations for the vehicle and update their status to `COMPLETED` alongside the sale.
*Run tests -> Pass (GREEN).*

##### REFACTOR Stage
Extract the status resolution check into a domain event handler or a domain service: `SaleDomainService.process()`. This keeps the use-case layer clean.
*Run tests -> Ensure they remain green.*

#### 5. Expected Git Commit
`feat(sales): tdd process sales transaction and resolve holds`
