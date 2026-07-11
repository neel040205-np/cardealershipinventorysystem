import { Request, Response, NextFunction } from "express";
import { RegisterUser } from "@usecases/auth/RegisterUser";

export class AuthController {
  constructor(private registerUserUseCase: RegisterUser) {}

  // POST /auth/register
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, role } = req.body;
      const user = await this.registerUserUseCase.execute({ email, password, role });

      // Strip sensitive password hash before sending response to client
      const responseUser = {
        id: user.id,
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
