import { useRef, useState, type FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Mail, User, Lock, Save, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { authService } from '@/services/auth.service';
import styles from './AccountPage.module.css';

const AccountPage: FC = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const avatarSrc = preview || user?.avatar_url || null;
  const initial = (user?.name?.[0] ?? '?').toUpperCase();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && !currentPassword) {
      toast.error('Informe sua senha atual para trocá-la.');
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      form.append('name', name);
      form.append('email', email);
      if (newPassword) {
        form.append('currentPassword', currentPassword);
        form.append('newPassword', newPassword);
      }
      if (avatarFile) form.append('avatar', avatarFile);

      const updated = await authService.updateProfile(form);
      updateUser(updated);
      setCurrentPassword('');
      setNewPassword('');
      setAvatarFile(null);
      setPreview(null);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || 'Erro ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />

      <header className={styles.topbar}>
        <Link to="/" className={styles.back}>
          <ArrowLeft size={14} /> Voltar ao site
        </Link>
        <button type="button" className={styles.logout} onClick={handleLogout}>
          <LogOut size={14} /> Sair
        </button>
      </header>

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Minha conta</h1>
          <p className={styles.subtitle}>Gerencie seu perfil da comunidade Capivari</p>
        </div>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Perfil</h2>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.avatarRow}>
              <div className={styles.avatarWrap}>
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Foto de perfil" className={styles.avatarImg} />
                ) : (
                  <span className={styles.avatarInitial}>{initial}</span>
                )}
                <button
                  type="button"
                  className={styles.avatarBtn}
                  onClick={() => fileInput.current?.click()}
                  aria-label="Alterar foto"
                >
                  <Camera size={16} />
                </button>
              </div>
              <div className={styles.avatarInfo}>
                <span className={styles.avatarName}>{user?.name}</span>
                <span className={styles.avatarEmail}>{user?.email}</span>
              </div>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                onChange={handleFile}
                hidden
              />
            </div>

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
                  autoComplete="email"
                />
              </div>
            </div>

            <div className={styles.divider}>
              <span>Trocar senha (opcional)</span>
            </div>

            <div className={styles.field}>
              <label htmlFor="currentPassword">Senha atual</label>
              <div className={styles.inputWrap}>
                <Lock size={15} />
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="newPassword">Nova senha</label>
              <div className={styles.inputWrap}>
                <Lock size={15} />
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button type="submit" className={styles.submit} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : <><Save size={16} /> Salvar alterações</>}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default AccountPage;
