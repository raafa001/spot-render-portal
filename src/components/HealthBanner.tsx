import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

interface HealthComponent {
  name: string;
  healthy: boolean;
  details: string;
}

interface HealthSummary {
  overall: string;
  components: HealthComponent[];
}

export default function HealthBanner() {
  const [health, setHealth] = useState<HealthSummary | null>(null);

  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (!api) return;

    async function fetchHealth() {
      try {
        const res = await axios.get<HealthSummary>(`${api}/health/summary`);
        setHealth(res.data);
      } catch (error) {
        setHealth({ overall: "degraded", components: [{ name: "api", healthy: false, details: "Erro ao consultar" }] });
      }
    }

    fetchHealth();
    const id = setInterval(fetchHealth, 20000);
    return () => clearInterval(id);
  }, []);

  if (!health) return null;

  const healthy = health.overall === "healthy";

  return (
    <div className={`health-banner ${healthy ? "ok" : "fail"}`}>
      <div className="pulse" />
      <div className="copy">
        <strong>{healthy ? "Plataforma saudável" : "Atenção: ambiente degradado"}</strong>
        <span>{healthy ? "API, portal e workers respondendo normalmente" : "Estamos analisando instabilidades nos componentes"}</span>
      </div>
      <Link href="/status">Ver status</Link>
      <style jsx>{`
        .health-banner {
          display: inline-flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.85rem 1.2rem;
          border-radius: 999px;
          font-size: 0.9rem;
          box-shadow: 0 15px 30px rgba(15, 23, 42, 0.08);
        }
        .pulse {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: currentColor;
          position: relative;
        }
        .pulse::after {
          content: "";
          position: absolute;
          inset: -6px;
          border: 2px solid currentColor;
          border-radius: 999px;
          opacity: 0.4;
          animation: pulse 1.8s infinite;
        }
        @keyframes pulse {
          0% {
            transform: scale(0.4);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
        .copy {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }
        .copy strong {
          font-size: 0.95rem;
        }
        .copy span {
          color: inherit;
          opacity: 0.8;
          font-size: 0.85rem;
        }
        .health-banner.ok {
          background: rgba(34, 197, 94, 0.15);
          color: #15803d;
        }
        .health-banner.fail {
          background: rgba(248, 113, 113, 0.15);
          color: #b91c1c;
        }
        a {
          margin-left: auto;
          font-weight: 600;
          color: inherit;
          text-decoration: none;
        }
        @media (max-width: 640px) {
          .health-banner {
            flex-direction: column;
            border-radius: 18px;
            align-items: flex-start;
            width: 100%;
          }
          a {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
}
