export async function POST(req: Request) {
  const { code, email } = (await req.json()) as { code: string; email?: string };
  if (!code) return Response.json({ valid: false }, { status: 400 });

  const codeUpper = code.trim().toUpperCase();

  // FAMILY_CODES : codes par famille liés à un email, format : "email:CODE,email2:CODE2"
  // Permet d'empêcher le partage entre familles
  const familyCodes = process.env.FAMILY_CODES || "";
  if (familyCodes && email) {
    const emailLower = email.trim().toLowerCase();
    const pairs = familyCodes.split(",").map((p) => {
      const [e, c] = p.trim().split(":");
      return { email: (e || "").trim().toLowerCase(), code: (c || "").trim().toUpperCase() };
    });
    const match = pairs.find((p) => p.email === emailLower && p.code === codeUpper);
    if (match) return Response.json({ valid: true });
    return Response.json({ valid: false });
  }

  // Fallback : BETA_CODES sans email (codes génériques)
  const rawCodes = process.env.BETA_CODES || process.env.NEXT_PUBLIC_BETA_CODE || "POULPE2025";
  const validCodes = rawCodes.split(",").map((c) => c.trim().toUpperCase());
  const valid = validCodes.includes(codeUpper);
  return Response.json({ valid });
}
