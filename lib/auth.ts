import jwt from "jsonwebtoken";

export interface AuthUser {
  userId: string;
  username: string;
  email: string;
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret"
    ) as AuthUser;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function getUserFromRequest(request: Request): AuthUser | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7);
  return verifyToken(token);
}
