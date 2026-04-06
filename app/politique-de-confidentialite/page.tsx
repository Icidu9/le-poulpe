"use client";

import { useRouter } from "next/navigation";

export default function PolitiqueConfidentialite() {
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
        <div style={{ fontSize: 16, fontWeight: 700 }}>Politique de confidentialité</div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 20px 64px" }}>

        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, marginBottom: 32 }}>
          Le Poulpe s'engage à protéger les données personnelles de vos enfants. Cette politique explique quelles données nous collectons, pourquoi, comment elles sont utilisées, et vos droits en tant que parent ou responsable légal.
        </p>

        <Section title="Responsable du traitement">
          <P>Diana Monfort — Le Poulpe · lepoulpe.app@gmail.com</P>
        </Section>

        <Section title="Données collectées">
          <SubTitle>Lors de l'inscription (parent)</SubTitle>
          <ul style={listStyle}>
            <li>Adresse e-mail du parent / responsable légal</li>
            <li>Prénom de l'enfant</li>
            <li>Classe et matières</li>
          </ul>
          <SubTitle>Lors de l'onboarding (optionnel)</SubTitle>
          <ul style={listStyle}>
            <li>Profil scolaire de l'enfant (matières difficiles/fortes, intérêts)</li>
            <li>Données de santé : diagnostics déclarés (TDAH, HPI, dyslexie…) — <strong>uniquement avec consentement explicite Art. 9 RGPD</strong></li>
            <li>Profil comportemental et émotionnel (anonymisé, non transmis à des tiers)</li>
          </ul>
          <SubTitle>Lors des sessions</SubTitle>
          <ul style={listStyle}>
            <li>Résumé synthétique des échanges pédagogiques (pas de transcription brute)</li>
            <li>Points de travail identifiés par l'IA</li>
            <li>Compteur et date des sessions</li>
          </ul>
          <SubTitle>Ce que nous ne collectons PAS</SubTitle>
          <ul style={listStyle}>
            <li>Nom de famille de l'enfant</li>
            <li>Photos ou documents personnels identifiants</li>
            <li>Données de localisation</li>
            <li>Données bancaires</li>
          </ul>
        </Section>

        <Section title="Finalités du traitement">
          <ul style={listStyle}>
            <li><strong>Personnalisation pédagogique :</strong> adapter les explications de l'IA au profil de l'enfant</li>
            <li><strong>Continuité entre sessions :</strong> mémoriser les progrès pour éviter de repartir de zéro</li>
            <li><strong>Transparence parentale :</strong> permettre au parent de voir et corriger les données utilisées</li>
            <li><strong>Amélioration du service :</strong> statistiques agrégées et anonymisées uniquement</li>
          </ul>
        </Section>

        <Section title="Base légale">
          <ul style={listStyle}>
            <li><strong>Consentement (Art. 6.1.a RGPD)</strong> — pour toutes les données personnelles</li>
            <li><strong>Consentement explicite (Art. 9 RGPD)</strong> — pour les données de santé (diagnostics)</li>
            <li><strong>Mineur de moins de 15 ans :</strong> le consentement du représentant légal est requis conformément à la loi française (Art. 8 RGPD, loi Informatique et Libertés Art. 45)</li>
          </ul>
        </Section>

        <Section title="Durée de conservation">
          <ul style={listStyle}>
            <li>Données du profil et mémoire des sessions : conservées pendant la durée d'utilisation du service + 1 an</li>
            <li>En cas de demande de suppression : effacement dans les 72 heures</li>
            <li>Logs techniques (Vercel) : 30 jours maximum</li>
          </ul>
        </Section>

        <Section title="Sous-traitants et hébergement">
          <Row label="Vercel Inc." value="Hébergement de l'application (USA — transfert encadré par clauses contractuelles types)" />
          <Row label="Supabase" value="Base de données — région EU (Frankfurt, Allemagne)" />
          <Row label="Mistral AI" value="Moteur IA des conversations — les messages sont envoyés à l'API, aucun stockage permanent de leur côté" />
          <Row label="Anthropic" value="Analyse des copies (Claude) — traitement ponctuel, pas de stockage" />
          <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.35)", fontStyle: "italic" }}>
            Aucune donnée n'est vendue, partagée ou utilisée à des fins publicitaires.
          </div>
        </Section>

        <Section title="Vos droits (RGPD)">
          <ul style={listStyle}>
            <li><strong>Accès (Art. 15) :</strong> voir toutes les données via l'Espace parent</li>
            <li><strong>Rectification (Art. 16) :</strong> modifier le profil à tout moment</li>
            <li><strong>Effacement (Art. 17) :</strong> supprimer toutes les données via l'Espace parent</li>
            <li><strong>Portabilité (Art. 20) :</strong> exporter toutes les données en JSON</li>
            <li><strong>Opposition (Art. 21) :</strong> s'opposer à tout traitement à tout moment</li>
            <li><strong>Retrait du consentement :</strong> possible à tout moment, sans effet rétroactif</li>
          </ul>
          <div style={{ marginTop: 12, fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
            Pour exercer vos droits : <strong style={{ color: "#E8922A" }}>lepoulpe.app@gmail.com</strong><br />
            En cas de réclamation : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: "#E8922A" }}>CNIL — cnil.fr</a>
          </div>
        </Section>

        <Section title="Sécurité">
          <P>
            Les données sont chiffrées en transit (HTTPS/TLS). L'accès à la base de données est restreint et protégé par authentification. Les données de santé ne sont jamais transmises dans les logs techniques. Aucun employé tiers n'a accès aux données personnelles des enfants.
          </P>
        </Section>

        <Section title="Décisions automatisées">
          <P>
            Le Poulpe ne prend <strong>aucune décision automatisée</strong> ayant un effet sur l'enfant (Art. 22 RGPD). L'IA propose — le parent et l'enfant décident. Aucun profil de performance n'est communiqué à des établissements scolaires.
          </P>
        </Section>

        <Section title="Cookies">
          <P>
            Le Poulpe utilise un cookie technique (<code style={{ background: "rgba(255,255,255,0.08)", borderRadius: 4, padding: "1px 5px", fontSize: 12 }}>poulpe_email</code>) pour maintenir la session parent entre les visites. Pas de cookies publicitaires ou de suivi tiers.
          </P>
        </Section>

        <div style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.25)", paddingTop: 24 }}>
          Dernière mise à jour : avril 2026 · Conformité RGPD + Loi IA (UE) 2024/1689
        </div>
      </div>
    </div>
  );
}

const listStyle: React.CSSProperties = {
  margin: "6px 0 12px 0", padding: "0 0 0 18px",
  color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 1.9,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#E8922A", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
        {title}
      </div>
      <div style={{ background: "rgba(6,26,38,0.95)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px 18px" }}>
        {children}
      </div>
    </div>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginTop: 10, marginBottom: 2 }}>{children}</div>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: 0 }}>{children}</p>;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 16, padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", alignItems: "flex-start" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", minWidth: 120, paddingTop: 1 }}>{label}</div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", flex: 1 }}>{value}</div>
    </div>
  );
}
