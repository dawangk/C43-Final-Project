import { z, ZodType } from "zod";

export type LoginForm = {
  email: string;
  password: string;
};

export const LoginFormSchema: ZodType<LoginForm> = z.object({
  email: z.string().min(1, "Please enter an email").email("Invalid email"),
  password: z.string().min(1, "Please enter a password"),
});
