import { useEffect, useState } from "react";
import axios from "axios";

interface ProjectRoute {
  name: string;
  description?: string;
  repo?: string;
  bucket?: string;
}

interface JobResponse {
  id: string;
  project: string;
  variation: string;
  status: string;
  stage_message: string;
  input_uri: string;
  output_uri: string;
  storage_bucket?: string | null;
  storage_repo?: string | null;
}

const EMAIL_PREF_KEY = "spotrenderAlwaysNotify";
const EMAIL_VALUE_KEY = "spotrenderDefaultEmail";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [renderList, setRenderList] = useState<File | null>(null);
  const [projects, setProjects] = useState<ProjectRoute[]>([]);
  const [project, setProject] = useState("demo");
  const [variation, setVariation] = useState("v1");
  const [artist, setArtist] = useState("");
  const [email, setEmail] = useState("");
  const [notify, setNotify] = useState(false);
  const [alwaysNotify, setAlwaysNotify] = useState(false);
  const [isCorrection, setIsCorrection] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [adminUser, setAdminUser] = useState("admin");
  const [adminPass, setAdminPass] = useState("admin");
  const [submitting, setSubmitting] = useState(false);
  const [lastJob, setLastJob] = useState<JobResponse | null>(null);

  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (!api) return;
    axios.get<ProjectRoute[]>(`${api}/projects/`).then((res) => {
      setProjects(res.data);
      if (res.data.length > 0) {
        setProject(res.data[0].name);
      }
    });
    if (typeof window !== "undefined") {
      const savedAlways = window.localStorage.getItem(EMAIL_PREF_KEY);
      const savedEmail = window.localStorage.getItem(EMAIL_VALUE_KEY);
      if (savedAlways) {
        setAlwaysNotify(savedAlways === "true");
      }
      if (savedEmail) {
        setEmail(savedEmail);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(EMAIL_PREF_KEY, alwaysNotify ? "true" : "false");
    if (alwaysNotify && email) {
      window.localStorage.setItem(EMAIL_VALUE_KEY, email);
    }
  }, [alwaysNotify, email]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file && !isDefault) {
      alert("Selecione um arquivo principal");
      return;
    }
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (!api) {
      alert("NEXT_PUBLIC_API_URL não configurado");
      return;
    }

    setSubmitting(true);
    try {
      if (isDefault) {
        if (!renderList) {
          alert("Escolha uma render list para torná-la padrão");
          return;
        }
        const form = new FormData();
        form.append("renderlist", renderList);
        form.append("username", adminUser);
        form.append("password", adminPass);
        await axios.post(`${api}/uploads/renderlists/default`, form);
        alert("Render list padrão atualizada");
        return;
      }

      const form = new FormData();
      if (file) form.append("file", file);
      form.append("project", project);
      form.append("variation", variation);
      form.append("artist", artist || "unknown");
      form.append("notify_on_complete", notify ? "true" : "false");
      form.append("always_notify", alwaysNotify ? "true" : "false");
      if (email) form.append("email", email);
      if (isCorrection) form.append("is_correction", "true");
      if (renderList) form.append("renderlist", renderList);

      const response = await axios.post<JobResponse>(`${api}/uploads/`, form);
      setLastJob(response.data);
      alert("Upload enviado!");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedProject = projects.find((p) => p.name === project);

  return (
    <section>
      <form onSubmit={handleSubmit} className="upload-form">
        <div>
          <label>Arquivo principal</label>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>
        <div>
          <label>Projeto</label>
          <select value={project} onChange={(e) => setProject(e.target.value)}>
            {projects.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
          {selectedProject?.description && <small>{selectedProject.description}</small>}
        </div>
        <div>
          <label>Variação</label>
          <input value={variation} onChange={(e) => setVariation(e.target.value)} placeholder="Variação" />
        </div>
        <div>
          <label>Artista</label>
          <input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Artista" />
        </div>
        <div>
          <label>Email para aviso</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@estudio.com" />
          <label className="inline">
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} /> Desejo receber um aviso no email quando minha tarefa for concluída
          </label>
          <label className="inline">
            <input type="checkbox" checked={alwaysNotify} onChange={(e) => setAlwaysNotify(e.target.checked)} /> Sempre receber email (usa este endereço automaticamente)
          </label>
        </div>
        <div>
          <label className="inline">
            <input type="checkbox" checked={isCorrection} onChange={(e) => setIsCorrection(e.target.checked)} /> Esta submissão é uma correção
          </label>
        </div>
        <label>
          Render list (opcional)
          <input type="file" onChange={(e) => setRenderList(e.target.files?.[0] ?? null)} />
        </label>
        <label className="inline">
          <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} /> Atualizar render list padrão (admin)
        </label>
        {isDefault && (
          <div className="admin-block">
            <input value={adminUser} onChange={(e) => setAdminUser(e.target.value)} placeholder="Usuário" />
            <input value={adminPass} onChange={(e) => setAdminPass(e.target.value)} type="password" placeholder="Senha" />
          </div>
        )}
        <button type="submit" disabled={submitting}>
          {submitting ? "Enviando..." : "Enviar"}
        </button>
      </form>

      {lastJob && (
        <div className="upload-result">
          <h3>Última tarefa enviada</h3>
          <p>
            Projeto <strong>{lastJob.project}</strong> – status: {lastJob.stage_message}
          </p>
          <p>
            Origem: <code>{lastJob.input_uri}</code>
          </p>
          <p>
            Saída prevista: <code>{lastJob.output_uri}</code>
          </p>
          {lastJob.storage_bucket && <p>Bucket: {lastJob.storage_bucket}</p>}
          {lastJob.storage_repo && <p>Repositório: {lastJob.storage_repo}</p>}
        </div>
      )}
      <style jsx>{`
        .upload-form {
          display: grid;
          gap: 0.75rem;
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }
        .upload-form label {
          font-weight: 600;
          display: block;
        }
        .upload-form input,
        .upload-form select {
          width: 100%;
          padding: 0.5rem;
          border-radius: 6px;
          border: 1px solid #cbd5f5;
        }
        .upload-form .inline {
          font-weight: 400;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .upload-result {
          border: 1px solid #d1fae5;
          padding: 1rem;
          border-radius: 12px;
          background: #ecfdf5;
        }
        .admin-block {
          display: flex;
          gap: 0.5rem;
        }
        button {
          background: #2563eb;
          color: #fff;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
        }
        button[disabled] {
          opacity: 0.6;
          cursor: wait;
        }
      `}</style>
    </section>
  );
}
