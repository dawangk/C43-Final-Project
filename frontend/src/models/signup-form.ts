import { z, ZodType } from "zod";

export type SignupForm = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export const SignupFormSchema: ZodType<SignupForm> = z
  .object({
    username: z
      .string()
      .min(1, "Please enter a Username")
      .max(50, "Username must be 50 characters or less"),
    email: z.string().min(1, "Please enter an email").email("Invalid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character",
      ),
    confirmPassword: z.string(),
  })
  .refine(
    (data) => {
      return data.password === data.confirmPassword;
    },
    {
      message: "Passwords do not match",
      path: ["password"],
    },
  );
