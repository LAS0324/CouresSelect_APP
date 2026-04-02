import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { COLORS } from '../styles/theme';

// 定義組件接收的參數類型 (TypeScript 語法)
interface LoginProps {
    onLogin: () => void;
}

const LoginScreen: React.FC<LoginProps> = ({ onLogin }) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.contentContainer}>

                {/* 插圖區域：如果圖片還沒放好，會顯示一個淡色的圓角方塊 */}
                <View style={styles.imageWrapper}>
                    <View style={styles.imagePlaceholder}>
                        {/* 等你把 owl.png 放入 src/images 後，可以解開下方註解 */}
                        {/* <Image source={require('../images/owl.png')} style={styles.image} /> */}
                        <Text style={{ fontSize: 50 }}>🦉</Text>
                    </View>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>✨ 學習夥伴</Text>
                    </View>
                </View>

                {/* 標題與標語 */}
                <View style={styles.textSection}>
                    <Text style={styles.title}>歡迎使用選課助手</Text>
                    <Text style={styles.subtitle}>開展您的學術禪意之旅</Text>
                </View>

                {/* Google 登入按鈕：按下後觸發 onLogin */}
                <TouchableOpacity
                    style={styles.googleButton}
                    onPress={onLogin}
                    activeOpacity={0.8}
                >
                    <View style={styles.googleIconPlaceholder} />
                    <Text style={styles.googleButtonText}>使用 Google 帳號登入</Text>
                </TouchableOpacity>

                <TouchableOpacity>
                    <Text style={styles.otherLoginText}>其他登入方式 →</Text>
                </TouchableOpacity>
            </View>

            {/* 底部版本資訊 */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>THE ACADEMIC SANCTUARY • VERSION 2.0</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingHorizontal: 40,
    },
    imageWrapper: {
        position: 'relative',
        marginBottom: 40,
    },
    imagePlaceholder: {
        width: 220,
        height: 220,
        backgroundColor: '#E6E5DF',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: 220,
        height: 220,
        borderRadius: 30,
    },
    badge: {
        position: 'absolute',
        bottom: -10,
        right: -10,
        backgroundColor: COLORS.accent,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
    },
    badgeText: {
        fontSize: 14,
        color: '#6B603D',
        fontWeight: 'bold',
    },
    textSection: {
        alignItems: 'center',
        marginBottom: 50,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#999',
    },
    googleButton: {
        flexDirection: 'row',
        backgroundColor: '#E6E5DF',
        width: '100%',
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    googleIconPlaceholder: {
        width: 20,
        height: 20,
        backgroundColor: '#AAA',
        marginRight: 10,
        borderRadius: 4,
    },
    googleButtonText: {
        fontSize: 16,
        color: COLORS.text,
        fontWeight: '600',
    },
    otherLoginText: {
        color: '#999',
        fontSize: 14,
    },
    footer: {
        marginBottom: 20,
    },
    footerText: {
        fontSize: 10,
        color: '#CCC',
        letterSpacing: 1,
    },
});

export default LoginScreen;