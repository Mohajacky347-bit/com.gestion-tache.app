import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/services/auth.service";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
} from "@/lib/session";
import { AppUserRole } from "@/types/auth";

type LoginBody = {
  identifier?: string;
  password?: string;
  role?: AppUserRole;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LoginBody;
    const identifier = body.identifier?.trim();
    const role = body.role;

    if (!identifier || !role) {
      return NextResponse.json(
        { error: "Identifiant et rôle sont requis" },
        { status: 400 }
      );
    }

    const result = await authService.authenticate({ identifier, role });

    if (!result) {
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { status: 401 }
      );
    }

    const token = createSessionToken(result.session);
    const response = NextResponse.json({ user: result.user });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_TTL_SECONDS,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Impossible de connecter l'utilisateur" },
      { status: 500 }
    );
  }
}



