import { type FC } from 'react';
import { MapPin, Calendar, Ticket, ExternalLink, Music } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import styles from './SobrePage.module.css';

const SobrePage: FC = () => {
  return (
    <PublicLayout>
      <div className={styles.page}>

        {/* ── Hero ── */}
        <section className={styles.hero}>
          <div className={styles.heroGlow} />
          <div className={styles.heroNoise} />
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>4ª Edição · 2026</span>
            <h1 className={styles.heroTitle}>Capivari<br />Festival</h1>
            <p className={styles.heroSub}>
              Dois dias de música, arte e cultura no coração de Minas Gerais.
            </p>
            <a
              href="https://uticket.com.br/event/01LLYG7MQNF1GQ"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.heroTicketBtn}
            >
              <Ticket size={16} /> Garantir Ingresso
            </a>
          </div>
          <div className={styles.heroDivider} />
        </section>

        {/* ── Info cards ── */}
        <section className={styles.infoSection}>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}><Calendar size={22} /></div>
              <div>
                <p className={styles.infoLabel}>Data</p>
                <p className={styles.infoValue}>13 e 14 de Junho</p>
                <p className={styles.infoSub}>2026</p>
              </div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}><MapPin size={22} /></div>
              <div>
                <p className={styles.infoLabel}>Local</p>
                <p className={styles.infoValue}>Sítio Gabriela</p>
                <p className={styles.infoSub}>Pouso Alegre — MG</p>
              </div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}><Music size={22} /></div>
              <div>
                <p className={styles.infoLabel}>Edição</p>
                <p className={styles.infoValue}>Capivari Festival</p>
                <p className={styles.infoSub}>4ª Edição Oficial</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Sobre ── */}
        <section className={styles.aboutSection}>
          <div className={styles.aboutInner}>
            <div className={styles.aboutText}>
              <span className={styles.sectionEye}>Sobre o Festival</span>
              <h2 className={styles.sectionTitle}>Uma experiência única em Minas Gerais</h2>
              <p className={styles.aboutPara}>
                O Capivari Festival é um evento de música eletrônica e cultura criado por idealizadores de Santa Rita do Sapucaí, Minas Gerais.
                Em sua 4ª edição, o festival reúne DJs, artistas e amantes da música em um ambiente ao ar livre,
                criando uma experiência imersiva de dois dias repleta de som, arte e conexão.
              </p>
              <p className={styles.aboutPara}>
                Com palcos dedicados a diferentes vertentes da música eletrônica, o festival celebra
                a diversidade cultural e consolida o Capivari como um espaço de referência na cena musical mineira.
              </p>
            </div>
            <div className={styles.aboutStats}>
              <div className={styles.statBox}>
                <span className={styles.statNum}>3K+</span>
                <span className={styles.statLabel}>Seguidores</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statNum}>2</span>
                <span className={styles.statLabel}>Dias de Festival</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statNum}>4ª</span>
                <span className={styles.statLabel}>Edição</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Atrações ── */}
        <section className={styles.attractionsSection}>
          <div className={styles.attractionsInner}>
            <span className={styles.sectionEye}>Programação</span>
            <h2 className={styles.sectionTitle}>O que esperar</h2>
            <div className={styles.attractionGrid}>
              {[
                { icon: '🎧', title: 'DJs Confirmados', desc: 'Line-up com os melhores nomes da cena eletrônica nacional.' },
                { icon: '⚡', title: 'Electronic Stage', desc: 'Palco dedicado à música eletrônica com sets ao vivo e alta energia.' },
                { icon: '🎪', title: 'Capivari Club', desc: 'Experiência noturna com sets exclusivos e ambiente imersivo.' },
                { icon: '🔊', title: 'Sound System', desc: 'Equipamento de alta qualidade para uma experiência sonora incomparável.' },
              ].map((item, i) => (
                <div key={i} className={styles.attractionCard}>
                  <span className={styles.attractionEmoji}>{item.icon}</span>
                  <h3 className={styles.attractionTitle}>{item.title}</h3>
                  <p className={styles.attractionDesc}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaGlow} />
          <div className={styles.ctaInner}>
            <h2 className={styles.ctaTitle}>Capivari Festival 2026</h2>
            <p className={styles.ctaSub}>13 e 14 de Junho · Pouso Alegre, Minas Gerais</p>
            <div className={styles.ctaBtns}>
              <a
                href="https://uticket.com.br/event/01LLYG7MQNF1GQ"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaPrimary}
              >
                <Ticket size={16} /> Comprar Ingresso
              </a>
              <a
                href="https://www.instagram.com/capivarifestival/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaSecondary}
              >
                <ExternalLink size={16} /> @capivarifestival
              </a>
            </div>
          </div>
        </section>

      </div>
    </PublicLayout>
  );
};

export default SobrePage;
