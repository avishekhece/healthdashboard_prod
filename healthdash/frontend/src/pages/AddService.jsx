import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'
import toast from 'react-hot-toast'
import { ArrowLeft, PlusCircle } from 'lucide-react'

export default function AddService() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [form, setForm] = useState({
        name: '',
        baseUrl: '',
        environment: 'production',
        checkIntervalSec: 60,
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await api.post('/services', {
                ...form,
                checkIntervalSec: Number(form.checkIntervalSec),
            })
            toast.success(`"${form.name}" added successfully!`)
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add service')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <Link to="/dashboard" className="btn btn-ghost btn-sm" style={{ marginBottom: 12, display: 'inline-flex' }}>
                        <ArrowLeft size={14} /> Back to Dashboard
                    </Link>
                    <h1>Add New Service</h1>
                </div>
            </div>
            <div className="page-body">
                <div className="card form-card">
                    <h2>Service Details</h2>
                    <p className="subtitle">Connect a Spring Boot service to start monitoring its health endpoint.</p>

                    {error && <div className="alert-error">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Service Name</label>
                            <input id="svc-name" className="form-control" type="text"
                                placeholder="e.g. User Service, Payment API"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                required />
                        </div>
                        <div className="form-group">
                            <label>Base URL</label>
                            <input id="svc-url" className="form-control" type="url"
                                placeholder="http://your-service:8080"
                                value={form.baseUrl}
                                onChange={e => setForm({ ...form, baseUrl: e.target.value })}
                                required />
                            <small style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4, display: 'block' }}>
                                We'll automatically append <code>/actuator/health</code> to this URL.
                            </small>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Environment</label>
                                <select id="svc-env" className="form-control" value={form.environment}
                                    onChange={e => setForm({ ...form, environment: e.target.value })}>
                                    <option value="production">Production</option>
                                    <option value="staging">Staging</option>
                                    <option value="development">Development</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Check Interval</label>
                                <select id="svc-interval" className="form-control" value={form.checkIntervalSec}
                                    onChange={e => setForm({ ...form, checkIntervalSec: e.target.value })}>
                                    <option value={30}>Every 30 seconds</option>
                                    <option value={60}>Every 1 minute</option>
                                    <option value={300}>Every 5 minutes</option>
                                    <option value={600}>Every 10 minutes</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                            <button id="btn-add-service" className="btn btn-primary" type="submit" disabled={loading}>
                                <PlusCircle size={16} />
                                {loading ? 'Adding...' : 'Add Service'}
                            </button>
                            <Link to="/dashboard" className="btn btn-ghost">Cancel</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
