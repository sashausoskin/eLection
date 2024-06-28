import './App.css'
import { Route, Routes } from 'react-router'
import { Home } from './routes/Home'
import { Host } from './routes/Host'
import { ParticipantView } from './routes/Participant'
import { SetParticipantViewContextProvider } from './Contexts'
import Viewer from './routes/Viewer'
import RankedElectionView from './routes/participant/voting_views/RankedElectionView'
import { RankedElectionInfo } from './types'

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
				<Route path='/testing' element={<RankedElectionView electionInfo={{type: 'ranked', title: 'Test', candidates: ['Candidate 1', 'Candidate 2', 'Candidate 3'], candidatesToRank: 2} as RankedElectionInfo } onSubmitVote={async (voteContent) => console.log('Got vote:', voteContent)} /> }  />
			</Routes>
		</>
	)
}

export default App
