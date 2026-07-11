import { Request, Response, NextFunction } from "express";
import { RegisterUser } from "@usecases/auth/RegisterUser";

export class AuthController {
  constructor(private registerUserUseCase: RegisterUser) {}

  // POST /auth/register
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password } = req.body;
      const user = await this.registerUserUseCase.execute({ name, email, password });

      // Strip sensitive password hash before sending response to client
      const responseUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      };

      res.status(201).json({
        success: true,
        data: {
          user: responseUser
        },
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  };
}
