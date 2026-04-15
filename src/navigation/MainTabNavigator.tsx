import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../styles/theme';

// 引入你的四個頁面
import CourseSelection_2 from '../screens/CourseSelection_2'; // 需建立
import CreditStackNavigator from '../screens/credit_3/CreditStackNavigator';
import NotificationScreen from '../screens/NotificationScreen';
import SettingsStackNavigator from '../screens/SettingsStackNavigator';
import TimetableScreen_1 from '../screens/Timetable_1';

const settingsSvgData = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTkuMjUwMiAyMkw4Ljg1MDIgMTguOEM4LjYzMzUzIDE4LjcxNjcgOC40MjkzNiAxOC42MTY3IDguMjM3NyAxOC41QzguMDQ2MDMgMTguMzgzMyA3Ljg1ODUzIDE4LjI1ODMgNy42NzUyIDE4LjEyNUw0LjcwMDIgMTkuMzc1TDEuOTUwMiAxNC42MjVMNC41MjUyIDEyLjY3NUM0LjUwODUzIDEyLjU1ODMgNC41MDAyIDEyLjQ0NTggNC41MDAyIDEyLjMzNzVWMTEuNjYyNUM0LjUwMDIgMTEuNTU0MiA0LjUwODUzIDExLjQ0MTcgNC41MjUyIDExLjMyNUwxLjk1MDIgOS4zNzVMNC43MDAyIDQuNjI1TDcuNjc1MiA1Ljg3NUM3Ljg1ODUzIDUuNzQxNjcgOC4wNTAyIDUuNjE2NjcgOC4yNTAyIDUuNUM4LjQ1MDIgNS4zODMzMyA4LjY1MDIgNS4yODMzMyA4Ljg1MDIgNS4yTDkuMjUwMiAySDE0Ljc1MDJMMTUuMTUwMiA1LjJDMTUuMzY2OSA1LjI4MzMzIDE1LjU3MSA1LjM4MzMzIDE1Ljc2MjcgNS41QzE1Ljk1NDQgNS42MTY2NyAxNi4xNDE5IDUuNzQxNjcgMTYuMzI1MiA1Ljg3NUwxOS4zMDAyIDQuNjI1TDIyLjA1MDIgOS4zNzVMMTkuNDc1MiAxMS4zMjVDMTkuNDkxOSAxMS40NDE3IDE5LjUwMDIgMTEuNTU0MiAxOS41MDAyIDExLjY2MjVWMTIuMzM3NUMxOS41MDAyIDEyLjQ0NTggMTkuNDgzNSAxMi41NTgzIDE5LjQ1MDIgMTIuNjc1TDIyLjAyNTIgMTQuNjI1TDE5LjI3NTIgMTkuMzc1TDE2LjMyNTIgMTguMTI1QzE2LjE0MTkgMTguMjU4MyAxNS45NTAyIDE4LjM4MzMgMTUuNzUwMiAxOC41QzE1LjU1MDIgMTguNjE2NyAxNS4zNTAyIDE4LjcxNjcgMTUuMTUwMiAxOC44TDE0Ljc1MDIgMjJIOS4yNTAyWk0xMi4wNTAyIDE1LjVDMTMuMDE2OSAxNS41IDEzLjg0MTkgMTUuMTU4MyAxNC41MjUyIDE0LjQ3NUMxNS4yMDg1IDEzLjc5MTcgMTUuNTUwMiAxMi45NjY3IDE1LjU1MDIgMTJDMTUuNTUwMiAxMS4wMzMzIDE1LjIwODUgMTAuMjA4MyAxNC41MjUyIDkuNTI1QzEzLjg0MTkgOC44NDE2NyAxMy4wMTY5IDguNSAxMi4wNTAyIDguNUMxMS4wNjY5IDguNSAxMC4yMzc3IDguODQxNjcgOS41NjI3IDkuNTI1QzguODg3NyAxMC4yMDgzIDguNTUwMiAxMS4wMzMzIDguNTUwMiAxMkM4LjU1MDIgMTIuOTY2NyA4Ljg4NzcgMTMuNzkxNyA5LjU2MjcgMTQuNDc1QzEwLjIzNzcgMTUuMTU4MyAxMS4wNjY5IDE1LjUgMTIuMDUwMiAxNS41WiIgZmlsbD0iIzVGNUY1RiIvPgo8L3N2Zz4=";

