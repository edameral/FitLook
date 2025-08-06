import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    Linking
} from 'react-native';
import config from '../services/config';

export default function ProductPage({ route }) {
    const productUrl = route.params?.productUrl ?? null;
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (productUrl) {
            callFindLinks(productUrl);
        }
    }, [productUrl]);

    const callFindLinks = async (imageUrl) => {
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch(`${config.BASE_URL}/api/find-links`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ outfit_url: imageUrl }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                Alert.alert('API Hatası', JSON.stringify(errorData));
                setLoading(false);
                return;
            }

            const data = await response.json();
            setResult(data);
        } catch (error) {
            Alert.alert('İstek Hatası', error.message);
        } finally {
            setLoading(false);
        }
    };

    const openLink = (url) => {
        Linking.openURL(url).catch((err) => {
            Alert.alert('Link Açma Hatası', err.message);
        });
    };

    if (!productUrl) {
        return (
            <View style={styles.centered}>
                <Text>Ürün linki bulunamadı.</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} color="#6200ea" />}

            {!loading && result && Array.isArray(result) && (
                <View style={styles.linksContainer}>
                    <Text style={styles.resultTitle}>Ürün Linkleri</Text>
                    {result.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.linkButton}
                            onPress={() => openLink(item.link)}
                        >
                            <Text style={styles.linkButtonText}>{item.link}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#f4f4f4',
    },
    card: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        marginBottom: 20,
    },
    image: {
        width: 300,
        height: 300,
        resizeMode: 'contain',
        borderRadius: 8,
    },
    linksContainer: {
        width: '100%',
        alignItems: 'center',
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    linkButton: {
        backgroundColor: '#6200ea',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginBottom: 12,
        shadowColor: '#6200ea',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 4,
    },
    linkButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
