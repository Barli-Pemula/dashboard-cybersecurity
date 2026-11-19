import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { stripHtml, isValidEmail } from "@/lib/sanitize";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const limiter = rateLimit(`register:${ip}`, {
      windowMs: 60 * 1000,
      maxRequests: 5,
    });

    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    const body = await request.json().catch(() => null);
    const { name, email, password } = body || {};

    // Validate inputs
    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password || (name !== undefined && (typeof name !== "string" || !name.trim() || name.length > 100))) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    if (email.length > 254 || !isValidEmail(email.trim())) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    if (password.length < 8 || password.length > 72) {
      return NextResponse.json(
        { error: "Password must be between 8 and 72 characters" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: name ? stripHtml(name).trim() : null,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: "analyst",
      },
    });

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: { id: user.id, email: user.email, name: user.name },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
