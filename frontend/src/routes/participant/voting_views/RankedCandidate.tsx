import { useTranslation } from 'react-i18next'
import dragIcon from '/img/icons/drag.svg'
import { defaultAnimateLayoutChanges, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CSSProperties } from 'react'

interface RankedCandidateProps {
	id: string,
	key: string,
	candidate: string,
	position: number,
	votes: number,
	containerStyle: CSSProperties
}

const RankedCandidate = (props : React.PropsWithChildren<RankedCandidateProps>) => {
	const {t} = useTranslation()

	const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({animateLayoutChanges: defaultAnimateLayoutChanges, id: props.id})
	const style : CSSProperties = {
		transform: CSS.Translate.toString(transform),
		transition,
		zIndex: isDragging ? 1000 : 0,
		scale: isDragging ? 1.1 : 1,
		boxShadow: isDragging ? '10px 10px 10px black': '0px 0px 0px black',
		...props.containerStyle
	}

	return <div ref={setNodeRef} style={style} {...attributes} {...listeners}
		data-testid={`candidate-drag-${props.position - 1}`}
		className={'candidateContainer rankedCandidate'}
		children={<>	
			<img src={dragIcon} className={'icon dragIcon'}/>
			<div className='candidatePosition'>
				{props.votes > 0 && <a>{props.position}.</a>}
			</div>
			<a className='candidateName'>{props.candidate}</a>
			<div className='candidateVotes'>
				{props.votes > 0 && <a>{t('votes', {count: props.votes})}</a>}
			</div>
		</>}
	/>
}

export default RankedCandidate