import './App.css'
import { Route, Routes } from 'react-router'
import { Home } from './routes/Home'
import { Host } from './routes/Host'
import { ParticipantView } from './routes/Participant'

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/host' element={<Host />} />
        <Route path='/participant' element={<ParticipantView />} />
      </Routes>
    </>
  )
}

export default App
