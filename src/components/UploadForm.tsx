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

interface FormatDocumentation {
  supported_formats: {
    extension: string;
    name: string;
    description: string;
    can_convert_directly: boolean;
  }[];
  unsupported_formats: {
    extension: string;
    name: string;
    description: string;
    export_instructions: string;
  }[];
  workflows: {
    title: string;
    steps: string[];
  }[];
  software_alternatives: {
    name: string;
    url: string;
    free: boolean;
  }[];
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
  const [formatDoc, setFormatDoc] = useState<FormatDocumentation | null>(null);
  const [showFormatsHelp, setShowFormatsHelp] = useState(false);
  const [showInvalidHelp, setShowInvalidHelp] = useState<string | null>(null);
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

    // Fetch format documentation
    axios.get<FormatDocumentation>(`${api}/uploads/supported-formats`).then((res) => {
      setFormatDoc(res.data);
    }).catch(err => {
      console.error("Erro ao buscar formatos:", err);
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
    return formatDoc?.supported_formats.some(f => f.extension === ext) || false;
  }

  function getFormatExtension(filename: string): string {
    return "." + filename.split(".").pop()?.toLowerCase();
  }

  function getUnsupportedFormat(filename: string) {
    const ext = getFormatExtension(filename);
    return formatDoc?.unsupported_formats.find(f => f.extension === ext);
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
        const unsupported = getUnsupportedFormat(item.name);
        if (unsupported) {
          errors.set(item.name, `Formato ${getFormatExtension(item.name).toUpperCase()} não é aceito. Clique em "?" para ver como converter.`);
        } else {
          errors.set(item.name, "Formato não reconhecido");
        }
      }
    }

    if (errors.size > 0) {
      setValidationErrors(errors);
    } else {
      setValidationErrors(new Map());
    }

