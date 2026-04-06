"use client";

import { useRouter } from "next/navigation";

export default function MentionsLegales() {
  const router = useRouter();

  return (
    <div style={{ minHeight: "100vh", background: "#030D18", fontFamily: "Inter, sans-serif", color: "rgba(255,255,255,0.88)" }}>
      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "rgba(3,13,24,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "14px 20px", display: "flex", alignItems: "center", gap: 12,
      }}>
        <button
          onClick={() => router.back()}
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "rgba(255,255,255,0.45)", padding: "7px 14px", fontSize: 13, cursor: "pointer", fontFamily: "Inter, sans-serif" }}
        >
          ← Retour
        </button>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Mentions légales</div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 20px 64px" }}>

        <Section title="Éditeur du site">
          <Row label="Site" value="Le Poulpe — lepoulpe.app" />
          <Row label="Éditeur" value="Diana Monfort — auto-entrepreneur" />
          <Row label="Adresse" value="France" />
          <Row label="SIRET" value="En cours d'immatriculation" />
          <Row label="Email" value="lepoulpe.app@gmail.com" />
        </Section>

        <Section title="Hébergement">
          <Row label="Hébergeur" value="Vercel Inc." />
          <Row label="Adresse" value="340 Pine Street, Suite 701, San Francisco, CA 94104, USA" />
          <Row label="Site" value="vercel.com" />
          <Row label="Base de données" value="Supabase (hébergement EU — Frankfurt)" />
        </Section>

        <Section title="Directeur de la publication">
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: 0 }}>
            Diana Monfort — lepoulpe.app@gmail.com
          </p>
        </Section>

        <Section title="Propriété intellectuelle">
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: 0 }}>
            L'ensemble du contenu de ce site (textes, illustrations, interface, logo Le Poulpe) est la propriété exclusive de Diana Monfort. Toute reproduction, même partielle, est interdite sans autorisation écrite préalable.
          </p>
        </Section>

        <Section title="Responsabilité">
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: 0 }}>
            Le Poulpe est un outil d'aide pédagogique. Il ne se substitue pas à un enseignant, un orthophoniste ou un professionnel de santé. Les suggestions de l'IA sont indicatives et soumises à la vérification d'un adulte responsable.
          </p>
        </Section>

        <Section title="Loi applicable">
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: 0 }}>
            Le présent site est soumis au droit français. En cas de litige, les tribunaux français sont seuls compétents.
          </p>
        </Section>

        <div style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.25)", paddingTop: 24 }}>
          Dernière mise à jour : avril 2026
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#E8922A", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
        {title}
      </div>
      <div style={{ background: "rgba(6,26,38,0.95)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px 18px" }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 16, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", alignItems: "flex-start" }}>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", minWidth: 160, paddingTop: 1, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", flex: 1 }}>{value}</div>
    </div>
  );
}
