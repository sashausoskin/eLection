import confirmIcon from '/img/icons/confirm.svg'
import cancelIcon from '/img/icons/cancel.svg'
import { useContext } from 'react'
import { PopupContext } from '../Contexts'

/**
 * A popup that covers the entire screen. Uses {@link PopupContext} to get information on what to show.
 */
const Popup = () => {
    const {popupInfo, clearPopup} = useContext(PopupContext)

    return <>
        {popupInfo && <div className='popupBackground'>
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
        </div>}
    </>
}

export default Popup