import React, { useState } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    Alert,
    SafeAreaView,
    TouchableOpacity,
    Text,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import config from '../services/config';

export default function RegisterScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = () => {
        if (!email || !password || !confirmPassword) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurun!');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Hata', 'Şifreler eşleşmiyor!');
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const uid = userCredential.user.uid;

                try {
                    const response = await fetch(`${config.BASE_URL}/users`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ firebaseUid: uid }),
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Backend kaydı sırasında hata oluştu');
                    }

                    Alert.alert('Başarılı', 'Kayıt başarılı! Giriş yapabilirsiniz.');
                    navigation.replace('Login');
                } catch (error) {
                    Alert.alert('Backend Hatası', error.message);
                }
            })
            .catch((error) => {
                Alert.alert('Kayıt Hatası', error.message);
            });
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    style={styles.keyboardAvoid}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
                >
                    <View style={styles.container}>
                        <TextInput
                            style={styles.input}
                            placeholder="E-posta"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Şifre"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Şifre Tekrar"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                        />

                        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                            <Text style={styles.registerButtonText}>Üye Ol</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.loginLinkContainer}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.loginLinkText}>
                                Zaten hesabın var mı? <Text style={styles.loginLinkTextBold}>Giriş yap</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    keyboardAvoid: { flex: 1 },
    container: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    registerButton: {
        backgroundColor: '#145F14',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loginLinkContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    loginLinkText: {
        color: 'gray',
        fontSize: 14,
    },
    loginLinkTextBold: {
        color: '#145F14',
        fontWeight: 'bold',
    },
});
