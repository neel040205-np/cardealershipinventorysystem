import { Request, Response, NextFunction } from "express";
import { RegisterUser } from "@usecases/auth/RegisterUser";
import { LoginUser } from "@usecases/auth/LoginUser";
import { UserMapper } from "../mappers/UserMapper";

export class AuthController {
  constructor(
    private registerUserUseCase: RegisterUser,
    private loginUserUseCase: LoginUser
  ) {}

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

  // POST /auth/login
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const { token, user } = await this.loginUserUseCase.execute({ email, password });

      res.status(200).json({
        success: true,
        data: {
          token,
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
