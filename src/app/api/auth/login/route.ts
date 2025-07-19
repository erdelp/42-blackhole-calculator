import { NextResponse } from "next/server";

export async function GET() {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.FORTYTWO_CLIENT_ID!,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/42`,
    scope: "public",
  });

  const authUrl = `https://api.intra.42.fr/oauth/authorize?${params.toString()}`;

  return NextResponse.redirect(authUrl);
}