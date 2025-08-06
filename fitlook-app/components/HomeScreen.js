import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
    FontAwesome,
    MaterialCommunityIcons,
    Ionicons,
    MaterialIcons
} from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
    const [images, setImages] = useState([]);
    const [userImage, setUserImage] = useState(null);
    const [event, setEvent] = useState('');

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 1,
            allowsMultipleSelection: true,
        });

        if (!result.canceled) {
            setImages(prev => [...prev, ...result.assets.map(asset => asset.uri)]);
        }
    };

    const pickUserImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setUserImage(result.assets[0].uri);
        }
    };

    const goToAnalysis = () => {
        if (images.length === 0 || !event) {
            Alert.alert("Uyarı", "Lütfen en az bir görsel seçin ve etkinliği belirtin.");
            return;
        }

        navigation.navigate("Chatbot", {
            images,
            event,
            userImage
        });
    };

    const eventOptions = [
        { label: 'Parti', icon: <MaterialCommunityIcons name="party-popper" size={24} color="#5D5FEF" /> },
        { label: 'İş', icon: <MaterialIcons name="work" size={24} color="#5D5FEF" /> },
        { label: 'Okul', icon: <Ionicons name="school" size={24} color="#5D5FEF" /> },
        { label: 'Spor', icon: <MaterialIcons name="fitness-center" size={24} color="#5D5FEF" /> },
        { label: 'Randevu', icon: <Ionicons name="heart" size={24} color="#5D5FEF" /> },
        { label: 'Gezi', icon: <Ionicons name="airplane" size={24} color="#5D5FEF" /> },
    ];

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
            <ScrollView
                contentContainerStyle={[styles.container, { paddingBottom: 40 }]}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.headerText}>Tarzını Yükle, Etkinliği Seç, Kombinini Keşfet!</Text>
                <View style={styles.card}>
                    <Text style={styles.title}><FontAwesome name="cloud-upload" size={20} /> Görsel Yükleme</Text>
                    <Text style={styles.subtitle}>Kombin analizi için görsellerinizi seçin</Text>

                    <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                        {images.length > 0 ? (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {images.map((uri, index) => (
                                    <Image key={index} source={{ uri }} style={styles.previewImage} />
                                ))}
                            </ScrollView>
                        ) : (
                            <>
                                <MaterialIcons name="image" size={40} color="#A3A3A3" />
                                    {/* <Text style={styles.dropText}>Görsellerinizi seçiniz...</Text> */}
                                <TouchableOpacity style={styles.selectButton} onPress={pickImage}>
                                    <Text style={styles.selectButtonText}>+ Görsel Seç</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.card}>
                    <Text style={styles.title}><FontAwesome name="user" size={20} /> Kullanıcı Fotoğrafı</Text>
                    <Text style={styles.subtitle}>Kombinin giydirileceği fotoğrafı seçin</Text>

                    <TouchableOpacity style={styles.imagePicker} onPress={pickUserImage}>
                        {userImage ? (
                            <Image source={{ uri: userImage }} style={styles.previewImage} />
                        ) : (
                            <>
                                <MaterialIcons name="add-a-photo" size={40} color="#A3A3A3" />
                                 {/* <Text style={styles.dropText}>Fotoğrafınızı buraya sürükleyin</Text> */}
                                <TouchableOpacity style={styles.selectButton} onPress={pickUserImage}>
                                    <Text style={styles.selectButtonText}>+ Fotoğraf Seç</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.card}>
                    <Text style={styles.title}><FontAwesome name="calendar" size={20} /> Etkinlik Seçimi</Text>
                    <Text style={styles.subtitle}>Gidilecek yeri belirtin</Text>

                    <View style={styles.eventGrid}>
                        {eventOptions.map((opt, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.eventButton,
                                    event === opt.label && styles.selectedEvent,
                                ]}
                                onPress={() => setEvent(opt.label)}
                            >
                                {opt.icon}
                                <Text style={styles.eventLabel}>{opt.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TextInput
                        placeholder="Veya özel bir etkinlik yazın..."
                        style={styles.input}
                        value={event}
                        onChangeText={setEvent}
                    />
                </View>

                <TouchableOpacity
                    style={[
                        styles.analyzeButton,
                        !(images.length > 0 && event && userImage) && styles.disabledButton
                    ]}
                    disabled={!(images.length > 0 && event && userImage)}
                    onPress={goToAnalysis}
                >
                    <Text style={styles.analyzeText}>Kombin Analizi Başlat</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    headerText: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    container: {
        padding: 20,
        backgroundColor: '#D3D0D0',
        flexGrow: 1,
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#fff',
        width: '100%',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 10,
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
    },
    imagePicker: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    dropText: {
        marginTop: 10,
        fontSize: 14,
        color: '#999',
    },
    selectButton: {
        backgroundColor: '#5D5FEF',
        marginTop: 15,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    selectButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    previewImage: {
        width: 200,
        height: 200,
        resizeMode: 'cover',
        borderRadius: 10,
        marginRight:10
    },
    eventGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    eventButton: {
        width: '30%',
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 10,
        marginVertical: 6,
        alignItems: 'center',
    },
    selectedEvent: {
        backgroundColor: '#dcd9fc',
    },
    eventLabel: {
        marginTop: 5,
        fontSize: 14,
        color: '#333',
    },
    input: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    analyzeButton: {
        backgroundColor: '#5D5FEF',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 30,
    },
    disabledButton: {
        backgroundColor: '#c4c4c4',
    },
    analyzeText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
