import { Stack } from 'expo-router';
import React, { useState } from 'react';
import MainTabNavigator from '../src/navigation/MainTabNavigator'; // 等下要建立
import LoginScreen from '../src/screens/Login';
import SetupScreen from '../src/screens/Setup';
import { CourseProvider } from '../src/context/CourseContext';

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSetupComplete, setIsSetupComplete] = useState(false);

    return (
        <>
            <CourseProvider>
                <Stack.Screen options={{ headerShown: false }} />

                {/* 階段 1：未登入 */}
                {!isLoggedIn && (
                    <LoginScreen onLogin={() => setIsLoggedIn(true)} />
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
