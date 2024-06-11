import './App.css'
import { Route, Routes } from 'react-router'
import { Home } from './routes/Home'
import { Host } from './routes/Host'
import { ParticipantView } from './routes/Participant'
import { SetParticipantViewContextProvider } from './Contexts'

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/host' element={<Host />} />
        <Route path='/participant' element={
          <SetParticipantViewContextProvider>
            <ParticipantView />
          </SetParticipantViewContextProvider>} 
          />
      </Routes>
    </>
  )
}

export default App
