import asyncHandler from "../middleware/asyncHandler";
import { Request, Response } from "express";
import { UserService } from "../services/userService";

const userService = new UserService();

export const signUp = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const { data, error } = await userService.signUp(username, email, password);

    if (error) {
      res.status(error.status).json({ message: error.message });
      return;
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { data, error }  = await userService.login(email, password);

    if (error) {
      res.status(error.status).json({ message: error.message });
      return;
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { data, error } = await userService.logout();

    if (error) {
      res.status(error.status).json({ message: error.message });
      return;
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { data, error }  = await userService.me();

    if (error) {
      res.status(error.status).json({ message: error.message });
      return;
    }

    res.status(200).json(data);
  } catch (error: any) {
    console.error("Session Error:", error);
    res.status(500).json({ error: error.message });
  }
});