import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

export default function GerarDocumento() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    bi: '',
    data: '',
    valor: '',
    genero: 'Masculino'
  });

  const handleGenerate = (e) => {
    e.preventDefault();
    setIsGenerating(true);
    // Simulate generation delay
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
    }, 2000);
  };

  if (isGenerated) {
    return (
      <div className="main-content">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="btn btn-ghost" onClick={() => navigate('/app')}>← Voltar</button>
            <h1 className="text-display">Documento Gerado</h1>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '48px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '560px', textAlign: 'center', padding: '48px 32px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <span style={{ color: 'var(--color-success)', fontSize: '24px' }}>✓</span>
            </div>
            
            <h2 className="text-title" style={{ marginBottom: '8px' }}>Documento gerado com sucesso.</h2>
            <p className="text-support" style={{ marginBottom: '32px' }}>O ficheiro está pronto para download e foi guardado no seu histórico.</p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
              <button className="btn btn-primary" style={{ padding: '0 32px' }}>Descarregar PDF</button>
              <button className="btn btn-secondary" style={{ padding: '0 32px' }}>Descarregar DOCX</button>
            </div>
            
            <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '24px 0' }}></div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="btn btn-ghost" onClick={() => setIsGenerated(false)}>Gerar outro com esta minuta</button>
              <Link to="/app" className="btn btn-ghost">Voltar ao dashboard</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn btn-ghost" onClick={() => navigate(-1)}>← Voltar</button>
          <h1 className="text-display">Gerar documento — Contrato de Prestação de Serviços</h1>
        </div>
      </div>

      <div style={{ maxWidth: '600px' }}>
        <div className="panel" style={{ marginBottom: '24px' }}>
          <p className="text-support" style={{ marginBottom: '24px' }}>Preencha os campos abaixo</p>
          
          <form onSubmit={handleGenerate}>
            <div className="form-group">
              <label className="form-label">Nome do Cliente *</label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                required 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Género *</label>
              <select 
                className="form-input"
                value={formData.genero}
                onChange={(e) => setFormData({...formData, genero: e.target.value})}
              >
                <option>Masculino</option>
                <option>Feminino</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Número do BI *</label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.bi}
                onChange={(e) => setFormData({...formData, bi: e.target.value})}
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Data do Contrato *</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="dd / mm / aaaa"
                value={formData.data}
                onChange={(e) => setFormData({...formData, data: e.target.value})}
                required 
              />
              {formData.data && (
                <div className="text-support" style={{ marginTop: '4px' }}>12 de Maio de 2025</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Valor do Contrato (AOA) *</label>
              <input 
                type="number" 
                className="form-input" 
                value={formData.valor}
                onChange={(e) => setFormData({...formData, valor: e.target.value})}
                required 
              />
              {formData.valor && (
                <div className="text-support" style={{ marginTop: '4px' }}>
                  {formData.valor === '3000' ? 'Três mil kwanzas' : 'Valor por extenso será calculado'}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--color-border)' }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={isGenerating}>
                {isGenerating ? 'A gerar...' : 'Gerar Documento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
