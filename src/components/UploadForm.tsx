import { useState } from "react";
import axios from "axios";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [renderList, setRenderList] = useState<File | null>(null);
  const [project, setProject] = useState("demo");
  const [variation, setVariation] = useState("v1");
  const [artist, setArtist] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [adminUser, setAdminUser] = useState("admin");
  const [adminPass, setAdminPass] = useState("admin");

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

    if (isDefault) {
      if (!renderList) {
        alert("Escolha uma render list para torná-la padrão");
        return;
      }
      const data = new FormData();
      data.append("renderlist", renderList);
      data.append("username", adminUser);
      data.append("password", adminPass);
      await axios.post(`${api}/renderlists/default`, data);
      alert("Render list padrão atualizada");
      return;
    }

    const data = new FormData();
    if (file) data.append("file", file);
    data.append("project", project);
    data.append("variation", variation);
    data.append("artist", artist);
    if (renderList) data.append("renderlist", renderList);
    await axios.post(`${api}/uploads/`, data);
    alert("Upload enviado!");
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <input value={project} onChange={(e) => setProject(e.target.value)} placeholder="Projeto" />
      <input value={variation} onChange={(e) => setVariation(e.target.value)} placeholder="Variação" />
      <input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Funcionário" />
      <label>
        Render list (opcional)
        <input type="file" onChange={(e) => setRenderList(e.target.files?.[0] ?? null)} />
      </label>
      <label>
        <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} /> Instalar como render list padrão
      </label>
      {isDefault && (
        <div>
          <input value={adminUser} onChange={(e) => setAdminUser(e.target.value)} placeholder="Usuário" />
          <input value={adminPass} onChange={(e) => setAdminPass(e.target.value)} type="password" placeholder="Senha" />
        </div>
      )}
      <button type="submit">Enviar</button>
    </form>
  );
}
