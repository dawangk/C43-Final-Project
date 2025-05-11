import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { LoginFormSchema } from "@/models/login-form"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod"
import { Link, useNavigate } from "react-router-dom"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import PasswordInput from "./password-input"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { login } from "@/api/authApiSlice"
import useAuthStore from "@/stores/authStore"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const loginForm = useForm<z.infer<typeof LoginFormSchema>>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invalidCredentials, setInvalidCredentials] = useState(false);
  const navigate = useNavigate();
  const loginMutation = useMutation({
    mutationFn: login
  })
  const setCredentials = useAuthStore(state => state.setCredentials);

  const onSubmit = async (values: z.infer<typeof LoginFormSchema>) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setInvalidCredentials(false);
    try {
      const data = await loginMutation.mutateAsync({
        email: values.email,
        password: values.password
      });
      console.log("Login", data);

      // Set user details to localstorage
      setCredentials(data?.user);
      // Go to dashboard
      navigate("/dashboard/home");
      
    } catch (error: any) {
      if (
        error?.message === "Invalid email or password"
      ) {
        setInvalidCredentials(true);
      }
      console.error(error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-muted-foreground pt-4">
                  Login to your Stock account
                </p>
              </div>
              <Form {...loginForm}>
                <form
                  onSubmit={loginForm.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="text-left">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            id="EmailInput"
                            placeholder="someone@test.com"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <PasswordInput
                    form={loginForm}
                    name="password"
                    label="Password"
                    placeholder="Enter password"
                    className="w-full"
                  />

                  {invalidCredentials && (
                    <div>
                      <p className="text-sm font-medium text-destructive">
                        Login invalid. Please check your email or password.
                      </p>
                    </div>
                  )}

                  <div className="w-full flex flex-row justify-center">
                    <Button
                      id="LoginBtn"
                      className="w-full"
                      variant={isSubmitting ? "ghost" : "default"}
                      type="submit"
                    >
                      Login
                    </Button>
                  </div>
                </form>
              </Form>
              
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link to="/signup">
                  <p className="underline">Sign up!</p>
                </Link>
              </div>
            </div>
          </div>
          <div className="relative hidden bg-muted md:block">
            <img
              src="/img/cover.jpg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
