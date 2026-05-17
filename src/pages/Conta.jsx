import React, { useState } from 'react';

export default function Conta() {
  const [tab, setTab] = useState('Perfil');
  const tabs = ['Perfil', 'Plano e Faturação', 'Segurança', 'Equipa'];

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1 className="text-display">Conta e Planos</h1>
        </div>
      </div>

      <div className="mobile-hide" style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '32px' }}>
        {tabs.map(t => (
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
          {tabs.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div style={{ maxWidth: '800px', width: '100%' }}>
        {tab === 'Perfil' && (
          <div className="panel" style={{ width: '100%' }}>
            <h2 className="text-subtitle" style={{ marginBottom: '24px' }}>Informações Pessoais</h2>
            <form>
              <div className="form-group">
                <label className="form-label">Nome Completo</label>
                <input type="text" className="form-input" defaultValue="Edgar Silva" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" defaultValue="edgar@exemplo.ao" disabled />
                <div className="text-micro" style={{ color: 'var(--color-text-support)', marginTop: '4px' }}>O email não pode ser alterado.</div>
              </div>
              <div className="form-group">
                <label className="form-label">Empresa</label>
                <input type="text" className="form-input" defaultValue="Silva & Associados" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        )}

        {tab === 'Plano e Faturação' && (
          <>
            <div className="panel" style={{ marginBottom: '32px', width: '100%' }}>
              <div className="mobile-col" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h2 className="text-subtitle">Plano actual:</h2>
                    <span className="badge badge-active">PROFISSIONAL</span>
                  </div>
                  <p className="text-support" style={{ marginBottom: '4px' }}>Renovação: 14 de Junho de 2025</p>
                  <p className="text-support">Minutas usadas: 34 / Ilimitado</p>
                </div>
                <div className="mobile-col" style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-secondary">Cancelar subscrição</button>
                  <button className="btn btn-primary">Mudar plano</button>
                </div>
              </div>
            </div>

            <h2 className="text-subtitle" style={{ marginBottom: '16px' }}>Histórico de pagamentos</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Plano</th>
                    <th>Valor</th>
                    <th>Estado</th>
                    <th style={{ textAlign: 'right' }}>Recibo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="main-cell">14 Mai 2025</td>
                    <td>Profissional</td>
                    <td>15.000 AOA</td>
                    <td><span className="badge badge-active">Pago</span></td>
                    <td style={{ textAlign: 'right' }}><button className="btn btn-ghost" style={{ fontSize: '13px' }}>Descarregar</button></td>
                  </tr>
                  <tr>
                    <td className="main-cell">14 Abr 2025</td>
                    <td>Profissional</td>
                    <td>15.000 AOA</td>
                    <td><span className="badge badge-active">Pago</span></td>
                    <td style={{ textAlign: 'right' }}><button className="btn btn-ghost" style={{ fontSize: '13px' }}>Descarregar</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'Segurança' && (
          <div className="panel" style={{ width: '100%' }}>
            <h2 className="text-subtitle" style={{ marginBottom: '24px' }}>Alterar Password</h2>
            <form>
              <div className="form-group">
                <label className="form-label">Password Actual</label>
                <input type="password" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Nova Password</label>
                <input type="password" className="form-input" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-primary">Actualizar Password</button>
              </div>
            </form>
          </div>
        )}

        {tab === 'Equipa' && (
          <div style={{ width: '100%' }}>
            <div className="mobile-col" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '16px' }}>
              <h2 className="text-subtitle">Membros da Equipa</h2>
              <button className="btn btn-primary">Convidar utilizador</button>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Função</th>
                    <th>Estado</th>
                    <th style={{ textAlign: 'right' }}>Acções</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="main-cell">Edgar Silva</td>
                    <td>edgar@exemplo.ao</td>
                    <td>Admin</td>
                    <td><span className="badge badge-active">Activo</span></td>
                    <td style={{ textAlign: 'right' }}></td>
                  </tr>
                  <tr>
                    <td className="main-cell">Ana Luísa</td>
                    <td>ana@exemplo.ao</td>
                    <td>Editor</td>
                    <td><span className="badge badge-active">Activo</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-ghost" style={{ color: 'var(--color-error)' }}>Remover</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="main-cell">Carlos M.</td>
                    <td>cm@exemplo.ao</td>
                    <td>Leitor</td>
                    <td><span className="badge badge-draft">Pendente</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-ghost" style={{ fontSize: '13px' }}>Reenviar</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
