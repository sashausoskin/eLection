import axios from "axios";

console.log("Base url", import.meta.env.VITE_BACKEND_URL)

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL
})