import React from 'react';
import PublicLayout from '@/components/layout/PublicLayout';

const s: Record<string, React.CSSProperties> = {
  hero: { padding: '120px 24px 60px', textAlign: 'center', borderBottom: '1px solid rgba(180,79,255,0.15)' },
  eye: { fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', background: 'linear-gradient(90deg,#ff4fa3,#b44fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 16 },
  h1: { fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 900, background: 'linear-gradient(135deg,#fff 0%,#b44fff 60%,#ff4fa3 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.03em', margin: '0 0 12px' },
  lead: { color: 'rgba(255,255,255,0.4)', fontSize: '1rem', margin: 0 },
  body: { maxWidth: 760, margin: '0 auto', padding: '60px 24px 100px' },
  h2: { fontSize: '1.1rem', fontWeight: 700, color: '#d4a8ff', margin: '40px 0 10px', letterSpacing: '-0.01em' },
  p: { color: 'rgba(255,255,255,0.5)', fontSize: '0.92rem', lineHeight: 1.8, margin: '0 0 14px' },
  updated: { fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', marginBottom: 40 },
};

const TermosPage: React.FC = () => (
  <PublicLayout>
    <div style={{ background: '#000', color: '#e8e8f0', minHeight: '100vh', fontFamily: 'Inter,sans-serif' }}>
      <div style={s.hero}>
        <p style={s.eye}>Legal</p>
        <h1 style={s.h1}>Termos de Uso</h1>
        <p style={s.lead}>Leia com atenção antes de utilizar nossa plataforma.</p>
      </div>
      <div style={s.body}>
        <p style={s.updated}>Última atualização: maio de 2025</p>

        <h2 style={s.h2}>1. Aceitação dos termos</h2>
        <p style={s.p}>Ao acessar ou utilizar o Capivari Festival, você concorda com estes Termos de Uso. Se não concordar com qualquer parte deles, não utilize nossa plataforma.</p>

        <h2 style={s.h2}>2. Uso da plataforma</h2>
        <p style={s.p}>Você se compromete a utilizar a plataforma apenas para fins lícitos e de acordo com estes termos. É vedado publicar conteúdo falso, ofensivo, difamatório, que viole direitos de terceiros ou contrário à legislação brasileira.</p>

        <h2 style={s.h2}>3. Cadastro de eventos e projetos</h2>
        <p style={s.p}>Ao cadastrar um evento ou projeto, você declara que as informações fornecidas são verídicas e que possui autorização para divulgá-las. Reservamo-nos o direito de remover conteúdos que violem estes termos sem aviso prévio.</p>

        <h2 style={s.h2}>4. Propriedade intelectual</h2>
        <p style={s.p}>Todo o conteúdo da plataforma — incluindo textos, imagens, logotipos e código — é de propriedade do Capivari Festival ou de seus respectivos autores, protegido por leis de propriedade intelectual. É proibida a reprodução sem autorização.</p>

        <h2 style={s.h2}>5. Responsabilidade</h2>
        <p style={s.p}>Não nos responsabilizamos por danos diretos ou indiretos decorrentes do uso da plataforma, pela realização ou cancelamento de eventos divulgados por terceiros, nem por informações incorretas fornecidas pelos organizadores.</p>

        <h2 style={s.h2}>6. Produtos e pedidos</h2>
        <p style={s.p}>As transações de compra de produtos são realizadas diretamente entre o comprador e o vendedor via WhatsApp. O Capivari Festival atua apenas como vitrine e não é parte da transação comercial.</p>

        <h2 style={s.h2}>7. Modificações</h2>
        <p style={s.p}>Podemos alterar estes termos a qualquer momento. As alterações entram em vigor na data de publicação. O uso continuado da plataforma após as mudanças implica aceitação dos novos termos.</p>

        <h2 style={s.h2}>8. Foro</h2>
        <p style={s.p}>Fica eleito o foro da comarca de Capivari — SP para dirimir quaisquer controvérsias oriundas destes termos, com renúncia a qualquer outro por mais privilegiado que seja.</p>
      </div>
    </div>
  </PublicLayout>
);

export default TermosPage;
