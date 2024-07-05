import './App.css'
import './style.css'
import { Route, Routes } from 'react-router'
import { Home } from './routes/Home'
import { Host } from './routes/Host'
import { ParticipantView } from './routes/Participant'
import { SetParticipantViewContextProvider } from './Contexts'
import Viewer from './routes/Viewer'
import icon from '../src/img/icon.svg'

function App() {
	return (
		<>
			<div className='topbar'>
				<div>
					<img className='mainIcon' width={50} height={50} src={icon} />
				</div>
				
			</div>
			<div className='mainContainer'>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/host" element={<Host />} />
					<Route path='/viewer' element={<Viewer />} />
					<Route
						path="/participant"
						element={
							<SetParticipantViewContextProvider>
								<ParticipantView />
							</SetParticipantViewContextProvider>
						}
					/>
				</Routes>
			</div>
		</>
	)
}

export default App
