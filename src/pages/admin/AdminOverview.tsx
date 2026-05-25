import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Target, TrendingUp, Clock, CheckCircle2, BarChart3, DollarSign, AlertCircle } from 'lucide-react';
import { eventService } from '@/services/events.service';
import { projectService } from '@/services/projects.service';
import { taskService } from '@/services/tasks.service';
import { financialService } from '@/services/financial.service';
import type { Event } from '@/types/event.types';
import type { Project } from '@/types/project.types';
import type { Task } from '@/types/task.types';
import type { FinancialEntry } from '@/types/financial.types';
import styles from './AdminOverview.module.css';

const fmt = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

const AdminOverview: React.FC = () => {
  const [events, setEvents]   = useState<Event[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks]     = useState<Task[]>([]);
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [evs, projs, tks, fins] = await Promise.all([
          eventService.getAdminEvents(),
          projectService.getAdminProjects(),
          taskService.getTasks(),
          financialService.getEntries(),
        ]);
        setEvents(evs || []);
        setProjects(projs || []);
        setTasks(tks || []);
        setEntries(fins || []);
      } catch (err) {
        console.error('Erro ao carregar stats', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const upcoming = events.filter(e => new Date(e.starts_at) > now).length;
    const published = events.filter(e => e.status === 'published').length;

    const completedTasks = tasks.filter(t => t.status === 'concluida').length;
    const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    const receita = entries
      .filter(e => e.type === 'entrada' && e.payment_status === 'pago')
      .reduce((acc, e) => acc + Number(e.amount || 0), 0);

    const despesa = entries
      .filter(e => e.type === 'saida' && e.payment_status === 'pago')
      .reduce((acc, e) => acc + Number(e.amount || 0), 0);

    const saldo = receita - despesa;

    const pendente = entries
      .filter(e => e.payment_status === 'pendente')
      .reduce((acc, e) => acc + Number(e.amount || 0), 0);

    return { upcoming, published, completionRate, receita, despesa, saldo, pendente };
  }, [events, tasks, entries]);

  const L = loading;

  return (
    <div className={styles.overview}>

      <div className={styles.sectionLabel}>Conteúdo</div>
      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.icon}><Calendar size={26} strokeWidth={1.5} /></div>
          <h3 className={styles.cardTitle}>Eventos</h3>
          <p className={styles.count}>{L ? '—' : events.length}</p>
          <p className={styles.description}>cadastrados</p>
        </div>

        <div className={styles.card}>
          <div className={styles.icon}><Target size={26} strokeWidth={1.5} /></div>
          <h3 className={styles.cardTitle}>Projetos</h3>
          <p className={styles.count}>{L ? '—' : projects.length}</p>
          <p className={styles.description}>cadastrados</p>
        </div>

        <div className={styles.card}>
          <div className={styles.icon}><Clock size={26} strokeWidth={1.5} /></div>
          <h3 className={styles.cardTitle}>Próximos</h3>
          <p className={styles.count}>{L ? '—' : stats.upcoming}</p>
          <p className={styles.description}>eventos futuros</p>
        </div>

        <div className={styles.card}>
          <div className={styles.icon}><BarChart3 size={26} strokeWidth={1.5} /></div>
          <h3 className={styles.cardTitle}>Publicados</h3>
          <p className={styles.count}>{L ? '—' : stats.published}</p>
          <p className={styles.description}>eventos ativos</p>
        </div>

        <div className={styles.card}>
          <div className={styles.icon}><CheckCircle2 size={26} strokeWidth={1.5} /></div>
          <h3 className={styles.cardTitle}>Eficiência Op.</h3>
          <p className={styles.count}>{L ? '—' : `${stats.completionRate}%`}</p>
          <div className={styles.progressContainer}>
            <div className={styles.progressBar} style={{ width: `${stats.completionRate}%` }} />
          </div>
          <p className={styles.description}>tarefas concluídas</p>
        </div>
      </div>

      <div className={styles.sectionLabel}>Financeiro</div>
      <div className={styles.grid}>
        <div className={`${styles.card} ${styles.cardGreen}`}>
          <div className={styles.icon}><TrendingUp size={26} strokeWidth={1.5} /></div>
          <h3 className={styles.cardTitle}>Receita</h3>
          <p className={`${styles.count} ${styles.countGreen}`}>{L ? '—' : fmt(stats.receita)}</p>
          <p className={styles.description}>entradas pagas</p>
        </div>

        <div className={`${styles.card} ${styles.cardRed}`}>
          <div className={styles.icon}><DollarSign size={26} strokeWidth={1.5} /></div>
          <h3 className={styles.cardTitle}>Despesas</h3>
          <p className={`${styles.count} ${styles.countRed}`}>{L ? '—' : fmt(stats.despesa)}</p>
          <p className={styles.description}>saídas pagas</p>
        </div>

        <div className={`${styles.card} ${stats.saldo >= 0 ? styles.cardGreen : styles.cardRed}`}>
          <div className={styles.icon}><BarChart3 size={26} strokeWidth={1.5} /></div>
          <h3 className={styles.cardTitle}>Saldo</h3>
          <p className={`${styles.count} ${stats.saldo >= 0 ? styles.countGreen : styles.countRed}`}>
            {L ? '—' : fmt(stats.saldo)}
          </p>
          <p className={styles.description}>resultado atual</p>
        </div>

        <div className={`${styles.card} ${styles.cardOrange}`}>
          <div className={styles.icon}><AlertCircle size={26} strokeWidth={1.5} /></div>
          <h3 className={styles.cardTitle}>Pendente</h3>
          <p className={`${styles.count} ${styles.countOrange}`}>{L ? '—' : fmt(stats.pendente)}</p>
          <p className={styles.description}>a liquidar</p>
        </div>
      </div>

    </div>
  );
};

export default AdminOverview;
