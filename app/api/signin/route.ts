import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

const signinSchema = z.object({
  identifier: z.string().min(1, "identifier is required"),
  password: z.string().min(1, "Password is required"),
});

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { identifier, password } = body;
    const credential = identifier?.trim();
    const trimmedPassword = password?.trim();

    if (!credential || !trimmedPassword) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const validation = signinSchema.safeParse({
      identifier: credential,
      password: trimmedPassword,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    // Find user by email or username
    const user = await prisma.newUser.findFirst({
      where: {
        OR: [{ email: credential }, { username: credential }],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      trimmedPassword,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );

    // Return user without password and token
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: "Signin successful", user: userWithoutPassword, token },
      { status: 200 }
    );
  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
