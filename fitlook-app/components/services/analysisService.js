// services/analysisService.js

const API_URL = 'http://192.168.1.178:8080'; // kendi backend IP ve portunu yaz

export const createAnalysis = async (userId) => {
    try {
        const response = await fetch(`${API_URL}/analysis`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
            throw new Error(`Sunucu hatası: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Analysis oluşturma hatası:', error);
        throw error;
    }
};
