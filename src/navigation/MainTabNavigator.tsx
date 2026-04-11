import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'expo-image';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../styles/theme';

// 引入你的四個頁面
import CourseSelection_2 from '../screens/CourseSelection_2'; // 需建立
import CreditStackNavigator from '../screens/credit_3/CreditStackNavigator';
import SettingsStackNavigator from '../screens/SettingsStackNavigator';
import TimetableScreen_1 from '../screens/Timetable_1';

const settingsSvgData = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTkuMjUwMiAyMkw4Ljg1MDIgMTguOEM4LjYzMzUzIDE4LjcxNjcgOC40MjkzNiAxOC42MTY3IDguMjM3NyAxOC41QzguMDQ2MDMgMTguMzgzMyA3Ljg1ODUzIDE4LjI1ODMgNy42NzUyIDE4LjEyNUw0LjcwMDIgMTkuMzc1TDEuOTUwMiAxNC42MjVMNC41MjUyIDEyLjY3NUM0LjUwODUzIDEyLjU1ODMgNC41MDAyIDEyLjQ0NTggNC41MDAyIDEyLjMzNzVWMTEuNjYyNUM0LjUwMDIgMTEuNTU0MiA0LjUwODUzIDExLjQ0MTcgNC41MjUyIDExLjMyNUwxLjk1MDIgOS4zNzVMNC43MDAyIDQuNjI1TDcuNjc1MiA1Ljg3NUM3Ljg1ODUzIDUuNzQxNjcgOC4wNTAyIDUuNjE2NjcgOC4yNTAyIDUuNUM4LjQ1MDIgNS4zODMzMyA4LjY1MDIgNS4yODMzMyA4Ljg1MDIgNS4yTDkuMjUwMiAySDE0Ljc1MDJMMTUuMTUwMiA1LjJDMTUuMzY2OSA1LjI4MzMzIDE1LjU3MSA1LjM4MzMzIDE1Ljc2MjcgNS41QzE1Ljk1NDQgNS42MTY2NyAxNi4xNDE5IDUuNzQxNjcgMTYuMzI1MiA1Ljg3NUwxOS4zMDAyIDQuNjI1TDIyLjA1MDIgOS4zNzVMMTkuNDc1MiAxMS4zMjVDMTkuNDkxOSAxMS40NDE3IDE5LjUwMDIgMTEuNTU0MiAxOS41MDAyIDExLjY2MjVWMTIuMzM3NUMxOS41MDAyIDEyLjQ0NTggMTkuNDgzNSAxMi41NTgzIDE5LjQ1MDIgMTIuNjc1TDIyLjAyNTIgMTQuNjI1TDE5LjI3NTIgMTkuMzc1TDE2LjMyNTIgMTguMTI1QzE2LjE0MTkgMTguMjU4MyAxNS45NTAyIDE4LjM4MzMgMTUuNzUwMiAxOC41QzE1LjU1MDIgMTguNjE2NyAxNS4zNTAyIDE4LjcxNjcgMTUuMTUwMiAxOC44TDE0Ljc1MDIgMjJIOS4yNTAyWk0xMi4wNTAyIDE1LjVDMTMuMDE2OSAxNS41IDEzLjg0MTkgMTUuMTU4MyAxNC41MjUyIDE0LjQ3NUMxNS4yMDg1IDEzLjc5MTcgMTUuNTUwMiAxMi45NjY3IDE1LjU1MDIgMTJDMTUuNTUwMiAxMS4wMzMzIDE1LjIwODUgMTAuMjA4MyAxNC41MjUyIDkuNTI1QzEzLjg0MTkgOC44NDE2NyAxMy4wMTY5IDguNSAxMi4wNTAyIDguNUMxMS4wNjY5IDguNSAxMC4yMzc3IDguODQxNjcgOS41NjI3IDkuNTI1QzguODg3NyAxMC4yMDgzIDguNTUwMiAxMS4wMzMzIDguNTUwMiAxMkM4LjU1MDIgMTIuOTY2NyA4Ljg4NzcgMTMuNzkxNyA5LjU2MjcgMTQuNDc1QzEwLjIzNzcgMTUuMTU4MyAxMS4wNjY5IDE1LjUgMTIuMDUwMiAxNS41WiIgZmlsbD0iIzVGNUY1RiIvPgo8L3N2Zz4=";

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: '#AAA',
                tabBarStyle: {
                    backgroundColor: '#FFF',
                    borderTopWidth: 0,
                    elevation: 10,
                    height: 50 + insets.bottom,
                    paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
                    paddingTop: 5,
                },
                tabBarItemStyle: {
                    justifyContent: 'center',
                    alignItems: 'center',
                }
            }}
        >
            <Tab.Screen name="課表" component={TimetableScreen_1} />
            <Tab.Screen name="選課" component={CourseSelection_2} />
            <Tab.Screen name="學分檢核" component={CreditStackNavigator} />
            <Tab.Screen 
                name="設定" 
                component={SettingsStackNavigator} 
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Image 
                            source={{ uri: settingsSvgData }} 
                            style={{ width: size, height: size, tintColor: color }} 
                            contentFit="contain" 
                        />
                    )
                }}
            />
            
        </Tab.Navigator>
    );
};

export default MainTabNavigator;