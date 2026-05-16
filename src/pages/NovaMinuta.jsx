import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NovaMinuta() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [content, setContent] = useState('');
  const [fields, setFields] = useState([]);
  const [minutaName, setMinutaName] = useState('');
  const [selectedText, setSelectedText] = useState('');

  // Simulates defining a field
  const handleAddField = () => {
    if (selectedText) {
      setFields([...fields, { name: 'Novo Campo', type: 'Texto' }]);
      setSelectedText('');
    }
  };

  const renderStep1 = () => (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '48px' }}>
      <div style={{ width: '100%', maxWidth: '560px' }}>
        <h2 className="text-title" style={{ textAlign: 'center', marginBottom: '32px' }}>Como quer começar?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div 
            className="panel" 
            style={{ textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}
            onClick={() => setStep(2)}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
          >
            <div style={{ fontWeight: 500, fontSize: '14px' }}>Escrever do zero</div>
          </div>
          <div 
            className="panel" 
            style={{ textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}
            onClick={() => setStep(2)}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
          >
            <div style={{ fontWeight: 500, fontSize: '14px' }}>Fazer upload de DOCX</div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <span className="text-support">Ou escolher um template da biblioteca</span>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
      <div className="panel" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: 0 }}>
        <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-global)', display: 'flex', gap: '16px' }}>
          <button className="btn btn-ghost">Negrito</button>
          <button className="btn btn-ghost">Itálico</button>
          <button className="btn btn-ghost">Lista</button>
        </div>
        <textarea 
          style={{ flexGrow: 1, border: 'none', padding: '24px', outline: 'none', resize: 'none', fontFamily: 'inherit', fontSize: '14px' }}
          placeholder="Comece a escrever a sua minuta aqui..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
        <button className="btn btn-primary" onClick={() => setStep(3)}>Definir Campos</button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', height: 'calc(100vh - 250px)' }}>
      <div className="panel" style={{ padding: '24px', overflowY: 'auto' }}>
        <div className="text-support" style={{ marginBottom: '16px' }}>Seleccione o texto para criar um campo editável.</div>
        <div 
          style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '14px' }}
          onMouseUp={() => {
            const text = window.getSelection().toString();
            if (text) setSelectedText(text);
          }}
        >
          {content || 'Exemplo de texto: O Sr. [Nome do Cliente], portador do BI nº [Número BI], celebrou este contrato na data [Data Contrato].'}
        </div>

        {selectedText && (
          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'var(--color-bg-global)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
            <div className="text-label" style={{ marginBottom: '12px' }}>Adicionar campo para: "{selectedText}"</div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <input type="text" className="form-input" placeholder="Nome do campo (ex: Nome do Cliente)" />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <select className="form-input">
                <option>Texto Livre</option>
                <option>Data</option>
                <option>Valor (Extenso)</option>
                <option>BI / NIF</option>
                <option>Género</option>
              </select>
            </div>
            <button className="btn btn-secondary" onClick={handleAddField}>Guardar Campo</button>
          </div>
        )}
      </div>

      <div className="panel" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-global)' }}>
          <h3 className="text-subtitle">Campos Definidos</h3>
        </div>
        <div style={{ padding: '16px', flexGrow: 1, overflowY: 'auto' }}>
          {fields.length === 0 ? (
            <div className="text-support" style={{ textAlign: 'center', marginTop: '24px' }}>Nenhum campo definido ainda.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {fields.map((f, i) => (
                <div key={i} style={{ padding: '12px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-surface)', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div className="text-label">{f.name}</div>
                    <div className="text-micro" style={{ color: 'var(--color-text-secondary)' }}>{f.type}</div>
                  </div>
                  <button className="btn btn-ghost" style={{ color: 'var(--color-error)' }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Step 4: Footer */}
      <div style={{ position: 'fixed', bottom: 0, left: '220px', right: 0, padding: '16px 24px', backgroundColor: 'var(--color-bg-surface)', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Nome da minuta..." 
            value={minutaName}
            onChange={(e) => setMinutaName(e.target.value)}
            style={{ width: '300px' }}
          />
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => {
            alert('Minuta guardada com sucesso.');
            navigate('/app');
          }}
        >
          Guardar minuta
        </button>
      </div>
    </div>
  );

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1 className="text-display">Criar Minuta</h1>
        </div>
        {step > 1 && <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>Voltar</button>}
      </div>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step >= 3 && renderStep3()}
    </div>
  );
}
