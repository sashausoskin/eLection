import { CSSProperties, Fragment, use, useState } from 'react'
import { RankedElectionInfo } from '../../../types'
import { PopupContext } from '../../../context/Contexts'
import { useTranslation } from 'react-i18next'
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import RankedCandidate from './RankedCandidate'

// Used React Spring's Draggable List example as base and inspiration: https://codesandbox.io/s/zfy9p

// These would usually be defined in a .css-file, but because they are needed for the animation library, these are defined here
const candidateContainerHeight = 50
const candidateContainerPadding = 15
const candidateContainerMarginTop = 10
const candidateContainerBorderWidth = 15
const candidateContainerSpace = candidateContainerHeight + 2 * candidateContainerPadding + 2 * candidateContainerBorderWidth + candidateContainerMarginTop

/**
 * The view a participant sees when they are voting in a ranked election
 * @param onSubmitVote - 
 */
const RankedElectionView = ({electionInfo, onSubmitVote, canSubmitVote} : {
	/**
     * Information on the election
     */
	electionInfo : RankedElectionInfo,
	/**
     * Called when the user submits a vote.
     * @param voteContent What the participant voted for
     * @returns null
     */
	onSubmitVote: (voteContent: string[] | string | null) => Promise<void> | void,
	/**
     * If the participant can submit a vote.
     */
	canSubmitVote: boolean
}) => {
	const {createPopup} = use(PopupContext)
	const {t} = useTranslation()

	const [candidateList, setCandidateList] = useState(electionInfo.candidates)
	const sensors = useSensors(
		useSensor(KeyboardSensor),
		useSensor(MouseSensor),
		useSensor(TouchSensor)
	)

	const handleButtonClick = () => {
		const votedCandidates = candidateList.slice(0, electionInfo.candidatesToRank)

		onSubmitVote(votedCandidates)
	}

	const handleEmptyVote = () => {
		createPopup({type: 'confirm', message: t('rankedElection.emptyVoteConfirm'), onConfirm: () => {
			onSubmitVote(null)
		}})
	}

	const handleDragEvent = (event : DragEndEvent) => {
		if (event.active.id !== event.over?.id) {
			setCandidateList((candidateList) => {
				if (event.over === null) return []
				const oldIndex = candidateList.indexOf(event.active.id.toString())
				const newIndex = candidateList.indexOf(event.over.id.toString())
        
				return arrayMove(candidateList, oldIndex, newIndex)
			})
		}
	}

	const candidateContainerStyle : CSSProperties = {
		height: candidateContainerHeight,
		padding: candidateContainerPadding,

	}

	return (
		<>
			<h2>{electionInfo.title}</h2>
			<a className='votingInstructions secondaryColor'>{t('electionType.ranked.votingInstructions', {candidatesToRank: electionInfo.candidatesToRank})}</a>
			<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEvent} modifiers={[restrictToVerticalAxis]}>
				<div className='rankedCandidatesContainer'>
					<SortableContext items={candidateList} strategy={verticalListSortingStrategy}>
						{candidateList.map((candidate, i) => {
							const votes = electionInfo.candidatesToRank - i
							return <Fragment key={`candidateFragment_${candidate}`}>
								<RankedCandidate key={candidate} id={candidate} position={i + 1} candidate={candidate} votes={votes} containerStyle={candidateContainerStyle}/>
								{i < candidateList.length - 1 && <img style={{height: `${candidateContainerMarginTop}`}}/>}
							</Fragment>
						})}
						{electionInfo.candidatesToRank < electionInfo.candidates.length && 
						<hr key='separator' style={{position: 'absolute', top: electionInfo.candidatesToRank * candidateContainerSpace - 2 * candidateContainerBorderWidth - candidateContainerMarginTop / 2, width: '100%'}} />
						}
					</SortableContext>
				</div>
			</DndContext>
			<div className='submitContainer' >
				<button type='button' disabled={!canSubmitVote} data-testid='cast-vote' onClick={handleButtonClick}>{t('button.submit')}</button>
				<button type='button' disabled={!canSubmitVote} className='emptyVoteButton' data-testid='cast-empty-vote' onClick={handleEmptyVote}>{t('button.voteEmpty')}</button>
			</div>
		</>
	)
}

export default RankedElectionView