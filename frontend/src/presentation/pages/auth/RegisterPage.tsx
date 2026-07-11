import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { authService } from "@infra/api/auth-service";
import { Input } from "@presentation/components/shared/Input";
import { Button } from "@presentation/components/shared/Button";

// Zod schema for registration form validation
const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be 128 characters or less")
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);
    try {
      await authService.register(data.name, data.email, data.password);
      setIsSuccess(true);
    } catch (err: any) {
      const backendMessage =
        err.response?.data?.error?.message || "Registration failed. Please try again.";
      setError(backendMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Create your account
        </h1>
      </div>

      {error && (
        <div
          className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400 font-medium"
          role="alert"
        >
          {error}
        </div>
      )}

      {isSuccess ? (
        <div className="space-y-4">
          <div
            className="rounded-lg bg-green-50 p-4 text-sm text-green-700 dark:bg-green-950/20 dark:text-green-400 font-medium"
            role="status"
          >
            Account created successfully! You can now sign in.
          </div>
          <Link to="/login">
            <Button className="w-full">Go to Sign In</Button>
          </Link>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              error={errors.name?.message}
              {...register("name")}
              autoComplete="name"
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="name@dealership.com"
              error={errors.email?.message}
              {...register("email")}
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register("password")}
              autoComplete="new-password"
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Create Account
            </Button>
          </form>

          <div className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-brand-500 hover:text-brand-600">
              Sign in here
            </Link>
          </div>
        </>
      )}
    </div>
  );
};
