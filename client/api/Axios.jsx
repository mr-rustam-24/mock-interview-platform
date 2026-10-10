import Axios from "axios";

const api = Axios.create({
  baseURL: "http://localhost:9000/api",
});

export default api;
