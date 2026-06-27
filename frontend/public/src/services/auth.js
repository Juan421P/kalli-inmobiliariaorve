import axios from 'axios';
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
});
const AuthService = {
    async me() {
        const response = await api.get('/auth/me');
        return response.data;
    }
};
export default AuthService;