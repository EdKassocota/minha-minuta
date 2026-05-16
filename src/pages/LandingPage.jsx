import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Check } from 'lucide-react';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div style={{ backgroundColor: 'var(--color-bg-global)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header Fixo */}
      <header style={{ 
        height: '72px', 
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
          <img src="/logo.png" alt="Minha Minuta" style={{ height: '48px' }} />
        </div>
        
        {/* Menu Desktop */}
        <div className="mobile-hide" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a href="#funcionalidades" style={{ color: 'var(--color-text-main)', fontSize: '14px', fontWeight: 500 }}>Funcionalidades</a>
          <a href="#precos" style={{ color: 'var(--color-text-main)', fontSize: '14px', fontWeight: 500 }}>Preços</a>
          <Link to="/login" style={{ color: 'var(--color-text-main)', fontSize: '14px', fontWeight: 500 }}>Entrar</Link>
          <Link to="/login" className="btn btn-primary">Começar grátis</Link>
        </div>

        {/* Menu Hamburguer Mobile */}
        <div className="mobile-only" style={{ display: 'none' }}>
          <style>{`@media (max-width: 768px) { .mobile-only { display: block !important; } }`}</style>
          <button className="btn btn-ghost" style={{ padding: '8px' }} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Menu Aberto (Mobile) */}
      {isMenuOpen && (
        <div style={{ position: 'fixed', top: '72px', left: 0, right: 0, bottom: 0, backgroundColor: 'var(--color-bg-surface)', zIndex: 99, padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <a href="#funcionalidades" style={{ color: 'var(--color-text-main)', fontSize: '18px', fontWeight: 500 }} onClick={() => setIsMenuOpen(false)}>Funcionalidades</a>
          <a href="#precos" style={{ color: 'var(--color-text-main)', fontSize: '18px', fontWeight: 500 }} onClick={() => setIsMenuOpen(false)}>Preços</a>
          <Link to="/login" style={{ color: 'var(--color-text-main)', fontSize: '18px', fontWeight: 500 }} onClick={() => setIsMenuOpen(false)}>Entrar na conta</Link>
          <Link to="/login" className="btn btn-primary" style={{ textAlign: 'center' }} onClick={() => setIsMenuOpen(false)}>Começar grátis</Link>
        </div>
      )}

      {/* Hero */}
      <section className="mobile-padding" style={{ padding: '72px 24px', backgroundColor: 'var(--color-bg-global)', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div className="mobile-col" style={{ display: 'flex', gap: '48px', alignItems: 'center' }}>
          <div className="mobile-text-center" style={{ flex: 1 }}>
            <h1 className="text-display" style={{ fontSize: '36px', marginBottom: '16px' }}>
              Automatize a geração de documentos legais e contratos.
            </h1>
            <p className="text-title" style={{ color: 'var(--color-text-secondary)', marginBottom: '32px', fontWeight: 400 }}>
              Crie templates inteligentes a partir das suas minutas Word. Preencha formulários simples e gere documentos perfeitos em segundos. Sem erros, sem stress.
            </p>
            <div className="mobile-col" style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px', justifyContent: 'center' }}>
              <Link to="/login" className="btn btn-primary" style={{ height: '44px', padding: '0 24px', fontSize: '16px', width: '100%' }}>Começar grátis</Link>
              <Link to="/login" className="btn btn-secondary" style={{ height: '44px', padding: '0 24px', fontSize: '16px', width: '100%' }}>Ver exemplo</Link>
            </div>
            <p className="text-micro" style={{ color: 'var(--color-text-support)' }}>
              Sem cartão de crédito · Grátis para sempre
            </p>
          </div>
          <div className="mobile-hide" style={{ flex: 1 }}>
            <div className="panel" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-surface)', boxShadow: 'var(--shadow-floating)' }}>
              <img src="/logo.png" alt="App Preview" style={{ opacity: 0.1, width: '50%' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Prova Social */}
      <section className="mobile-padding" style={{ padding: '32px 24px', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-surface)', textAlign: 'center' }}>
        <p className="text-support" style={{ marginBottom: '16px' }}>Usado por profissionais em Angola</p>
        <div className="mobile-col" style={{ display: 'flex', justifyContent: 'center', gap: '48px', color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: '14px' }}>
          <span>Advogados</span>
          <span>Contabilistas</span>
          <span>Gestores de RH</span>
          <span>Agências Imobiliárias</span>
        </div>
      </section>

      {/* Funcionalidades */}
      <section id="funcionalidades" className="mobile-padding" style={{ padding: '72px 24px', backgroundColor: 'var(--color-bg-surface)', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <h2 className="text-display mobile-text-center" style={{ textAlign: 'center', marginBottom: '48px' }}>Tudo o que precisa</h2>
        
        <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
          <div className="mobile-text-center">
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '12px' }}>01</div>
            <h3 className="text-title" style={{ marginBottom: '8px' }}>Variáveis Inteligentes</h3>
            <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>Defina campos no seu texto. O sistema converte automaticamente valores por extenso e formata datas.</p>
          </div>
          <div className="mobile-text-center">
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '12px' }}>02</div>
            <h3 className="text-title" style={{ marginBottom: '8px' }}>Concordância de Género</h3>
            <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>Adaptação automática do texto baseando-se no género seleccionado no formulário de geração.</p>
          </div>
          <div className="mobile-text-center">
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '12px' }}>03</div>
            <h3 className="text-title" style={{ marginBottom: '8px' }}>Exportação Imediata</h3>
            <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>Descarregue os documentos gerados em formato PDF ou DOCX num clique, sempre formatados perfeitamente.</p>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="mobile-padding" style={{ padding: '72px 24px', backgroundColor: 'var(--color-bg-global)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
          <h2 className="text-display mobile-text-center" style={{ textAlign: 'center', marginBottom: '48px' }}>Como funciona</h2>
          
          <div className="mobile-col" style={{ display: 'flex', gap: '32px' }}>
            <div className="panel mobile-text-center" style={{ flex: 1, padding: '32px' }}>
              <div style={{ fontSize: '48px', fontWeight: 700, color: 'var(--color-border)', lineHeight: 1, marginBottom: '16px' }}>1</div>
              <h3 className="text-title" style={{ marginBottom: '8px' }}>Importe a sua minuta</h3>
              <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>Faça o upload do seu documento Word atual ou escreva do zero no nosso editor simplificado.</p>
            </div>
            <div className="panel mobile-text-center" style={{ flex: 1, padding: '32px' }}>
              <div style={{ fontSize: '48px', fontWeight: 700, color: 'var(--color-border)', lineHeight: 1, marginBottom: '16px' }}>2</div>
              <h3 className="text-title" style={{ marginBottom: '8px' }}>Marque as variáveis</h3>
              <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>Seleccione o texto que muda (nomes, valores, datas) e defina o tipo de campo com um clique.</p>
            </div>
            <div className="panel mobile-text-center" style={{ flex: 1, padding: '32px' }}>
              <div style={{ fontSize: '48px', fontWeight: 700, color: 'var(--color-border)', lineHeight: 1, marginBottom: '16px' }}>3</div>
              <h3 className="text-title" style={{ marginBottom: '8px' }}>Gere documentos</h3>
              <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>Preencha o formulário rápido e descarregue o documento final em segundos, sem erros.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Preços (Destaque Adicionado) */}
      <section id="precos" className="mobile-padding" style={{ padding: '80px 24px', backgroundColor: 'var(--color-bg-surface)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
          <h2 className="text-display mobile-text-center" style={{ textAlign: 'center', marginBottom: '16px' }}>Planos simples, sem surpresas</h2>
          <p className="text-body mobile-text-center" style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginBottom: '48px' }}>Escolha o plano ideal para as necessidades da sua equipa e do seu escritório.</p>
          
          <div className="mobile-col" style={{ display: 'flex', gap: '24px', justifyContent: 'center', alignItems: 'center' }}>
            {/* Card 1 */}
            <div className="panel" style={{ flex: 1, padding: '40px 32px', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '420px', width: '100%' }}>
              <h3 className="text-subtitle" style={{ color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Essencial</h3>
              <div style={{ fontSize: '36px', fontWeight: 800, marginBottom: '24px' }}>Grátis</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', color: 'var(--color-text-main)', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '15px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Check size={20} color="var(--color-primary)" /> Até 3 minutas</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Check size={20} color="var(--color-primary)" /> 10 Documentos / mês</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Check size={20} color="var(--color-primary)" /> 1 Utilizador</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-placeholder)' }}><Check size={20} color="currentColor" /> Marca d'água no PDF</li>
              </ul>
              <Link to="/login" className="btn btn-secondary" style={{ width: '100%', marginTop: 'auto', padding: '12px' }}>Começar agora</Link>
            </div>

            {/* Card 2 - DESTAQUE */}
            <div className="panel" style={{ flex: 1.1, padding: '48px 32px', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '460px', width: '100%', border: '2px solid var(--color-primary)', boxShadow: '0 20px 40px rgba(52,100,154,0.15)', transform: 'scale(1.03)', zIndex: 10, position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--color-primary)', color: 'white', padding: '6px 20px', borderRadius: '100px', fontSize: '12px', fontWeight: 600, letterSpacing: '1px' }}>MAIS POPULAR</div>
              <h3 className="text-subtitle" style={{ color: 'var(--color-primary)', marginBottom: '8px' }}>Profissional</h3>
              <div style={{ fontSize: '36px', fontWeight: 800, marginBottom: '24px' }}>15.000 AOA<span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 400 }}> / mês</span></div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', color: 'var(--color-text-main)', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '15px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Check size={20} color="var(--color-primary)" /> Minutas Ilimitadas</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Check size={20} color="var(--color-primary)" /> Documentos Ilimitados</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Check size={20} color="var(--color-primary)" /> 1 Utilizador</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Check size={20} color="var(--color-primary)" /> Sem Marca d'água</li>
              </ul>
              <Link to="/login" className="btn btn-primary" style={{ width: '100%', marginTop: 'auto', padding: '12px' }}>Subscrever Plano</Link>
            </div>

            {/* Card 3 */}
            <div className="panel" style={{ flex: 1, padding: '40px 32px', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '420px', width: '100%' }}>
              <h3 className="text-subtitle" style={{ color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Escritório</h3>
              <div style={{ fontSize: '36px', fontWeight: 800, marginBottom: '24px' }}>35.000 AOA<span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 400 }}> / mês</span></div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', color: 'var(--color-text-main)', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '15px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Check size={20} color="var(--color-primary)" /> Tudo do Profissional</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Check size={20} color="var(--color-primary)" /> Até 5 Utilizadores</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Check size={20} color="var(--color-primary)" /> Gestão de Equipa</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Check size={20} color="var(--color-primary)" /> Suporte Prioritário</li>
              </ul>
              <Link to="/login" className="btn btn-secondary" style={{ width: '100%', marginTop: 'auto', padding: '12px' }}>Contactar vendas</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#1A1D23', color: 'var(--color-text-placeholder)', padding: '48px 24px', marginTop: 'auto' }}>
        <div className="mobile-col" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', gap: '32px' }}>
          <div>
            <div style={{ color: 'white', fontWeight: 600, marginBottom: '16px' }}>Minha Minuta</div>
            <p className="text-support" style={{ color: 'var(--color-text-support)' }}>A ferramenta de produtividade para<br/>profissionais em Angola.</p>
          </div>
          <div className="mobile-col" style={{ display: 'flex', gap: '48px' }}>
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
