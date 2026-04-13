import { request } from "./api";

// ===== USER =====
export const registerUser = (payload) =>
  request("/auth/user/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const loginUser = (payload) =>
  request("/auth/user/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const verifyOtp = (payload) =>
  request("/auth/user/verify-email", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const resendOtp = (payload) =>
  request("/auth/user/resend-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const forgotPassword = (payload) =>
  request("/auth/user/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const resetPassword = (payload) =>
  request("/auth/user/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });

// ===== OWNER =====
export const registerOwner = (payload) =>
  request("/auth/owner/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const loginOwner = (payload) =>
  request("/auth/owner/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const requestOwnerOtp = (payload) =>
  request("/auth/owner/request-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });

// ===== ADMIN =====
export const loginAdmin = (payload) =>
  request("/auth/admin/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });