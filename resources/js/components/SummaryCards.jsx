import { Layers3, Timer, CircleCheck, Pause } from 'lucide-react';
export default function SummaryCards({ summary }) {
    const cards = [['Total projects', 'total', Layers3, 'purple'], ['In progress', 'in_progress', Timer, 'blue'], ['Completed', 'completed', CircleCheck, 'green'], ['On hold', 'on_hold', Pause, 'amber']];
    return <section className="stats" aria-label="Project summary">{cards.map(([label, key, Icon, color]) => <div className="stat" key={key}><div><span>{label}</span><strong>{summary ? summary[key] : '—'}</strong></div><span className={'stat-icon ' + color}><Icon size={22} /></span></div>)}</section>;
}



