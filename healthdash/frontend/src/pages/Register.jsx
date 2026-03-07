import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import toast from 'react-hot-toast'
import { UserPlus } from 'lucide-react'

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
        setLoading(true)
        try {
            const { data } = await api.post('/auth/register', form)
            login({ email: data.email, name: data.name, plan: data.plan }, data.token)
            toast.success(`Account created! Welcome, ${data.name}!`)
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <div className="logo-dot" />
                    <h1>HealthDash</h1>
                </div>
                <div className="auth-sub">
                    <h2>Create your account</h2>
                    <p>Start monitoring your Spring Boot microservices</p>
                </div>

                {error && <div className="alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full name</label>
                        <input id="reg-name" className="form-control" type="text" placeholder="Jane Doe"
                            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Email address</label>
                        <input id="reg-email" className="form-control" type="email" placeholder="you@company.com"
                            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input id="reg-password" className="form-control" type="password" placeholder="Min 6 characters"
                            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                    </div>
                    <button id="btn-register" className="btn btn-primary btn-full" type="submit" disabled={loading}>
                        <UserPlus size={16} />
                        {loading ? 'Creating account...' : 'Create Free Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    )
}
