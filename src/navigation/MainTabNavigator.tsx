import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../styles/theme';

// 引入你的四個頁面
import Comment from '../screens/Comment'; // 需建立
import CourseSelection from '../screens/CourseSelection'; // 需建立
import Credit from '../screens/Credit'; // 需建立
import TimetableScreen from '../screens/Timetable';


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
            <Tab.Screen name="學分查詢" component={Credit} />
        </Tab.Navigator>
    );
};

export default MainTabNavigator;