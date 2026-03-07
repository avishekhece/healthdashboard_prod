import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { PlusCircle, RefreshCw, Activity, CheckCircle2, XCircle, Clock } from 'lucide-react'

function StatusBadge({ status }) {
    const cls = status === 'UP' ? 'up' : status === 'DOWN' ? 'down' : 'unknown'
    return (
        <span className={`badge ${cls}`}>
            <span className="status-dot" />
            {status}
        </span>
    )
}

function ServiceCard({ service, onCheckNow }) {
    const [checking, setChecking] = useState(false)

    const handleCheck = async (e) => {
        e.preventDefault()
        setChecking(true)
        await onCheckNow(service.id)
        setChecking(false)
    }

    return (
        <Link to={`/services/${service.id}`} className="card service-card">
            <div className="service-card-header">
                <div>
                    <div className="service-name">{service.name}</div>
                    <div className="service-env">{service.environment}</div>
                </div>
                <StatusBadge status={service.currentStatus} />
            </div>
            <div className="service-url">{service.baseUrl}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="service-metrics">
                    <div className="metric">
                        <span className="m-label">Response</span>
                        <span className="m-value" style={{ color: 'var(--blue)' }}>
                            {service.lastResponseTimeMs != null ? `${service.lastResponseTimeMs}ms` : '—'}
                        </span>
                    </div>
                    <div className="metric">
                        <span className="m-label">Last Check</span>
                        <span className="m-value" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            {service.lastCheckedAt
                                ? new Date(service.lastCheckedAt).toLocaleTimeString()
                                : 'Never'}
                        </span>
                    </div>
                </div>
                <button
                    className="btn btn-ghost btn-sm btn-icon"
                    onClick={handleCheck}
                    disabled={checking}
                    title="Check now"
                    style={{ width: 34, height: 34 }}
                >
                    <RefreshCw size={14} style={{ animation: checking ? 'spin 0.7s linear infinite' : 'none' }} />
                </button>
            </div>
        </Link>
    )
}

export default function Dashboard() {
    const { user } = useAuth()
    const [services, setServices] = useState([])
    const [summary, setSummary] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchData = useCallback(async () => {
        try {
            const [svcRes, sumRes] = await Promise.all([
                api.get('/services'),
                api.get('/dashboard/summary'),
            ])
            setServices(svcRes.data)
            setSummary(sumRes.data)
        } catch {
            toast.error('Failed to load dashboard')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
        const interval = setInterval(fetchData, 30000) // refresh every 30s
        return () => clearInterval(interval)
    }, [fetchData])

    const handleCheckNow = async (id) => {
        try {
            await api.post(`/services/${id}/check-now`)
            toast.success('Health check triggered!')
            fetchData()
        } catch {
            toast.error('Check failed')
        }
    }

    if (loading) {
        return (
            <div>
                <div className="page-header"><h1>Dashboard</h1></div>
                <div className="page-body"><div className="loading"><div className="spinner" />Loading services...</div></div>
            </div>
        )
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                        Welcome back, <strong>{user?.name}</strong> · Auto-refreshes every 30s
                    </p>
                </div>
                <Link to="/services/add" className="btn btn-primary">
                    <PlusCircle size={16} />
                    Add Service
                </Link>
            </div>

            <div className="page-body">
                {/* Summary Stats */}
                {summary && (
                    <div className="stats-bar">
                        <div className="card stat-card">
                            <div className="label"><Activity size={12} style={{ display: 'inline', marginRight: 4 }} />Total</div>
                            <div className="value white">{summary.totalServices}</div>
                        </div>
                        <div className="card stat-card">
                            <div className="label"><CheckCircle2 size={12} style={{ display: 'inline', marginRight: 4 }} />Up</div>
                            <div className="value green">{summary.servicesUp}</div>
                        </div>
                        <div className="card stat-card">
                            <div className="label"><XCircle size={12} style={{ display: 'inline', marginRight: 4 }} />Down</div>
                            <div className="value red">{summary.servicesDown}</div>
                        </div>
                        <div className="card stat-card">
                            <div className="label"><Clock size={12} style={{ display: 'inline', marginRight: 4 }} />Avg Response</div>
                            <div className="value blue">{summary.avgResponseTimeMs}ms</div>
                        </div>
                    </div>
                )}

                {/* Services Grid */}
                {services.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon">📡</div>
                        <p>No services monitored yet. Add your first Spring Boot service.</p>
                        <Link to="/services/add" className="btn btn-primary">
                            <PlusCircle size={16} /> Add Your First Service
                        </Link>
                    </div>
                ) : (
                    <div className="services-grid">
                        {services.map(svc => (
                            <ServiceCard key={svc.id} service={svc} onCheckNow={handleCheckNow} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
