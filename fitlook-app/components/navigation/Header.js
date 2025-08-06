import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    Image,
    Platform,
    Modal,
    Pressable,
    Dimensions,
    Animated,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MenuPage from "./MenuPage";

const { width } = Dimensions.get("window");

const Header = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();

    const [menuVisible, setMenuVisible] = useState(false);

    // Animated value for sliding menu
    const slideAnim = useRef(new Animated.Value(width)).current; // başlangıçta ekranın dışı (sağda)

    const isHomeScreen = route.name === "HomeScreen";
    const isAnalysis = route.name === "Analysis";
    const isResultScreen = route.name === "ResultScreen";
    const isProfile = route.name === "Profilim";
    const isChatbot = route.name === "Chatbot";
    const isChatBotRead = route.name === "ChatBotRead";

    const showBackIcon = isAnalysis || isResultScreen;

    const showMenuIcon = isChatbot || isHomeScreen || isChatBotRead;

    const handleBackPress = () => {
        navigation.goBack();
    };

    const openMenu = () => {
        setMenuVisible(true);
    };

    const closeMenu = () => {
        // Menüyi kapatmak için sağa doğru animasyon
        Animated.timing(slideAnim, {
            toValue: width,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setMenuVisible(false);
        });
    };

    useEffect(() => {
        if (menuVisible) {
            // Menü açılınca soldan kaydır
            Animated.timing(slideAnim, {
                toValue: width * 0.2, // Menü genişliği 80%, menü 20% boşluk kalacak sağda
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [menuVisible]);

    return (
        <SafeAreaView
            style={{
                backgroundColor: "#e67828",
                paddingTop: Platform.OS === "android" ? insets.top : 0,
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 10,
                    backgroundColor: "#e67828",
                    position: "relative",
                }}
            >
                {/* Geri ok veya logo */}
                {showBackIcon ? (
                    <TouchableOpacity
                        onPress={handleBackPress}
                        style={{ position: "absolute", left: 10 }}
                    >
                        <Ionicons name="arrow-back" size={28} color="white" />
                    </TouchableOpacity>
                ) : (
                    <Image
                        source={require("../../assets/images/logo.png")}
                        style={{
                            width: 100,
                            height: 28,
                            resizeMode: "contain",
                            position: "absolute",
                            left: 10,
                        }}
                    />
                )}

                {/* Başlık */}
                <Text style={{ fontSize: 18, fontWeight: "bold", color: "white" }}>
                    {isAnalysis && "Analiz"}
                    {isProfile && "Profilim"}
                </Text>

                {/* Menü ikonu sadece Chatbot sayfasında */}
                {showMenuIcon && (
                    <TouchableOpacity
                        onPress={openMenu}
                        style={{ position: "absolute", right: 10 }}
                    >
                        <Ionicons name="menu" size={28} color="white" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Geniş Modal Menü */}
            <Modal
                animationType="none" // animasyonu kendi yapacağız
                transparent={true}
                visible={menuVisible}
                onRequestClose={closeMenu}
            >
                <Pressable
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.3)",
                    }}
                    onPress={closeMenu}
                >
                    {/* Animated.View sağdan sola kayacak */}
                    <Animated.View
                        style={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            bottom: 0,
                            width: width * 0.8,
                            backgroundColor: "#fff",
                            paddingTop: insets.top,
                            paddingHorizontal: 20,
                            paddingBottom: 40,
                            transform: [
                                {
                                    translateX: slideAnim.interpolate({
                                        inputRange: [width * 0.2, width],
                                        outputRange: [0, width * 0.8],
                                        extrapolate: "clamp",
                                    }),
                                },
                            ],
                        }}
                    >
                        <Pressable onPress={(e) => e.stopPropagation()} style={{ flex: 1, justifyContent: 'space-between' }}>
                            <View>
                                {/* Menü başlığı ve kapatma ikonu sabit */}
                                <View
                                    style={{
                                        marginBottom: 10,
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Text style={{ fontSize: 20, fontWeight: "bold" }}>Eski Analizler</Text>
                                    <TouchableOpacity onPress={closeMenu}>
                                        <Ionicons name="close" size={28} color="#000" />
                                    </TouchableOpacity>
                                </View>

                                {/* Menü içeriği burada başka bir bileşen */}
                                <MenuPage onClose={closeMenu} />
                            </View>

                            {/* Yeni Analiz Butonu */}
                            <TouchableOpacity
                                onPress={() => {
                                    closeMenu();
                                    navigation.navigate("HomeScreen");
                                }}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    backgroundColor: "#e67828",
                                    paddingVertical: 12,
                                    paddingHorizontal: 20,
                                    borderRadius: 10,
                                    marginTop: 20,
                                    alignSelf: "center",
                                    width: "90%",
                                    justifyContent: "center",
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 3,
                                    elevation: 5,
                                }}
                            >
                                <Ionicons name="add-circle-outline" size={24} color="white" style={{ marginRight: 10 }} />
                                <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Yeni Analiz</Text>
                            </TouchableOpacity>
                        </Pressable>
                    </Animated.View>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
};

export default Header;
