import { NextRequest, NextResponse } from "next/server";
import prisma from "../lib/prisma";

export async function POST(request: NextRequest, res: NextResponse) {
  try {
    const { symptoms } = await request.json();

    if (!symptoms || !Array.isArray(symptoms)) {
      return NextResponse.json(
        { message: "Input gejala tidak valid." },
        { status: 400 }
      );
    }

    // Ambil aturan diagnosis dari database
    const rules = await prisma.diagnosisRule.findMany({
      include: {
        ruleConditions: {
          include: {
            symptom: {
              select: {
                name: true,
                importanceScore: true,
              },
            },
          },
        },
      },
    });

    // Proses inferensi berbasis Forward Chaining
    let matchedRule = null;
    for (const rule of rules) {
      const conditionsMet = rule.ruleConditions.every((condition) =>
        symptoms.includes(condition.symptom.name)
      );
      if (conditionsMet) {
        matchedRule = rule;
        break;
      }
    }

    if (!matchedRule) {
      return NextResponse.json(
        {
          diagnosis: "Tidak terdeteksi diabetes",
          message: "Silakan konsultasi lebih lanjut dengan dokter.",
        },
        { status: 200 }
      );
    }

    // Hitung probabilitas berdasarkan bobot gejala (Fuzzy Logic)
    const totalScore = matchedRule.ruleConditions.reduce((sum, condition) => {
      return sum + condition.symptom.importanceScore;
    }, 0);

    let probability;
    if (totalScore >= 8) {
      probability = "Sangat Tinggi";
    } else if (totalScore >= 5) {
      probability = "Tinggi";
    } else if (totalScore >= 3) {
      probability = "Sedang";
    } else {
      probability = "Rendah";
    }

    return NextResponse.json(
      {
        diagnosis: matchedRule.outputDiagnosis,
        probability,
        ruleDescription: matchedRule.ruleDescription,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memproses diagnosis." },
      { status: 500 }
    );
  }
}
