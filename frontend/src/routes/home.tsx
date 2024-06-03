import { Link } from "react-router-dom"

export const Home = () => {
    return (
        <>
        <h1>Welcome to e-lection</h1>
        <Link to={"/host"}>Host</Link>
        <Link to={"/participant"}>Participate</Link>
        </>
    )
}