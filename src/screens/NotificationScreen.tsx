import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 建立一些預設的通知假資料
const MOCK_NOTIFICATIONS = [
    { id: '1', title: '選課系統開放', description: '114-2 學期選課系統已正式開放。', date: '2026-04-15' },
    { id: '2', title: '學分檢核提醒', description: '本次第一階段選課開始於2/23號 請同學多加注意。', date: '2026-04-10' },
];

export default function NotificationScreen({ navigation }: any) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            
            {/* Header 區塊：風格與 CreditDetail 等頁面保持一致 */}
            <View style={styles.header}>
                <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#654321" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>通知</Text>
                <View style={styles.rightPlaceholder} />
            </View>

            {/* 通知列表區塊 */}
            <FlatList
                data={MOCK_NOTIFICATIONS}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                    <TouchableOpacity activeOpacity={0.8} style={styles.notificationCard}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="notifications" size={24} color="#D0B589" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.description}>{item.description}</Text>
                            <Text style={styles.date}>{item.date}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-off-outline" size={48} color="#CCC" />
                        <Text style={styles.emptyText}>目前沒有新通知</Text>
                    </View>
                }
            />
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
    listContainer: {
        padding: 20,
    },
    notificationCard: {
        flexDirection: 'row',
        backgroundColor: '#FDFBF7',
        borderWidth: 1.5,
        borderColor: '#E8DED1',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    iconContainer: {
        marginRight: 16,
        justifyContent: 'center',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 8,
    },
    date: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
        color: '#999',
    }
});