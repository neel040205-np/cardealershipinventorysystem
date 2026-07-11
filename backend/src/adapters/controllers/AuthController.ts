import { Request, Response, NextFunction } from "express";
import { RegisterUser } from "@usecases/auth/RegisterUser";
import { LoginUser } from "@usecases/auth/LoginUser";
import { UserMapper } from "../mappers/UserMapper";
import { sendSuccessResponse } from "@infra/express/utils/response";

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

      sendSuccessResponse(res, 201, {
        user: UserMapper.toResponse(user)
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

      sendSuccessResponse(res, 200, {
        token,
        user: UserMapper.toResponse(user)
      });
    } catch (error) {
      next(error);
    }
  };
}
