import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

export default function Templates() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('tab') === 'user' ? 'user' : 'system';
    }
    return 'system';
  }); // 'system' | 'user'
  const [filter, setFilter] = useState('Todos');
  const [templates, setTemplates] = useState([]);
  const [myMinutas, setMyMinutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUserMinutas, setLoadingUserMinutas] = useState(false);
  const [creating, setCreating] = useState(false);
  const [viewingTemplate, setViewingTemplate] = useState(null);
  
  const filters = ['Todos', 'Jurídico', 'RH', 'Comercial', 'Imobiliário', 'Financeiro'];

  // Fetch System Templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
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

  // Fetch User's Minutas (filtered by RLS)
  const fetchMyMinutas = async () => {
    if (!user) return;
    try {
      setLoadingUserMinutas(true);
      const { data, error } = await supabase
        .from('minutas')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setMyMinutas(data || []);
    } catch (error) {
      console.error('Erro ao carregar as suas minutas:', error);
    } finally {
      setLoadingUserMinutas(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'user') {
      fetchMyMinutas();
    }
  }, [activeTab, user]);

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
          content_html: template.content || 'Conteúdo de exemplo...',
          status: 'Rascunho',
          source_type: 'template'
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

  const handleDeleteMinuta = async (minutaId) => {
    if (!confirm("Tem a certeza que deseja eliminar esta minuta permanente?")) return;
    try {
      const { error } = await supabase
        .from('minutas')
        .delete()
        .eq('id', minutaId);
      if (error) throw error;
      setMyMinutas(prev => prev.filter(m => m.id !== minutaId));
      alert("Minuta eliminada com sucesso.");
    } catch (err) {
      console.error(err);
      alert("Erro ao eliminar minuta: " + err.message);
    }
  };

  const filtered = filter === 'Todos' ? templates : templates.filter(t => t.category === filter);

  return (
    <div className="main-content">
      <div className="page-header" style={{ borderBottom: 'none', marginBottom: '8px' }}>
        <div>
          <h1 className="text-display" style={{ marginBottom: '8px' }}>Modelos e Minutas</h1>
          <p className="text-support">Gerir minutas personalizadas ou começar a partir de um documento pré-configurado do sistema.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '24px', gap: '24px' }}>
        <button 
          style={{
            padding: '12px 4px',
            fontSize: '15px',
            fontWeight: activeTab === 'system' ? 600 : 400,
            color: activeTab === 'system' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            borderBottom: activeTab === 'system' ? '2px solid var(--color-primary)' : '2px solid transparent',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onClick={() => setActiveTab('system')}
        >
          Templates do Sistema
        </button>
        <button 
          style={{
            padding: '12px 4px',
            fontSize: '15px',
            fontWeight: activeTab === 'user' ? 600 : 400,
            color: activeTab === 'user' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            borderBottom: activeTab === 'user' ? '2px solid var(--color-primary)' : '2px solid transparent',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onClick={() => setActiveTab('user')}
        >
          As Minhas Minutas
        </button>
      </div>

      {activeTab === 'system' ? (
        <>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {filters.map(f => (
              <button 
                key={f}
                className="btn" 
                style={{ 
                  backgroundColor: filter === f ? 'var(--color-bg-surface)' : 'transparent',
                  border: filter === f ? '1px solid var(--color-border)' : '1px solid transparent',
                  color: filter === f ? 'var(--color-text-main)' : 'var(--color-text-secondary)',
                  fontWeight: filter === f ? 500 : 400,
                  borderRadius: '2px'
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
            <div className="panel" style={{ textAlign: 'center', padding: '48px', borderRadius: '2px' }}>Nenhum template encontrado nesta categoria.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {filtered.map((t) => (
                <div key={t.id} className="panel" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: '2px' }}>
                  <div style={{ height: '160px', backgroundColor: 'var(--color-bg-global)', borderBottom: '1px solid var(--color-border)', position: 'relative' }}>
                    {t.cover_image_url ? (
                      <img src={t.cover_image_url} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-placeholder)' }}>
                        Sem imagem
                      </div>
                    )}
                    <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                      <span className="badge" style={{ backgroundColor: 'var(--color-bg-surface)', color: 'var(--color-text-main)', border: '1px solid var(--color-border)', fontSize: '10px', borderRadius: '2px' }}>
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
                        style={{ flex: 1, padding: '0', fontSize: '13px', borderRadius: '2px' }}
                        onClick={() => setViewingTemplate(t)}
                      >
                        Abrir
                      </button>
                      <button 
                        className="btn btn-primary" 
                        style={{ flex: 1, padding: '0', fontSize: '13px', borderRadius: '2px' }}
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
        </>
      ) : (
        <>
          {loadingUserMinutas ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>A carregar as suas minutas...</div>
          ) : myMinutas.length === 0 ? (
            <div className="panel" style={{ textAlign: 'center', padding: '48px', borderRadius: '2px' }}>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '16px' }}>Ainda não criou nenhuma minuta personalizada.</p>
              <button className="btn btn-primary" onClick={() => navigate('/app/nova-minuta')} style={{ borderRadius: '2px' }}>Criar Minuta</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {myMinutas.map((m) => (
                <div key={m.id} className="panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', borderRadius: '2px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span className="badge" style={{ fontSize: '10px', textTransform: 'uppercase', backgroundColor: m.status === 'Activo' ? 'var(--color-success-bg)' : 'var(--color-bg-global)', color: m.status === 'Activo' ? 'var(--color-success)' : 'var(--color-text-secondary)', borderColor: m.status === 'Activo' ? 'var(--color-success-border)' : 'var(--color-border)', borderRadius: '2px' }}>
                      {m.status || 'Rascunho'}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-support)' }}>
                      {new Date(m.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="text-subtitle" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '24px', flexGrow: 1, minHeight: '40px', lineHeight: '1.4' }}>
                    {m.name}
                  </h3>
                  
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <button 
                      className="btn btn-primary" 
                      style={{ flex: 1, padding: '0', fontSize: '13px', borderRadius: '2px' }}
                      onClick={() => navigate(`/app/gerar/${m.id}`)}
                    >
                      Gerar Documento
                    </button>
                    <button 
                      className="btn btn-destructive" 
                      style={{ padding: '0 12px', fontSize: '13px', borderRadius: '2px', border: '1px solid var(--color-error)' }}
                      onClick={() => handleDeleteMinuta(m.id)}
                    >
                      Apagar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal para Visualizar o Documento */}
      {viewingTemplate && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setViewingTemplate(null); }}>
          <div className="modal-content" style={{ maxWidth: '800px', height: '80vh', borderRadius: '2px' }}>
            <div className="modal-header">
              <h2 className="text-title">{viewingTemplate.name}</h2>
              <button className="btn btn-ghost" onClick={() => setViewingTemplate(null)} style={{ fontSize: '20px', padding: '0 8px', borderRadius: '2px' }}>×</button>
            </div>
            <div className="modal-body" style={{ flexGrow: 1, overflowY: 'auto', backgroundColor: 'var(--color-bg-global)' }}>
              <div className="panel" style={{ minHeight: '100%', backgroundColor: 'white', whiteSpace: 'pre-wrap', fontFamily: 'serif', fontSize: '15px', color: '#000', lineHeight: 1.6, padding: '48px', borderRadius: '2px' }}>
                {viewingTemplate.content || 'Este template ainda não possui conteúdo configurado na base de dados.'}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewingTemplate(null)} style={{ borderRadius: '2px' }}>Fechar</button>
              <button className="btn btn-primary" onClick={() => { handleUseTemplate(viewingTemplate); setViewingTemplate(null); }} disabled={creating} style={{ borderRadius: '2px' }}>
                Usar este template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
