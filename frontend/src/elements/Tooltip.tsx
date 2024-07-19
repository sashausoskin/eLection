import { Tooltip } from 'react-tooltip'
import infoIcon from '/img/icons/info.svg'
import './elements.css'
import { renderToStaticMarkup } from 'react-dom/server'

const InfoTooltip = ({children} : {children : JSX.Element}) => {
    const tooltipId = '123'

    return <>
        <img className='icon tooltipIcon' src={infoIcon} width={20} height={20} data-tooltip-id={tooltipId} data-tooltip-html={renderToStaticMarkup(children)}/>
        <Tooltip className='tooltip' id={tooltipId} />
    </>
}
export default InfoTooltip