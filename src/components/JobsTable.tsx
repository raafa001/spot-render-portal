import { useEffect, useState } from "react";
import axios from "axios";

interface Job {
  id: string;
  project: string;
  variation: string;
  artist: string;
  status: string;
  stage: string;
  stage_message: string;
  progress_percent: number;
  eta_seconds?: number | null;
  input_uri: string;
  output_uri: string;
  storage_bucket?: string | null;
  storage_repo?: string | null;
  notify_on_complete: boolean;
  email?: string | null;
  error_message?: string | null;
  artifacts: Artifact[];
}

interface Artifact {
  name: string;
  download_url: string;
  size: number;
  modified_at: string;
}

function formatEta(seconds?: number | null) {
  if (!seconds && seconds !== 0) return "—";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = (minutes / 60).toFixed(1);
  return `${hours} h`;
}

export default function JobsTable() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (!api) return;

    async function fetchJobs() {
      const res = await axios.get<Job[]>(`${api}/jobs/`);
      setJobs(res.data);
    }

    fetchJobs();
    const id = setInterval(fetchJobs, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="jobs-board">
      <table className="jobs-table">
        <thead>
          <tr>
            <th>Projeto</th>
            <th>Artista</th>
            <th>Status</th>
            <th>Progresso</th>
            <th>ETA</th>
            <th>Locais</th>
            <th>Artefatos</th>
            <th>Notificação</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td>
                <strong>{job.project}</strong>
                <div className="sub">Var: {job.variation}</div>
              </td>
              <td>{job.artist}</td>
              <td>
                <span className={`pill ${job.stage}`}>
                  {job.stage === "finalizing" ? "Concluindo" : job.stage === "completed" ? "Concluída" : job.stage}
                </span>
                <div className="stage-msg">{job.stage_message}</div>
                {job.error_message && <div className="error-chip">Erro: {job.error_message}</div>}
              </td>
              <td>
                <div className="progress">
                  <span style={{ width: `${Math.min(job.progress_percent ?? 0, 100)}%` }} />
                </div>
                <strong>{job.progress_percent?.toFixed(1) ?? 0}%</strong>
              </td>
              <td>{formatEta(job.eta_seconds)}</td>
              <td>
                <div>
                  Entrada: <code>{job.input_uri}</code>
                </div>
                <div>
                  Saída: <code>{job.output_uri}</code>
                </div>
                {job.storage_bucket && <div>Bucket: {job.storage_bucket}</div>}
                {job.storage_repo && <div>Repo: {job.storage_repo}</div>}
              </td>
              <td>
                {job.artifacts?.length ? (
                  <div className="artifact-list">
                    {job.artifacts.map((artifact) => (
                      <a
                        key={`${job.id}-${artifact.name}`}
                        href={`${apiBase}${artifact.download_url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="artifact-chip"
                      >
                        ⬇ {artifact.name}
                      </a>
                    ))}
                  </div>
                ) : (
                  <span className="muted">Sem arquivos ainda</span>
                )}
              </td>
              <td>{job.notify_on_complete ? job.email || "Email configurado" : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="jobs-cards">
        {jobs.map((job) => (
          <article key={`${job.id}-card`}>
            <header>
              <div>
                <p>{job.project}</p>
                <small>Var: {job.variation}</small>
              </div>
              <span className={`pill ${job.stage}`}>
                {job.stage === "finalizing" ? "Concluindo" : job.stage === "completed" ? "Concluída" : job.stage}
              </span>
            </header>
            <p className="stage">{job.stage_message}</p>
            {job.error_message && <p className="stage error">Erro: {job.error_message}</p>}
            <div className="progress">
              <span style={{ width: `${Math.min(job.progress_percent ?? 0, 100)}%` }} />
            </div>
            <dl>
              <div>
                <dt>Artista</dt>
                <dd>{job.artist}</dd>
              </div>
              <div>
                <dt>ETA</dt>
                <dd>{formatEta(job.eta_seconds)}</dd>
              </div>
              <div>
                <dt>Locais</dt>
                <dd>
                  <div>Entrada: <code>{job.input_uri}</code></div>
                  <div>Saída: <code>{job.output_uri}</code></div>
                </dd>
              </div>
              <div>
                <dt>Artefatos</dt>
                <dd>
                  {job.artifacts?.length ? (
                    <div className="artifact-list">
                      {job.artifacts.map((artifact) => (
                        <a
                          key={`${job.id}-mobile-${artifact.name}`}
                          href={`${apiBase}${artifact.download_url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="artifact-chip"
                        >
                          ⬇ {artifact.name}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <span className="muted">Sem arquivos</span>
                  )}
                </dd>
              </div>
              <div>
                <dt>Notificação</dt>
                <dd>{job.notify_on_complete ? job.email || "Email configurado" : "—"}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <style jsx>{`
        .jobs-board {
          width: 100%;
        }
        .jobs-table {
          width: 100%;
          border-collapse: collapse;
          border-radius: 18px;
          overflow: hidden;
          background: #fff;
          box-shadow: inset 0 0 0 1px #eef2ff;
        }
        .jobs-table th,
        .jobs-table td {
          padding: 1rem;
          border-bottom: 1px solid #eef2ff;
          vertical-align: top;
        }
        .jobs-table th {
          text-align: left;
          font-size: 0.8rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #94a3b8;
        }
        .jobs-table tr:last-child td {
          border-bottom: none;
        }
        .sub {
          font-size: 0.8rem;
          color: #6b7280;
        }
        .stage-msg {
          font-size: 0.85rem;
          color: #475569;
          margin-top: 0.35rem;
        }
        .pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.2rem 0.75rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
        }
        .pill:before {
          content: "";
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: currentColor;
        }
        .pill.queued {
          background: #e0f2fe;
          color: #0369a1;
        }
        .pill.running {
          background: #ede9fe;
          color: #6d28d9;
        }
        .pill.finalizing {
          background: #fef3c7;
          color: #92400e;
        }
        .pill.completed {
          background: #dcfce7;
          color: #166534;
        }
        .pill.failed {
          background: #fee2e2;
          color: #b91c1c;
        }
        .error-chip {
          margin-top: 0.5rem;
          padding: 0.3rem 0.6rem;
          border-radius: 8px;
          background: #fef2f2;
          color: #b91c1c;
          font-size: 0.8rem;
          font-weight: 600;
        }
        .artifact-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.3rem;
        }
        .artifact-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.3rem 0.65rem;
          border-radius: 999px;
          background: #eef2ff;
          color: #312e81;
          text-decoration: none;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .artifact-chip:hover {
          background: #e0e7ff;
        }
        .muted {
          color: #94a3b8;
          font-size: 0.8rem;
        }
        code {
          font-family: "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
          font-size: 0.75rem;
          background: #f1f5f9;
          padding: 0.15rem 0.35rem;
          border-radius: 6px;
        }
        .progress {
          width: 100%;
          height: 6px;
          background: #e2e8f0;
          border-radius: 999px;
          overflow: hidden;
          margin-bottom: 0.4rem;
        }
        .progress span {
          display: block;
          height: 100%;
          background: linear-gradient(90deg, #2563eb, #7c3aed);
        }
        .jobs-cards {
          display: none;
        }
        @media (max-width: 960px) {
          .jobs-table {
            display: none;
          }
          .jobs-cards {
            display: grid;
            gap: 1rem;
            margin-top: 1rem;
          }
          .jobs-cards article {
            background: #fff;
            border-radius: 20px;
            padding: 1.25rem;
            box-shadow: 0 30px 60px rgba(15, 23, 42, 0.08);
          }
          .jobs-cards header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
          }
          .jobs-cards header p {
            margin: 0;
            font-weight: 600;
            font-size: 1.05rem;
          }
          .jobs-cards header small {
            color: #94a3b8;
          }
          .jobs-cards .stage {
            margin: 0.5rem 0 0.75rem;
            color: #475569;
          }
          dl {
            margin: 1rem 0 0;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 0.75rem;
          }
          dt {
            text-transform: uppercase;
            font-size: 0.7rem;
            letter-spacing: 0.08em;
            color: #94a3b8;
          }
          dd {
            margin: 0.1rem 0 0;
            color: #0f172a;
          }
        }
      `}</style>
    </section>
  );
}