const ScheduleIcon = ({ color, size }: { color: string, size: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 14C12.1978 14 12.3911 13.9414 12.5556 13.8315C12.72 13.7216 12.8482 13.5654 12.9239 13.3827C12.9996 13.2 13.0194 12.9989 12.9808 12.8049C12.9422 12.6109 12.847 12.4327 12.7071 12.2929C12.5673 12.153 12.3891 12.0578 12.1951 12.0192C12.0011 11.9806 11.8 12.0004 11.6173 12.0761C11.4346 12.1518 11.2784 12.28 11.1685 12.4444C11.0586 12.6089 11 12.8022 11 13C11 13.2652 11.1054 13.5196 11.2929 13.7071C11.4804 13.8946 11.7348 14 12 14ZM17 14C17.1978 14 17.3911 13.9414 17.5556 13.8315C17.72 13.7216 17.8482 13.5654 17.9239 13.3827C17.9996 13.2 18.0194 12.9989 17.9808 12.8049C17.9422 12.6109 17.847 12.4327 17.7071 12.2929C17.5673 12.153 17.3891 12.0578 17.1951 12.0192C17.0011 11.9806 16.8 12.0004 16.6173 12.0761C16.4346 12.1518 16.2784 12.28 16.1685 12.4444C16.0586 12.6089 16 12.8022 16 13C16 13.2652 16.1054 13.5196 16.2929 13.7071C16.4804 13.8946 16.7348 14 17 14ZM12 18C12.1978 18 12.3911 17.9414 12.5556 17.8315C12.72 17.7216 12.8482 17.5654 12.9239 17.3827C12.9996 17.2 13.0194 16.9989 12.9808 16.8049C12.9422 16.6109 12.847 16.4327 12.7071 16.2929C12.5673 16.153 12.3891 16.0578 12.1951 16.0192C12.0011 15.9806 11.8 16.0004 11.6173 16.0761C11.4346 16.1518 11.2784 16.28 11.1685 16.4444C11.0586 16.6089 11 16.8022 11 17C11 17.2652 11.1054 17.5196 11.2929 17.7071C11.4804 17.8946 11.7348 18 12 18ZM17 18C17.1978 18 17.3911 17.9414 17.5556 17.8315C17.72 17.7216 17.8482 17.5654 17.9239 17.3827C17.9996 17.2 18.0194 16.9989 17.9808 16.8049C17.9422 16.6109 17.847 16.4327 17.7071 16.2929C17.5673 16.153 17.3891 16.0578 17.1951 16.0192C17.0011 15.9806 16.8 16.0004 16.6173 16.0761C16.4346 16.1518 16.2784 16.28 16.1685 16.4444C16.0586 16.6089 16 16.8022 16 17C16 17.2652 16.1054 17.5196 16.2929 17.7071C16.4804 17.8946 16.7348 18 17 18ZM7 14C7.19778 14 7.39112 13.9414 7.55557 13.8315C7.72002 13.7216 7.84819 13.5654 7.92388 13.3827C7.99957 13.2 8.01937 12.9989 7.98079 12.8049C7.9422 12.6109 7.84696 12.4327 7.70711 12.2929C7.56725 12.153 7.38907 12.0578 7.19509 12.0192C7.00111 11.9806 6.80004 12.0004 6.61732 12.0761C6.43459 12.1518 6.27841 12.28 6.16853 12.4444C6.05865 12.6089 6 12.8022 6 13C6 13.2652 6.10536 13.5196 6.29289 13.7071C6.48043 13.8946 6.73478 14 7 14ZM19 4H18V3C18 2.73478 17.8946 2.48043 17.7071 2.29289C17.5196 2.10536 17.2652 2 17 2C16.7348 2 16.4804 2.10536 16.2929 2.29289C16.1054 2.48043 16 2.73478 16 3V4H8V3C8 2.73478 7.89464 2.48043 7.70711 2.29289C7.51957 2.10536 7.26522 2 7 2C6.73478 2 6.48043 2.10536 6.29289 2.29289C6.10536 2.48043 6 2.73478 6 3V4H5C4.20435 4 3.44129 4.31607 2.87868 4.87868C2.31607 5.44129 2 6.20435 2 7V19C2 19.7956 2.31607 20.5587 2.87868 21.1213C3.44129 21.6839 4.20435 22 5 22H19C19.7956 22 20.5587 21.6839 21.1213 21.1213C21.6839 20.5587 22 19.7956 22 19V7C22 6.20435 21.6839 5.44129 21.1213 4.87868C20.5587 4.31607 19.7956 4 19 4ZM20 19C20 19.2652 19.8946 19.5196 19.7071 19.7071C19.5196 19.8946 19.2652 20 19 20H5C4.73478 20 4.48043 19.8946 4.29289 19.7071C4.10536 19.5196 4 19.2652 4 19V10H20V19ZM20 8H4V7C4 6.73478 4.10536 6.48043 4.29289 6.29289C4.48043 6.10536 4.73478 6 5 6H19C19.2652 6 19.5196 6.10536 19.7071 6.29289C19.8946 6.48043 20 6.73478 20 7V8ZM7 18C7.19778 18 7.39112 17.9414 7.55557 17.8315C7.72002 17.7216 7.84819 17.5654 7.92388 17.3827C7.99957 17.2 8.01937 16.9989 7.98079 16.8049C7.9422 16.6109 7.84696 16.4327 7.70711 16.2929C7.56725 16.153 7.38907 16.0578 7.19509 16.0192C7.00111 15.9806 6.80004 16.0004 6.61732 16.0761C6.43459 16.1518 6.27841 16.28 6.16853 16.4444C6.05865 16.6089 6 16.8022 6 17C6 17.2652 6.10536 17.5196 6.29289 17.7071C6.48043 17.8946 6.73478 18 7 18Z" fill={color} />
    </Svg>
);

const FluentBookIcon = ({ color, size }: { color: string, size: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M7 6C7 5.73478 7.10536 5.48043 7.29289 5.29289C7.48043 5.10536 7.73478 5 8 5H16C16.2652 5 16.5196 5.10536 16.7071 5.29289C16.8946 5.48043 17 5.73478 17 6V8C17 8.26522 16.8946 8.51957 16.7071 8.70711C16.5196 8.89464 16.2652 9 16 9H8C7.73478 9 7.48043 8.89464 7.29289 8.70711C7.10536 8.51957 7 8.26522 7 8V6ZM8.5 7.5H15.5V6.5H8.5V7.5ZM4 4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2H18C18.3283 2 18.6534 2.06466 18.9567 2.1903C19.26 2.31594 19.5356 2.50009 19.7678 2.73223C19.9999 2.96438 20.1841 3.23998 20.3097 3.54329C20.4353 3.84661 20.5 4.1717 20.5 4.5V11.732C20.0249 11.4849 19.5211 11.2975 19 11.174V4.5C19 4.23478 18.8946 3.98043 18.7071 3.79289C18.5196 3.60536 18.2652 3.5 18 3.5H6.5C6.23478 3.5 5.98043 3.60536 5.79289 3.79289C5.60536 3.98043 5.5 4.23478 5.5 4.5V18H11.019C11.0597 18.5213 11.1577 19.0213 11.313 19.5H5.5C5.5 19.7652 5.60536 20.0196 5.79289 20.2071C5.98043 20.3946 6.23478 20.5 6.5 20.5H11.732C12.0181 21.0488 12.3811 21.5539 12.81 22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5ZM23 17.5C23 16.0413 22.4205 14.6424 21.3891 13.6109C20.3576 12.5795 18.9587 12 17.5 12C16.0413 12 14.6424 12.5795 13.6109 13.6109C12.5795 14.6424 12 16.0413 12 17.5C12 18.9587 12.5795 20.3576 13.6109 21.3891C14.6424 22.4205 16.0413 23 17.5 23C18.9587 23 20.3576 22.4205 21.3891 21.3891C22.4205 20.3576 23 18.9587 23 17.5ZM18 18L18.001 20.503C18.001 20.6356 17.9483 20.7628 17.8546 20.8566C17.7608 20.9503 17.6336 21.003 17.501 21.003C17.3684 21.003 17.2412 20.9503 17.1474 20.8566C17.0537 20.7628 17.001 20.6356 17.001 20.503V18H14.496C14.3634 18 14.2362 17.9473 14.1424 17.8536C14.0487 17.7598 13.996 17.6326 13.996 17.5C13.996 17.3674 14.0487 17.2402 14.1424 17.1464C14.2362 17.0527 14.3634 17 14.496 17H17V14.5C17 14.3674 17.0527 14.2402 17.1464 14.1464C17.2402 14.0527 17.3674 14 17.5 14C17.6326 14 17.7598 14.0527 17.8536 14.1464C17.9473 14.2402 18 14.3674 18 14.5V17H20.497C20.6296 17 20.7568 17.0527 20.8506 17.1464C20.9443 17.2402 20.997 17.3674 20.997 17.5C20.997 17.6326 20.9443 17.7598 20.8506 17.8536C20.7568 17.9473 20.6296 18 20.497 18H18Z" fill={color} />
    </Svg>
);

const ChecklistIcon = ({ color, size }: { color: string, size: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M3 6L4 7L6 5M3 12L4 13L6 11M3 18L4 19L6 17M9 6H21M9 12H21M9 18H21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const TimetableStack = createNativeStackNavigator();
function TimetableStackNavigator() {
    return (
        <TimetableStack.Navigator screenOptions={{ headerShown: false }}>
            <TimetableStack.Screen name="TimetableMain" component={TimetableScreen_1} />
            <TimetableStack.Screen name="NotificationScreen" component={NotificationScreen} />
        </TimetableStack.Navigator>
    );
}

const CourseSelectionStack = createNativeStackNavigator();
function CourseSelectionStackNavigator() {
    return (
        <CourseSelectionStack.Navigator screenOptions={{ headerShown: false }}>
            <CourseSelectionStack.Screen name="CourseSelectionMain" component={CourseSelection_2} />
            <CourseSelectionStack.Screen name="NotificationScreen" component={NotificationScreen} />
        </CourseSelectionStack.Navigator>
    );
}

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.placeholder || '#AAA',
                tabBarStyle: {
                    backgroundColor: COLORS.surface || '#FFF',
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
            <Tab.Screen 
                name="課表" 
                component={TimetableStackNavigator} 
                options={{
                    tabBarIcon: ({ color, size }) => <ScheduleIcon color={color} size={size} />
                }}
            />
            <Tab.Screen 
                name="選課" 
                component={CourseSelectionStackNavigator} 
                options={{
                    tabBarIcon: ({ color, size }) => <FluentBookIcon color={color} size={size} />
                }}
            />
            <Tab.Screen 
                name="學分檢核" 
                component={CreditStackNavigator} 
                options={{
                    tabBarIcon: ({ color, size }) => <ChecklistIcon color={color} size={size} />
                }}
            />
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