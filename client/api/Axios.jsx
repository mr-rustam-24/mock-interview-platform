import Axios from "axios";

const api = Axios.create({
 baseURL: "https://mock-interview-platform-api.onrender.com/api"
});

export default api;
