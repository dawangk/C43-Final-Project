import express from "express";
import {
  signUp,
  login,
  logout,
  me
} from "../controllers/userController"

export const authRouter = express.Router();

authRouter.post("/signup", signUp);

authRouter.post("/login", login);

authRouter.post("/logout", logout);

/* Get currently logged in user */
authRouter.get("/me", me);