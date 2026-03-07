import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import toast from 'react-hot-toast'
import { LogIn } from 'lucide-react'

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const { data } = await api.post('/auth/login', form)
            login({ email: data.email, name: data.name, plan: data.plan }, data.token)
            toast.success(`Welcome back, ${data.name}!`)
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid credentials')
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
                    <h2>Welcome back</h2>
                    <p>Sign in to your monitoring dashboard</p>
                </div>

                {error && <div className="alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email address</label>
                        <input
                            id="email"
                            className="form-control"
                            type="email"
                            placeholder="you@company.com"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            id="password"
                            className="form-control"
                            type="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </div>
                    <button id="btn-login" className="btn btn-primary btn-full" type="submit" disabled={loading}>
                        <LogIn size={16} />
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account? <Link to="/register">Create one free</Link>
                </div>
            </div>
        </div>
    )
}
