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
        <div className="form-grid">
          <label className="field">
            <span>Arquivo principal</span>
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
          <label className="field">
            <span>Projeto</span>
            <select value={project} onChange={(e) => setProject(e.target.value)}>
              {projects.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
            {selectedProject?.description && <small>{selectedProject.description}</small>}
          </label>
          <label className="field">
            <span>Variação</span>
            <input value={variation} onChange={(e) => setVariation(e.target.value)} placeholder="Variação" />
          </label>
          <label className="field">
            <span>Artista</span>
            <input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Artista" />
          </label>
          <label className="field">
            <span>Email para aviso</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@estudio.com" />
          </label>
          <label className="field">
            <span>Render list (opcional)</span>
            <input type="file" onChange={(e) => setRenderList(e.target.files?.[0] ?? null)} />
          </label>
        </div>

        <div className="preferences">
          <p>Preferências de notificação</p>
          <div className="checkbox-grid">
            <label className="checkbox">
              <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
              Receber aviso quando o job finalizar
            </label>
            <label className="checkbox">
              <input type="checkbox" checked={alwaysNotify} onChange={(e) => setAlwaysNotify(e.target.checked)} />
              Lembrar este email para próximos envios
            </label>
            <label className="checkbox">
              <input type="checkbox" checked={isCorrection} onChange={(e) => setIsCorrection(e.target.checked)} />
              Esta submissão é uma correção
            </label>
          </div>
        </div>

        <div className="default-card">
          <div>
            <p className="default-title">Render list padrão</p>
            <span>Opcional para usuários admin. Atualiza a lista que o time inteiro consome.</span>
          </div>
          <label className="checkbox">
            <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} /> Atualizar render list padrão
          </label>
          {isDefault && (
            <div className="admin-block">
              <input value={adminUser} onChange={(e) => setAdminUser(e.target.value)} placeholder="Usuário" />
              <input value={adminPass} onChange={(e) => setAdminPass(e.target.value)} type="password" placeholder="Senha" />
            </div>
          )}
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? "Enviando..." : "Enviar job"}
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
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          font-weight: 600;
          color: #0f172a;
        }

        .field small {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 400;
        }

        input,
        select {
          width: 100%;
          padding: 0.65rem 0.85rem;
          border-radius: 12px;
          border: 1px solid #d9e3f5;
          background: #f8fafc;
        }

        input[type="file"] {
          padding: 0.4rem;
          background: #fff;
        }

        .preferences {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1rem;
        }

        .preferences p {
          margin: 0 0 0.75rem;
          font-weight: 600;
          color: #0f172a;
        }

        .checkbox-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 0.75rem;
        }

        .checkbox {
          display: flex;
          gap: 0.5rem;
          align-items: flex-start;
          font-weight: 500;
          color: #475569;
        }

        .checkbox input {
          width: auto;
        }

        .default-card {
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1rem;
          background: #fff;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .default-title {
          margin: 0;
          font-weight: 600;
          color: #0f172a;
        }

        .default-card span {
          color: #64748b;
          font-size: 0.9rem;
        }

        .admin-block {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.75rem;
        }

        button {
          align-self: flex-start;
          background: linear-gradient(90deg, #2563eb, #7c3aed);
          color: white;
          border: none;
          padding: 0.75rem 1.75rem;
          border-radius: 999px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 15px 35px rgba(37, 99, 235, 0.25);
        }

        button[disabled] {
          opacity: 0.6;
          cursor: wait;
          box-shadow: none;
        }

        .upload-result {
          margin-top: 1.25rem;
          border-radius: 18px;
          border: 1px solid #bbf7d0;
          background: #f0fdf4;
          padding: 1.25rem;
        }

        .upload-result h3 {
          margin-top: 0;
        }

        code {
          background: #e2e8f0;
          padding: 0.15rem 0.35rem;
          border-radius: 6px;
        }
      `}</style>
    </section>
  );
}
