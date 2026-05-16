import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/app');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            }
          }
        });
        if (signUpError) throw signUpError;
        
        // Simplesmente redireccionar ou mostrar mensagem (Supabase por defeito requer confirmação de email se activo)
        alert('Registo efectuado. Se não necessitar de confirmação de email, o login foi automático.');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err.message || 'Ocorreu um erro ao tentar autenticar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-global)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="panel" style={{ width: '100%', maxWidth: '420px', padding: '48px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src="/logo.png" alt="Minha Minuta" style={{ height: '48px', marginBottom: '24px' }} />
          <h1 className="text-title" style={{ fontSize: '17px', fontWeight: 600 }}>
            {isRegister ? 'Criar nova conta' : 'Entrar na sua conta'}
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Nome completo</label>
              <input 
                type="text" 
                className="form-input" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="form-error" style={{ marginBottom: '16px' }}>{error}</div>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
            {loading ? 'A processar...' : (isRegister ? 'Registar' : 'Entrar')}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {!isRegister && (
            <a href="#" className="text-support" style={{ fontSize: '13px', color: 'var(--color-text-support)', textDecoration: 'underline' }}>
              Esqueceu a password?
            </a>
          )}
          
          <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '8px 0' }}></div>
          
          <button 
            className="btn btn-ghost" 
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            style={{ fontSize: '13px' }}
          >
            {isRegister ? 'Já tem conta? Entrar' : 'Não tem conta? Registar-se'}
          </button>
        </div>
      </div>
    </div>
  );
}
