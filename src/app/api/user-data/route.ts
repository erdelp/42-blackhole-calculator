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
    let detectedMilestone = 0;
    
    if (cursus) {
      cursusBeginDate = cursus.begin_at;
      campusName = userData.campus?.[0]?.name;
      
      // Detect next milestone based on completed projects
      detectedMilestone = detectNextMilestone(userData.projects_users);
    }
    
    function detectNextMilestone(projects: any[]): number {
      const validatedProjects = projects
        .filter((p: any) => p['validated?'] === true)
        .map((p: any) => p.project.slug);
      
      // Debug: Log validated projects for troubleshooting
      console.log('Validated projects:', validatedProjects);
      
      // Define required projects for each milestone completion
      const milestoneRequirements = {
        0: ["42cursus-libft"], // Circle 0
        1: ["42cursus-ft_printf", "42cursus-get_next_line", "born2beroot"], // Circle 1
        2: ["so_long", "42cursus-push_swap", "exam-rank-02"], // Circle 2 (plus minitalk optional)
        3: ["42cursus-minishell", "42cursus-philosophers", "exam-rank-03"], // Circle 3
        4: ["cub3d", "netpractice", "cpp-module-00", "cpp-module-01", "cpp-module-02", "cpp-module-03", "cpp-module-04", "exam-rank-04"], // Circle 4
        5: ["inception", "cpp-module-05", "cpp-module-06", "cpp-module-07", "cpp-module-08", "cpp-module-09", "webserv", "exam-rank-05"], // Circle 5
        6: ["ft_transcendence", "exam-rank-06"] // Circle 6
      };
      
      // Check which milestone the user should be working on next
      for (let milestone = 0; milestone <= 6; milestone++) {
        const required = milestoneRequirements[milestone as keyof typeof milestoneRequirements];
        const hasAllRequired = required.every(project => validatedProjects.includes(project));
        
        console.log(`Milestone ${milestone}: required=${JSON.stringify(required)}, hasAll=${hasAllRequired}`);
        
        if (!hasAllRequired) {
          return milestone; // Return the milestone they should be working on
        }
      }
      
      return 6; // All projects completed, working on milestone 6
    }

    return NextResponse.json({
      cursusBeginDate,
      campusName,
      detectedMilestone,
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