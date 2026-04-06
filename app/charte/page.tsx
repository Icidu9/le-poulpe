"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const CHARTE_VERSION = "v1.0-avril-2025";
const CHARTE_KEY = "poulpe_charte_accepted";

export default function ChartePage() {
  const router = useRouter();
  const [parentName, setParentName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Vérifie si déjà accepté
    if (localStorage.getItem(CHARTE_KEY) === "true") {
      router.replace("/onboarding");
      return;
    }
    // Pré-remplit l'email depuis la page bêta
    const savedEmail = localStorage.getItem("poulpe_beta_email") || "";
    setEmail(savedEmail);
  }, [router]);

  async function handleAccept(e: React.FormEvent) {
    e.preventDefault();
    if (!accepted || !parentName.trim() || loading) return;
    setLoading(true);

    // Enregistre l'acceptation côté serveur (non-bloquant)
    fetch("/api/log-charter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parentName: parentName.trim(),
        email,
        charteVersion: CHARTE_VERSION,
      }),
    }).catch(() => {});

    // Enregistre localement
    localStorage.setItem(CHARTE_KEY, "true");
    localStorage.setItem("poulpe_parent_name", parentName.trim());

    router.replace("/onboarding");
  }

  const D = {
    bg: "#030D18",
    card: "rgba(6,26,38,0.85)",
    border: "rgba(255,255,255,0.08)",
    textMain: "rgba(255,255,255,0.92)",
    textSub: "rgba(255,255,255,0.45)",
    inputBg: "rgba(255,255,255,0.05)",
    inputBorder: "rgba(255,255,255,0.12)",
  };

  return (
    <div
      className="min-h-screen py-10 px-6"
      style={{ background: D.bg, fontFamily: '"Inter", system-ui, sans-serif' }}
    >
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🐙</div>
          <h1 className="text-xl font-bold" style={{ color: D.textMain }}>Charte de participation bêta privée</h1>
          <p className="text-sm mt-1" style={{ color: D.textSub }}>À lire et signer avant d'accéder à l'application</p>
        </div>

        {/* Charte */}
        <div
          className="rounded-2xl p-6 mb-6 text-sm space-y-5"
          style={{ background: D.card, border: `1px solid ${D.border}`, color: D.textMain, lineHeight: "1.7", backdropFilter: "blur(12px)" }}
        >
          <div>
            <p className="font-semibold mb-1">Article 1 — Objet et cadre</p>
            <p>
              Dans le cadre de la phase de tests privés de l'application <strong>Le Poulpe</strong> (ci-après « l'Application »),
              la Société invite le Participant à accéder à une version non commerciale et confidentielle du produit.
              L'Application, son code, son interface, ses contenus pédagogiques et ses fonctionnalités constituent des
              œuvres protégées au titre des articles <strong>L.111-1 et L.122-6 du Code de la propriété intellectuelle (CPI)</strong>.
              L'accès à cette bêta est strictement personnel et conditionné à l'acceptation de la présente Charte.
            </p>
          </div>

          <div>
            <p className="font-semibold mb-1">Article 2 — Obligations de confidentialité</p>
            <p>Le Participant s'engage à :</p>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li>Ne pas divulguer, partager, transmettre ou rendre accessible l'Application, ses identifiants d'accès,
                ses captures d'écran, ses fonctionnalités ou tout contenu qui en est issu, à quelque tiers que ce soit ;</li>
              <li>S'abstenir de toute publication sur les réseaux sociaux, forums, blogs ou tout autre support public
                faisant référence à l'Application, à son contenu ou à ses caractéristiques ;</li>
              <li>Utiliser les accès fournis exclusivement à des fins de test, pour le compte du mineur désigné lors de l'inscription.</li>
            </ul>
            <p className="mt-2">
              Ces obligations s'appliquent pendant toute la durée de la bêta et pour une période de <strong>deux (2) mois</strong> à
              compter du début de l'utilisation.
            </p>
          </div>

          <div>
            <p className="font-semibold mb-1">Article 3 — Interdiction de reproduction et d'ingénierie inverse</p>
            <p>
              Toute reproduction, copie, adaptation, décompilation, rétro-ingénierie ou extraction de l'Application ou de ses
              composants est formellement interdite en vertu des articles <strong>L.122-4 et L.122-6 CPI</strong>.
              Cette interdiction vise également les bases de données et contenus pédagogiques intégrés, protégés au titre de
              l'article <strong>L.341-1 CPI</strong>.
            </p>
          </div>

          <div>
            <p className="font-semibold mb-1">Article 4 — Conséquences d'un manquement</p>
            <p>Tout manquement à la présente Charte expose le Participant aux recours suivants :</p>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li><strong>Responsabilité contractuelle</strong> (article 1231-1 du Code civil) : la Société est en droit de
                réclamer réparation de l'intégralité du préjudice subi, incluant la perte d'opportunité commerciale et
                le préjudice d'image ;</li>
              <li><strong>Action en contrefaçon</strong> (article L.335-2 CPI) : la reproduction non autorisée de l'Application
                constitue un délit de contrefaçon, puni de <strong>trois ans d'emprisonnement et 300 000 € d'amende</strong> ;</li>
              <li><strong>Action en référé</strong> (article 835 du Code de procédure civile) : la Société peut obtenir en urgence
                la cessation de toute divulgation ou publication litigieuse devant le Tribunal judiciaire compétent.</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold mb-1">Article 5 — Durée et conditions de la période bêta</p>
            <p>
              L'accès à la présente version bêta est accordé à titre gratuit pour une durée de <strong>trente (30) jours</strong> à
              compter de la première connexion du Participant. À l'issue de cette période, l'accès à l'Application sera
              suspendu automatiquement. Aucune reconduction tacite n'est prévue.
            </p>
            <p className="mt-2">
              Le Participant sera informé par email <strong>cinq (5) jours avant l'expiration</strong> de son accès, accompagné
              d'une invitation à partager son retour d'expérience. La Société se réserve le droit de proposer une offre
              payante à l'issue de la bêta.
            </p>
          </div>

          <div>
            <p className="font-semibold mb-1">Article 6 — Représentation du mineur</p>
            <p>
              Le parent ou tuteur légal soussigné reconnaît disposer de l'autorité parentale au sens des
              articles <strong>372 et 382 du Code civil</strong> et signe la présente Charte en son nom propre
              ainsi qu'au nom et pour le compte du mineur participant. Il s'engage personnellement au respect de l'ensemble
              des obligations ci-dessus.
            </p>
          </div>

          <div>
            <p className="font-semibold mb-1">Article 7 — Valeur juridique du consentement électronique</p>
            <p>
              La validation de la présente Charte par case à cocher assortie de la saisie du nom constitue une signature
              électronique au sens des articles <strong>1366 et 1367 du Code civil</strong> et du règlement européen
              eIDAS (UE n° 910/2014). La date, l'heure et l'adresse IP de validation sont enregistrées et font foi.
            </p>
          </div>

          <p className="text-xs pt-2" style={{ color: D.textSub }}>
            Droit applicable : Droit français. Juridiction compétente : Tribunal judiciaire compétent. {CHARTE_VERSION}
          </p>
        </div>

        {/* Formulaire d'acceptation */}
        <form onSubmit={handleAccept}>
          <div
            className="rounded-2xl p-6 space-y-4"
            style={{ background: D.card, border: `1px solid ${D.border}`, backdropFilter: "blur(12px)" }}
          >
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: D.textMain }}>
                Nom et prénom du parent / tuteur légal
              </label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Ex : Marie Dupont"
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{
                  background: D.inputBg,
                  border: `1.5px solid ${D.inputBorder}`,
                  color: D.textMain,
                }}
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 flex-shrink-0"
                style={{ accentColor: "#E8922A" }}
              />
              <span className="text-sm" style={{ color: D.textSub }}>
                J'ai lu et j'accepte la Charte de participation bêta privée. Je confirme être le parent ou tuteur légal
                du mineur participant et agir en cette qualité.
              </span>
            </label>

            <button
              type="submit"
              disabled={!accepted || !parentName.trim() || loading}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #E8922A, #C05C2A)", boxShadow: "0 0 20px rgba(232,146,42,0.3)" }}
            >
              {loading ? "Enregistrement..." : "Signer et accéder à l'application →"}
            </button>
          </div>
        </form>

        <p className="text-center text-xs mt-5" style={{ color: D.textSub }}>
          Des questions ? Contacte-nous avant de signer.
        </p>
      </div>
    </div>
  );
}
