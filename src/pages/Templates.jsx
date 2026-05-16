import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

export default function Templates() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [filter, setFilter] = useState('Todos');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [viewingTemplate, setViewingTemplate] = useState(null);
  
  const filters = ['Todos', 'Jurídico', 'RH', 'Comercial', 'Imobiliário', 'Financeiro'];

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data, error } = await supabase
          .from('system_templates')
          .select('*')
          .order('name');
          
        if (error) throw error;
        setTemplates(data || []);
      } catch (error) {
        console.error('Erro ao carregar templates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleUseTemplate = async (template) => {
    if (!user) {
      alert("Precisa de iniciar sessão para usar templates.");
      return;
    }
    setCreating(true);
    
    try {
      const { data, error } = await supabase
        .from('minutas')
        .insert([{
          user_id: user.id,
          name: `Cópia de ${template.name}`,
          content: template.content || 'Conteúdo de exemplo...',
          status: 'Rascunho'
        }])
        .select()
        .single();
        
      if (error) throw error;
      navigate(`/app/gerar/${data.id}`);
    } catch (error) {
      console.error('Erro ao usar template:', error);
      alert('Ocorreu um erro ao tentar usar o template.');
    } finally {
      setCreating(false);
    }
  };

  const filtered = filter === 'Todos' ? templates : templates.filter(t => t.category === filter);

  return (
    <div className="main-content">
      <div className="page-header" style={{ borderBottom: 'none', marginBottom: '8px' }}>
        <div>
          <h1 className="text-display" style={{ marginBottom: '8px' }}>Templates</h1>
          <p className="text-support">Explore a nossa galeria e comece por um documento pré-configurado.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button 
            key={f}
            className="btn" 
            style={{ 
              backgroundColor: filter === f ? 'var(--color-bg-surface)' : 'transparent',
              border: filter === f ? '1px solid var(--color-border)' : '1px solid transparent',
              color: filter === f ? 'var(--color-text-main)' : 'var(--color-text-secondary)',
              fontWeight: filter === f ? 500 : 400
            }}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center' }}>A carregar galeria de templates...</div>
      ) : filtered.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: '48px' }}>Nenhum template encontrado nesta categoria.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {filtered.map((t) => (
            <div key={t.id} className="panel" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '160px', backgroundColor: 'var(--color-bg-global)', borderBottom: '1px solid var(--color-border)', position: 'relative' }}>
                {t.cover_image_url ? (
                  <img src={t.cover_image_url} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-placeholder)' }}>
                    Sem imagem
                  </div>
                )}
                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  <span className="badge" style={{ backgroundColor: 'var(--color-bg-surface)', color: 'var(--color-text-main)', border: '1px solid var(--color-border)', fontSize: '10px' }}>
                    {t.category}
                  </span>
                </div>
              </div>
              
              <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 className="text-subtitle" style={{ marginBottom: '8px', lineHeight: 1.3 }}>{t.name}</h3>
                <p className="text-micro" style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
                  Contém {t.fields_count} campos variáveis
                </p>
                
                <div style={{ marginTop: 'auto', display: 'flex', gap: '12px' }}>
                  <button 
                    className="btn btn-secondary" 
                    style={{ flex: 1, padding: '0', fontSize: '13px' }}
                    onClick={() => setViewingTemplate(t)}
                  >
                    Abrir
                  </button>
                  <button 
                    className="btn btn-primary" 
                    style={{ flex: 1, padding: '0', fontSize: '13px' }}
                    onClick={() => handleUseTemplate(t)}
                    disabled={creating}
                  >
                    {creating ? '...' : 'Usar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para Visualizar o Documento */}
      {viewingTemplate && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setViewingTemplate(null); }}>
          <div className="modal-content" style={{ maxWidth: '800px', height: '80vh' }}>
            <div className="modal-header">
              <h2 className="text-title">{viewingTemplate.name}</h2>
              <button className="btn btn-ghost" onClick={() => setViewingTemplate(null)} style={{ fontSize: '20px', padding: '0 8px' }}>×</button>
            </div>
            <div className="modal-body" style={{ flexGrow: 1, overflowY: 'auto', backgroundColor: 'var(--color-bg-global)' }}>
              <div className="panel" style={{ minHeight: '100%', backgroundColor: 'white', whiteSpace: 'pre-wrap', fontFamily: 'serif', fontSize: '15px', color: '#000', lineHeight: 1.6, padding: '48px' }}>
                {viewingTemplate.content || 'Este template ainda não possui conteúdo configurado na base de dados.'}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewingTemplate(null)}>Fechar</button>
              <button className="btn btn-primary" onClick={() => { handleUseTemplate(viewingTemplate); setViewingTemplate(null); }} disabled={creating}>
                Usar este template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
