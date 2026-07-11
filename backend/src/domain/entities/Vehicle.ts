import { DomainException } from "@domain/exceptions/AppError";

// Vehicle Domain Entity enforcing physical invariants
export class Vehicle {
  private constructor(
    public readonly make: string,
    public readonly model: string,
    public readonly category: string,
    public readonly price: number,
    public readonly quantity: number,
    public readonly id?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  public static create(
    make: string,
    model: string,
    category: string,
    price: number,
    quantity: number,
    id?: string
  ): Vehicle {
    if (!make || make.trim().length === 0) {
      throw new DomainException("Make is required.");
    }
    if (!model || model.trim().length === 0) {
      throw new DomainException("Model is required.");
    }
    if (!category || category.trim().length === 0) {
      throw new DomainException("Category is required.");
    }
    if (price <= 0) {
      throw new DomainException("Price must be greater than zero.");
    }
    if (quantity < 0) {
      throw new DomainException("Quantity must be non-negative.");
    }

    return new Vehicle(make.trim(), model.trim(), category.trim(), price, quantity, id);
  }
}
