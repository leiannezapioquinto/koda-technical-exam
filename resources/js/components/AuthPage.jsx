import { useState } from 'react';
import { ArrowRight, FolderKanban, ShieldCheck } from 'lucide-react';
import { api, refreshCsrf } from '../api';
export default function AuthPage({ onAuthenticated }) {
    const [register, setRegister] = useState(window.location.pathname === '/register');
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);
    async function submit(event) {
        event.preventDefault();
        setErrors({}); setMessage(''); setBusy(true);
        const body = Object.fromEntries(new FormData(event.currentTarget));
        try {
            await refreshCsrf();
            const result = await api(register ? '/auth/register' : '/auth/login', { method: 'POST', body });
            await refreshCsrf();
            onAuthenticated(result.user);
        } catch (error) {
            setErrors(error.errors || {});
            setMessage(error.status === 429 ? 'Too many attempts. Please try again in a minute.' : error.message);
        } finally { setBusy(false); }
    }
    return <main className="auth-page">
        <section className="auth-story"><a className="brand" href="/"><img src="/logo.svg" alt="" />Projexia<span className="brand-dot">.</span></a>
            <div><span className="eyebrow">A LITTLE CLARITY. A LOT OF PROGRESS.</span><h1>Great projects.<br />All in one place.</h1><p>A clear view of your client work, from the first idea to the final delivery.</p>
                <div className="auth-visual"><FolderKanban size={32} /><div><strong>Your next great project</strong><span>Planning → In progress → Completed</span></div><ShieldCheck size={24} /></div>
            </div><span className="muted">Your work, beautifully organized.</span>
        </section>
        <section className="auth-form-panel"><form onSubmit={submit} className="auth-form">
            <span className="eyebrow">WELCOME TO PROJEXIA</span><h2>{register ? 'Create your account' : 'Welcome back'}</h2><p className="muted">{register ? 'Make room for your next big idea.' : 'Sign in to your project workspace.'}</p>
            {message && <div className="alert" role="alert">{message}</div>}
            {register && <AuthField label="Full name" name="name" autoComplete="name" errors={errors} />}
            <AuthField label="Email address" name="email" type="email" autoComplete="email" errors={errors} />
            <AuthField label="Password" name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} errors={errors} minLength={register ? 12 : undefined} />
            {register && <><small className="muted">At least 12 characters, including letters and numbers.</small><AuthField label="Confirm password" name="password_confirmation" type="password" autoComplete="new-password" errors={errors} /></>}
            <button className="button primary full" disabled={busy}>{busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'}<ArrowRight size={18} /></button>
            <p className="auth-switch">{register ? 'Already have an account?' : 'New to Projexia?'} <button type="button" className="text-button" onClick={() => { setRegister(!register); setErrors({}); setMessage(''); }}>{register ? 'Sign in' : 'Create an account'}</button></p>
        </form></section>
    </main>;
}
function AuthField({ label, name, errors, ...props }) {
    return <label className="field"><span>{label}</span><input name={name} required maxLength={255} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? name + '-error' : undefined} {...props} />{errors[name] && <small id={name + '-error'} className="field-error">{errors[name][0]}</small>}</label>;
}

