import { players } from "@/data/players"
import { NextResponse } from "next/server"

export async function GET() {
    return NextResponse.json(players)
}
