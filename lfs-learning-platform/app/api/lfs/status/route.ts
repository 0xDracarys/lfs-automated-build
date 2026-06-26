import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export async function GET(request: NextRequest) {
    try {
        const stateFilePath = path.join(process.cwd(), 'lfs-build-state.json');

        // Check if state file exists
        try {
            await fs.access(stateFilePath);
        } catch {
            return NextResponse.json({
                status: "idle",
                message: "No active build found"
            });
        }

        const fileContent = await fs.readFile(stateFilePath, 'utf-8');
        const state = JSON.parse(fileContent);

        return NextResponse.json(state);
    } catch (error) {
        console.error("Status check error:", error);
        return NextResponse.json(
            { error: "Failed to fetch build status" },
            { status: 500 }
        );
    }
}
