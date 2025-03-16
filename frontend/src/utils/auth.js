import { jwtDecode } from 'jwt-decode';

// Extracts permissions from a JWT stored in session storage
const getPermissionsFromToken = () => {

    const token = sessionStorage.getItem('lh_token'); 
    if (!token) {
        console.log("No token found in sessionStorage.");
        return [];
    }

    try {
        // Decode the JWT to access its payload
        const decoded = jwtDecode(token);
        // console.log("Decoded Token:", decoded);
        return decoded.permissions || [];
    } catch (error) {
        console.error('Invalid token', error);
        return []; 
    }
};

export { getPermissionsFromToken };