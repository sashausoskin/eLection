/**
 * A function that moves an item in an array to another index.
 * @param array The array in which to move item.
 * @param fromIndex The index of the item to move.
 * @param toIndex The index to which the item should be moved.
 * @returns Array with a moved item.
 */
export const move = (array: number[], fromIndex: number, toIndex: number) => {
    const arrayCopy = array.slice() as number[]

    arrayCopy.splice(toIndex, 0, arrayCopy.splice(fromIndex, 1)[0])

    return arrayCopy
}
