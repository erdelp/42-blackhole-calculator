import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();

  // Clear the access token cookie
  cookieStore.delete("access_token");

    return NextResponse.redirect(new URL("/42-blackhole-calculator", process.env.NEXTAUTH_URL ||
  "https://erdelp.com/42-blackhole-calculator"));
}