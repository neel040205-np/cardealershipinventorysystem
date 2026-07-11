import { User } from "@prisma/client";

// UserMapper encapsulates mapping logic to transform database structures to public data objects
export class UserMapper {
  public static toResponse(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };
  }
}
