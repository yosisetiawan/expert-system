import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  const symptoms = await prisma.symptom.findMany();
  return NextResponse.json({
    status: "success",
    data: symptoms,
  });
}
