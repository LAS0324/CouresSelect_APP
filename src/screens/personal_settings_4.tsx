import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getFirestore, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'expo-router'; // 💡 引入 useRouter
import React, { useState } from 'react';
import { Alert, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import TopNavBar from '../navigation/TopNavBar';
import { COLORS } from '../styles/theme';

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

const darkModeSvgData = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMjFDOS41IDIxIDcuMzc1IDIwLjEyNSA1LjYyNSAxOC4zNzVDMy44NzUgMTYuNjI1IDMgMTQuNSAzIDEyQzMgOS41IDMuODc1IDcuMzc1IDUuNjI1IDUuNjI1QzcuMzc1IDMuODc1IDkuNSAzIDEyIDNDMTIuMjMzMyAzIDEyLjQ2MjUgMy4wMDgzMyAxMi42ODc1IDMuMDI1QzEyLjkxMjUgMy4wNDE2NyAxMy4xMzMzIDMuMDY2NjcgMTMuMzUgMy4xQzEyLjY2NjcgMy41ODMzMyAxMi4xMjA4IDQuMjEyNSAxMS43MTI1IDQuOTg3NUMxMS4zMDQyIDUuNzYyNSAxMS4xIDYuNiAxMS4xIDcuNUMxMS4xIDkgMTEuNjI1IDEwLjI3NSAxMi42NzUgMTEuMzI1QzEzLjcyNSAxMi4zNzUgMTUgMTIuOSAxNi41IDEyLjlDMTcuNDE2NyAxMi45IDE4LjI1ODMgMTIuNjk1OCAxOS4wMjUgMTIuMjg3NUMxOS43OTE3IDExLjg3OTIgMjAuNDE2NyAxMS4zMzMzIDIwLjkgMTAuNjVDMjAuOTMzMyAxMC44NjY3IDIwLjk1ODMgMTEuMDg3NSAyMC45NzUgMTEuMzEyNUMyMC45OTE3IDExLjUzNzUgMjEgMTEuNzY2NyAyMSAxMkMyMSAxNC41IDIwLjEyNSAxNi42MjUgMTguMzc1IDE4LjM3NUMxNi42MjUgMjAuMTI1IDE0LjUgMjEgMTIgMjFaTTEyIDE5QzEzLjQ2NjcgMTkgMTQuNzgzMyAxOC41OTU4IDE1Ljk1IDE3Ljc4NzVDMTcuMTE2NyAxNi45NzkyIDE3Ljk2NjcgMTUuOTI1IDE4LjUgMTQuNjI1QzE4LjE2NjcgMTQuNzA4MyAxNy44MzMzIDE0Ljc3NSAxNy41IDE0LjgyNUMxNy4xNjY3IDE0Ljg3NSAxNi44MzMzIDE0LjkgMTYuNSAxNC45QzE0LjQ1IDE0LjkgMTIuNzA0MiAxNC4xNzkyIDExLjI2MjUgMTIuNzM3NUM5LjgyMDgzIDExLjI5NTggOS4xIDkuNTUgOS4xIDcuNUM5LjEgNy4xNjY2NyA5LjEyNSA2LjgzMzMzIDkuMTc1IDYuNUM5LjIyNSA2LjE2NjY3IDkuMjkxNjcgNS44MzMzMyA5LjM3NSA1LjVDOC4wNzUgNi4wMzMzMyA3LjAyMDgzIDYuODgzMzMgNi4yMTI1IDguMDVDNS40MDQxNyA5LjIxNjY3IDUgMTAuNTMzMyA1IDEyQzUgMTMuOTMzMyA1LjY4MzMzIDE1LjU4MzMgNy4wNSAxNi45NUM4LjQxNjY3IDE4LjMxNjcgMTAuMDY2NyAxOSAxMiAxOVoiIGZpbGw9IiNGRkZGRkYiLz48L3N2Zz4=";
const chevronForwardSvgData = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIuNiAxMkw4IDcuNEw5LjQgNkwxNS40IDEyTDkuNCAxOEw4IDE2LjZMMTIuNiAxMloiIGZpbGw9IiMwMDAwMDAiLz48L3N2Zz4=";

const setingOptions = [
    {
        title: "教學導覽",
        icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDdDMTIgNS45MzkxMyAxMS41Nzg2IDQuOTIxNzIgMTAuODI4NCA0LjE3MTU3QzEwLjA3ODMgMy40MjE0MyA5LjA2MDg3IDMgOCAzSDJWMThIOUM5Ljc5NTY1IDE4IDEwLjU1ODcgMTguMzE2MSAxMS4xMjEzIDE4Ljg3ODdDMTEuNjgzOSAxOS40NDEzIDEyIDIwLjIwNDQgMTIgMjFNMTIgN1YyMU0xMiA3QzEyIDUuOTM5MTMgMTIuNDIxNCA0LjkyMTcyIDEzLjE3MTYgNC4xNzE1N0MxMy45MjE3IDMuNDIxNDMgMTQuOTM5MSAzIDE2IDNIMjJWMThIMTVDMTQuMjA0NCAxOCAxMy40NDEzIDE4LjMxNjEgMTIuODc4NyAxOC44Nzg3QzEyLjMxNjEgMTkuNDQxMyAxMiAyMC4yMDQ0IDEyIDIxIiBzdHJva2U9IiNGRkZFRkEiIHN0cm9rZS13aWR0aD0iMi41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+"
    },
    {
        title: "關於應用程式",
        icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzExN18xNDEwKSI+CjxwYXRoIGQ9Ik0xMiAxNlYxMk0xMiA4SDEyLjAxTTIyIDEyQzIyIDE3LjUyMjggMTcuNTIyOCAyMiAxMiAyMkM2LjQ3NzE1IDIyIDIgMTcuNTIyOCAyIDEyQzIgNi40NzcxNSA2LjQ3NzE1IDIgMTIgMkMxNy41MjI4IDIgMjIgNi40NzcxNSAyMiAxMloiIHN0cm9rZT0iI0ZGRkVGQSIgc3Ryb2tlLXdpZHRoPSIyLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L2c+CjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzExN18xNDEwIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPg=="
    }
];

const logoutOption = {
    title: "登出",
    icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwLjE1IDEzSDhWMTFIMjAuMTVMMTguNiAxNC41NUwyMC4xNSAxM1pNMTUgOVY1SDVWMTlIMTVWMTVIMTdWMTlDMTcgMTkuNTUgMTYuODA0MiAyMC4wMjA4IDE2LjQxMjUgMjAuNDEyNUMxNi4wMjA4IDIwLjgwNDIgMTUuNTUgMjEgMTUgMjFINUM0LjQ1IDIxIDMuOTc5MTcgMjAuODA0MiAzLjU4NzUgMjAuNDEyNUMzLjE5NTgzIDIwLjAyMDggMyAxOS41NSAzIDE5VjVDMyA0LjQ1IDMuMTk1ODMgMy45NzkxNyAzLjU4NzUgMy41ODc1QzMuOTc5MTcgMy4xOTU4MyA0LjQ1IDMgNSAzSDE1QzE1LjU1IDMgMTYuMDIwOCAzLjE5NTgzIDE2LjQxMjUgMy41ODc1QzE2LjgwNDIgMy45NzkxNyAxNyA0LjQ1IDE3IDVWOUgxNVoiIGZpbGw9IiNGRkZFRkEiLz4KPC9zdmc+"
};

export default function PersonalSettings({ navigation }: any) {
    const router = useRouter(); // 💡 初始化路由器
    const [name, setName] = useState('您的名字');
    const [department, setDepartment] = useState('數位科技設計學系');
    const [className, setClassName] = useState('數位二甲');
    const [studentId, setStudentId] = useState('111319100');
    const [school, setSchool] = useState('尚未設定學校');
    const [isDarkMode, setIsDarkMode] = useState(false);

    const currentUser = auth.currentUser;

    React.useEffect(() => {
        if (!currentUser) return;

        const docRef = doc(db, "users", currentUser.uid);
        const unsubscribe = onSnapshot(docRef, (userDoc) => {
            if (userDoc.exists()) {
                const data = userDoc.data();
                if (data.name) setName(data.name);
                if (data.department) setDepartment(data.department);
                if (data.className) setClassName(data.className);
                if (data.studentId) setStudentId(data.studentId);
                if (data.school) setSchool(data.school);
            }
        }, (error) => {
            console.error("監聽使用者資料失敗:", error);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleEditPress = () => {
        navigation.navigate('EditProfile');
    };

    const handleLogout = () => {
        Alert.alert('登出確認', '確定要登出目前的帳號嗎？', [
            { text: '取消', style: 'cancel' },
            {
                text: '確定',
                style: 'destructive',
                onPress: async () => {
                    // 💡 如果是正式帳號，執行 Firebase 登出
                    if (currentUser) {
                        signOut(auth).catch((error) => {
                            console.error('Logout error: ', error);
                            Alert.alert('登出失敗', '出了點問題，請稍後再試。');
                        });
                    } else {
                        // 💡 訪客模式登出：直接導向根路徑 (index) 重置狀態
                        // 在 expo-router 中，replace('/') 會重新載入 index.tsx
                        router.replace('/');
                    }
                }
            }
        ]);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <TopNavBar
                title="設定"
                showMenu={false}
                showInfo={false}
                showRightMenu={true}
                onRightMenuPress={handleEditPress}
            />

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.avatarWrapper}>
                    <View style={styles.avatarContainer}>
                        <Ionicons name="person" size={60} color="#FFF" />
                    </View>
                </View>

                <TouchableOpacity onPress={handleEditPress} style={styles.nameContainer} activeOpacity={0.7}>
                    <View style={styles.nameBox}>
                        <Text style={styles.nameText}>{name}</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.emailContainer}>
                    <Text style={styles.emailText}>{school}</Text>
                </View>

                <TouchableOpacity onPress={handleEditPress} style={styles.tagsContainer} activeOpacity={0.7}>
                    <View style={styles.tagBadge}>
                        <Text style={styles.tagText}>{department}</Text>
                    </View>
                    <View style={styles.tagBadge}>
                        <Text style={styles.tagText}>{className}</Text>
                    </View>
                    <View style={styles.tagBadge}>
                        <Text style={styles.tagText}>{studentId}</Text>
                    </View>
                </TouchableOpacity>

                <View style={[styles.mainSettingsContainer, { backgroundColor: COLORS.settingsCardBg }]}>
                    <View style={[styles.settingRow, { marginTop: 20 }]}>
                        <View style={[styles.settingIconCircle, { backgroundColor: COLORS.darkModeIconBg }]}>
                            <Image
                                source={{ uri: darkModeSvgData }}
                                style={{ width: 28, height: 28, tintColor: COLORS.darkModeIcon }}
                                contentFit="contain"
                            />
                        </View>
                        <View style={styles.settingTextContainer}>
                            <Text style={styles.settingText}>深夜模式</Text>
                        </View>
                        <Switch
                            value={isDarkMode}
                            onValueChange={setIsDarkMode}
                            style={styles.settingSwitch}
                        />
                    </View>

                    {setingOptions.map((option, index) => (
                        <TouchableOpacity key={index} style={styles.settingRow} activeOpacity={0.7}>
                            <View style={[styles.settingIconCircle, { backgroundColor: COLORS.settingIconBg }]}>
                                <Image
                                    source={{ uri: option.icon }}
                                    style={{ width: 28, height: 28 }}
                                    contentFit="contain"
                                />
                            </View>
                            <View style={styles.settingTextContainer}>
                                <Text style={styles.settingText}>{option.title}</Text>
                            </View>
                            <Image
                                source={{ uri: chevronForwardSvgData }}
                                style={[styles.forwardIcon, { tintColor: COLORS.forwardIconColor }]}
                                contentFit="contain"
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={[styles.mainSettingsContainer, { backgroundColor: COLORS.settingsCardBg, marginTop: 20, paddingBottom: 0 }]}>
                    <TouchableOpacity
                        style={[styles.settingRow, { marginTop: 20, marginBottom: 20 }]}
                        activeOpacity={0.7}
                        onPress={handleLogout}
                    >
                        <View style={[styles.settingIconCircle, { backgroundColor: COLORS.settingIconBg }]}>
                            <Image
                                source={{ uri: logoutOption.icon }}
                                style={{ width: 28, height: 28 }}
                                contentFit="contain"
                            />
                        </View>
                        <View style={styles.settingTextContainer}>
                            <Text style={styles.settingText}>{logoutOption.title}</Text>
                        </View>
                        <Image
                            source={{ uri: chevronForwardSvgData }}
                            style={[styles.forwardIcon, { tintColor: COLORS.forwardIconColor }]}
                            contentFit="contain"
                        />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FAF7ED',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
    },
    container: {
        flexGrow: 1,
        alignItems: 'center',
        paddingBottom: 60,
    },
    avatarWrapper: {
        marginTop: 50,
        width: 100,
        height: 100,
        position: 'relative',
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#D1C8B4',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    nameContainer: {
        flexDirection: 'row',
        marginTop: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nameBox: {
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nameText: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    emailContainer: {
        marginTop: 15,
        height: 24,
        backgroundColor: '#D9D9D9',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    emailText: {
        fontSize: 15,
        color: '#000000',
    },
    tagsContainer: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 10,
    },
    tagBadge: {
        height: 24,
        backgroundColor: '#D9D9D9',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    tagText: {
        fontSize: 12,
        color: '#000000',
    },
    mainSettingsContainer: {
        width: 330,
        height: 'auto',
        paddingBottom: 20,
        marginTop: 30,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.2)',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 290,
        height: 48,
        marginTop: 40,
        alignSelf: 'center',
    },
    settingIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingTextContainer: {
        height: 30,
        marginLeft: 10,
        justifyContent: 'center',
    },
    settingText: {
        fontSize: 16,
        color: '#000000',
    },
    settingSwitch: {
        marginLeft: 'auto',
        alignSelf: 'center',
        transform: [{ scale: 0.9 }],
    },
    forwardIcon: {
        marginLeft: 'auto',
        width: 24,
        height: 24,
        alignSelf: 'center',
    }
});