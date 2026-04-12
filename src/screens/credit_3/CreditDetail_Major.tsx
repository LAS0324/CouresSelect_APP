import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CreditDetailMajor({ navigation }: any) {
    const title = '系專門課程';

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            
            <View style={styles.header}>
                <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#654321" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title}</Text>
                <View style={styles.rightPlaceholder} />
            </View>
            
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={22} color="#888" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="搜尋課程名稱或是授課老師..."
                        placeholderTextColor="#999"
                    />
                </View>
            </View>

            <View style={styles.content}>
                
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 50,
        backgroundColor: 'transparent',
    },
    backButton: {
        width: 40,
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#654321',
    },
    rightPlaceholder: {
        width: 40,
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginTop: 15,
        marginBottom: 10,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EAEAEA',
        borderRadius: 24,
        paddingHorizontal: 16,
        height: 48,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    }
});