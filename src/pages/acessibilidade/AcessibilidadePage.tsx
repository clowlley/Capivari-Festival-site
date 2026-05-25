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
  ul: { color: 'rgba(255,255,255,0.5)', fontSize: '0.92rem', lineHeight: 1.8, margin: '0 0 14px', paddingLeft: 20 },
  updated: { fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', marginBottom: 40 },
};

const AcessibilidadePage: React.FC = () => (
  <PublicLayout>
    <div style={{ background: '#000', color: '#e8e8f0', minHeight: '100vh', fontFamily: 'Inter,sans-serif' }}>
      <div style={s.hero}>
        <p style={s.eye}>Inclusão</p>
        <h1 style={s.h1}>Acessibilidade</h1>
        <p style={s.lead}>Nosso compromisso com uma experiência inclusiva para todos.</p>
      </div>
      <div style={s.body}>
        <p style={s.updated}>Última atualização: maio de 2025</p>

        <h2 style={s.h2}>Nosso compromisso</h2>
        <p style={s.p}>O Capivari Festival está comprometido em garantir que nossa plataforma seja acessível ao maior número possível de pessoas, independentemente de habilidade, tecnologia ou contexto de uso. Buscamos seguir as diretrizes WCAG 2.1 nível AA.</p>

        <h2 style={s.h2}>Recursos de acessibilidade</h2>
        <ul style={s.ul}>
          <li>Contraste de cores adequado em todos os elementos de texto</li>
          <li>Navegação completa por teclado (Tab, Enter, Esc)</li>
          <li>Textos alternativos em imagens e ícones</li>
          <li>Estrutura semântica com uso correto de headings (h1–h4)</li>
          <li>Labels descritivos em todos os campos de formulário</li>
          <li>Compatibilidade com leitores de tela (NVDA, JAWS, VoiceOver)</li>
          <li>Fontes redimensionáveis sem perda de funcionalidade</li>
          <li>Foco visível destacado em elementos interativos</li>
        </ul>

        <h2 style={s.h2}>Tecnologias assistivas compatíveis</h2>
        <p style={s.p}>Nossa plataforma foi testada com as seguintes tecnologias assistivas:</p>
        <ul style={s.ul}>
          <li>NVDA com Firefox no Windows</li>
          <li>VoiceOver com Safari no macOS e iOS</li>
          <li>TalkBack no Android</li>
          <li>Zoom de navegador até 200% sem perda de conteúdo</li>
        </ul>

        <h2 style={s.h2}>Limitações conhecidas</h2>
        <p style={s.p}>Algumas partes da plataforma podem ainda não atingir o nível ideal de acessibilidade. Estamos trabalhando continuamente para identificar e corrigir essas limitações. Se encontrar alguma barreira, por favor nos informe.</p>

        <h2 style={s.h2}>Como reportar problemas</h2>
        <p style={s.p}>Se você encontrar qualquer dificuldade de acessibilidade ao usar nossa plataforma, entre em contato:</p>
        <ul style={s.ul}>
          <li>E-mail: <span style={{ color: '#b44fff' }}>contato@capivarifestival.com.br</span></li>
          <li>WhatsApp: (19) 99999-9999</li>
        </ul>
        <p style={s.p}>Descreva o problema encontrado, a página onde ocorreu e a tecnologia assistiva utilizada. Respondemos em até 5 dias úteis.</p>

        <h2 style={s.h2}>Padrões e referências</h2>
        <p style={s.p}>Esta plataforma busca conformidade com as Diretrizes de Acessibilidade para Conteúdo Web (WCAG) 2.1, nível AA, publicadas pelo W3C, e com o modelo de acessibilidade em Governo Eletrônico (eMAG) do Governo Federal Brasileiro.</p>
      </div>
    </div>
  </PublicLayout>
);

export default AcessibilidadePage;
