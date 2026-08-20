import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

/* HIER het 'n onvoorwaardelike herlaai op `controllerchange` gestaan.
 *
 * Dit het by ELKE ontplooiing gevuur — sw.js doen skipWaiting() en
 * clients.claim(), dus kry elke oop bladsy die gebeurtenis binne sekondes.
 * Die mens is dan uit sy blad geskop terwyl hy lees. Erger: hierdie
 * luisteraar het EERSTE geregistreer, wat App.jsx se klank-hek verbygesteek
 * het, en dus het 'n herlaai ook oor 'n stemboodskap heen geloop.
 *
 * Die besluit staan nou op een plek — magHerlaai() in
 * src/data/herlaaiBesluit.js — en word in App.jsx toegepas. Moenie dit hier
 * terugsit nie.
 */

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
