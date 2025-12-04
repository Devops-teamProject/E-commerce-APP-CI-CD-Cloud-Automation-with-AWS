// let API;

// if (import.meta.env.VITE_REACT_APP_API_URL) {
//   API = import.meta.env.VITE_REACT_APP_API_URL;
// } else {
//   const port = 5000;
//   API = window.location.hostname === 'localhost'
//     ? `http://localhost:${port}`
//     : `${window.location.protocol}//${window.location.hostname}:${port}`;
// }
const API = "/api";
export default API;