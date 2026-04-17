import { Stack } from 'expo-router';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { CourseProvider } from '../src/context/CourseContext';
import MainTabNavigator from '../src/navigation/MainTabNavigator';
import LoginScreen from '../src/screens/Login';
import SetupScreen from '../src/screens/Setup';

// 確保 Firebase 初始化
const firebaseConfig = {
    apiKey: "AIzaSyBAKhdryuoSlPhhgedbxb5-pL24TtAzfzA",
    authDomain: "courseapp-788ad.firebaseapp.com",
    projectId: "courseapp-788ad",
    storageBucket: "courseapp-788ad.firebasestorage.app",
    messagingSenderId: "650322013005",
    appId: "1:650322013005:web:5855bdc8aa1c0dc70be504",
    measurementId: "G-L6FBFFW8PM"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isGuest, setIsGuest] = useState(false); // 💡 新增訪客狀態
    const [isSetupComplete, setIsSetupComplete] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        // 監聽 Firebase 登入狀態
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setIsInitializing(true);
            if (user) {
                // 檢查是否已經設定過資料
                try {
                    const docRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists() && docSnap.data().setupCompleted) {
                        setIsSetupComplete(true);
                    } else {
                        setIsSetupComplete(false);
                    }
                } catch (error) {
                    console.error("讀取設定狀態失敗:", error);
                    setIsSetupComplete(false);
                }
                setIsLoggedIn(true);
                setIsGuest(false); // 💡 如果正式登入，就取消訪客狀態
            } else {
                setIsLoggedIn(false);
                setIsSetupComplete(false);
            }
            setIsInitializing(false);
        });

        return () => unsubscribe();
    }, []);

    if (isInitializing) {
        return null;
    }

    return (
        <>
            <CourseProvider>
                <Stack.Screen options={{ headerShown: false }} />

                {/* 階段 1：未登入且非訪客 */}
                {!isLoggedIn && !isGuest && !isInitializing && (
                    <LoginScreen
                        onLogin={() => { }}
                        onGuestLogin={() => setIsGuest(true)} // 💡 傳遞訪客登入 Function
                    />
                )}

                {/* 階段 2：已登入（正式帳號）但未完成設定 */}
                {isLoggedIn && !isSetupComplete && !isGuest && (
                    <SetupScreen onFinish={() => setIsSetupComplete(true)} />
                )}

                {/* 階段 3：進入主程式 (滿足以下任一條件即進入)
                    1. 正式登入且完成設定 
                    2. 以訪客身份登入 (跳過 Setup)
                */}
                {((isLoggedIn && isSetupComplete) || isGuest) && (
                    <MainTabNavigator />
                )}
            </CourseProvider>
        </>
    );
}