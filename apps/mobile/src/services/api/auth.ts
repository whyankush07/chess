import { request, type ApiResponse } from "./client";
import type { StoredUser } from "../../utils/storage";

export interface SignInResponse {
  msg: string;
  user: StoredUser;
}

export interface SignUpResponse {
  msg: string;
}

export function apiSignUp(
  username: string,
  email: string,
  password: string
): Promise<ApiResponse<SignUpResponse>> {
  return request<SignUpResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
}

export function apiSignIn(
  email: string,
  password: string
): Promise<ApiResponse<SignInResponse>> {
  return request<SignInResponse>("/auth/signin", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
