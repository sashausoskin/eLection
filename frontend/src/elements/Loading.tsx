import loadingIcon from '/img/icons/loading.svg'
import './elements.css'
import { ReactNode } from 'react'

/**
 * A simple loading icon that can show elements underneath it.
 * 
 * @param children The children of this element that are rendered under the loading icon. 
 * @returns The Loading element
 */
const Loading = ({children} : {children: ReactNode}) => {
    return <div className="loadingContainer">
        <img className='loadingIcon icon' src={loadingIcon} width={100} />
        {children}
    </div>
}

export default Loading