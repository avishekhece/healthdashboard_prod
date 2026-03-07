import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import toast from 'react-hot-toast'
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import { ArrowLeft, RefreshCw, Trash2, AlertCircle, CheckCircle2, Activity } from 'lucide-react'

function StatusBadge({ status }) {
    const cls = status === 'UP' ? 'up' : status === 'DOWN' ? 'down' : 'unknown'
    return <span className={`badge ${cls}`}><span className="status-dot" />{status}</span>
}

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div style={{ background: '#1a1f33', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 12px' }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--blue)' }}>{payload[0].value}ms</p>
            </div>
        )
    }
    return null
}

export default function ServiceDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [service, setService] = useState(null)
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [checking, setChecking] = useState(false)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        async function load() {
            try {
                const [svcRes, histRes] = await Promise.all([
                    api.get('/services'),
                    api.get(`/services/${id}/history?limit=50`),
                ])
                const found = svcRes.data.find(s => String(s.id) === String(id))
                if (!found) { toast.error('Service not found'); navigate('/dashboard'); return }
                setService(found)
                // reverse so chart shows oldest first
                setHistory([...histRes.data].reverse())
            } catch {
                toast.error('Failed to load service')
                navigate('/dashboard')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id, navigate])

    const handleCheckNow = async () => {
        setChecking(true)
        try {
            const { data } = await api.post(`/services/${id}/check-now`)
            setService(data)
            const histRes = await api.get(`/services/${id}/history?limit=50`)
            setHistory([...histRes.data].reverse())
            toast.success('Health check completed!')
        } catch { toast.error('Check failed') }
        finally { setChecking(false) }
    }

    const handleDelete = async () => {
        if (!confirm(`Delete "${service?.name}"? This cannot be undone.`)) return
        setDeleting(true)
        try {
            await api.delete(`/services/${id}`)
            toast.success('Service deleted')
            navigate('/dashboard')
        } catch { toast.error('Delete failed'); setDeleting(false) }
    }

    const chartData = history
        .filter(h => h.responseTimeMs != null)
        .map(h => ({
            time: new Date(h.checkedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            responseTime: h.responseTimeMs,
            status: h.status,
        }))

    const upCount = history.filter(h => h.status === 'UP').length
    const uptime = history.length > 0 ? ((upCount / history.length) * 100).toFixed(1) : '—'

    if (loading) return <div className="loading"><div className="spinner" /> Loading...</div>

    return (
        <div>
            <div className="page-header">
                <div>
                    <Link to="/dashboard" className="btn btn-ghost btn-sm" style={{ marginBottom: 12, display: 'inline-flex' }}>
                        <ArrowLeft size={14} /> Back
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <h1>{service.name}</h1>
                        <StatusBadge status={service.currentStatus} />
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
                        {service.baseUrl} · <span style={{ textTransform: 'uppercase', fontSize: 11 }}>{service.environment}</span>
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-ghost" onClick={handleCheckNow} disabled={checking}>
                        <RefreshCw size={15} style={{ animation: checking ? 'spin 0.7s linear infinite' : 'none' }} />
                        {checking ? 'Checking...' : 'Check Now'}
                    </button>
                    <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                        <Trash2 size={15} />
                        {deleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>

            <div className="page-body">
                {/* Mini stats row */}
                <div className="stats-bar" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
                    <div className="card stat-card">
                        <div className="label">Last Response</div>
                        <div className="value blue">{service.lastResponseTimeMs != null ? `${service.lastResponseTimeMs}ms` : '—'}</div>
                    </div>
                    <div className="card stat-card">
                        <div className="label">Uptime (recent)</div>
                        <div className={`value ${parseFloat(uptime) >= 90 ? 'green' : 'red'}`}>{uptime}%</div>
                    </div>
                    <div className="card stat-card">
                        <div className="label">Total Checks</div>
                        <div className="value white">{history.length}</div>
                    </div>
                    <div className="card stat-card">
                        <div className="label">Last Checked</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 8 }}>
                            {service.lastCheckedAt ? new Date(service.lastCheckedAt).toLocaleString() : 'Never'}
                        </div>
                    </div>
                </div>

                {/* Last Failure Alert */}
                {service.currentStatus === 'DOWN' && service.lastErrorMessage && (
                    <div className="alert-error" style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <AlertCircle size={16} style={{ marginTop: 2, flexShrink: 0 }} />
                        <div>
                            <strong>Last Error:</strong> {service.lastErrorMessage}
                            {service.lastFailureAt && (
                                <span style={{ display: 'block', fontSize: 11, marginTop: 4, color: 'var(--text-muted)' }}>
                                    at {new Date(service.lastFailureAt).toLocaleString()}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Response Time Chart */}
                {chartData.length > 0 && (
                    <div className="card" style={{ padding: '24px', marginBottom: 24 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>
                            <Activity size={14} style={{ display: 'inline', marginRight: 6 }} />
                            Response Time (last {chartData.length} checks)
                        </h3>
                        <ResponsiveContainer width="100%" height={180}>
                            <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="rtGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#4d5a7a' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                                <YAxis tick={{ fontSize: 10, fill: '#4d5a7a' }} tickLine={false} axisLine={false} unit="ms" />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="responseTime" stroke="#6366f1" strokeWidth={2} fill="url(#rtGrad)" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* History Table */}
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>
                        Check History
                    </h3>
                    {history.length === 0 ? (
                        <div className="empty-state">
                            <div className="icon">🕐</div>
                            <p>No health checks recorded yet. Click "Check Now" to run the first check.</p>
                        </div>
                    ) : (
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Status</th>
                                        <th>Response Time</th>
                                        <th>Checked At</th>
                                        <th>Error</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...history].reverse().slice(0, 50).map(h => (
                                        <tr key={h.id}>
                                            <td><StatusBadge status={h.status} /></td>
                                            <td>{h.responseTimeMs != null ? `${h.responseTimeMs}ms` : '—'}</td>
                                            <td>{new Date(h.checkedAt).toLocaleString()}</td>
                                            <td style={{ color: 'var(--red)', fontSize: 12 }}>{h.errorMessage || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
