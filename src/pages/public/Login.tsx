import { useState, type FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { authService } from '@/services/auth.service';
import avatar from '@/assets/capiii.png';
import styles from './Login.module.css';

const Login: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token, admin } = await authService.login({ email, password });
      login(token, admin);
      toast.success('Login realizado com sucesso!');
      navigate(admin.role === 'user' ? '/painel' : '/admin');
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || 'Erro ao realizar login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.grid} aria-hidden="true" />

      <Link to="/" className={styles.back}>
        <ArrowLeft size={14} /> Voltar ao site
      </Link>

      <div className={styles.card}>
        <div className={styles.avatarWrap}>
          <div className={styles.avatarRing} />
          <div className={styles.avatar}>
            <img src={avatar} alt="Capivari" />
          </div>
        </div>

        <div className={styles.eyebrow}>
          <span className={styles.eyebrowLine} />
          Acesso restrito
        </div>

        <h1 className={styles.title}>Capivari Festival</h1>
        <p className={styles.subtitle}>Entre na sua conta para acessar o painel administrativo</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email">E-mail</label>
            <div className={styles.inputWrap}>
              <Mail size={15} />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Senha</label>
            <div className={styles.inputWrap}>
              <Lock size={15} />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? (
              <span className={styles.spinner} />
            ) : (
              <>
                <LogIn size={16} /> Entrar
              </>
            )}
          </button>
        </form>

        <p className={styles.altAction}>
          Não tem conta?{' '}
          <Link to="/registro" className={styles.link}>Criar conta</Link>
        </p>

        <p className={styles.footer}>
          Capivari Festival · 4ª Edição · 2026
        </p>
      </div>
    </div>
  );
};

export default Login;
