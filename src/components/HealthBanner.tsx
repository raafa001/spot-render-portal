import { useEffect, useState } from "react";
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
    <>
      <div className={`health-banner ${healthy ? "ok" : "fail"}`}>
        <span>{healthy ? "Ambiente está funcionando corretamente!" : "Ambiente com falha e/ou em manutenção"}</span>
        <a href="/status">Ver status detalhado</a>
      </div>
      <style jsx>{`
        .health-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin: 1rem 0;
        }
        .health-banner.ok {
          background: #e6ffed;
          color: #03543f;
        }
        .health-banner.fail {
          background: #fde8e8;
          color: #981b1b;
        }
        .health-banner a {
          font-weight: 600;
        }
      `}</style>
    </>
  );
}
