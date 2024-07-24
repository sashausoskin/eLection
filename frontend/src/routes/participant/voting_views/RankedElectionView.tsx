import { Fragment, useContext, useState } from 'react'
import { RankedElectionInfo } from '../../../types'
import { useSprings, animated } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import { clamp } from 'lodash'
import { PopupContext } from '../../../Contexts'
import { useTranslation } from 'react-i18next'

// Used React Spring's Draggable List example as base: https://codesandbox.io/s/zfy9p

// These would usually be defined in a .css-file, but because they are needed for the animation library, these are defined here
const candidateContainerHeight = 50
const candidateContainerPadding = 15
const candidateContainerGap = 10
const candidateContainerBorderWidth = 5
const candidateContainerSpace = candidateContainerHeight + 2 * candidateContainerPadding + 2 * candidateContainerBorderWidth + candidateContainerGap

const animateFn = (order: number[], active = false, originalIndex = 0, curIndex = 0, y = 0) => (index: number) => 
    active && index === originalIndex
        ? {
            y: curIndex * candidateContainerSpace + y,
            scale: 1.1,
            zIndex: 1,
            shadow: 15,
            immediate: (key :string) => key === 'y' || key === 'zIndex',
        }
        : {
            y: order.indexOf(index) * (candidateContainerSpace),
            scale: 1,
            zIndex: 0,
            shadow: 1,
            immediate: false
        }

const swap = (array: number[], indexA : number, indexB : number) => {
    const arrayCopy = array.slice() as number[]

    [arrayCopy[indexA], arrayCopy[indexB]] = [array[indexB], array[indexA]]

    return arrayCopy
}

const RankedElectionView = ({electionInfo, onSubmitVote} : {electionInfo : RankedElectionInfo, onSubmitVote: (voteContent: string[] | string | null) => Promise<void> | void}) => {
    const {createPopup} = useContext(PopupContext)
    const {t} = useTranslation()

    const [candidateOrder, setCandidateOrder] = useState(electionInfo.candidates.map((_,index) => index))

    const [springs, animationApi] = useSprings(candidateOrder.length, animateFn(candidateOrder))

    const bind = useDrag(({args: [originalIndex], active, movement: [, y]}) => {
        const curIndex = candidateOrder.indexOf(originalIndex)
        const curRow = clamp(Math.round((curIndex * candidateContainerSpace + y) / candidateContainerSpace), 0, candidateOrder.length - 1)
        const newOrder = swap(candidateOrder, curIndex, curRow)
        animationApi.start(animateFn(newOrder, active, originalIndex, curIndex, y))
        if (!active) setCandidateOrder(newOrder)
    })

    const handleButtonClick = () => {
        const orderedCandidates : string[] = []

        candidateOrder.some((candidateOrderIndex, i) => {
            orderedCandidates.push(electionInfo.candidates[candidateOrderIndex])
            if (i >= electionInfo.candidatesToRank - 1) return true
        })
        onSubmitVote(orderedCandidates)
    }

    const handleEmptyVote = () => {
        createPopup({type: 'confirm', message: t('rankedElection.emptyVoteConfirm'), onConfirm: () => {
            onSubmitVote(null)
        }})
    }

    return (
        <>
        <h2>{electionInfo.title}</h2>
        <a className='votingInstructions secondaryColor'>{t('electionType.ranked.votingInstructions', {candidatesToRank: electionInfo.candidatesToRank})}</a>
        <div className='rankedCandidatesContainer' style={{minHeight: candidateOrder.length * candidateContainerSpace}}>
            {springs.map(({ zIndex, shadow, y, scale }, i) => {
                const orderPosition = candidateOrder.indexOf(i)
                const votes = electionInfo.candidatesToRank - orderPosition
                return <Fragment key={`candidateFragment_${i}`}>
                <animated.div
                    {...bind(i)}
                    key={`dragCandidate_${i}`}
                    data-testid={`candidate-drag-${i}`}
                    className={'candidateContainer rankedCandidate'}
                    style={{
                        height: candidateContainerHeight,
                        padding: candidateContainerPadding,
                        touchAction: 'none',
                        userSelect: 'none',
                        position: 'absolute',
                        zIndex,
                        boxShadow: shadow.to(s => `rgba(0,0,0,0.15) 0px ${s}px ${2 * s} px 0px`),
                        y,
                        scale,
                    }}
                children={<>
                    <div className='candidatePosition'>
                        {votes > 0 && <a>{orderPosition + 1}.</a>}
                    </div>
                    <a className='candidateName'>{electionInfo.candidates[i]}</a>
                    <div className='candidateVotes'>
                        {votes > 0 && <a>{t('votes', {count: votes})}</a>}
                    </div>
                </>}
                />
                </Fragment>
    })}
            {electionInfo.candidatesToRank < electionInfo.candidates.length && 
                <hr key='separator' style={{position: 'absolute', top: electionInfo.candidatesToRank * candidateContainerSpace - 2 * candidateContainerBorderWidth - candidateContainerGap / 2, width: '100%'}} />
            }
        </div>
        <div className='submitContainer' >
            <button type='button' data-testid='cast-vote' onClick={handleButtonClick}>{t('button.submit')}</button>
            <button type='button' data-testid='cast-empty-vote' onClick={handleEmptyVote} style={{backgroundColor: 'red'}}>{t('button.voteEmpty')}</button>
        </div>
        </>
    )
}

export default RankedElectionView