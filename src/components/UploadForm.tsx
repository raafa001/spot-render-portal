import { useState } from "react";
import axios from "axios";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [project, setProject] = useState("demo");
  const [variation, setVariation] = useState("v1");
  const [artist, setArtist] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    data.append("project", project);
    data.append("variation", variation);
    data.append("artist", artist);

    await axios.post(process.env.NEXT_PUBLIC_API_URL + "/uploads/", data);
    alert("Upload enviado!");
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <input value={project} onChange={(e) => setProject(e.target.value)} placeholder="Projeto" />
      <input value={variation} onChange={(e) => setVariation(e.target.value)} placeholder="Variação" />
      <input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Funcionário" />
      <button type="submit">Enviar</button>
    </form>
  );
}
