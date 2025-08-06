import React, { useState, useContext } from 'react';
import {
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    View,
    TextInput,
    Alert,
    TouchableOpacity,
    Text,
    StyleSheet,
    Image,
    Keyboard,
    TouchableWithoutFeedback,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import config from '../services/config';
import { UserContext } from '../services/UserContext';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('fitlook@gmail.com');
    const [password, setPassword] = useState('');
    const { setUserId } = useContext(UserContext);

    const handleLogin = () => {
        if (!email || !password) {
            Alert.alert('Hata', 'E-posta ve şifre alanlarını doldurun!');
            return;
        }

        signInWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;
                console.log('Giriş yapan kullanıcı:', user);
                const firebaseId = user.uid;

                try {
                    const response = await fetch(`${config.BASE_URL}/users/firebase/${firebaseId}`);
                    if (!response.ok) {
                        throw new Error('Kullanıcı bulunamadı!');
                    }
                    const userIdFromBackend = await response.json();

                    setUserId(userIdFromBackend);

                    navigation.replace('HomeScreen');
                } catch (error) {
                    Alert.alert('Hata', error.message);
                }
            })
            .catch((error) => {
                Alert.alert('Giriş Hatası', error.message);
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
                        <Image
                            source={require('../../assets/images/logo2.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
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
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                                <Text style={styles.loginButtonText}>Giriş Yap</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            onPress={() => navigation.navigate('Register')}
                            style={styles.registerLink}
                        >
                            <Text style={styles.registerLinkText}>Hesabın yok mu? Üye ol</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    keyboardAvoid: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: Platform.OS === 'ios' ? 30 : 16,
        paddingTop: Platform.OS === 'ios' ? 40 : 16,
        justifyContent: 'center',
    },
    logo: {
        width: 400,
        height: 200,
        alignSelf: 'center',
        marginBottom: 40,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        width: '100%',
    },
    buttonContainer: {
        marginTop: 8,
    },
    loginButton: {
        backgroundColor: '#145F14',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    registerLink: {
        marginTop: 16,
        alignItems: 'center',
    },
    registerLinkText: {
        color: 'red',
    },
});
