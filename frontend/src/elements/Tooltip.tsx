import { Tooltip } from 'react-tooltip'
import { JSX } from 'react'
import infoIcon from '/img/icons/info.svg'
import './elements.css'

/**
 * An icon that shows elements when hovered over it. Mostly used as a tooltip.
 * @param children What the tooltip should show when hovered over it.
 * @param id An ID to give to the tooltip. Required for tooltips to work correctly.
 * @returns 
 */
const InfoTooltip = ({children, id} : {children : JSX.Element, id : string}) => {
	return <>
		<img className='icon tooltipIcon' src={infoIcon} width={20} height={20} data-tooltip-id={id}/>
		<Tooltip className='tooltip' id={id}>
			{children}
		</Tooltip>
	</>
}
export default InfoTooltip