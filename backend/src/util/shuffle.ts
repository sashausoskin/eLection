import crypto from 'node:crypto'

/**
 * Randomly shuffles an array.
 * @param array The array to shuffle
 * @returns Shuffled array
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const shuffleArray = (array: any[]) => {
    for (let i = array.length-1; i>0; i--) {
        const j = crypto.randomInt(i + 1);
        [array[i], array[j]] = [array[j], array[i]]
    }

    return array
}

/**
 * Places an item at a random point of an array.
 * @param array 
 * @param newElement The element to insert at a random index.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const insertToRandomIndex = (array: any[], newElement: any) => {
    const randomIndex = crypto.randomInt(array.length + 1)

    array.splice(randomIndex, 0, newElement)
}