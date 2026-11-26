import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const urlLogin = new URL("/login", request.url);

  if (accessToken) {
    return NextResponse.next();
  }

  if (!refreshToken) {
    return NextResponse.redirect(urlLogin);
  }

  // Refresh seul : on tente de renouveler la session
  let res: Response;

  try {
    res = await fetch(`${process.env.API_URL}/auth/refresh`, {
      method: "POST",
      headers: { cookie: `refresh_token=${refreshToken}` },
    });
  } catch {
    return NextResponse.redirect(urlLogin);
  }

  if (!res.ok) {
    return NextResponse.redirect(urlLogin);
  }

  const setCookies = res.headers.getSetCookie();
  const accessCookie = setCookies.find((cookie) =>
    cookie.startsWith("access_token="),
  );

  if (!accessCookie) {
    return NextResponse.redirect(urlLogin);
  }

  const newAccessToken = accessCookie
    .split(";")[0]
    .slice("access_token=".length);

  const headers = new Headers(request.headers);
  const existing = headers.get("cookie");
  headers.set(
    "cookie",
    existing
      ? `${existing}; access_token=${newAccessToken}`
      : `access_token=${newAccessToken}`,
  );

  const response = NextResponse.next({ request: { headers } });

  // cookie pour le navigateur
  for (const cookie of setCookies) {
    response.headers.append("set-cookie", cookie);
  }

  return response;
}

export const config = {
  matcher: [
    "/budget",
    "/chat",
    "/corvees",
    "/courses/:path*",
    "/dashboard",
    "/parametres/:path*",
    "/rappels",
    "/recettes/:path*",
    "/foyer",
  ],
};
