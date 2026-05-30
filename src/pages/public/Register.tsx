import { useState, type FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowLeft, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { authService } from '@/services/auth.service';
import avatar from '@/assets/capiii.png';
import styles from './Login.module.css';

const Register: FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('As senhas não coincidem.');
      return;
    }
    if (password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      const { token, admin } = await authService.register({ name, email, password });
      login(token, admin);
      toast.success('Conta criada com sucesso!');
      navigate('/conta');
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || 'Erro ao criar conta. Tente novamente.');
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
          Criar conta
        </div>

        <h1 className={styles.title}>Capivari Festival</h1>
        <p className={styles.subtitle}>Crie sua conta para participar da comunidade</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="name">Nome</label>
            <div className={styles.inputWrap}>
              <User size={15} />
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Seu nome"
                autoComplete="name"
              />
            </div>
          </div>

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
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="confirm">Confirmar senha</label>
            <div className={styles.inputWrap}>
              <Lock size={15} />
              <input
                type="password"
                id="confirm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
          </div>

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? (
              <span className={styles.spinner} />
            ) : (
              <>
                <UserPlus size={16} /> Criar conta
              </>
            )}
          </button>
        </form>

        <p className={styles.footer}>
          Já tem conta?{' '}
          <Link to="/login" className={styles.link}>Entrar</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
