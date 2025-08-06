import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Image, TextInput, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import config from './services/config';
import { UserContext } from './services/UserContext';
import { useNavigation } from '@react-navigation/native';

export default function Chatbot({ route }) {
    const navigation = useNavigation();
    const { userId } = useContext(UserContext);
    const [analysisId, setAnalysisId] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const { images = [], event = "", userImage } = route?.params || {};
    const [dressingImage, setDressingImage] = useState(null);
    const [lastUrl,setLastUrl]=useState(null);
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState({ generalStyle: "", suggestion: "" });
    const [botMessage, setBotMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [destination, setDestination] = useState("");
    const [showForm, setShowForm] = useState(true);
    const [newUpperPrompt, setNewUpperPrompt] = useState("");
    const [newLowerPrompt, setNewLowerPrompt] = useState("");
    const [generatedUpperImage, setGeneratedUpperImage] = useState(null);
    const [generatedLowerImage, setGeneratedLowerImage] = useState(null);
    const scrollRef = useRef();

    useEffect(() => {
        setSelectedImages(images);
        setDestination(event);
        setShowForm(false);
        setAnalysisId(null);
        setMessages([
            {
                text: "",
                feedback: null,
                loading: false,
                isForm: true,
            }
        ]);

        // otomatik analiz başlat
        if (images.length > 0 && event) {
            analyzeOutfit(images, event);
        }
    }, [route?.params]);


    const handleCreateContent = async (analysisId, text, type, source) => {
        console.log("gelen veriler : " + analysisId + " " + text + " " + type + " " + source);
        try {
            console.log("buraya girdi");
            const result = await config.createContent(analysisId, text, type, source);
            console.log('Content oluşturuldu, id:', result.id);
        } catch (error) {
            Alert.alert("Hata", error.message || "İçerik oluşturulamadı.");
        }
    };


    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImages(prev => [...prev, ...result.assets.map(asset => asset.uri)]);
        }
    };

    const handleAnalyze = () => {
        if (selectedImages.length === 0) {
            Alert.alert("Hata", "Lütfen en az bir görsel seçin.");
            return;
        }
        if (!destination.trim()) {
            Alert.alert("Hata", "Lütfen gidilecek yeri girin.");
            return;
        }

        setShowForm(false); // ✅ sadece butonlar gizlenecek
        analyzeOutfit(selectedImages, destination);
    };

    const analyzeOutfit = async (imagesToAnalyze = images, destinationToAnalyze = event) => {
        const newMsg = {
            text: "",
            feedback: null,
            loading: true,
            isForm: false
        };

        // loading mesajını ekle ve index'ini yakala
        let loadingIndex = -1;
        setMessages(prev => {
            const updated = [...prev, newMsg];
            loadingIndex = updated.length - 1;
            return updated;
        });

        // React'in state'i güncellemesi için küçük bir gecikme ver
        setTimeout(async () => {
            const formData = new FormData();
            imagesToAnalyze.forEach((uri) => {
                const filename = uri.split("/").pop();
                const match = /\.(\w+)$/.exec(filename ?? "");
                const type = match ? `image/${match[1]}` : `image`;
                formData.append("image", { uri, name: filename, type });
            });
            formData.append("destination", destinationToAnalyze);

            try {
                const response = await fetch(`${config.BASE_URL}/api/outfit/analyze`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    body: formData,
                });

                const textResult = await response.text();

                if (response.ok) {
                    const jsonResult = JSON.parse(textResult);

                    // API'den sadece photo_desc geliyor, buna göre mesajı ayarla
                    const newText = jsonResult.photo_desc ?? "Analiz sonucu bulunamadı.";

                    setMessages(prev => {
                        const updated = [...prev];
                        updated[loadingIndex] = {
                            ...updated[loadingIndex],
                            text: newText,
                            loading: false,
                            // API'den diğer promptlar gelmediği için boş bırakabiliriz
                            upperPrompt: null,
                            lowerPrompt: null
                        };
                        return updated;
                    });


                    try {
                        if (!analysisId) {
                            const result = await config.createAnalysis(userId, destinationToAnalyze);
                            setAnalysisId(result.id);

                            await handleCreateContent(result.id, jsonResult.outfit_suggestion, 0, 0);

                            if (userImage) {
                                // userImage bir dosya yolu, bunu upload ederken yukarıdaki gibi FormData ile göndermelisin
                                await uploadUserPhoto(userImage, result.id, userId, destinationToAnalyze);
                            }

                            for (let uri of imagesToAnalyze) {
                                await config.uploadPhoto(uri, result.id, userId, destinationToAnalyze);
                            }

                            
                        } else {
                            await handleCreateContent(analysisId, jsonResult.outfit_suggestion, 0, 0);
                        }
                    } catch (e) {
                        Alert.alert("Hata", "Analiz veya içerik oluşturulurken bir hata oluştu.");
                    }
                } else {
                    Alert.alert("Hata", `Sunucu hatası: ${response.status}`);
                }
            } catch (e) {
                Alert.alert("Hata", "Sunucuya bağlanırken hata oluştu.");
            }
        }, 0); // hemen çalıştırmak için 0 ms delay
    };

    const sendOutfitRequest = async (desc, occasion) => {
        const newMsg = {
            text: "",
            feedback: null,
            loading: true,
            isForm: false,
            isSuggestionRequest: true,
        };

        let loadingIndex = -1;
        setMessages(prev => {
            const updated = [...prev, newMsg];
            loadingIndex = updated.length - 1;
            return updated;
        });

        setTimeout(async () => {
            try {
                const response = await fetch(`${config.BASE_URL}/api/style/create`, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        photo_desc: desc,
                        occasion: occasion,
                        // context is optional, eklemek istersen:
                        // context: "default context",
                    }),
                });

                if (response.ok) {
                    const jsonResult = await response.json();
                    console.log(jsonResult);

                    // Outfit önerilerini hazırla
                    const suggestionValues = Object.values(jsonResult.suggestions || {});
                    const formattedSuggestions = suggestionValues.join('\n');

                    // Image prompt'larını state'e yaz
                    const imagePrompts = jsonResult.image_prompts || {};
                    setNewUpperPrompt(imagePrompts.upper_clothing_prompt || "");
                    setNewLowerPrompt(imagePrompts.lower_clothing_prompt || "");

                    setMessages(prev => {
                        const updated = [...prev];
                        updated[loadingIndex] = {
                            ...updated[loadingIndex],
                            text: formattedSuggestions,
                            loading: false,
                            isOutfitSuggestion: true,
                        };
                        return updated;
                    });
                } else {
                    Alert.alert("Error", `Server error: ${response.status}`);
                    setMessages(prev => prev.filter((_, i) => i !== loadingIndex));
                }
            } catch (error) {
                Alert.alert("Error", "Failed to connect to server.");
                setMessages(prev => prev.filter((_, i) => i !== loadingIndex));
            }
        }, 0);
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
                await config.createImage(result.secure_url, analysisId);
                setDressingImage(result.secure_url);
                (result.secure_url);
            } else {
                console.error("Cloudinary hatası:", result);
            }
        } catch (error) {
            console.error("Cloudinary bağlantı hatası:", error);
        }
    };

    const handleTekrarUret = async (upperPrompt, lowerPrompt, index) => {
        const loadingMsg = {
            text: "",
            feedback: null,
            loading: true,
            isForm: false,
            isGeneratingImages: true
        };

        // Loading mesajını ekle
        setMessages(prev => [...prev, loadingMsg]);
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            const response = await fetch(`${config.BASE_URL}/api/generate-images`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    item_0: `**Üst**: ${upperPrompt}`,
                    item_1: `**Alt**: ${lowerPrompt}`
                }),
            });

            if (!response.ok) throw new Error(`Görsel üretme hatası: ${response.status}`);

            const data = await response.json();
            const upperUrl = data.upper_image_urls?.[0];
            const lowerUrl = data.lower_image_urls?.[0];

            setGeneratedUpperImage(upperUrl);
            setGeneratedLowerImage(lowerUrl);

            handleCreateContent(analysisId, upperUrl, 1, 0);
            handleCreateContent(analysisId, lowerUrl, 1, 0);

            // loading mesajlarını kaldır ve yeni mesajı ekle
            setMessages(prev => {
                const filtered = prev.filter(msg => !msg.isGeneratingImages);
                filtered.splice(index + 1, 0, {
                    text: "Üretilen Kombin Görselleri",
                    imageUrls: [upperUrl, lowerUrl],
                    feedback: null,
                    loading: false,
                    upperPrompt: upperPrompt,
                    lowerPrompt: lowerPrompt,
                });
                return filtered;
            });
        } catch (error) {
            Alert.alert("Hata", error.message);
            setMessages(prev => prev.filter(msg => !msg.isGeneratingImages));
        } finally {
            setLoading(false);
        }
    };

    const combineUserAndItem = async (humanImage, upperImage, lowerImage, index) => {
        const loadingMsg = {
            text: "",
            feedback: null,
            loading: true,
            isForm: false,
            isGeneratingImages: true,
            isCombining: true
        };

        setMessages(prev => [...prev, loadingMsg]);
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            const response = await fetch(`${config.BASE_URL}/api/tryon`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    human_image: humanImage,
                    upper_image: upperImage,
                    lower_image: lowerImage,
                    model_name: "kolors-virtual-try-on-v1-5"
                }),
            });

            if (!response.ok) throw new Error(`Kombin görseli üretilemedi: ${response.status}`);
            const data = await response.json();
            const imageUrl = data.result_data?.images?.[0]?.url;

            if (!imageUrl) throw new Error("Kombin görseli bulunamadı.");

            console.log("try linki : " + imageUrl);

            setLastUrl(imageUrl);

            // Opsiyonel: sonucu backend'e kaydet
            handleCreateContent(analysisId, imageUrl, 1, 0);

            // Mesajları güncelle
            setMessages(prev => {
                const filtered = prev.filter(msg => !msg.isGeneratingImages);
                filtered.splice(index + 1, 0, {
                    text: "Üretilen Kombin Görseli",
                    imageUrls: [imageUrl],
                    feedback: null,
                    loading: false,
                    prompt: "Kombin görüntüsü",
                    isCombineResult: true
                });
                return filtered;
            });

        } catch (error) {
            Alert.alert("Hata", error.message);
            setMessages(prev => prev.filter(msg => !msg.isGeneratingImages));
        } finally {
            setLoading(false);
        }
    };




    //analiz menüsü
    const handleFeedback = (index, isLike, isImageFeedback = false) => {
        setMessages(prev => {
            const updated = [...prev];
            updated[index].feedback = isLike ? 'like' : 'dislike';

            const msg = updated[index];

            let upperPrompt = newUpperPrompt;
            let lowerPrompt = newLowerPrompt;

            if (msg.isOutfitSuggestion) {
                // Öneri beğeni işlemleri
                if (isLike) {
                    console.log("öneri like Öneriyi beğendim");
                    handleCreateContent(analysisId, "Öneriyi beğendim...", 0, 1);
                    console.log("üst prompt : " + upperPrompt);
                    console.log("alt promt : " + lowerPrompt);
                    setMessages(prev => [...prev, {
                        text: "",
                        feedback: null,
                        loading: true,
                        isForm: false,
                        isGeneratingImages: true
                    }]);
                    setTimeout(() => {
                        handleTekrarUret(upperPrompt, lowerPrompt, index);
                    }, 10);

                } else {
                    console.log("öneri !like Öneriyi beğenmedim");
                    handleCreateContent(analysisId, "Öneriyi beğenmedim...", 0, 1);

                    // ⬇️⬇️ BURAYA YENİDEN ÖNERİ YAPMA KODUNU EKLE
                    setMessages(prev => [
                        ...prev,
                        {
                            text: "Yeni öneri yapılıyor...",
                            feedback: null,
                            loading: true,
                            isForm: false,
                            isSuggestionRequest: true,
                        },
                    ]);
                    console.log("text : "+msg.text + " " + destination);
                    setTimeout(() => {
                        sendOutfitRequest(msg.text, destination);
                    }, 10);
                }
            }
 else if (msg.isCombineResult) {
                // Kombin beğeni işlemleri
                if (isLike) {
                    console.log("Kombini beğendim");
                    handleCreateContent(analysisId, "Kombini beğendim...", 0, 1);
                    navigation.navigate("ProductPage", {productUrl: lastUrl});
                } else {
                    console.log("Kombini beğenmedim");
                    handleCreateContent(analysisId, "Kombini beğenmedim...", 0, 1);
                    setMessages(prev => [...prev, {
                        text: "",
                        feedback: null,
                        loading: true,
                        isForm: false,
                        isGeneratingImages: true,
                        isCombining: true,
                    }]);
                    setTimeout(() => {
                        const prompt = `yeniden kombin üretimi için prompt`;
                        combineUserAndItem(prompt, index);
                    }, 10);
                }
            } else if (isImageFeedback) {
                // Görsel beğeni işlemleri
                if (isLike) {
                    handleCreateContent(analysisId, "Görseli beğendim...", 0, 1);
                    const prompt = `bir kaplan uzayda geziyor`;
                    setMessages(prev => [...prev, {
                        text: "",
                        feedback: null,
                        loading: true,
                        isForm: false,
                        isGeneratingImages: true,
                        isCombining: true,
                    }]);
                    console.log("kombinden sonra : " + dressingImage + " " + generatedUpperImage + " " + generatedLowerImage);
                    setTimeout(() => {
                        combineUserAndItem(dressingImage,generatedUpperImage,generatedLowerImage ,index);
                    }, 10);
                } else {
                    console.log("Görseller beğenilmedi, yeniden görsel üretimi...");
                    handleCreateContent(analysisId, "Görseli beğenmedim", 0, 1);
                    setMessages(prev => [...prev, {
                        text: "",
                        feedback: null,
                        loading: true,
                        isForm: false,
                        isGeneratingImages: true
                    }]);
                    setTimeout(() => {
                        handleTekrarUret(upperPrompt, lowerPrompt, index);
                    }, 10);
                }
            } else {
                // Analiz beğeni işlemleri
                if (isLike) {
                    console.log("Analizi beğendim");
                    setMessages(prev => [
                        ...prev,
                        {
                            text: "Öneri yapılıyor...",
                            feedback: null,
                            loading: true,
                            isForm: false,
                            isSuggestionRequest: true,
                        },
                    ]);
                    console.log("giden text : "+msg.text+" "+destination);
                    setTimeout(() => {
                        handleCreateContent(analysisId, "Analizi beğendim...", 0, 1);
                        sendOutfitRequest(msg.text, destination);
                    }, 10);
                } else {
                    console.log("Analizi beğenmedim, yeniden analiz...");
                    handleCreateContent(analysisId, "Analizi beğenmedim...", 0, 1);
                    setMessages(prev => [...prev, {
                        text: "",
                        feedback: null,
                        loading: true,
                        isForm: false
                    }]);
                    setTimeout(() => {
                        analyzeOutfit(selectedImages, destination);
                    }, 10);
                }
            }

            return updated;
        });
    };

    
    // Çentikli balon komponenti
    const NotchedBubble = ({ children, style, notchColor, notchPosition = 'left' }) => (
        <View style={[styles.chatBubble, style]}>
            {/* Çentik */}
            <View
                style={[
                    styles.notch,
                    notchPosition === 'right' ? styles.notchRight : styles.notchLeft,
                    { borderTopColor: notchColor || '#e9ecef' }
                ]}
            />
            {children}
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={[styles.chatArea, { paddingBottom: 80 }]} ref={scrollRef} onContentSizeChange={() => scrollRef.current.scrollToEnd({ animated: true })}>
                {messages.map((msg, index) => (
                    <View key={index} style={{ width: '100%' }}>
                        {msg.isForm && (
                            <NotchedBubble style={styles.formMessage} notchColor="#e9ecef" notchPosition="right">
                                <View style={styles.formContainer}>
                                    <Text style={styles.formTitle}>Kombin Analizi</Text>
                                    <Text style={styles.formSubtitle}>Görselinizi seçin ve gidilecek yeri belirtin</Text>

                                    {selectedImages.length > 0 && (
                                        <ScrollView horizontal style={styles.imagePreviewContainer}>
                                            {selectedImages.map((uri, index) => (
                                                <Image
                                                    key={index}
                                                    source={{ uri }}
                                                    style={styles.imagePreview}
                                                />
                                            ))}
                                        </ScrollView>
                                    )}

                                    <TextInput
                                        placeholder="Gidilecek Yer (Örn: Parti, Okul, ...)"
                                        value={destination}
                                        onChangeText={setDestination}
                                        style={styles.destinationInput}
                                        editable={false} // analizden sonra yazılamasın istiyorsan bunu kullan
                                    />

                                    {/* BUTONLAR sadece showForm === true iken gösterilir */}
                                    {false && (
                                        <>
                                            <TouchableOpacity onPress={pickImage} style={styles.pickImageButton}>
                                                <Text style={styles.pickImageButtonText}>
                                                    {selectedImages.length > 0 ? `${selectedImages.length} Görsel Seçildi` : 'Görsel Seç'}
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={handleAnalyze}
                                                style={[
                                                    styles.analyzeButton,
                                                    (selectedImages.length === 0 || !destination.trim()) && styles.analyzeButtonDisabled
                                                ]}
                                                disabled={selectedImages.length === 0 || !destination.trim()}
                                            >
                                                <Text style={styles.analyzeButtonText}>Analiz Et</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
                            </NotchedBubble>
                        )}

                        {!msg.isForm && (
                            <>
                                <NotchedBubble style={[styles.botMessage, msg.imageUrls ? styles.fullWidthBubble : null]} notchColor="#e9ecef" notchPosition="left">
                                    {msg.loading ? (
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <ActivityIndicator size="small" color="#7CABCE" />
                                            <Text style={{ marginLeft: 8 }}>
                                                {msg.isSuggestionRequest
                                                    ? "Öneri yapılıyor..."
                                                    : msg.isCombining
                                                        ? "Kombin üretiliyor..."
                                                        : msg.isGeneratingImages
                                                            ? "Görsel üretiliyor..."
                                                            : "Analiz yapılıyor..."}
                                            </Text>
                                        </View>
                                    ) : (
                                        <>
                                            {msg.text && (
                                                <Text style={{ fontSize: 16, lineHeight: 24 }}>
                                                    {msg.text}
                                                </Text>
                                            )}
                                            {msg.imageUrls?.map((url, i) => (
                                                <View key={i} style={{ marginTop: 8 }}>
                                                    <Text>Görsel {i + 1}:</Text>
                                                    <Image source={{ uri: url }} style={{ width: '100%', height: 200, borderRadius: 10 }} />
                                                </View>
                                            ))}
                                        </>
                                    )}
                                </NotchedBubble>

                                {/* ANALİZ MENÜSÜ */}
                                {/* ANALİZ MENÜSÜ VE GÖRSEL MENÜSÜ AYRIMI */}
                                {!msg.loading && msg.feedback === null && (
                                    <View style={styles.analysisMenu}>
                                        <TouchableOpacity
                                            style={[styles.analysisOption, styles.like]}
                                            onPress={() => handleFeedback(index, true, !!msg.imageUrls)}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={styles.likeText}>
                                                {msg.isOutfitSuggestion
                                                    ? "Öneriyi Beğendim"
                                                    : msg.isCombineResult
                                                        ? "Kombini Beğendim"
                                                        : msg.imageUrls
                                                            ? "Görselleri Beğendim"
                                                            : "Analizi Beğendim"}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.analysisOption, styles.dislike]}
                                            onPress={() => handleFeedback(index, false, !!msg.imageUrls)}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={styles.dislikeText}>
                                                {msg.isOutfitSuggestion
                                                    ? "Öneriyi Beğenmedim"
                                                    : msg.isCombineResult
                                                        ? "Kombini Beğenmedim"
                                                        : msg.imageUrls
                                                            ? "Görselleri Beğenmedim"
                                                            : "Analizi Beğenmedim"}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}


                                {msg.feedback && (
                                    <NotchedBubble
                                        style={[
                                            styles.botMessage,
                                            styles.feedbackMessage,
                                            msg.feedback === 'like' ? styles.feedbackLike : styles.feedbackDislike,
                                        ]}
                                        notchColor={msg.feedback === 'like' ? '#e8f5e8' : '#ffeaea'}
                                        notchPosition="right"
                                    >
                                        <Text style={msg.feedback === 'like' ? styles.likeText : styles.dislikeText}>
                                            {msg.feedback === 'like' ? (
                                                msg.isOutfitSuggestion
                                                    ? 'Teşekkürler! Öneriyi beğendiğinizi kaydettik. Ürünler oluşturuluyor...'
                                                    : msg.isCombineResult
                                                        ? 'Teşekkürler! Kombini beğendiğinizi kaydettik.'
                                                        : msg.imageUrls
                                                            ? 'Teşekkürler! Görselleri beğendiğinizi kaydettik. Görsel Oluşturuluyor...'
                                                            : 'Teşekkürler! Analizinizi beğendiğinizi kaydettik. Görsel Oluşturuluyor...'
                                            ) : (
                                                msg.isOutfitSuggestion
                                                    ? 'Teşekkürler! Öneri hakkındaki geri bildiriminizi aldık. Tekrar Öneri yapılıyor..'
                                                    : msg.isCombineResult
                                                        ? 'Teşekkürler! Kombin hakkındaki geri bildiriminizi aldık.'
                                                        : msg.imageUrls
                                                            ? 'Teşekkürler! Görseller hakkındaki geri bildiriminizi aldık. Yeni görseller geliyor...'
                                                            : 'Teşekkürler! Geri bildiriminizi aldık. Yeni bir analiz geliyor...'
                                            )}
                                        </Text>
                                    </NotchedBubble>
                                )}


                            </>
                        )}
                    </View>
                ))}
            </ScrollView>
        </View>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#D3D0D0',
    },
    chatArea: {
        padding: 16,
        alignItems: 'flex-start',
    },
    chatBubble: {
        backgroundColor: '#e9ecef',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderTopRightRadius: 18,
        marginBottom: 0,
        maxWidth: '80%',
        alignSelf: 'flex-start',
        marginTop: 16,
        position: 'relative',
    },
    botMessage: {
        alignSelf: 'flex-start',
        marginLeft: 0,
    },
    formMessage: {
        alignSelf: 'flex-end',
        marginRight: 0,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
    },
    notch: {
        position: 'absolute',
        top: 0,
        width: 0,
        height: 0,
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        zIndex: 2,
    },
    notchLeft: {
        left: -8,
        borderTopColor: '#e9ecef',
    },
    notchRight: {
        right: -8,
        borderTopColor: '#e9ecef',
        // borderTopColor üstte override ediliyor
    },
    analysisMenu: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
        padding: 16,
        marginTop: 0,
        maxWidth: '80%',
        alignSelf: 'flex-start',
        width: '100%',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    analysisOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 8,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
        backgroundColor: '#f8f9fa',
    },
    like: {
        borderColor: '#4caf50',
    },
    dislike: {
        borderColor: '#f44336',
        marginBottom: 0,
    },
    likeText: {
        color: '#2d5a2d',
        fontWeight: 'bold',
    },
    dislikeText: {
        color: '#8b0000',
        fontWeight: 'bold',
    },
    feedbackMessage: {
        marginTop: 16,
        alignSelf: 'flex-end',
        borderTopLeftRadius: 18,      // Feedbackte sağ çentik olacağı için sol üstü yuvarlak yapıyoruz
        borderTopRightRadius: 0,      // Sağ üst köşe düz
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
        position: 'relative',
        maxWidth: '80%',
        backgroundColor: '#e9ecef',
    },
    feedbackLike: {
        backgroundColor: '#e8f5e8',
    },
    feedbackDislike: {
        backgroundColor: '#ffeaea',
    },
    formContainer: {
        backgroundColor: 'transparent',
        padding: 0,
        width: '100%',
    },
    pickImageButton: {
        backgroundColor: '#7CABCE',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 15,
    },
    pickImageButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    destinationInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        marginBottom: 15,
    },
    analyzeButton: {
        backgroundColor: '#4caf50',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        alignItems: 'center',
    },
    analyzeButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    analyzeButtonDisabled: {
        backgroundColor: '#ccc',
        opacity: 0.7,
    },
    formTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    formSubtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    imagePreviewContainer: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    imagePreview: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginHorizontal: 5,
    },
    fullWidthBubble: {
        maxWidth: '80%',
        alignSelf: 'flex-start',
        width: '100%',
    }
});
