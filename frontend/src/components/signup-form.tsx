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
import { login, signup } from "@/api/authApiSlice"
import useAuthStore from "@/stores/authStore"
import { SignupFormSchema } from "@/models/signup-form"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const signupForm = useForm<z.infer<typeof SignupFormSchema>>({
    resolver: zodResolver(SignupFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUserExists, setShowUserExists] = useState(false);
  const [showSignupError, setShowSignupError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const signupMutation = useMutation({
    mutationFn: signup
  })

  const onSubmit = async (values: z.infer<typeof SignupFormSchema>) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setShowUserExists(false);
    setShowSignupError(false);
    setShowSuccess(false);
    try {
      signupMutation.mutate({
        username: values.username,
        email: values.email,
        password: values.password
      });
      const data = signupMutation.data;
      const error = signupMutation.error;
      console.log("Signup", data, error);
      
      if (error) {
        if ((error as any)?.message.endsWith("Username or email already in use.")) {
          setShowUserExists(true);
        } else {
          setShowSignupError(true);
        }
      } else {
        setShowSuccess(true);
      }
    } catch (err) {
      setShowSignupError(true);
      console.error(err);
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
                <h1 className="text-2xl font-bold">Sign up</h1>
                <p className="text-balance text-muted-foreground pt-4">
                  Signup for an account
                </p>
              </div>
              <Form {...signupForm}>
                <form
                  onSubmit={signupForm.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={signupForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem className="text-left">
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} id="UsernameInput" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
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
                    form={signupForm}
                    name="password"
                    label="Create Password"
                    placeholder="Enter password"
                    className="w-full"
                  />
                  <PasswordInput
                    form={signupForm}
                    name="confirmPassword"
                    label="Confirm Password"
                    placeholder="Confirm password"
                    className="w-full"
                  />
                  {showSuccess  && (
                    <p className="text-sm text-green-700">
                      Your account for {signupForm.getValues("email")} has been made successfully. Please login.
                    </p>
                  )}
                  {showUserExists && (
                    <p className="text-sm text-red-500">
                      Username or email already in use. 
                    </p>
                  )}
                  {showSignupError && (
                    <p className="text-sm text-red-500">
                      An unknown error occured. Please try again.
                    </p>
                  )}

                  <div className="w-full flex flex-row justify-center">
                    <Button
                      id="LoginBtn"
                      className="w-full"
                      variant={isSubmitting ? "ghost" : "default"}
                      type="submit"
                    >
                      Sign Up
                    </Button>
                  </div>
                </form>
              </Form>
              
              <div className="text-center text-sm">
                Have an account?{" "}
                <Link to="/login">
                  <p className="underline">Log in!</p>
                </Link>
              </div>
            </div>
          </div>
          <div className="relative hidden bg-muted md:block">
            <img
              src="/img/cover-2.jpg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
