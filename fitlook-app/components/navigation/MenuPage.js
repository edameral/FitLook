import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import config from "../services/config";
import { useNavigation } from '@react-navigation/native';

const MenuPage = ({ onClose }) => {  // navigation propunu ekledik
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${config.BASE_URL}/analysis`);
                if (!response.ok) throw new Error("Fetch failed");
                const data = await response.json();

                // createdAt tarihine göre en güncelden başlamak için sıralama
                const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                setAnalyses(sortedData);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleAnalysisPress = (id) => {
        console.log("Seçilen Analysis id:", id);
        onClose();
        navigation.navigate("ChatBotRead", { analysisId: id });  // id'yi gönderiyoruz
    };

    if (loading) {
        return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
    }

    return (
        <View>
            <FlatList
                data={analyses}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleAnalysisPress(item.id)} style={{ marginBottom: 15 }}>
                        <Text style={{ fontSize: 16 }}>{item.title}</Text>
                        <Text style={{ fontSize: 12, color: "gray" }}>{new Date(item.createdAt).toLocaleString()}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

export default MenuPage;
