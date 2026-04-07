import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../styles/theme';

// 引入你的四個頁面
import CourseSelection from '../screens/CourseSelection_2'; // 需建立
import Credit from '../screens/Credit_3'; // 需建立
import Comment from '../screens/Settings_4'; // 需建立
import TimetableScreen from '../screens/Timetable_1';


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
                    height: 55 + insets.bottom,
                    paddingBottom:10,
                }
            }}
        >
            <Tab.Screen name="課表" component={TimetableScreen} />
            <Tab.Screen name="選課" component={CourseSelection} />
            <Tab.Screen name="課堂評論" component={Comment} />
            <Tab.Screen name="學分檢核" component={Credit} />
        </Tab.Navigator>
    );
};

export default MainTabNavigator;