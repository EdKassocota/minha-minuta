import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    minutasCount: 0,
    docsCount: 0,
    docsThisMonth: 0,
    lastDocDate: 'Nenhum'
  });
  const [minutas, setMinutas] = useState([]);
  const [actividade, setActividade] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch Minutas do utilizador
        const { data: minutasData } = await supabase
          .from('minutas')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        // Fetch Documentos gerados
        const { data: docsData } = await supabase
          .from('generated_documents')
          .select('*, minutas(name)')
          .order('created_at', { ascending: false });

        const minutasTotais = minutasData ? minutasData.length : 0; // Wait, actually should count all, but let's use a count query for accuracy.
        
        const { count: totalMinutas } = await supabase
          .from('minutas')
          .select('*', { count: 'exact', head: true });
          
        const { count: totalDocs } = await supabase
          .from('generated_documents')
          .select('*', { count: 'exact', head: true });

        // Calculate current month docs
        const thisMonthDocs = (docsData || []).filter(d => {
          const date = new Date(d.created_at);
          const now = new Date();
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length;

        const lastDoc = docsData && docsData.length > 0 
          ? new Date(docsData[0].created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
          : 'Nenhum';

        setMetrics({
          minutasCount: totalMinutas || 0,
          docsCount: totalDocs || 0,
          docsThisMonth: thisMonthDocs,
          lastDocDate: lastDoc
        });

        setMinutas(minutasData || []);
        setActividade(docsData ? docsData.slice(0, 5) : []);

      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const hasData = metrics.minutasCount > 0 || metrics.docsCount > 0;

  if (loading) {
    return <div className="main-content" style={{ padding: '48px', textAlign: 'center' }}>A carregar o seu painel...</div>;
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1 className="text-display">Dashboard</h1>
        </div>
        <Link to="/app/nova-minuta" className="btn btn-primary">Nova Minuta</Link>
      </div>

      {!hasData ? (
        <div style={{ textAlign: 'center', marginTop: '120px' }}>
          <p className="text-body" style={{ color: 'var(--color-text-main)', marginBottom: '8px' }}>Ainda não tem minutas.</p>
          <p className="text-support" style={{ marginBottom: '24px' }}>Pode começar por um template pronto ou criar a sua própria minuta.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <Link to="/app/templates" className="btn btn-secondary">Explorar templates</Link>
            <Link to="/app/nova-minuta" className="btn btn-primary">Criar minuta</Link>
          </div>
        </div>
      ) : (
        <>
          {/* Métricas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
            <div className="panel" style={{ padding: '24px' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>{metrics.minutasCount}</div>
              <div className="text-label" style={{ color: 'var(--color-text-secondary)' }}>Minutas criadas</div>
            </div>
            <div className="panel" style={{ padding: '24px' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>{metrics.docsCount}</div>
              <div className="text-label" style={{ color: 'var(--color-text-secondary)' }}>Documentos gerados</div>
            </div>
            <div className="panel" style={{ padding: '24px' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>{metrics.docsThisMonth}</div>
              <div className="text-label" style={{ color: 'var(--color-text-secondary)' }}>Este mês</div>
            </div>
            <div className="panel" style={{ padding: '24px' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px', marginTop: '10px' }}>{metrics.lastDocDate}</div>
              <div className="text-label" style={{ color: 'var(--color-text-secondary)' }}>Último documento gerado</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '32px' }}>
            {/* Minutas Recentes */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 className="text-subtitle">Minutas Recentes</h2>
              </div>
              
              {minutas.length === 0 ? (
                <div className="panel" style={{ textAlign: 'center', padding: '32px' }}>
                  <p className="text-support">Nenhuma minuta criada recentemente.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Nome da Minuta</th>
                        <th>Data</th>
                        <th>Estado</th>
                        <th style={{ textAlign: 'right' }}>Acção</th>
                      </tr>
                    </thead>
                    <tbody>
                      {minutas.map((minuta) => (
                        <tr key={minuta.id}>
                          <td className="main-cell">{minuta.name}</td>
                          <td>{new Date(minuta.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                          <td>
                            <span className={`badge ${minuta.status === 'Activo' ? 'badge-active' : 'badge-draft'}`}>
                              {minuta.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <Link to={`/app/gerar/${minuta.id}`} className="btn btn-ghost" style={{ fontSize: '13px' }}>Gerar</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {minutas.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <Link to="/app/templates" className="btn btn-ghost" style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Ver todas as minutas →</Link>
                </div>
              )}
            </div>

            {/* Actividade Recente */}
            <div>
              <h2 className="text-subtitle" style={{ marginBottom: '16px' }}>Actividade Recente</h2>
              
              {actividade.length === 0 ? (
                <div className="panel" style={{ textAlign: 'center', padding: '32px' }}>
                  <p className="text-support">Nenhum documento gerado ainda.</p>
                </div>
              ) : (
                <div className="panel" style={{ padding: '0' }}>
                  {actividade.map((act, i) => (
                    <div key={act.id} style={{ padding: '16px 24px', borderBottom: i < actividade.length - 1 ? '1px solid var(--color-border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div className="text-body" style={{ fontWeight: 500, color: 'var(--color-text-main)', marginBottom: '2px' }}>{act.doc_name}</div>
                        <div className="text-micro" style={{ color: 'var(--color-text-secondary)' }}>
                          {act.minutas?.name || 'Minuta apagada'} · {new Date(act.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-ghost" style={{ fontSize: '12px' }}>PDF</button>
                        <button className="btn btn-ghost" style={{ fontSize: '12px' }}>DOCX</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
