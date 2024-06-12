import { useState } from "react"
import { VoteType } from "../../types"
import FTPTForm from "./vote_forms/FTPTForm"

const CreateVoteForm = () => {
    const [voteType, setVoteType] = useState<VoteType>("FPTP")

    return (
        <>
        <h2> Create a vote </h2>
        <h3> Voting type: </h3>
        <input type="radio"  data-testid="ftpt_radio" defaultChecked={voteType === "FPTP"} name="voteType" onClick={() => setVoteType("FPTP")}/> First-past-the-post voting
        <input type="radio" data-testid="ranked_radio" defaultChecked={voteType === "ranked"} name="voteType" onClick={() => setVoteType("ranked")}/> Ranked voting

        { voteType === "FPTP" &&
            <FTPTForm />
        }
        { voteType === "ranked" &&
            <>
            <br />
            <a data-testid="ranked_form">Under construction...</a>
            </>
        }
        </>
    )
}

export default CreateVoteForm