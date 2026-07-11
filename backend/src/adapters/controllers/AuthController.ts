import { Request, Response, NextFunction } from "express";
import { RegisterUser } from "@usecases/auth/RegisterUser";
import { UserMapper } from "../mappers/UserMapper";

export class AuthController {
  constructor(private registerUserUseCase: RegisterUser) {}

  // POST /auth/register
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password } = req.body;
      const user = await this.registerUserUseCase.execute({ name, email, password });

      res.status(201).json({
        success: true,
        data: {
          user: UserMapper.toResponse(user)
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
