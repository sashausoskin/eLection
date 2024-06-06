import { server } from './util/server'

const PORT : number = 3000

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})



