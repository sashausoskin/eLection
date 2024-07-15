import loadingIcon from '../img/icons/loading.svg'
import './elements.css'

const Loading = (props : React.PropsWithChildren) => {
    return <div className="loadingContainer">
        <img className='loadingIcon icon' src={loadingIcon} width={100} />
        {props.children}
    </div>
}

export default Loading