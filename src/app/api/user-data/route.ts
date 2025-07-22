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

      // Helper function to check if user has any of the projects in a group
      const hasAnyProject = (projectOptions: string[]) => {
        return projectOptions.some(project => validatedProjects.includes(project));
      };

      // Check milestone requirements with flexible project choices
      const checkMilestoneRequirements = (milestone: number): boolean => {
        switch (milestone) {
          case 0:
            return validatedProjects.includes("42cursus-libft");

          case 1:
            return ["42cursus-ft_printf", "42cursus-get_next_line", "born2beroot"]
              .every(project => validatedProjects.includes(project));

          case 2:
            const hasGraphicsProject = hasAnyProject(["so_long", "42cursus-fdf", "42cursus-fract-ol"]);
            const hasNetworkProject = hasAnyProject(["minitalk", "pipex"]);
            const hasBaseProjects = ["42cursus-push_swap", "exam-rank-02"]
              .every(project => validatedProjects.includes(project));
            return hasGraphicsProject && hasNetworkProject && hasBaseProjects;

          case 3:
            return ["42cursus-minishell", "42cursus-philosophers", "exam-rank-03"]
              .every(project => validatedProjects.includes(project));

          case 4:
            const has3DProject = hasAnyProject(["cub3d", "minirt"]);
            const hasBaseCircle4 = ["netpractice", "cpp-module-00", "cpp-module-01", "cpp-module-02", "cpp-module-03", "cpp-module-04", "exam-rank-04"]
              .every(project => validatedProjects.includes(project));
            return has3DProject && hasBaseCircle4;

          case 5:
            const hasNetworkProjectCircle5 = hasAnyProject(["ft_irc", "webserv"]);
            const hasBaseCircle5 = ["inception", "cpp-module-05", "cpp-module-06", "cpp-module-07", "cpp-module-08", "cpp-module-09", "exam-rank-05"]
              .every(project => validatedProjects.includes(project));
            return hasNetworkProjectCircle5 && hasBaseCircle5;

          case 6:
            return ["ft_transcendence", "exam-rank-06"]
              .every(project => validatedProjects.includes(project));

          default:
            return false;
        }
      };

      // Check which milestone the user should be working on next
      for (let milestone = 0; milestone <= 6; milestone++) {
        const hasAllRequired = checkMilestoneRequirements(milestone);

        console.log(`Milestone ${milestone}: hasAll=${hasAllRequired}`);

        if (!hasAllRequired) {
		  console.log(`Milestone is ${milestone}`);
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