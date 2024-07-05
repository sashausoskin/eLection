import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './stylesheet.css'
import { BrowserRouter } from 'react-router-dom'
import { Globals } from '@react-spring/web'

if (process.env.NODE_ENV === 'test') {
	console.log('Noticed test environment, skipping animations...')
	Globals.assign({skipAnimation: true})
}

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</React.StrictMode>
)
