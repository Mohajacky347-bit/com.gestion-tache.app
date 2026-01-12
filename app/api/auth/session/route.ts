import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, parseSessionToken } from "@/lib/session";
import { authService } from "@/services/auth.service";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = parseSessionToken(token);

    if (!session) {
      const response = NextResponse.json({ user: null }, { status: 401 });
      response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: "",
        maxAge: 0,
        path: "/",
      });
      return response;
    }

    const user = await authService.getUserFromSession(session);
    if (!user) {
      const response = NextResponse.json({ user: null }, { status: 401 });
      response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: "",
        maxAge: 0,
        path: "/",
      });
      return response;
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json(
      { error: "Impossible de récupérer la session" },
      { status: 500 }
    );
  }
}



