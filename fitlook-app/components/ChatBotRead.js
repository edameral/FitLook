import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Image, TextInput } from 'react-native';
import config from './services/config';

export default function Chatbot({ route, navigation }) {
    const { analysisId } = route.params;
    const [messages, setMessages] = useState([]);
    const [destination, setDestination] = useState("Parti");
    const [imagesList, setImagesList] = useState([]); // Yeni state: görseller için
    const scrollRef = useRef();

    const getContentByAnalysisId = async (analysisId) => {
        try {
            const response = await fetch(`${config.BASE_URL}/content/analysis/${analysisId}`);
            if (!response.ok) throw new Error('Sunucudan geçersiz cevap geldi');
            const data = await response.json();
            console.log('Gelen içerikler:', data);
            return data;
        } catch (error) {
            console.error('İçerikler alınamadı:', error);
            return null;
        }
    };

    const getImagesByAnalysisId = async (analysisId) => {
        try {
            const response = await fetch(`${config.BASE_URL}/images/analysis/${analysisId}`);
            if (!response.ok) throw new Error('Sunucudan geçersiz cevap geldi');
            const data = await response.json();
            console.log('Gelen görseller:', data);
            return data; // Burada dönen veri dizisi olmalı
        } catch (error) {
            console.error('Görseller alınamadı:', error);
            return null;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const contentData = await getContentByAnalysisId(analysisId);
            if (!contentData) return;

            const formatted = contentData.map(item => ({
                text: item.text,
                type: item.type,
                isBot: item.source === 0,
                feedback: null,
                loading: false,
                isForm: false,
            }));

            setMessages([
                {
                    text: "Merhaba! Kombin analizi için görselinizi seçin ve gidilecek yeri belirtin.",
                    feedback: null,
                    loading: false,
                    isForm: true,
                },
                ...formatted
            ]);

            const imagesData = await getImagesByAnalysisId(analysisId);
            if (imagesData) {
                setImagesList(imagesData);
            }
        };

        fetchData();
    }, []);

    const NotchedBubble = ({ children, style, notchColor, notchPosition = 'left' }) => (
        <View style={[styles.chatBubble, style]}>
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
            <ScrollView
                contentContainerStyle={[styles.chatArea, { paddingBottom: 80 }]}
                ref={scrollRef}
                onContentSizeChange={() => scrollRef.current.scrollToEnd({ animated: true })}
            >
                {messages.map((msg, index) => (
                    <View key={index} style={{ width: '100%' }}>
                        {msg.isForm && (
                            <NotchedBubble style={styles.formMessage} notchColor="#e9ecef" notchPosition="right">
                                <View style={styles.formContainer}>
                                    <Text style={styles.formTitle}>Kombin Analizi</Text>
                                    <Text style={styles.formSubtitle}>Görselinizi seçin ve gidilecek yeri belirtin</Text>

                                    <ScrollView horizontal style={styles.imagePreviewContainer}>
                                        {imagesList.length === 0 ? (
                                            <Text>Görsel bulunamadı</Text>
                                        ) : (
                                            imagesList.map((img, idx) => (
                                                <Image
                                                    key={idx}
                                                    source={{ uri: img.imageUrl || img }} // img nesne ise url, değilse kendisi url
                                                    style={styles.imagePreview}
                                                />
                                            ))
                                        )}
                                    </ScrollView>

                                    <TextInput
                                        placeholder="Gidilecek Yer (Örn: Parti, Okul, Ofis, Spor)"
                                        value={destination}
                                        onChangeText={setDestination}
                                        style={styles.destinationInput}
                                        editable={false}
                                    />
                                </View>
                            </NotchedBubble>
                        )}

                        {!msg.isForm && (
                            <NotchedBubble
                                style={[styles.botMessage, !msg.isBot && styles.userMessage]}
                                notchColor={msg.isBot ? "#e9ecef" : "#d1e7dd"}
                                notchPosition={msg.isBot ? "left" : "right"}
                            >
                                {msg.loading ? (
                                    <ActivityIndicator size="small" color="#7CABCE" />
                                ) : (
                                    <>
                                        {msg.type === 0 && msg.text !== "" && (
                                            <Text style={{ fontSize: 16, lineHeight: 24 }}>{msg.text}</Text>
                                        )}
                                        {msg.type === 1 && (
                                            <Image
                                                source={{ uri: msg.text }}
                                                style={{ width: 200, height: 200, borderRadius: 10, marginTop: 8 }}
                                            />
                                        )}
                                    </>
                                )}
                            </NotchedBubble>
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
        backgroundColor: 'gray',
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
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#d1e7dd',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
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
    },
    formContainer: {
        backgroundColor: 'transparent',
        padding: 0,
        width: '100%',
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
});
