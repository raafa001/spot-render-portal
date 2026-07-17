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
  is_multi_file: boolean;
  total_files: number;
}

interface SupportedFormats {
  extensions: string[];
  total: number;
}

const EMAIL_PREF_KEY = "spotrenderAlwaysNotify";
const EMAIL_VALUE_KEY = "spotrenderDefaultEmail";

export default function UploadForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [renderList, setRenderList] = useState<File | null>(null);
  const [projects, setProjects] = useState<ProjectRoute[]>([]);
  const [project, setProject] = useState("demo");
  const [variation, setVariation] = useState("v1");
  const [artist, setArtist] = useState("");
  const [email, setEmail] = useState("");
  const [notify, setNotify] = useState(false);
  const [alwaysNotify, setAlwaysNotify] = useState(false);
  const [isCorrection, setIsCorrection] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastJob, setLastJob] = useState<JobResponse | null>(null);
  const [supportedFormats, setSupportedFormats] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (!api) return;

    // Fetch projects
    axios.get<ProjectRoute[]>(`${api}/projects/`).then((res) => {
      setProjects(res.data);
      if (res.data.length > 0) {
        setProject(res.data[0].name);
      }
    });

    // Fetch supported formats
    axios.get<SupportedFormats>(`${api}/uploads/supported-formats`).then((res) => {
      setSupportedFormats(res.data.extensions);
    });

    // Load saved preferences
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

  function isValidExtension(filename: string): boolean {
    const ext = "." + filename.split(".").pop()?.toLowerCase();
    return supportedFormats.includes(ext);
  }

  function sanitizeFiles(list: FileList | null): File[] {
    if (!list) return [];
    const selected = Array.from(list);
    const accepted: File[] = [];
    const errors = new Map<string, string>();

    for (const item of selected) {
      if (isValidExtension(item.name)) {
        accepted.push(item);
      } else {
        errors.set(item.name, "Formato não suportado");
      }
    }

    if (errors.size > 0) {
      setValidationErrors(errors);
      const errorList = Array.from(errors.keys()).join(", ");
      alert(`Alguns arquivos foram rejeitados por terem formatos não suportados:\n${errorList}\n\nFormatos aceitos: ${supportedFormats.join(", ")}`);
    } else {
      setValidationErrors(new Map());
    }

    return accepted;
  }

  async function validateFile(file: File): Promise<{ valid: boolean; message: string }> {
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (!api) return { valid: false, message: "API não configurada" };

    try {
      // Para validação real, precisaríamos enviar o arquivo para o servidor
      // Por ora, vamos apenas validar a extensão
      if (!isValidExtension(file.name)) {
        return { valid: false, message: "Formato não suportado" };
      }
      return { valid: true, message: "OK" };
    } catch (error) {
      return { valid: false, message: "Erro ao validar arquivo" };
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!files.length) {
      alert("Selecione pelo menos um arquivo renderizável");
      return;
    }
    if (!renderList) {
      alert("Anexe uma render list (obrigatória)");
      return;
    }

    const api = process.env.NEXT_PUBLIC_API_URL;
    if (!api) {
      alert("NEXT_PUBLIC_API_URL não configurado");
      return;
    }

    // Valida todos os arquivos
    const invalidFiles: string[] = [];
    for (const file of files) {
      const result = await validateFile(file);
      if (!result.valid) {
        invalidFiles.push(`${file.name}: ${result.message}`);
      }
    }

    if (invalidFiles.length > 0) {
      alert(`Os seguintes arquivos são inválidos e serão rejeitados:\n${invalidFiles.join("\n")}\n\nRemova estes arquivos e tente novamente.`);
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();

      if (files.length === 1) {
        // Upload simples
        form.append("file", files[0]);
      } else {
        // Upload multi-arquivo
        for (const file of files) {
          form.append("files", file);
        }
      }

      form.append("project", project);
      form.append("variation", variation);
      form.append("artist", artist || "unknown");
      form.append("notify_on_complete", notify ? "true" : "false");
      form.append("always_notify", alwaysNotify ? "true" : "false");
      if (email) form.append("email", email);
      if (isCorrection) form.append("is_correction", "true");
      form.append("renderlist", renderList);

      const endpoint = files.length > 1 ? `${api}/uploads/multi` : `${api}/uploads/`;
      const response = await axios.post<JobResponse>(endpoint, form);

      setLastJob(response.data);

      const msg = files.length > 1
        ? `${files.length} arquivos enviados!`
        : "Upload enviado!";

      alert(msg);
      setFiles([]);
      setRenderList(null);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const detail = error.response?.data?.detail;
        alert(detail || "Falha ao enviar job. Verifique os arquivos e tente novamente.");
      } else {
        alert("Falha desconhecida ao enviar o job");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const selectedProject = projects.find((p) => p.name === project);

  return (
    <section>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-grid">
          <label className="field">
            <span>Arquivos de cena ({files.length} selecionado{s files.length !== 1 ? "s" : ""})</span>
            <input
              type="file"
              accept={supportedFormats.join(",")}
              multiple
              onChange={(e) => setFiles(prev => [...prev, ...sanitizeFiles(e.target.files)])}
            />
            <small>Formatos aceitos: {supportedFormats.join(", ")}</small>
            {!!files.length && (
              <div className="file-chips">
                {files.map((f, index) => (
                  <span key={f.name + index} className="file-chip">
                    {f.name}
                    <button
                      type="button"
                      className="remove-file"
                      onClick={() => removeFile(index)}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
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
            <span>Render list (obrigatória)</span>
            <input type="file" accept=".csv,.xlsx" required onChange={(e) => setRenderList(e.target.files?.[0] ?? null)} />
            <small>Somente CSV ou XLSX.</small>
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

        <button type="submit" disabled={submitting || files.length === 0}>
          {submitting ? "Enviando..." : files.length > 1 ? `Enviar ${files.length} arquivos` : "Enviar job"}
        </button>
      </form>

      {lastJob && (
        <div className="upload-result">
          <h3>Última tarefa enviada</h3>
          <p>
            Projeto <strong>{lastJob.project}</strong> – status: {lastJob.stage_message}
          </p>
          {lastJob.is_multi_file && (
            <p>
              <strong>{lastJob.total_files}</strong> arquivo(s) enviados
            </p>
          )}
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

        .file-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          margin-top: 0.5rem;
        }

        .file-chip {
          background: rgba(37, 99, 235, 0.12);
          color: #1d4ed8;
          padding: 0.25rem 0.5rem;
          border-radius: 999px;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .remove-file {
          background: none;
          border: none;
          color: #1d4ed8;
          cursor: pointer;
          padding: 0;
          font-size: 0.7rem;
          opacity: 0.7;
        }

        .remove-file:hover {
          opacity: 1;
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
