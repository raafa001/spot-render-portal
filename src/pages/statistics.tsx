import { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import axios from "axios";
import SpotinhoWidget from "../components/SpotinhoWidget";
import { LanguageSelector, useLanguage, getPortalText } from "../components/LanguageSelector";
import { getApiUrl } from "../utils/apiUtils";

interface JobStatistics {
  total_jobs: number;
  completed: number;
  failed: number;
  cancelled: number;
  running: number;
  queued: number;
  success_rate: number;
  avg_render_time_seconds: number;
  by_status: Record<string, number>;
  by_project: Record<string, number>;
  by_artist: Record<string, number>;
}

interface RenderedFilesStatistics {
  total_files: number;
  rendered_success: number;
  rendered_failed: number;
  validation_valid: number;
  validation_invalid: number;
  validation_pending: number;
}

interface StatisticsResponse {
  jobs: JobStatistics;
  rendered_files: RenderedFilesStatistics;
  period_start: string | null;
  period_end: string | null;
  project: string | null;
  artist: string | null;
}

interface DailyStatistics {
  date: string;
  total: number;
  completed: number;
  failed: number;
  cancelled: number;
  running: number;
  queued: number;
}

type DateRange = "today" | "7days" | "30days" | "90days" | "custom";

export default function StatisticsPage() {
  const { language } = useLanguage();
  const t = getPortalText(language.code);
  const [stats, setStats] = useState<StatisticsResponse | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>("7days");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [artistFilter, setArtistFilter] = useState("");

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    try {
      // Build date parameters
      let startDate = "";
      let endDate = "";

      const now = new Date();
      if (dateRange === "today") {
        startDate = now.toISOString().split("T")[0];
        endDate = now.toISOString().split("T")[0];
      } else if (dateRange === "7days") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate = weekAgo.toISOString().split("T")[0];
        endDate = now.toISOString().split("T")[0];
      } else if (dateRange === "30days") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        startDate = monthAgo.toISOString().split("T")[0];
        endDate = now.toISOString().split("T")[0];
      } else if (dateRange === "90days") {
        const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        startDate = threeMonthsAgo.toISOString().split("T")[0];
        endDate = now.toISOString().split("T")[0];
      } else if (dateRange === "custom" && customStartDate && customEndDate) {
        startDate = customStartDate;
        endDate = customEndDate;
      }

      // Build query params
      const params = new URLSearchParams();
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      if (projectFilter) params.append("project", projectFilter);
      if (artistFilter) params.append("artist", artistFilter);

      // Fetch summary statistics
      const statsRes = await axios.get<StatisticsResponse>(
        `${getApiUrl()}/jobs/statistics/summary?${params.toString()}`
      );
      setStats(statsRes.data);

      // Fetch daily statistics
      const days = dateRange === "today" ? 1 : dateRange === "7days" ? 7 : dateRange === "30days" ? 30 : dateRange === "90days" ? 90 : 30;
      const dailyParams = new URLSearchParams();
      dailyParams.append("days", days.toString());
      if (projectFilter) dailyParams.append("project", projectFilter);
      if (artistFilter) dailyParams.append("artist", artistFilter);

      const dailyRes = await axios.get<DailyStatistics[]>(
        `${getApiUrl()}/jobs/statistics/daily?${dailyParams.toString()}`
      );
      setDailyStats(dailyRes.data);
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, customStartDate, customEndDate, projectFilter, artistFilter]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  function formatDuration(seconds: number): string {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ${Math.round(seconds % 60)}s`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    }).format(date);
  }

  return (
    <>
      <Head>
        <title>{t.statistics.pageTitle}</title>
      </Head>
      <div className="page">
        <header className="header">
          <nav className="nav">
            <div className="brand">{t.brand}</div>
            <div className="nav__links">
              <Link href="/">{t.nav.upload}</Link>
              <Link href="/statistics">{t.nav.statistics}</Link>
              <Link href="/docs">{t.nav.techDocs}</Link>
              <a href="https://github.com/raafa001/spot-render" target="_blank" rel="noreferrer">{t.nav.repositories}</a>
              <Link href="/chat">{t.nav.spotinho}</Link>
              <LanguageSelector compact />
            </div>
          </nav>
          <h1>{t.statistics.title}</h1>
          <p>{t.statistics.subtitle}</p>
        </header>

        <div className="filters">
          <div className="filter-group">
            <label>{t.statistics.period}</label>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value as DateRange)}>
              <option value="today">{t.statistics.today}</option>
              <option value="7days">{t.statistics.last7Days}</option>
              <option value="30days">{t.statistics.last30Days}</option>
              <option value="90days">{t.statistics.last90Days}</option>
              <option value="custom">{t.statistics.custom}</option>
            </select>
          </div>

          {dateRange === "custom" && (
            <div className="filter-group">
              <label>{t.statistics.from}</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
              />
              <label>{t.statistics.to}</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
              />
            </div>
          )}

          <div className="filter-group">
            <label>{t.statistics.project}</label>
            <input
              type="text"
              placeholder={t.statistics.allProjects}
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>{t.statistics.artist}</label>
            <input
              type="text"
              placeholder={t.statistics.allArtists}
              value={artistFilter}
              onChange={(e) => setArtistFilter(e.target.value)}
            />
          </div>

          <button onClick={fetchStatistics} disabled={loading}>
            {loading ? t.status.loading : "Atualizar"}
          </button>
        </div>

        {loading ? (
          <div className="loading">{t.statistics.noData}</div>
        ) : stats ? (
          <>
            <section className="stats-grid">
              <div className="stat-card primary">
                <h3>{t.statistics.totalJobs}</h3>
                <strong className="big-number">{stats.jobs.total_jobs}</strong>
                <div className="stat-details">
                  <span className="success">{stats.jobs.completed} {t.statistics.completed.toLowerCase()}</span>
                  <span className="failed">{stats.jobs.failed} {t.statistics.failed.toLowerCase()}</span>
                  <span className="cancelled">{stats.jobs.cancelled} {t.statistics.cancelled.toLowerCase()}</span>
                </div>
              </div>

              <div className="stat-card">
                <h3>{t.statistics.successRate}</h3>
                <strong className="big-number success">{stats.jobs.success_rate.toFixed(1)}%</strong>
                <div className="stat-bar">
                  <div className="stat-bar-fill success" style={{ width: `${stats.jobs.success_rate}%` }} />
                </div>
              </div>

              <div className="stat-card">
                <h3>{t.statistics.avgRenderTime}</h3>
                <strong className="big-number">{formatDuration(stats.jobs.avg_render_time_seconds)}</strong>
                <span className="sub">por job concluído</span>
              </div>

              <div className="stat-card">
                <h3>{t.statistics.avgRenderTime}</h3>
                <strong className="big-number">{formatDuration(stats.jobs.avg_render_time_seconds)}</strong>
                <span className="sub">por job concluído</span>
              </div>

              <div className="stat-card">
                <h3>{t.statistics.running}</h3>
                <strong className="big-number">{stats.jobs.running + stats.jobs.queued}</strong>
                <div className="stat-details">
                  <span>{stats.jobs.running} {t.statistics.running.toLowerCase()}</span>
                  <span>{stats.jobs.queued} {t.statistics.queued.toLowerCase()}</span>
                </div>
              </div>

              <div className="stat-card">
                <h3>{t.statistics.filesSection}</h3>
                <strong className="big-number">{stats.rendered_files.total_files}</strong>
                <div className="stat-details">
                  <span className="success">{stats.rendered_files.rendered_success} {t.statistics.renderedSuccess.toLowerCase()}</span>
                  <span className="failed">{stats.rendered_files.rendered_failed} {t.statistics.renderedFailed.toLowerCase()}</span>
                </div>
              </div>
            </section>

            <section className="section">
              <h2>{t.statistics.byStatus}</h2>
              <div className="status-bars">
                {Object.entries(stats.jobs.by_status).map(([status, count]) => (
                  <div key={status} className="status-row">
                    <span className={`status-badge ${status}`}>{status}</span>
                    <div className="status-bar">
                      <div
                        className={`status-bar-fill ${status}`}
                        style={{ width: `${(count / stats.jobs.total_jobs) * 100}%` }}
                      />
                    </div>
                    <span className="status-count">{count}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="section">
              <h2>{t.statistics.byProject}</h2>
              <div className="project-list">
                {Object.entries(stats.jobs.by_project)
                  .sort((a, b) => b[1] - a[1])
                  .map(([project, count]) => (
                    <div key={project} className="project-row">
                      <span className="project-name">{project}</span>
                      <div className="status-bar">
                        <div
                          className="status-bar-fill primary"
                          style={{ width: `${(count / stats.jobs.total_jobs) * 100}%` }}
                        />
                      </div>
                      <span className="status-count">{count}</span>
                    </div>
                  ))}
              </div>
            </section>

            <section className="section">
              <h2>Jobs por Artista</h2>
              <div className="artist-list">
                {Object.entries(stats.jobs.by_artist)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 10)
                  .map(([artist, count]) => (
                    <div key={artist} className="artist-row">
                      <span className="artist-name">{artist}</span>
                      <div className="status-bar">
                        <div
                          className="status-bar-fill secondary"
                          style={{ width: `${(count / stats.jobs.total_jobs) * 100}%` }}
                        />
                      </div>
                      <span className="status-count">{count}</span>
                    </div>
                  ))}
              </div>
            </section>

            <section className="section">
              <h2>Evolução Diária</h2>
              <div className="daily-chart">
                {dailyStats.slice().reverse().map((day) => (
                  <div key={day.date} className="day-bar">
                    <div className="day-info">
                      <span className="day-date">{formatDate(day.date)}</span>
                      <span className="day-total">{day.total} jobs</span>
                    </div>
                    <div className="day-bars">
                      {day.completed > 0 && (
                        <div
                          className="mini-bar completed"
                          style={{ height: `${Math.min((day.completed / day.total) * 100, 100)}%` }}
                          title={`${day.completed} concluídos`}
                        />
                      )}
                      {day.failed > 0 && (
                        <div
                          className="mini-bar failed"
                          style={{ height: `${Math.min((day.failed / day.total) * 100, 100)}%` }}
                          title={`${day.failed} falharam`}
                        />
                      )}
                      {day.cancelled > 0 && (
                        <div
                          className="mini-bar cancelled"
                          style={{ height: `${Math.min((day.cancelled / day.total) * 100, 100)}%` }}
                          title={`${day.cancelled} cancelados`}
                        />
                      )}
                      {day.running > 0 && (
                        <div
                          className="mini-bar running"
                          style={{ height: `${Math.min((day.running / day.total) * 100, 100)}%` }}
                          title={`${day.running} em execução`}
                        />
                      )}
                      {day.queued > 0 && (
                        <div
                          className="mini-bar queued"
                          style={{ height: `${Math.min((day.queued / day.total) * 100, 100)}%` }}
                          title={`${day.queued} na fila`}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="chart-legend">
                <span className="legend-item"><span className="dot completed"></span> Concluídos</span>
                <span className="legend-item"><span className="dot failed"></span> Falharam</span>
                <span className="legend-item"><span className="dot cancelled"></span> Cancelados</span>
                <span className="legend-item"><span className="dot running"></span> Em execução</span>
                <span className="legend-item"><span className="dot queued"></span> Na fila</span>
              </div>
            </section>
          </>
        ) : (
          <div className="error">Erro ao carregar estatísticas</div>
        )}
      </div>

      <style jsx global>{`
        body {
          margin: 0;
          font-family: "Inter", "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
          background: #f8fafc;
          color: #0f172a;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>

      <style jsx>{`
        .page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
        }

        .header {
          margin-bottom: 2rem;
        }

        .header h1 {
          margin: 0 0 0.5rem;
          font-size: 2rem;
        }

        .header p {
          margin: 0;
          color: #64748b;
        }

        .filters {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: center;
          margin-bottom: 2rem;
          padding: 1rem;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #64748b;
        }

        .filter-group select,
        .filter-group input {
          padding: 0.5rem 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.9rem;
        }

        .filters button {
          padding: 0.5rem 1.5rem;
          background: linear-gradient(90deg, #2563eb, #7c3aed);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        .filters button:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .loading, .error {
          text-align: center;
          padding: 3rem;
          color: #64748b;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: #fff;
          border-radius: 16px;
          padding: 1.25rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .stat-card.primary {
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          color: white;
        }

        .stat-card h3 {
          margin: 0 0 0.75rem;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          opacity: 0.8;
        }

        .big-number {
          display: block;
          font-size: 2.5rem;
          font-weight: 700;
          line-height: 1;
        }

        .big-number.success {
          color: #22c55e;
        }

        .stat-card.primary .big-number.success {
          color: #bbf7d0;
        }

        .stat-details {
          margin-top: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.85rem;
          opacity: 0.9;
        }

        .sub {
          font-size: 0.8rem;
          color: #64748b;
          margin-top: 0.5rem;
        }

        .stat-bar {
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
          margin-top: 0.75rem;
        }

        .stat-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .stat-bar-fill.success {
          background: #22c55e;
        }

        .section {
          background: #fff;
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .section h2 {
          margin: 0 0 1.25rem;
          font-size: 1.25rem;
        }

        .status-bars {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .status-row {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .status-badge {
          min-width: 100px;
          padding: 0.35rem 0.75rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status-badge.completed { background: #dcfce7; color: #166534; }
        .status-badge.failed { background: #fee2e2; color: #b91c1c; }
        .status-badge.cancelled { background: #f1f5f9; color: #475569; }
        .status-badge.running { background: #ede9fe; color: #6d28d9; }
        .status-badge.queued { background: #e0f2fe; color: #0369a1; }

        .status-bar {
          flex: 1;
          height: 24px;
          background: #f1f5f9;
          border-radius: 12px;
          overflow: hidden;
        }

        .status-bar-fill {
          height: 100%;
          border-radius: 12px;
          transition: width 0.3s ease;
        }

        .status-bar-fill.completed { background: #22c55e; }
        .status-bar-fill.failed { background: #ef4444; }
        .status-bar-fill.cancelled { background: #94a3b8; }
        .status-bar-fill.running { background: #8b5cf6; }
        .status-bar-fill.queued { background: #0ea5e9; }
        .status-bar-fill.primary { background: linear-gradient(90deg, #2563eb, #7c3aed); }
        .status-bar-fill.secondary { background: #64748b; }

        .status-count {
          min-width: 50px;
          text-align: right;
          font-weight: 600;
          color: #64748b;
        }

        .project-list, .artist-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .project-row, .artist-row {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .project-name, .artist-name {
          min-width: 150px;
          font-weight: 500;
        }

        .daily-chart {
          display: flex;
          gap: 0.5rem;
          align-items: flex-end;
          height: 200px;
          padding: 1rem 0;
          overflow-x: auto;
        }

        .day-bar {
          flex: 1;
          min-width: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .day-info {
          text-align: center;
        }

        .day-date {
          display: block;
          font-size: 0.7rem;
          color: #64748b;
        }

        .day-total {
          font-size: 0.65rem;
          color: #94a3b8;
        }

        .day-bars {
          flex: 1;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: #f1f5f9;
          border-radius: 4px;
          padding: 2px;
        }

        .mini-bar {
          width: 100%;
          min-height: 2px;
          border-radius: 2px;
          transition: height 0.3s ease;
        }

        .mini-bar.completed { background: #22c55e; }
        .mini-bar.failed { background: #ef4444; }
        .mini-bar.cancelled { background: #94a3b8; }
        .mini-bar.running { background: #8b5cf6; }
        .mini-bar.queued { background: #0ea5e9; }

        .chart-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: center;
          margin-top: 1rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8rem;
          color: #64748b;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .dot.completed { background: #22c55e; }
        .dot.failed { background: #ef4444; }
        .dot.cancelled { background: #94a3b8; }
        .dot.running { background: #8b5cf6; }
        .dot.queued { background: #0ea5e9; }
      `}</style>
      <SpotinhoWidget />
    </>
  );
}
