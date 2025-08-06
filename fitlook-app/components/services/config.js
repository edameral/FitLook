const BASE_URL = 'http://192.168.1.104:8080';

export const createAnalysis = async (userId, title) => {
    try {
        const response = await fetch(`${BASE_URL}/analysis`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, title }),
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

export const createContent = async (analysisId, text, type, source) => {
    try {
        const response = await fetch(`${BASE_URL}/content`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ analysisId, text, type, source }),
        });

        if (!response.ok) {
            throw new Error(`Sunucu hatası: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Content oluşturma hatası:', error);
        throw error;
    }
};

const createImage = async (imageUrl, analysisId) => {
    try {
        const response = await fetch(`${BASE_URL}/images`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                imageUrl: imageUrl,
                analysisId: analysisId
            }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Görsel yüklendi:', data);
        } else {
            const errorData = await response.text();
            console.error('Sunucu hatası:', errorData);
        }
    } catch (error) {
        console.error('İstek hatası:', error);
    }
};

const uploadPhoto = async (photoUri, analysisId, userId, event) => {
    const data = new FormData();
    const cloudName = "dv5seg71e";
    const uploadPreset = "CityFlow";
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

    // Benzersiz klasör adı: userId/event/analysisId
    const folderName = `${userId}/${event}/${analysisId}`;

    // Benzersiz dosya ismi
    const fileName = `analysis_${analysisId}_${Date.now()}.jpg`;

    data.append("file", {
        uri: photoUri,
        name: fileName,
        type: "image/jpeg",
    });

    data.append("upload_preset", uploadPreset);
    data.append("folder", folderName);

    try {
        const response = await fetch(cloudinaryUrl, {
            method: "POST",
            body: data,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        const result = await response.json();

        if (response.ok) {
            await createImage(result.secure_url, analysisId);
        } else {
            console.error("Cloudinary hatası:", result);
        }
    } catch (error) {
        console.error("Cloudinary bağlantı hatası:", error);
    }
};

const uploadUserPhoto = async (photoUri, analysisId, userId, event) => {
    const data = new FormData();
    const cloudName = "dv5seg71e";
    const uploadPreset = "CityFlow";
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

    // Benzersiz klasör adı: userId/event/analysisId
    const folderName = `${userId}/${event}/${analysisId}`;

    // Benzersiz dosya ismi
    const fileName = `analysis_${analysisId}_user_${Date.now()}.jpg`;

    data.append("file", {
        uri: photoUri,
        name: fileName,
        type: "image/jpeg",
    });

    data.append("upload_preset", uploadPreset);
    data.append("folder", folderName);

    try {
        const response = await fetch(cloudinaryUrl, {
            method: "POST",
            body: data,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        const result = await response.json();

        if (response.ok) {
            await createImage(result.secure_url, analysisId);
        } else {
            console.error("Cloudinary hatası:", result);
        }
    } catch (error) {
        console.error("Cloudinary bağlantı hatası:", error);
    }
};

export default {
    BASE_URL,
    createAnalysis,
    createContent,
    uploadPhoto,
    createImage,
    uploadUserPhoto
};
