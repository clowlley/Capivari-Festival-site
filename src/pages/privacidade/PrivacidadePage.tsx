import React from 'react';
import PublicLayout from '@/components/layout/PublicLayout';

const s: Record<string, React.CSSProperties> = {
  hero: { padding: '120px 24px 60px', textAlign: 'center', borderBottom: '1px solid rgba(180,79,255,0.15)', position: 'relative' },
  eye: { fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', background: 'linear-gradient(90deg,#ff4fa3,#b44fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 16 },
  h1: { fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 900, background: 'linear-gradient(135deg,#fff 0%,#b44fff 60%,#ff4fa3 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.03em', margin: '0 0 12px' },
  lead: { color: 'rgba(255,255,255,0.4)', fontSize: '1rem', margin: 0 },
  body: { maxWidth: 760, margin: '0 auto', padding: '60px 24px 100px' },
  h2: { fontSize: '1.1rem', fontWeight: 700, color: '#d4a8ff', margin: '40px 0 10px', letterSpacing: '-0.01em' },
  p: { color: 'rgba(255,255,255,0.5)', fontSize: '0.92rem', lineHeight: 1.8, margin: '0 0 14px' },
  updated: { fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', marginBottom: 40 },
};

const PrivacidadePage: React.FC = () => (
  <PublicLayout>
    <div style={{ background: '#000', color: '#e8e8f0', minHeight: '100vh', fontFamily: 'Inter,sans-serif' }}>
      <div style={s.hero}>
        <p style={s.eye}>Legal</p>
        <h1 style={s.h1}>Política de Privacidade</h1>
        <p style={s.lead}>Como coletamos, usamos e protegemos seus dados.</p>
      </div>
      <div style={s.body}>
        <p style={s.updated}>Última atualização: maio de 2025</p>

        <h2 style={s.h2}>1. Informações que coletamos</h2>
        <p style={s.p}>Coletamos informações que você nos fornece diretamente, como nome, e-mail e telefone ao realizar cadastros, compras ou enviar formulários de contato. Também coletamos automaticamente dados de navegação como endereço IP, tipo de navegador e páginas visitadas.</p>

        <h2 style={s.h2}>2. Como usamos suas informações</h2>
        <p style={s.p}>Utilizamos seus dados para processar pedidos, enviar comunicações sobre eventos e projetos, melhorar nossos serviços e cumprir obrigações legais. Não vendemos nem compartilhamos seus dados pessoais com terceiros para fins comerciais.</p>

        <h2 style={s.h2}>3. Compartilhamento de dados</h2>
        <p style={s.p}>Podemos compartilhar suas informações com prestadores de serviços que nos auxiliam na operação da plataforma (como processadores de pagamento e serviços de e-mail), sempre sob acordos de confidencialidade.</p>

        <h2 style={s.h2}>4. Cookies</h2>
        <p style={s.p}>Utilizamos cookies para melhorar sua experiência de navegação, manter sessões ativas e analisar o uso da plataforma. Você pode desativar os cookies nas configurações do seu navegador, mas algumas funcionalidades podem ser afetadas.</p>

        <h2 style={s.h2}>5. Segurança</h2>
        <p style={s.p}>Adotamos medidas técnicas e organizacionais para proteger seus dados contra acesso não autorizado, perda ou divulgação indevida. No entanto, nenhum sistema é completamente inviolável.</p>

        <h2 style={s.h2}>6. Seus direitos (LGPD)</h2>
        <p style={s.p}>Em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018), você tem direito a acessar, corrigir, excluir ou portar seus dados pessoais. Para exercer esses direitos, entre em contato pelo e-mail <span style={{ color: '#b44fff' }}>contato@capivarifestival.com.br</span>.</p>

        <h2 style={s.h2}>7. Alterações nesta política</h2>
        <p style={s.p}>Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas por e-mail ou aviso destacado na plataforma. O uso continuado após as alterações implica aceitação da nova política.</p>

        <h2 style={s.h2}>8. Contato</h2>
        <p style={s.p}>Dúvidas sobre privacidade? Entre em contato: <span style={{ color: '#b44fff' }}>contato@capivarifestival.com.br</span></p>
      </div>
    </div>
  </PublicLayout>
);

export default PrivacidadePage;
