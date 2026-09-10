import React from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
function App() {
    return <main className="base"><img src="/logo.svg" alt="" width="48" /><h1>Projexia</h1><p>Client project tracker</p></main>;
}
createRoot(document.getElementById('app')).render(<React.StrictMode><App /></React.StrictMode>);