    return accepted;
  }

  async function validateFile(file: File): Promise<{ valid: boolean; message: string }> {
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (!api) return { valid: false, message: "API não configurada" };

    try {
      if (!isValidExtension(file.name)) {
        const unsupported = getUnsupportedFormat(file.name);
        return {
          valid: false,
          message: unsupported
            ? `Formato ${getFormatExtension(file.name).toUpperCase()} não aceito. ${unsupported.description}`
            : "Formato não suportado"
        };
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
      alert(`Os seguintes arquivos não são aceitos:\n\n${invalidFiles.join("\n")}\n\nClique no botão "?" para ver como converter estes arquivos para um formato aceito.`);
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();

      if (files.length === 1) {
        form.append("file", files[0]);
      } else {
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
  const acceptedExtensions = formatDoc?.supported_formats.map(f => f.extension.toUpperCase()).join(", ") || "";

  return (
    <section>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-grid">
          <label className="field">
            <span>
              Arquivos de cena ({files.length} arquivo{files.length !== 1 ? "s" : ""} selecionado{files.length !== 1 ? "s" : ""})
              <button
                type="button"
                className="help-btn"
                onClick={() => setShowFormatsHelp(true)}
                title="Ver formatos aceitos e instruções de conversão"
              >
                ?
              </button>
            </span>
            <input
              type="file"
              accept={formatDoc?.supported_formats.map(f => f.extension).join(",")}
              multiple
              onChange={(e) => setFiles(prev => [...prev, ...sanitizeFiles(e.target.files)])}
            />
            <small>
              Aceitos: {acceptedExtensions || "Carregando..."}
            </small>
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
            {validationErrors.size > 0 && (
              <div className="error-list">
                <small className="error-title">Arquivos não aceitos:</small>
                {Array.from(validationErrors.entries()).map(([name, error]) => (
                  <div key={name} className="error-item">
                    <span className="error-name">{name}</span>
                    <button
                      type="button"
                      className="help-link"
                      onClick={() => {
                        const ext = getFormatExtension(name);
                        setShowInvalidHelp(ext);
                      }}
                    >
                      Como converter?
                    </button>
                  </div>
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

      {/* Modal de Formatos Aceitos */}
      {showFormatsHelp && formatDoc && (
        <div className="modal-overlay" onClick={() => setShowFormatsHelp(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Formatos de Arquivo Aceitos</h2>
              <button className="close-btn" onClick={() => setShowFormatsHelp(false)}>✕</button>
            </div>

            <div className="modal-body">
              <section className="format-section">
                <h3>✅ Formatos Aceitos Diretamente</h3>
                <div className="format-grid">
                  {formatDoc.supported_formats.map((fmt) => (
                    <div key={fmt.extension} className="format-card accepted">
                      <span className="format-ext">{fmt.extension.toUpperCase()}</span>
                      <span className="format-name">{fmt.name}</span>
                      <span className="format-desc">{fmt.description}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="format-section">
                <h3>❌ Formatos Não Aceitos (Requerem Conversão)</h3>
                <div className="format-grid">
                  {formatDoc.unsupported_formats.map((fmt) => (
                    <div key={fmt.extension} className="format-card rejected">
                      <span className="format-ext">{fmt.extension.toUpperCase()}</span>
                      <span className="format-name">{fmt.name}</span>
                      <span className="format-desc">{fmt.description}</span>
                      <button
                        className="convert-btn"
                        onClick={() => {
                          setShowFormatsHelp(false);
                          setShowInvalidHelp(fmt.extension);
                        }}
                      >
                        Como converter →
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="format-section">
                <h3>🔄 Workflows de Conversão</h3>
                {formatDoc.workflows.map((workflow, idx) => (
                  <div key={idx} className="workflow">
                    <h4>{workflow.title}</h4>
                    <ol>
                      {workflow.steps.map((step, stepIdx) => (
                        <li key={stepIdx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                ))}
              </section>

              <section className="format-section">
                <h3>🛠️ Software de Conversão (Alternativos)</h3>
                <div className="software-grid">
                  {formatDoc.software_alternatives.map((sw) => (
                    <div key={sw.name} className="software-card">
                      <span className="sw-name">{sw.name}</span>
                      <span className="sw-price">{sw.free ? "Gratuito" : "Pago"}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Instruções de Conversão para formato específico */}
      {showInvalidHelp && formatDoc && (
        <div className="modal-overlay" onClick={() => setShowInvalidHelp(null)}>
          <div className="modal-content wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Como Converter Arquivos {showInvalidHelp.toUpperCase()}</h2>
              <button className="close-btn" onClick={() => setShowInvalidHelp(null)}>✕</button>
            </div>
            <div className="modal-body">
              {formatDoc.unsupported_formats
                .filter(fmt => fmt.extension === showInvalidHelp)
                .map(fmt => (
                  <div key={fmt.extension} className="conversion-guide">
                    <div className="guide-header">
                      <span className="guide-ext">{fmt.extension.toUpperCase()}</span>
                      <span className="guide-name">{fmt.name}</span>
                    </div>
                    <p className="guide-desc">{fmt.description}</p>
                    <div className="guide-instructions">
                      <h4>📋 Passo a Passo para Converter:</h4>
                      <pre>{fmt.export_instructions}</pre>
                    </div>
                    <div className="guide-note">
                      <strong>💡 Dica:</strong> Após converter, exporte como FBX e envie para o Spot-Render.
                    </div>
                  </div>
                ))}
            </div>
          </div>
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

        .help-btn {
          background: #e0f2fe;
          border: none;
          color: #0369a1;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          font-size: 0.8rem;
          font-weight: bold;
          cursor: pointer;
          margin-left: 0.5rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .help-btn:hover {
          background: #bae6fd;
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

        .error-list {
          margin-top: 0.75rem;
          padding: 0.75rem;
          background: #fef2f2;
          border-radius: 8px;
          border: 1px solid #fecaca;
        }

        .error-title {
          display: block;
          color: #b91c1c;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .error-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.25rem 0;
          border-bottom: 1px solid #fecaca;
        }

        .error-item:last-child {
          border-bottom: none;
        }

        .error-name {
          color: #991b1b;
          font-size: 0.85rem;
        }

        .help-link {
          background: none;
          border: none;
          color: #dc2626;
          font-size: 0.8rem;
          text-decoration: underline;
          cursor: pointer;
        }

        .help-link:hover {
          color: #991b1b;
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

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          width: 100%;
        }

        .modal-content.wide {
          max-width: 900px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          background: white;
          border-radius: 20px 20px 0 0;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.25rem;
        }

        .close-btn {
          background: #f1f5f9;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }

        .close-btn:hover {
          background: #e2e8f0;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .format-section {
          margin-bottom: 2rem;
        }

        .format-section:last-child {
          margin-bottom: 0;
        }

        .format-section h3 {
          margin: 0 0 1rem;
          font-size: 1rem;
        }

        .format-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 0.75rem;
        }

        .format-card {
          padding: 0.75rem;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .format-card.accepted {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
        }

        .format-card.rejected {
          background: #fef2f2;
          border: 1px solid #fecaca;
        }

        .format-ext {
          font-weight: 700;
          font-size: 1rem;
        }

        .format-card.accepted .format-ext {
          color: #166534;
        }

        .format-card.rejected .format-ext {
          color: #b91c1c;
        }

        .format-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: #0f172a;
        }

        .format-desc {
          font-size: 0.75rem;
          color: #64748b;
        }

        .convert-btn {
          background: #dc2626;
          color: white;
          border: none;
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          margin-top: 0.5rem;
        }

        .convert-btn:hover {
          background: #b91c1c;
        }

        .workflow {
          background: #f8fafc;
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .workflow h4 {
          margin: 0 0 0.75rem;
          font-size: 0.95rem;
        }

        .workflow ol {
          margin: 0;
          padding-left: 1.25rem;
        }

        .workflow li {
          margin-bottom: 0.35rem;
          font-size: 0.9rem;
          color: #475569;
        }

        .software-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 0.75rem;
        }

        .software-card {
          padding: 0.75rem;
          background: #f8fafc;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .sw-name {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .sw-price {
          font-size: 0.75rem;
          color: #64748b;
        }

        /* Conversion Guide Modal */
        .conversion-guide {
          background: #fef2f2;
          border-radius: 16px;
          padding: 1.5rem;
        }

        .guide-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .guide-ext {
          background: #dc2626;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 1.25rem;
        }

        .guide-name {
          font-weight: 600;
          font-size: 1.1rem;
        }

        .guide-desc {
          color: #991b1b;
          margin: 0 0 1.5rem;
        }

        .guide-instructions h4 {
          margin: 0 0 0.75rem;
          color: #0f172a;
        }

        .guide-instructions pre {
          background: #1e293b;
          color: #e2e8f0;
          padding: 1.25rem;
          border-radius: 12px;
          overflow-x: auto;
          font-size: 0.85rem;
          line-height: 1.6;
          margin: 0;
        }

        .guide-note {
          margin-top: 1rem;
          padding: 0.75rem;
          background: #fef3c7;
          border-radius: 8px;
          color: #92400e;
          font-size: 0.9rem;
        }
      `}</style>
    </section>
  );
}
