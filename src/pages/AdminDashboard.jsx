import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import mammoth from 'mammoth';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Utilizadores');

  // Modal State para CRUD de Templates
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Jurídico',
    cover_image_url: '',
    content: ''
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (usersError) {
          alert("Não tem permissões de administrador.");
          navigate('/app');
          return;
        }

        const { data: templatesData } = await supabase
          .from('system_templates')
          .select('*')
          .order('name');

        setUsers(usersData || []);
        setTemplates(templatesData || []);
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [navigate]);

  const handleChangeRole = async (userId, newRole) => {
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      if (error) throw error;
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      alert('Erro ao atualizar a função: ' + error.message);
    }
  };

  const handleChangePlan = async (userId, newPlan) => {
    try {
      const { error } = await supabase.from('profiles').update({ plan: newPlan }).eq('id', userId);
      if (error) throw error;
      setUsers(users.map(u => u.id === userId ? { ...u, plan: newPlan } : u));
    } catch (error) {
      alert('Erro ao atualizar o plano: ' + error.message);
    }
  };

  // Funções CRUD Templates
  const handleOpenModal = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        category: template.category,
        cover_image_url: template.cover_image_url || '',
        content: template.content || ''
      });
    } else {
      setEditingTemplate(null);
      setFormData({ name: '', category: 'Jurídico', cover_image_url: '', content: '' });
    }
    setIsModalOpen(true);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.docx')) {
      alert('Por favor, carregue apenas ficheiros DOCX.');
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      setFormData(prev => ({ ...prev, content: result.value }));
      alert('Texto extraído com sucesso do DOCX!');
    } catch (err) {
      console.error(err);
      alert('Erro ao processar o ficheiro DOCX.');
    }
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.content) {
      alert('O Nome e o Ficheiro DOCX/Conteúdo são obrigatórios.');
      return;
    }

    // Calcula os campos (tudo o que estiver entre parênteses rectos ex: [Nome])
    const fieldsCount = (formData.content.match(/\[(.*?)\]/g) || []).length;

    try {
      if (editingTemplate) {
        const { error } = await supabase
          .from('system_templates')
          .update({
            name: formData.name,
            category: formData.category,
            cover_image_url: formData.cover_image_url,
            content: formData.content,
            fields_count: fieldsCount
          })
          .eq('id', editingTemplate.id);

        if (error) throw error;
        setTemplates(templates.map(t => t.id === editingTemplate.id ? { ...t, ...formData, fields_count: fieldsCount } : t));
      } else {
        const { data, error } = await supabase
          .from('system_templates')
          .insert([{
            name: formData.name,
            category: formData.category,
            cover_image_url: formData.cover_image_url,
            content: formData.content,
            fields_count: fieldsCount
          }])
          .select()
          .single();

        if (error) throw error;
        setTemplates([...templates, data]);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert('Erro ao guardar template: ' + err.message);
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!confirm('Tem a certeza que deseja eliminar este template?')) return;
    try {
      const { error } = await supabase.from('system_templates').delete().eq('id', id);
      if (error) throw error;
      setTemplates(templates.filter(t => t.id !== id));
    } catch (err) {
      alert('Erro ao eliminar: ' + err.message);
    }
  };

  if (loading) {
    return <div className="main-content" style={{ padding: '48px', textAlign: 'center' }}>A verificar permissões...</div>;
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1 className="text-display" style={{ color: 'var(--color-primary)' }}>Gestão do Sistema (Admin)</h1>
          <p className="text-support">Gerencie utilizadores, permissões e configurações globais.</p>
        </div>
      </div>

      <div className="mobile-hide" style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '32px' }}>
        {['Utilizadores', 'Templates Globais', 'Métricas do Sistema'].map(t => (
          <button 
            key={t}
            className="btn btn-ghost"
            style={{ 
              padding: '12px 24px', 
              color: tab === t ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              borderBottom: tab === t ? '2px solid var(--color-primary)' : '2px solid transparent',
              borderRadius: 0,
              fontWeight: tab === t ? 500 : 400
            }}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Select Box para tabs no mobile */}
      <div className="mobile-only" style={{ marginBottom: '24px' }}>
        <select 
          className="form-input" 
          value={tab} 
          onChange={(e) => setTab(e.target.value)}
          style={{ height: '44px', fontWeight: 600 }}
        >
          {['Utilizadores', 'Templates Globais', 'Métricas do Sistema'].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {tab === 'Utilizadores' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="text-subtitle">Todos os Utilizadores ({users.length})</h2>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nome Completo</th>
                  <th>ID Conta</th>
                  <th>Plano</th>
                  <th>Função (Role)</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="main-cell">{u.full_name || 'Sem nome'}</td>
                    <td style={{ fontSize: '11px', fontFamily: 'monospace' }}>{u.id.substring(0, 8)}...</td>
                    <td>
                      <select 
                        className="form-input" 
                        style={{ height: '28px', padding: '0 8px', fontSize: '12px', width: 'auto' }}
                        value={u.plan || 'Essencial'}
                        onChange={(e) => handleChangePlan(u.id, e.target.value)}
                        disabled={u.id === user.id}
                      >
                        <option>Essencial</option>
                        <option>Profissional</option>
                        <option>Escritório</option>
                      </select>
                    </td>
                    <td>
                      <select 
                        className="form-input" 
                        style={{ height: '28px', padding: '0 8px', fontSize: '12px', width: 'auto', borderColor: u.role === 'admin' ? 'var(--color-primary)' : 'var(--color-border)' }}
                        value={u.role || 'user'}
                        onChange={(e) => handleChangeRole(u.id, e.target.value)}
                        disabled={u.id === user.id}
                      >
                        <option value="user">Utilizador</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'Templates Globais' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="text-subtitle">Galeria de Templates ({templates.length})</h2>
            <button className="btn btn-primary" onClick={() => handleOpenModal()}>
              Adicionar Template
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th>Campos</th>
                  <th style={{ textAlign: 'right' }}>Acções</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr key={t.id}>
                    <td className="main-cell">{t.name}</td>
                    <td>{t.category}</td>
                    <td>{t.fields_count}</td>
                    <td style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost" style={{ fontSize: '12px' }} onClick={() => handleOpenModal(t)}>Editar</button>
                      <button className="btn btn-ghost" style={{ fontSize: '12px', color: 'var(--color-error)' }} onClick={() => handleDeleteTemplate(t.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal Adicionar/Editar Template */}
          {isModalOpen && (
            <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
              <div className="modal-content">
                <div className="modal-header">
                  <h2 className="text-title">{editingTemplate ? 'Editar Template' : 'Adicionar Novo Template'}</h2>
                  <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)} style={{ fontSize: '20px', padding: '0 8px' }}>×</button>
                </div>
                <div className="modal-body">
                  <form id="template-form" onSubmit={handleSaveTemplate}>
                    <div className="form-group">
                      <label className="form-label">Nome do Documento</label>
                      <input type="text" className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Categoria</label>
                      <select className="form-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                        <option>Jurídico</option>
                        <option>RH</option>
                        <option>Comercial</option>
                        <option>Imobiliário</option>
                        <option>Financeiro</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">URL da Imagem de Capa (Opcional)</label>
                      <input type="url" className="form-input" placeholder="https://..." value={formData.cover_image_url} onChange={e => setFormData({...formData, cover_image_url: e.target.value})} />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Carregar Minuta Original (Ficheiro DOCX)</label>
                      <input 
                        type="file" 
                        accept=".docx" 
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                      />
                      <div 
                        className="panel" 
                        style={{ borderStyle: 'dashed', textAlign: 'center', cursor: 'pointer', padding: '24px' }}
                        onClick={() => fileInputRef.current.click()}
                      >
                        <span className="text-support">Clique aqui para selecionar o ficheiro .docx</span>
                      </div>
                      {formData.content && (
                        <div className="text-micro" style={{ color: 'var(--color-success)', marginTop: '8px' }}>✓ Ficheiro processado (Texto extraído)</div>
                      )}
                    </div>
                  </form>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                  <button type="submit" form="template-form" className="btn btn-primary">Guardar Template</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'Métricas do Sistema' && (
        <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="panel">
            <h3 className="text-subtitle" style={{ marginBottom: '8px' }}>Total de Utilizadores</h3>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--color-primary)' }}>{users.length}</div>
          </div>
          <div className="panel">
            <h3 className="text-subtitle" style={{ marginBottom: '8px' }}>Total de Templates</h3>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--color-primary)' }}>{templates.length}</div>
          </div>
        </div>
      )}
    </div>
  );
}
