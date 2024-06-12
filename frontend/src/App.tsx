import './App.css'
import { Route, Routes } from 'react-router'
import { Home } from './routes/Home'
import { Host } from './routes/Host'
import { ParticipantView } from './routes/Participant'
import { SetParticipantViewContextProvider } from './Contexts'
import Viewer from './routes/Viewer'

function App() {
	return (
		<>
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
		</>
	)
}

export default App
