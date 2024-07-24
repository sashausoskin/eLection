import './App.css'
import './style.css'
import './phone_style.css'
import { Route, Routes } from 'react-router'
import { Home } from './routes/Home' 
import { PopupContext, SetParticipantViewContextProvider } from './Contexts'
import { lazy, Suspense, useContext, useEffect } from 'react'
import Loading from './elements/Loading'
import icon from '/img/icon.svg'
import confirmIcon from '/img/icons/confirm.svg'
import cancelIcon from '/img/icons/cancel.svg'
import languageIcon from '/img/icons/language.svg'
import { useTranslation } from 'react-i18next'


const Host = lazy(() => import('./routes/Host'))
const ParticipantView = lazy(() => import('./routes/Participant')) 
const Viewer = lazy(() => import('./routes/Viewer')) 



function App() {
	const {popupInfo, clearPopup} = useContext(PopupContext)
	const {t, i18n} = useTranslation()

	useEffect(() => {
		document.title = t('pageTitle')
	})

	if (i18n.language !== i18n.resolvedLanguage) i18n.changeLanguage(i18n.resolvedLanguage)

	return (
		<>
			{popupInfo && 
				<div className='popupBackground'>
					<div className='popupContainer'>
						<a className='popupText' data-testid='popup-text'>{popupInfo.message}</a>
						<div className='buttonsContainer'>
							<button className='confirmButton' data-testid='confirm-button' onClick={() => {popupInfo.onConfirm?.(); clearPopup()}}>
								<img src={confirmIcon} />
							</button>
							{popupInfo.type === 'confirm' && 
								<button className='cancelButton' data-testid='cancel-button' onClick={() => {popupInfo.onCancel?.(); clearPopup()}}>
									<img src={cancelIcon} />
								</button>
							}
						</div>
					</div>
				</div>
			}

			<div className='topbar'>
				<img className='mainIcon' width={50} height={50} src={icon} />
				<div className='languageSelectionContainer'>
					<img width={30} src={languageIcon} />
					<select onChange={(e) => i18n.changeLanguage(e.target.value)} defaultValue={i18n.resolvedLanguage} data-testid={'language-selector'} name='language' id='language'>
						{i18n.languages.concat().sort().map((language) => (
							<option key={language} value={language} onSelect={() => i18n.changeLanguage(language)}>{language.toUpperCase()}</option>
						))}
					</select>
				</div>
			</div>
			<div className='mainContainer'>
				<Suspense fallback={<Loading>
						<a>{t('status.loadingFiles')}</a>
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
