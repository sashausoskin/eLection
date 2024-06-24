import { useState } from "react";
import { RankedElectionInfo } from "../../../types";
import { useSprings, animated } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { clamp } from 'lodash'

// Used React Spring's Draggable List example as base: https://codesandbox.io/s/zfy9p

const animateFn = (order: number[], active = false, originalIndex = 0, curIndex = 0, y = 0) => (index: number) => 
    active && index === originalIndex
        ? {
            y: curIndex * 120 + y,
            scale: 1.1,
            zIndex: 1,
            shadow: 15,
            immediate: (key :string) => key === 'y' || key === 'zIndex',
        }
        : {
            y: order.indexOf(index) * 120,
            scale: 1,
            zIndex: 0,
            shadow: 1,
            immediate: false
        }

const swap = (array: number[], indexA : number, indexB : number) => {
    let arrayCopy = [...array] as any[]

    [arrayCopy[indexA], arrayCopy[indexB]] = [array[indexB], array[indexA]]

    return arrayCopy
}

const RankedElectionView = ({electionInfo} : {electionInfo : RankedElectionInfo}) => {
    const [candidateOrder, setCandidateOrder] = useState(electionInfo.candidates.map((_,index) => index))

    const [springs, animationApi] = useSprings(candidateOrder.length, animateFn(candidateOrder))

    const bind = useDrag(({args: [originalIndex], active, movement: [, y]}) => {
        const curIndex = candidateOrder.indexOf(originalIndex)
        const curRow = clamp(Math.round((curIndex * 200 + y) / 200), 0, candidateOrder.length - 1)
        const newOrder = swap(candidateOrder, curIndex, curRow)
        animationApi.start(animateFn(newOrder, active, originalIndex, curIndex, y))
        if (!active) setCandidateOrder(newOrder)
    })

    return (
        <>
        <h2>{electionInfo.title}</h2>
        <p>Rank your top {electionInfo.candidatesToRank} candidates and press 'Submit'</p>
        <div style={{position: 'relative', width: 500, height: candidateOrder.length * 100, justifyContent: 'center', display: 'flex'}}>
        {springs.map(({ zIndex, shadow, y, scale }, i) => {
            const orderPosition = candidateOrder.indexOf(i)
            const votes = electionInfo.candidatesToRank - orderPosition
            return <>
            <animated.div
                {...bind(i)}
                key={i}
                style={{
                    position: 'absolute',
                    zIndex,
                    boxShadow: shadow.to(s => `rgba(0,0,0,0.15) 0px ${s}px ${2 * s} px 0px`),
                    y,
                    scale,
                    backgroundColor: "lightblue",
                    touchAction: 'none',
                    height: '100px',
                    width: '300px',
                }}
            children={<>
                <p key={electionInfo.candidates[i]}>{votes > 0 && `${orderPosition + 1}. `}{electionInfo.candidates[i]} {votes > 0 && `${votes} votes`}</p>
            </>}
             />
            </>
})}
        <hr style={{position: 'absolute', top: electionInfo.candidatesToRank * 110, width: '100%'}} />
        </div>
        </>
    )
}

export default RankedElectionView