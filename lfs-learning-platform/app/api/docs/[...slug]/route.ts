import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import matter from "gray-matter";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params;
    const slugArray = slug;
    const fileName = slugArray[slugArray.length - 1];
    
    // Try different possible paths
    const possiblePaths = [
      join(process.cwd(), "public", "docs", ...slugArray) + ".md",
      join(process.cwd(), "public", "docs", fileName) + ".md",
      join(process.cwd(), "..", "docs", ...slugArray) + ".md",
      join(process.cwd(), "..", "docs", fileName) + ".md",
      join(process.cwd(), "docs", ...slugArray) + ".md",
      join(process.cwd(), "docs", fileName) + ".md",
    ];

    console.log("Looking for doc:", slugArray);
    console.log("Trying paths:", possiblePaths);

    let filePath: string | null = null;
    for (const path of possiblePaths) {
      console.log("Checking:", path, "exists:", existsSync(path));
      if (existsSync(path)) {
        filePath = path;
        console.log("Found file at:", filePath);
        break;
      }
    }

    if (!filePath) {
      console.log("File not found for slug:", slugArray);
      // Return a placeholder content for missing docs
      return NextResponse.json({
        content: `# ${slugArray.join(" / ")}\n\nThis documentation page is coming soon.\n\nIn the meantime, check out our other resources:\n- [Getting Started](/docs/usage)\n- [Learning Modules](/learn)\n- [Commands Reference](/commands)`,
        title: slugArray[slugArray.length - 1],
      });
    }

    const fileContents = readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents);

    return NextResponse.json({
      content,
      title: data.title || fileName,
      ...data,
    });
  } catch (error) {
    console.error("Error reading documentation:", error);
    return NextResponse.json(
      { error: "Failed to load documentation" },
      { status: 500 }
    );
  }
}
