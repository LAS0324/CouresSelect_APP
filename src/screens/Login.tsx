import { getApp, getApps, initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../styles/theme';

// 初始化 Firebase Config (Web SDK - 支援 Expo Go 的版本)
const firebaseConfig = {
    apiKey: "AIzaSyBAKhdryuoSlPhhgedbxb5-pL24TtAzfzA",
    authDomain: "courseapp-788ad.firebaseapp.com",
    projectId: "courseapp-788ad",
    storageBucket: "courseapp-788ad.firebasestorage.app",
    messagingSenderId: "650322013005",
    appId: "1:650322013005:web:5855bdc8aa1c0dc70be504",
    measurementId: "G-L6FBFFW8PM"
};

// 避免 React Native 熱更新時重複初始化 Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// 定義組件接收的參數類型
interface LoginProps {
    onLogin: () => void;
}

const LoginScreen: React.FC<LoginProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 處理登入
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("請填寫完整", "請輸入信箱與密碼！");
            return;
        }

        try {
            setIsLoading(true);
            await signInWithEmailAndPassword(auth, email, password);
            onLogin(); // 登入成功，導向主頁面
        } catch (error: any) {
            console.error(error);
            Alert.alert("登入失敗", "請確認您的信箱與密碼是否正確，或嘗試註冊。");
        } finally {
            setIsLoading(false);
        }
    };

    // 處理註冊
    const handleRegister = async () => {
        if (!email || !password) {
            Alert.alert("請填寫完整", "請輸入信箱與密碼！");
            return;
        }
        
        try {
            setIsLoading(true);
            await createUserWithEmailAndPassword(auth, email, password);
            Alert.alert("註冊成功", "您的帳號已建立，您現在已登入！");
            onLogin();
        } catch (error: any) {
            console.error(error);
            if (error.code === "auth/email-already-in-use") {
                Alert.alert("註冊失敗", "這個信箱已經被註冊過囉！");
            } else if (error.code === "auth/weak-password") {
                Alert.alert("註冊失敗", "密碼太弱了，請至少輸入 6 位數。");
            } else if (error.code === "auth/invalid-email") {
                Alert.alert("註冊失敗", "信箱格式不正確！");
            } else {
                Alert.alert("註冊失敗", error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.contentContainer}
            >
                {/* 插圖區域 */}
                <View style={styles.imageWrapper}>
                    <View style={styles.imagePlaceholder}>
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

                {/* 使用者輸入區域 */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="請輸入 Email 信箱"
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="請輸入密碼 (至少 6 位數)"
                        placeholderTextColor="#999"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                {/* Email 登入按鈕 */}
                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleLogin}
                    activeOpacity={0.8}
                    disabled={isLoading}
                >
                    <Text style={styles.loginButtonText}>
                        {isLoading ? "處理中..." : "登入"}
                    </Text>
                </TouchableOpacity>

                {/* 註冊按鈕 */}
                <TouchableOpacity
                    style={[styles.loginButton, styles.registerButton]}
                    onPress={handleRegister}
                    activeOpacity={0.8}
                    disabled={isLoading}
                >
                    <Text style={[styles.loginButtonText, styles.registerButtonText]}>
                        還沒有帳號嗎？點此註冊
                    </Text>
                </TouchableOpacity>

            </KeyboardAvoidingView>

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
    },
    contentContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40,
    },
    imageWrapper: {
        position: "relative",
        marginBottom: 30,
    },
    imagePlaceholder: {
        width: 180,
        height: 180,
        backgroundColor: "#E6E5DF",
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
    },
    badge: {
        position: "absolute",
        bottom: -10,
        right: -10,
        backgroundColor: COLORS.accent,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
    },
    badgeText: {
        fontSize: 14,
        color: "#6B603D",
        fontWeight: "bold",
    },
    textSection: {
        alignItems: "center",
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: COLORS.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#999",
    },
    inputContainer: {
        width: "100%",
        marginBottom: 20,
    },
    input: {
        backgroundColor: "#FFF",
        width: "100%",
        height: 55,
        borderRadius: 15,
        paddingHorizontal: 20,
        fontSize: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#E6E5DF",
        color: COLORS.text,
    },
    loginButton: {
        backgroundColor: COLORS.primary || "#4A90E2", 
        width: "100%",
        height: 55,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 15,
    },
    loginButtonText: {
        fontSize: 16,
        color: "#FFF",
        fontWeight: "bold",
    },
    registerButton: {
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: COLORS.primary || "#4A90E2",
    },
    registerButtonText: {
        color: COLORS.primary || "#4A90E2",
    },
    footer: {
        alignItems: "center",
        paddingBottom: 20,
    },
    footerText: {
        fontSize: 10,
        color: "#CCC",
        letterSpacing: 1,
    },
});

export default LoginScreen;
