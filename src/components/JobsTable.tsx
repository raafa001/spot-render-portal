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
    <>
      <table className="jobs-table">
        <thead>
          <tr>
            <th>Projeto</th>
            <th>Artista</th>
            <th>Status</th>
            <th>Progresso</th>
            <th>ETA</th>
            <th>Locais</th>
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
                <div className="sub">{job.stage_message}</div>
              </td>
              <td>{job.progress_percent?.toFixed(1)}%</td>
              <td>{formatEta(job.eta_seconds)}</td>
              <td>
                <div>
                  Entrada: <code>{job.input_uri}</code>
                </div>
                <div>
                  Saída: <code>{job.output_uri}</code>
                </div>
                {job.storage_bucket && <div>Bucket: {job.storage_bucket}</div>}
                {job.storage_repo && <div>Repositório: {job.storage_repo}</div>}
              </td>
              <td>{job.notify_on_complete ? job.email || "Email configurado" : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <style jsx>{`
        .jobs-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1.5rem;
        }
        .jobs-table th,
        .jobs-table td {
          border: 1px solid #e5e7eb;
          padding: 0.75rem;
          vertical-align: top;
        }
        .sub {
          font-size: 0.8rem;
          color: #6b7280;
        }
        .pill {
          padding: 0.2rem 0.6rem;
          border-radius: 999px;
          font-size: 0.8rem;
          text-transform: capitalize;
          display: inline-block;
        }
        .pill.queued {
          background: #e0f2fe;
          color: #0369a1;
        }
        .pill.running {
          background: #ede9fe;
          color: #5b21b6;
        }
        .pill.finalizing {
          background: #fef3c7;
          color: #92400e;
        }
        .pill.completed {
          background: #dcfce7;
          color: #166534;
        }
        code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 0.8rem;
        }
      `}</style>
    </>
  );
}
