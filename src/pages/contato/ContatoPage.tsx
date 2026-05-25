import React, { useState } from 'react';
import PublicLayout from '@/components/layout/PublicLayout';
import { contactService } from '@/services/contact.service';

const s: Record<string, React.CSSProperties> = {
  hero: { padding: '120px 24px 60px', textAlign: 'center', borderBottom: '1px solid rgba(180,79,255,0.15)' },
  eye: { fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', background: 'linear-gradient(90deg,#ff4fa3,#b44fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 16 },
  h1: { fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 900, lineHeight: 1.15, paddingBottom: '0.1em', background: 'linear-gradient(135deg,#fff 0%,#b44fff 60%,#ff4fa3 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.03em', margin: '0 0 12px' },
  lead: { color: 'rgba(255,255,255,0.4)', fontSize: '1rem', margin: 0 },
  body: { maxWidth: 900, margin: '0 auto', padding: '60px 24px 100px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' },
  infoCol: { display: 'flex', flexDirection: 'column', gap: 32 },
  infoItem: { display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start', textAlign: 'left' },
  infoLabel: { fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b44fff', textAlign: 'left' },
  infoVal: { fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, textAlign: 'left' },
  formCol: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start', width: '100%' },
  label: { fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' },
  input: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', fontFamily: 'Inter,sans-serif', fontSize: '0.9rem', padding: '10px 14px', outline: 'none', width: '100%', boxSizing: 'border-box' } as React.CSSProperties,
  textarea: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', fontFamily: 'Inter,sans-serif', fontSize: '0.9rem', padding: '10px 14px', outline: 'none', width: '100%', resize: 'vertical', minHeight: 130, boxSizing: 'border-box' } as React.CSSProperties,
  btn: { background: 'linear-gradient(135deg,#b44fff 0%,#ff4fa3 100%)', color: '#fff', border: 'none', borderRadius: 100, padding: '13px 32px', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', alignSelf: 'flex-start', transition: 'opacity .2s' },
  sent: { color: '#6addb4', fontSize: '0.9rem', fontWeight: 600, padding: '12px 0' },
};

const ContatoPage: React.FC = () => {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', assunto: '', mensagem: '' });
  const [sent, setSent] = useState(false);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await contactService.submit(form);
    } catch {
      // silently ignore
    }
    setSent(true);
  };

  return (
    <PublicLayout>
      <div style={{ background: '#000', color: '#e8e8f0', minHeight: '100vh', fontFamily: 'Inter,sans-serif' }}>
        <div style={s.hero}>
          <p style={s.eye}>Fale conosco</p>
          <h1 style={s.h1}>Contato</h1>
          <p style={s.lead}>Estamos aqui para ajudar. Envie sua mensagem.</p>
        </div>

        <div style={s.body}>
          <div style={s.infoCol}>
            <div style={s.infoItem}>
              <span style={s.infoLabel}>E-mail</span>
              <span style={s.infoVal}>contato@capivarifestival.com.br</span>
            </div>
            <div style={s.infoItem}>
              <span style={s.infoLabel}>WhatsApp</span>
              <span style={s.infoVal}>(19) 99999-9999</span>
            </div>
            <div style={s.infoItem}>
              <span style={s.infoLabel}>Instagram</span>
              <span style={s.infoVal}>@capivarifestival</span>
            </div>
            <div style={s.infoItem}>
              <span style={s.infoLabel}>Localização</span>
              <span style={s.infoVal}>Capivari — MG, Brasil</span>
            </div>
            <div style={s.infoItem}>
              <span style={s.infoLabel}>Horário de atendimento</span>
              <span style={s.infoVal}>Segunda a sexta, das 9h às 18h</span>
            </div>
          </div>

          <form style={s.formCol} onSubmit={submit}>
            <div style={s.field}>
              <label style={s.label}>Nome</label>
              <input style={s.input} name="nome" value={form.nome} onChange={handle} placeholder="Seu nome" required />
            </div>
            <div style={s.field}>
              <label style={s.label}>E-mail</label>
              <input style={s.input} type="email" name="email" value={form.email} onChange={handle} placeholder="seu@email.com" required />
            </div>
            <div style={s.field}>
              <label style={s.label}>Telefone / WhatsApp</label>
              <input style={s.input} type="tel" name="telefone" value={form.telefone} onChange={handle} placeholder="(00) 00000-0000" />
            </div>
            <div style={s.field}>
              <label style={s.label}>Assunto</label>
              <input style={s.input} name="assunto" value={form.assunto} onChange={handle} placeholder="Sobre o que você quer falar?" required />
            </div>
            <div style={s.field}>
              <label style={s.label}>Mensagem</label>
              <textarea style={s.textarea} name="mensagem" value={form.mensagem} onChange={handle} placeholder="Escreva sua mensagem..." required />
            </div>
            {sent
              ? <p style={s.sent}>✓ Mensagem enviada! Entraremos em contato pelo WhatsApp em breve.</p>
              : <button type="submit" style={s.btn}>Enviar mensagem →</button>
            }
          </form>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ContatoPage;
