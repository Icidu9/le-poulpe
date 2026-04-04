export async function POST(req: Request) {
  const { code } = (await req.json()) as { code: string };
  if (!code) return Response.json({ valid: false }, { status: 400 });

  // BETA_CODES = liste de codes séparés par virgule, ex: FAMILLE1,FAMILLE2,FAMILLE3
  const rawCodes = process.env.BETA_CODES || process.env.NEXT_PUBLIC_BETA_CODE || "POULPE2025";
  const validCodes = rawCodes.split(",").map((c) => c.trim().toUpperCase());

  const valid = validCodes.includes(code.trim().toUpperCase());
  return Response.json({ valid });
}
