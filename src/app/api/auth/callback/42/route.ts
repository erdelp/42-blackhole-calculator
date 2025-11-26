import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/?error=auth_error", request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", request.url));
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://api.intra.42.fr/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.FORTYTWO_CLIENT_ID!,
        client_secret: process.env.FORTYTWO_CLIENT_SECRET!,
        code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/42`,
      }),
    });

    const tokenData = await tokenResponse.json();

    // If token exchange failed, it's often because the client secret is invalid/expired
    if (!tokenResponse.ok) {
      const errCode = tokenData?.error || tokenData?.error_description || tokenResponse.statusText;
      console.error("Token exchange failed:", errCode, tokenData);
      // Redirect to a visible error page on the canonical site instead of localhost
      const safeHost =
        process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes("localhost")
          ? process.env.NEXTAUTH_URL
          : "https://erdelp.com/42-blackhole-calculator";
      const redirectUrl = `${safeHost}?error=invalid_client`;
      return NextResponse.redirect(redirectUrl);
    }

    // Verify the access token works by fetching user info
    const userResponse = await fetch("https://api.intra.42.fr/v2/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      console.error("User verification failed after token exchange");
      const safeHost =
        process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes("localhost")
          ? process.env.NEXTAUTH_URL
          : "https://erdelp.com/42-blackhole-calculator";
      return NextResponse.redirect(`${safeHost}?error=invalid_token`);
    }

    // Set only the access token in a secure cookie
    const cookieStore = await cookies();
    // console.log("Access token length:", tokenData.access_token.length);
    cookieStore.set("access_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7200, // 2 hours
    });

    const safeHost =
      process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes("localhost")
        ? process.env.NEXTAUTH_URL
        : "https://erdelp.com/42-blackhole-calculator";

    return NextResponse.redirect(`${safeHost}`);
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }
}