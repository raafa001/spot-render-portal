import DocLayout from "../../../components/DocLayout";

const sections = [
  { id: "formatos-aceitos", title: "Formatos Aceitos", icon: "✅" },
  { id: "formatos-conversao", title: "Requerem Conversão", icon: "🔄" },
  { id: "workflows", title: "Workflows de Conversão", icon: "📋" },
  { id: "tips", title: "Dicas", icon: "💡" },
];

export default function FormatsPage() {
  return (
    <DocLayout
      title="Formatos de Arquivo"
      description="Formatos 3D suportados e workflows de conversão"
      sections={sections}
    >
      <section id="formatos-aceitos">
        <h2>✅ Formatos Aceitos</h2>
        <p>
          Os seguintes formatos podem ser enviados diretamente ao Spot Render
          sem necessidade de conversão:
        </p>

        <div className="formats-grid">
          <div className="format-card recommended">
            <h3>.FBX - Filmbox</h3>
            <span className="badge-recommended">Recomendado</span>
            <p>
              Formato mais versátil e recomendado. Suporta malhas, materiais,
              texturas, skeleton's e animações.
            </p>
            <ul>
              <li><strong>Prós:</strong> Compatibilidade universal, mantém hierarquia</li>
              <li><strong>Contras:</strong> Arquivos maiores</li>
            </ul>
          </div>

          <div className="format-card">
            <h3>.OBJ - Wavefront</h3>
            <p>
              Formato clássico de geometria. Não suporta animações ou esqueletos,
              apenas geometria estática.
            </p>
            <ul>
              <li><strong>Prós:</strong> Simples, amplamente suportado</li>
              <li><strong>Contras:</strong> Sem animações, materiais em MTL</li>
            </ul>
          </div>

          <div className="format-card">
            <h3>.BLEND - Blender</h3>
            <p>
              Formato nativo do Blender. Pode ser enviado diretamente se você
              trabalha com Blender.
            </p>
            <ul>
              <li><strong>Prós:</strong> Preserva todas as configurações do Blender</li>
              <li><strong>Contras:</strong> Requer Blender instalado no worker</li>
            </ul>
          </div>

          <div className="format-card">
            <h3>.GLTF / .GLB</h3>
            <p>
              Formato moderno para web e real-time. Excelente para visualização
              online.
            </p>
            <ul>
              <li><strong>Prós:</strong> Leve, streaming de geometria</li>
              <li><strong>Contras:</strong> Suporte limitado a efeitos</li>
            </ul>
          </div>

          <div className="format-card">
            <h3>.3DS - 3ds Max</h3>
            <p>Formato legado do 3ds Max. Suporta malhas e materiais básicos.</p>
          </div>

          <div className="format-card">
            <h3>.STL, .PLY, .DAE, .DXF</h3>
            <p>
              Formatos de intercâmbio para geometria. Úteis para dados de
              scanners 3D e CAD.
            </p>
          </div>
        </div>
      </section>

      <section id="formatos-conversao">
        <h2>🔄 Formatos que Requerem Conversão</h2>
        <p>
          Os seguintes formatos <strong>não são aceitos</strong> diretamente e
          precisam ser convertidos para .fbx antes do envio:
        </p>

        <div className="conversion-grid">
          <div className="conversion-card">
            <h3>.MAX - 3ds Max Scene</h3>
            <span className="badge-convert">Requer 3ds Max ou exportador</span>
            <p>
              Arquivo de cena nativo do 3ds Max. Para converter:
            </p>
            <ol>
              <li>Abra o arquivo no 3ds Max</li>
              <li>Vá em <strong>File → Export → Export</strong></li>
              <li>Selecione <strong>FBX (*.fbx)</strong></li>
              <li>Nas opções, marque <strong>"Embed Media"</strong></li>
              <li>Salve e envie o .fbx</li>
            </ol>
          </div>

          <div className="conversion-card">
            <h3>.MA / .MB - Maya Scene</h3>
            <span className="badge-convert">Requer Maya ou exportador</span>
            <p>
              Arquivos de cena nativos do Maya. Para converter:
            </p>
            <ol>
              <li>Abra o arquivo no Maya</li>
              <li>Vá em <strong>File → Export All</strong></li>
              <li>Selecione <strong>FBX export</strong></li>
              <li>Nas opções, marque <strong>"Fill: Animation"</strong></li>
              <li>Salve e envie o .fbx</li>
            </ol>
          </div>

          <div className="conversion-card">
            <h3>.MS - MEL Script</h3>
            <span className="badge-convert">Não é cena 3D</span>
            <p>
              Arquivo de script MEL, não uma cena 3D. Para renderizar:
            </p>
            <ol>
              <li>Abra o script no Maya ou 3ds Max</li>
              <li>Execute para criar/modificar a cena</li>
              <li>Exporte a cena resultante como .fbx</li>
            </ol>
          </div>
        </div>
      </section>

      <section id="workflows">
        <h2>📋 Workflows de Conversão</h2>

        <h3>Do 3ds Max para Spot Render</h3>
        <pre>{`1. Abra sua cena .max no 3ds Max
2. Verifique se todas as texturas estão embedded ou paths corretos
3. File > Export > Export
4. Escolha "FBX (*.fbx)"
5. Nas opções de export:
   - Axis Format: Y-Up (padrão)
   - Embed Media: Sim (texturas)
   - Animation: Sim (se houver)
6. Salve o arquivo
7. No portal, envie o .fbx junto com a render list`}</pre>

        <h3>Do Maya para Spot Render</h3>
        <pre>{`1. Abra sua cena .ma/.mb no Maya
2. Verifique UVs e materiais
3. File > Export All
4. Escolha "FBX export"
5. Nas opções:
   - Include: Geometry + Materials + Animation
   - Bake Animation: Sim (se necessário)
6. Salve o arquivo
7. Envie ao Spot Render`}</pre>

        <h3>Do Blender para Spot Render</h3>
        <pre>{`1. Abra sua cena .blend no Blender
2. Vá em File > Export > FBX
3. Nas opções:
   - Apply Scalings: FBX All
   - Forward: -Y Forward
   - Up: Z Up
   - Apply Transform: Sim
4. Salve e envie`}</pre>
      </section>

      <section id="tips">
        <h2>💡 Dicas Importantes</h2>

        <div className="tips-list">
          <div className="tip-item">
            <h4>📦 Texturas Embutidas</h4>
            <p>
              Sempre use a opção <strong>"Embed Media"</strong> ou
              <strong>"Pack Resources"</strong> para que as texturas fiquem
              junto com o arquivo.
            </p>
          </div>

          <div className="tip-item">
            <h4>🔧 Correção de Escala</h4>
            <p>
              Se sua cena aparecer muito grande ou pequena no Spot Render,
              verifique a escala antes de exportar. O Blender usa metros,
              outros programas podem usar centímetros.
            </p>
          </div>

          <div className="tip-item">
            <h4>🎬 Animações</h4>
            <p>
              Para renders animados, marque a opção <strong>"Animation"</strong>
              na exportação. A render list deve especificar os frames corretos.
            </p>
          </div>

          <div className="tip-item">
            <h4>🧮 Hierarquia</h4>
            <p>
              Mantenha a hierarquia de objetos organizada. Isso facilita o
              debugging e permite render parcial por objeto.
            </p>
          </div>
        </div>

        <div className="help-box">
          <h4>Precisa de ajuda?</h4>
          <p>
            O <strong>Spotinho</strong> pode ajudar com dúvidas específicas
            de conversão! 😊
          </p>
          <p>
            <a href="/docs/portal/upload">Veja também a documentação de Upload →</a>
          </p>
        </div>
      </section>

      <style jsx>{`
        section {
          margin-bottom: 3rem;
        }
        h2 {
          font-size: 1.8rem;
          margin-bottom: 1rem;
          color: #1e40af;
        }
        h3 {
          font-size: 1.3rem;
          margin: 1rem 0 0.75rem;
          color: #0f172a;
        }
        h4 {
          font-size: 1.1rem;
          margin: 0 0 0.5rem;
          color: #475569;
        }
        p {
          line-height: 1.7;
          color: #475569;
        }
        ul, ol {
          color: #475569;
          line-height: 1.8;
        }
        li {
          margin-bottom: 0.5rem;
        }
        a {
          color: #2563eb;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
        .formats-grid, .conversion-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
          margin: 1.5rem 0;
        }
        .format-card, .conversion-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem;
          position: relative;
        }
        .format-card.recommended {
          border-color: #22c55e;
          background: #f0fdf4;
        }
        .format-card h3, .conversion-card h3 {
          margin: 0 0 0.75rem;
          font-size: 1.1rem;
        }
        .format-card.recommended h3 {
          color: #166534;
        }
        .badge-recommended, .badge-convert {
          display: inline-block;
          font-size: 0.7rem;
          padding: 0.2rem 0.5rem;
          border-radius: 999px;
          margin-bottom: 0.5rem;
        }
        .badge-recommended {
          background: #dcfce7;
          color: #166534;
        }
        .badge-convert {
          background: #fef3c7;
          color: #92400e;
        }
        .format-card ul {
          font-size: 0.9rem;
          margin-top: 0.75rem;
        }
        pre {
          background: #1e293b;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          font-size: 0.85rem;
          line-height: 1.6;
        }
        .tips-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .tip-item {
          background: #eff6ff;
          border-radius: 12px;
          padding: 1.25rem;
        }
        .tip-item h4 {
          color: #1e40af;
          margin-bottom: 0.5rem;
        }
        .help-box {
          background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%);
          border: 1px solid #fcd34d;
          border-radius: 16px;
          padding: 1.5rem;
          margin-top: 2rem;
        }
        .help-box h4 {
          margin: 0 0 0.5rem;
          color: #92400e;
        }
        .help-box p {
          margin: 0 0 0.5rem;
          color: #a16207;
        }
      `}</style>
    </DocLayout>
  );
}
