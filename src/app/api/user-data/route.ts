import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch user data from 42 API
    const response = await fetch("https://api.intra.42.fr/v2/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }

    const userData = await response.json();
    
    // Find the main cursus (usually the first active one)
    const cursus = userData.cursus_users?.find((c: any) => c.cursus.slug === "42cursus");
    
    let cursusBeginDate = null;
    let campusName = null;
    if (cursus) {
      cursusBeginDate = cursus.begin_at;
      campusName = cursus.campus?.name || userData.campus?.name;
    }

    return NextResponse.json({
      cursusBeginDate,
      campusName,
      user: {
        id: userData.id,
        login: userData.login,
        displayname: userData.displayname,
        email: userData.email,
      },
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}