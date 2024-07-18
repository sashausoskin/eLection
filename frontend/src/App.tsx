import './App.css'
import './style.css'
import { Route, Routes } from 'react-router'
import { Home } from './routes/Home' 
import { PopupContext, SetParticipantViewContextProvider } from './Contexts'
import { lazy, Suspense, useContext } from 'react'
import Loading from './elements/Loading'
import icon from '../src/img/icon.svg'
import confirmIcon from './img/icons/confirm.svg'
import cancelIcon from './img/icons/cancel.svg'


const Host = lazy(() => import('./routes/Host'))
const ParticipantView = lazy(() => import('./routes/Participant')) 
const Viewer = lazy(() => import('./routes/Viewer')) 



function App() {
	const {popupInfo, clearPopup} = useContext(PopupContext)

	return (
		<>
			{popupInfo && 
				<div className='popupBackground'>
					<div className='popupContainer'>
						<a className='popupText'>{popupInfo.content}</a>
						<div className='buttonsContainer'>
							<button className='confirmButton' data-testid='confirmButton' onClick={() => {popupInfo.onConfirm?.(); clearPopup()}}>
								<img src={confirmIcon} />
							</button>
							{popupInfo.type === 'confirm' && 
								<button className='cancelButton' data-testid='cancelButton' onClick={() => {popupInfo.onCancel?.(); clearPopup()}}>
									<img src={cancelIcon} />
								</button>
							}
						</div>
					</div>
				</div>
			}

			<div className='topbar'>
				<div>
					<img className='mainIcon' width={50} height={50} src={icon} />
				</div>
			</div>
			<div className='mainContainer'>
				<Suspense fallback={<Loading>
						<a>Loading files...</a>
					</Loading>
					}>
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/host" element={
							<Host />} />
						<Route path='/viewer' element={
							<div className='viewerContainer'>
								<Viewer />
							</div>} />
						<Route
							path="/participant"
							element={
								<SetParticipantViewContextProvider>
									<ParticipantView />
								</SetParticipantViewContextProvider>
							}
						/>
					</Routes>
				</Suspense>
			</div>
		</>
	)
}

export default App
