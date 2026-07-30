import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

if ('serviceWorker' in navigator) {
  let reloaded = false
  const doReload = () => { if (!reloaded) { reloaded = true; window.location.reload() } }
  navigator.serviceWorker.addEventListener('controllerchange', doReload)
  navigator.serviceWorker.addEventListener('message', e => {
    if (e.data?.type === 'SW_UPDATED') doReload()
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
