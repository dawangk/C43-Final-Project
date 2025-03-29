import { ResponseType } from "../models/response";

export class UserService {
  async signUp(username: string, email: string, password: string): Promise<ResponseType> {
    // perform signup
    // return { data, error }
    return { }
  }

  async login(email: string, password: string): Promise<ResponseType> {
    // perform login
    // return { data, error }
    return {}
  }

  async logout(): Promise<ResponseType>{
    // perform logout
    // return { data, error }
    return { }
  }

  async me(): Promise<ResponseType> {
    // get current user
    // return { data, error }
    return { }
  }
}