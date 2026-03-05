import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import axios from 'axios';
import * as Localization from 'expo-localization';

const Test = () => {
    const [message, setMessage] = useState('');
    const [translatedMessage, setTranslatedMessage] = useState('');
    const [deviceLanguage, setDeviceLanguage] = useState('en');

    useEffect(() => {
        const locales = Localization.getLocales();
        if (locales.length > 0) {
            setDeviceLanguage(locales[0].languageCode);
        }
    }, []);

    const translateText = async (text: string) => {
        const apiKey = 'AIzaSyADi02pLUJEaHDmBfS7HauMNokwnBAQ1Mo';
        const BASE_URL = 'https://translation.googleapis.com/language/translate/v2'
        const params = {
            q: text,
            target: deviceLanguage,
            key: apiKey,
        }
        try {
            const response = await axios.get(BASE_URL, { params: params });
            setTranslatedMessage(response.data.data.translations[0].translatedText);
        } catch (error: any) {
            console.log('ERROR_MESSAGE:', error.message);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Chat Application</Text>

            <TextInput
                style={styles.input}
                placeholder="Type your message"
                value={message}
                onChangeText={setMessage}
            />

            <Button title="Send Message" onPress={() => translateText(message)} />
            <Button title="Clear Message" onPress={() => { setMessage(''); setTranslatedMessage(''); }} />

            <View style={styles.translatedContainer}>
                <Text style={[styles.translatedText, { color: 'blue' }]}>Original Message: {message}</Text>
                <Text style={[styles.translatedText, { color: 'green' }]}>Translated Message: {translatedMessage}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 20,
        borderRadius: 50
    },
    translatedContainer: {
        marginTop: 20,
    },
    translatedText: {
        fontSize: 20,
        marginVertical: 10,
    },
});

export default Test;