import { Stack } from 'expo-router';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { CourseProvider } from '../src/context/CourseContext';
import MainTabNavigator from '../src/navigation/MainTabNavigator';
import LoginScreen from '../src/screens/Login';
import SetupScreen from '../src/screens/Setup';

// 確保 Firebase 在這裡也有初始化
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
    const [isSetupComplete, setIsSetupComplete] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        // 監聽 Firebase 登入狀態
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setIsInitializing(true); // 開始檢查狀態前先顯示 Loading
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
            } else {
                setIsLoggedIn(false);
                setIsSetupComplete(false);
            }
            setIsInitializing(false); // 檢查完畢，關閉 Loading
        });

        // 取消監聽
        return () => unsubscribe();
    }, []);

    if (isInitializing) {
        return null; // 可以放個 Loading 畫面，這裡先留白
    }

    return (
        <>
            <CourseProvider>
                <Stack.Screen options={{ headerShown: false }} />

                {/* 階段 1：未登入 */}
                {!isLoggedIn && !isInitializing && (
                    <LoginScreen onLogin={() => {}} />
                )}

                {/* 階段 2：已登入但未選學校 */}
                {isLoggedIn && !isSetupComplete && (
                    <SetupScreen onFinish={() => setIsSetupComplete(true)} />
                )}

                {/* 階段 3：進入主程式 (Tab Bar) */}
                {isLoggedIn && isSetupComplete && (
                    <MainTabNavigator />
                )}
            </CourseProvider>

        </>
    );
}
