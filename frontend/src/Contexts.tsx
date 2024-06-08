import { Dispatch, SetStateAction, createContext } from "react";
import { ParticipantViewTab } from "./types";

export const SetParticipantViewContext = createContext<Dispatch<SetStateAction<ParticipantViewTab>> | null>(null)
