import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: 'var(--color-bg-global)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header Fixo */}
      <header style={{ 
        height: '64px', 
        backgroundColor: 'var(--color-bg-surface)', 
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo.png" alt="Minha Minuta" style={{ height: '32px' }} />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a href="#funcionalidades" style={{ color: 'var(--color-text-main)', fontSize: '14px', fontWeight: 500 }}>Funcionalidades</a>
          <a href="#precos" style={{ color: 'var(--color-text-main)', fontSize: '14px', fontWeight: 500 }}>Preços</a>
          <Link to="/login" style={{ color: 'var(--color-text-main)', fontSize: '14px', fontWeight: 500 }}>Entrar</Link>
          <Link to="/login" className="btn btn-primary">Começar grátis</Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: '72px 24px', backgroundColor: 'var(--color-bg-global)', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', gap: '48px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <h1 className="text-display" style={{ fontSize: '36px', marginBottom: '16px' }}>
              Automatize a geração de documentos legais e contratos.
            </h1>
            <p className="text-title" style={{ color: 'var(--color-text-secondary)', marginBottom: '32px', fontWeight: 400 }}>
              Crie templates inteligentes a partir das suas minutas Word. Preencha formulários simples e gere documentos perfeitos em segundos. Sem erros, sem stress.
            </p>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
              <Link to="/login" className="btn btn-primary" style={{ height: '44px', padding: '0 24px', fontSize: '16px' }}>Começar grátis</Link>
              <Link to="/login" className="btn btn-secondary" style={{ height: '44px', padding: '0 24px', fontSize: '16px' }}>Ver exemplo</Link>
            </div>
            <p className="text-micro" style={{ color: 'var(--color-text-support)' }}>
              Sem cartão de crédito · Grátis para sempre
            </p>
          </div>
          <div style={{ flex: 1 }}>
            <div className="panel" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-surface)', boxShadow: 'var(--shadow-floating)' }}>
              <img src="/logo.png" alt="App Preview" style={{ opacity: 0.1, width: '50%' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Prova Social */}
      <section style={{ padding: '32px 24px', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-surface)', textAlign: 'center' }}>
        <p className="text-support" style={{ marginBottom: '16px' }}>Usado por profissionais em Angola</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: '14px' }}>
          <span>Advogados</span>
          <span>Escritórios de Contabilidade</span>
          <span>Gestores de Recursos Humanos</span>
          <span>Agências Imobiliárias</span>
        </div>
      </section>

      {/* Funcionalidades */}
      <section id="funcionalidades" style={{ padding: '72px 24px', backgroundColor: 'var(--color-bg-surface)', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <h2 className="text-display" style={{ textAlign: 'center', marginBottom: '48px' }}>Tudo o que precisa para as suas minutas</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '12px' }}>01</div>
            <h3 className="text-title" style={{ marginBottom: '8px' }}>Variáveis Inteligentes</h3>
            <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>Defina campos no seu texto. O sistema converte automaticamente valores por extenso e formata datas.</p>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '12px' }}>02</div>
            <h3 className="text-title" style={{ marginBottom: '8px' }}>Concordância de Género</h3>
            <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>Adaptação automática do texto baseando-se no género seleccionado no formulário de geração.</p>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '12px' }}>03</div>
            <h3 className="text-title" style={{ marginBottom: '8px' }}>Exportação Imediata</h3>
            <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>Descarregue os documentos gerados em formato PDF ou DOCX num clique, sempre formatados perfeitamente.</p>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section style={{ padding: '72px 24px', backgroundColor: 'var(--color-bg-global)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
          <h2 className="text-display" style={{ textAlign: 'center', marginBottom: '48px' }}>Como funciona</h2>
          
          <div style={{ display: 'flex', gap: '32px' }}>
            <div className="panel" style={{ flex: 1, padding: '32px' }}>
              <div style={{ fontSize: '48px', fontWeight: 700, color: 'var(--color-border)', lineHeight: 1, marginBottom: '16px' }}>1</div>
              <h3 className="text-title" style={{ marginBottom: '8px' }}>Importe a sua minuta</h3>
              <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>Faça o upload do seu documento Word atual ou escreva do zero no nosso editor simplificado.</p>
            </div>
            <div className="panel" style={{ flex: 1, padding: '32px' }}>
              <div style={{ fontSize: '48px', fontWeight: 700, color: 'var(--color-border)', lineHeight: 1, marginBottom: '16px' }}>2</div>
              <h3 className="text-title" style={{ marginBottom: '8px' }}>Marque as variáveis</h3>
              <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>Seleccione o texto que muda (nomes, valores, datas) e defina o tipo de campo com um clique.</p>
            </div>
            <div className="panel" style={{ flex: 1, padding: '32px' }}>
              <div style={{ fontSize: '48px', fontWeight: 700, color: 'var(--color-border)', lineHeight: 1, marginBottom: '16px' }}>3</div>
              <h3 className="text-title" style={{ marginBottom: '8px' }}>Gere documentos</h3>
              <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>Preencha o formulário rápido e descarregue o documento final em segundos, sem erros.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Preços */}
      <section id="precos" style={{ padding: '72px 24px', backgroundColor: 'var(--color-bg-surface)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
          <h2 className="text-display" style={{ textAlign: 'center', marginBottom: '48px' }}>Planos simples, sem surpresas</h2>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Funcionalidades</th>
                  <th style={{ width: '20%' }}>Essencial<br/><span style={{ fontSize: '11px', fontWeight: 400 }}>Grátis</span></th>
                  <th style={{ width: '20%', borderTop: '2px solid var(--color-primary)', backgroundColor: 'var(--color-bg-active)' }}>Profissional<br/><span style={{ fontSize: '11px', fontWeight: 400 }}>15.000 AOA /mês</span></th>
                  <th style={{ width: '20%' }}>Escritório<br/><span style={{ fontSize: '11px', fontWeight: 400 }}>35.000 AOA /mês</span></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="main-cell">Número de minutas</td>
                  <td>Até 3</td>
                  <td style={{ backgroundColor: 'var(--color-bg-active)' }}>Ilimitado</td>
                  <td>Ilimitado</td>
                </tr>
                <tr>
                  <td className="main-cell">Documentos gerados</td>
                  <td>10 / mês</td>
                  <td style={{ backgroundColor: 'var(--color-bg-active)' }}>Ilimitado</td>
                  <td>Ilimitado</td>
                </tr>
                <tr>
                  <td className="main-cell">Marca d'água PDF</td>
                  <td>Sim</td>
                  <td style={{ backgroundColor: 'var(--color-bg-active)' }}>Não</td>
                  <td>Não</td>
                </tr>
                <tr>
                  <td className="main-cell">Utilizadores</td>
                  <td>1</td>
                  <td style={{ backgroundColor: 'var(--color-bg-active)' }}>1</td>
                  <td>Até 5</td>
                </tr>
                <tr>
                  <td></td>
                  <td><Link to="/login" className="btn btn-secondary" style={{ width: '100%' }}>Começar</Link></td>
                  <td style={{ backgroundColor: 'var(--color-bg-active)' }}><Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>Subscrever</Link></td>
                  <td><Link to="/login" className="btn btn-secondary" style={{ width: '100%' }}>Contactar</Link></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#1A1D23', color: 'var(--color-text-placeholder)', padding: '48px 24px', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: 'white', fontWeight: 600, marginBottom: '16px' }}>Minha Minuta</div>
            <p className="text-support" style={{ color: 'var(--color-text-support)' }}>A ferramenta de produtividade para<br/>profissionais em Angola.</p>
          </div>
          <div style={{ display: 'flex', gap: '48px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ color: 'white', fontWeight: 500, fontSize: '14px', marginBottom: '8px' }}>Produto</span>
              <a href="#funcionalidades" style={{ color: 'inherit', fontSize: '13px' }}>Funcionalidades</a>
              <a href="#precos" style={{ color: 'inherit', fontSize: '13px' }}>Preços</a>
              <Link to="/login" style={{ color: 'inherit', fontSize: '13px' }}>Entrar</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ color: 'white', fontWeight: 500, fontSize: '14px', marginBottom: '8px' }}>Legal</span>
              <a href="#" style={{ color: 'inherit', fontSize: '13px' }}>Termos e Condições</a>
              <a href="#" style={{ color: 'inherit', fontSize: '13px' }}>Privacidade</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
