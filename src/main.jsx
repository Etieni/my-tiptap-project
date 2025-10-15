import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Без StrictMode — чтобы в dev не было двойного mount
createRoot(document.getElementById('root')).render(<App />)