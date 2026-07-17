import { useEffect, useState } from "react";
import axios from "axios";
import Head from "next/head";
import SpotinhoWidget from "../components/SpotinhoWidget";

interface HealthComponent {
  name: string;
  healthy: boolean;
  details: string;
}

interface HealthSummary {
  overall: string;
  components: HealthComponent[];
}

export default function Status() {
  const [health, setHealth] = useState<HealthSummary | null>(null);

  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (!api) return;
    axios.get<HealthSummary>(`${api}/health/summary`).then((res) => setHealth(res.data));
  }, []);

  return (
    <>
      <Head>
        <title>Status da Plataforma</title>
      </Head>
      <main className="container">
        <h1>Status dos Componentes</h1>
        {!health && <p>Carregando...</p>}
        {health && (
          <div className="status-grid">
            {health.components.map((component) => (
              <div key={component.name} className={`status-card ${component.healthy ? "ok" : "fail"}`}>
                <h3>{component.name}</h3>
                <p>{component.details}</p>
              </div>
            ))}
          </div>
        )}
      </main>
      <style jsx>{`
        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
        .status-card {
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }
        .status-card.ok {
          background: #ecfdf5;
          border-color: #d1fae5;
        }
        .status-card.fail {
          background: #fef2f2;
          border-color: #fecaca;
        }
      `}</style>
      <SpotinhoWidget />
    </>
  );
}
