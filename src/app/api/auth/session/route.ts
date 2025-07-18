import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ user: null });
  }

  // Just return a minimal response to indicate user is authenticated
  // We'll fetch user data only when needed in the user-data endpoint
  return NextResponse.json({
    user: {
      authenticated: true,
    },
  });
}