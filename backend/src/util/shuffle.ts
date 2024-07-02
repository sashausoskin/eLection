// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const shuffleArray = (array: any[]) => {
    for (let i = array.length-1; i>0; i--) {
        const j = Math.floor(Math.random() * (i+1));
        [array[i], array[j]] = [array[j], array[i]]
    }

    return array
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const insertToRandomIndex = (array: any[], newElement: any) => {
    const randomIndex = Math.floor(Math.random() * (array.length - 1))

    array.splice(randomIndex, 0, newElement)
}