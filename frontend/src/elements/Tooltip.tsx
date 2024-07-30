import { Tooltip } from 'react-tooltip'
import infoIcon from '/img/icons/info.svg'
import './elements.css'
import { renderToStaticMarkup } from 'react-dom/server'

/**
 * An icon that shows elements when hovered over it. Mostly used as a tooltip.
 * @param children What the tooltip should show when hovered over it.
 * @returns 
 */
const InfoTooltip = ({children} : {children : JSX.Element}) => {
    // I don't know why, but the tooltip elements need an id or they don't work
    const tooltipId = '123'

    return <>
        <img className='icon tooltipIcon' src={infoIcon} width={20} height={20} data-tooltip-id={tooltipId} data-tooltip-html={renderToStaticMarkup(children)}/>
        <Tooltip className='tooltip' id={tooltipId} />
    </>
}
export default InfoTooltip