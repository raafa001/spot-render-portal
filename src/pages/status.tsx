import { useEffect, useState } from "react";
import axios from "axios";
import Head from "next/head";
import Link from "next/link";
import SpotinhoWidget from "../components/SpotinhoWidget";
import { LanguageSelector, useLanguage, getPortalText } from "../components/LanguageSelector";
import { getApiUrl } from "../utils/apiUtils";

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
  const { language } = useLanguage();
  const t = getPortalText(language.code);
  const [health, setHealth] = useState<HealthSummary | null>(null);

  useEffect(() => {
    axios.get<HealthSummary>(`${getApiUrl()}/health/summary`).then((res) => setHealth(res.data));
  }, []);

  return (
    <>
      <Head>
        <title>{t.status.pageTitle}</title>
      </Head>
      <main className="container">
        <nav className="nav">
          <div className="brand">{t.brand}</div>
          <div className="nav__links">
            <Link href="/">{t.nav.upload}</Link>
            <Link href="/statistics">{t.nav.statistics}</Link>
            <Link href="/docs">{t.nav.techDocs}</Link>
            <a href="https://github.com/raafa001/spot-render" target="_blank" rel="noreferrer">{t.nav.repositories}</a>
            <Link href="/chat">{t.nav.spotinho}</Link>
            <LanguageSelector compact />
          </div>
        </nav>
        <h1>{t.status.title}</h1>
        {!health && <p>{t.status.loading}</p>}
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
