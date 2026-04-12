import { Ionicons } from '@expo/vector-icons';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import classNamesData from '../../courses/classNames.json';
import departmentsData from '../../courses/departments.json';
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

export default function EditProfile({ navigation }: any) {
    const [name, setName] = useState('');
    const [department, setDepartment] = useState('');
    const [className, setClassName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [school, setSchool] = useState('國立臺北教育大學');
    const [isSchoolModalVisible, setIsSchoolModalVisible] = useState(false);
    const schools = ['國立臺北教育大學', '國立臺灣大學', '國立師範大學', '國立政治大學'];
    const [isSaving, setIsSaving] = useState(false);
    const [isDeptModalVisible, setIsDeptModalVisible] = useState(false);
    const [isClassModalVisible, setIsClassModalVisible] = useState(false);

    const getAvailableClasses = () => {
        if (department) {
            const shortDept = department === '資訊科學系' ? '資科' 
                            : department === '自然科學教育學系' ? '自'
                            : department === '藝術與造形設計學系' ? '藝'
                            : department === '數位科技設計學系' ? '數位'
                            : department === '數學暨資訊教育學系' ? '數資'
                            : department === '幼兒與家庭教育學系' ? '幼教'
                            : department === '社會與區域發展學系' ? '社'
                            : department === '教育經營與管理學系' ? '教經'
                            : department === '心理與諮商學系' ? '心諮'
                            : department === '兒童英語教育學系' ? '兒英'
                            : department === '語文與創作學系' ? '語'
                            : department === '體育學系' ? '體'
                            : department === '文化創意產業經營學系' ? '文創'
                            : department === '教育學系' ? '教'
                            : department === '音樂學系' ? '音'
                            : department === '特殊教育學系' ? '特'
                            : department.slice(0, 2); // 預設方案
            
            return classNamesData.filter((cls: string) => cls.startsWith(shortDept));
        }
        return classNamesData;
    };

    const currentUser = auth.currentUser;

    useEffect(() => {
        const fetchUserData = async () => {
            if (!currentUser) return;
            try {
                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    if (data.name) setName(data.name);
                    if (data.department) setDepartment(data.department);
                    if (data.className) setClassName(data.className);
                    if (data.studentId) setStudentId(data.studentId);
                    if (data.school) setSchool(data.school);
                }
            } catch (error) {
                console.error("獲取使用者資料失敗:", error);
            }
        };
        fetchUserData();
    }, [currentUser]);

    const handleSave = async () => {
        if (name.length > 8) {
            Alert.alert('輸入錯誤', '名字長度不可超過八個字');
            return;
        }

        setIsSaving(true);
        try {
            if (currentUser) {
                await setDoc(doc(db, "users", currentUser.uid), {
                    name,
                    department,
                    className,
                    studentId,
                    school
                }, { merge: true });
            }
            
            // 儲存完後回到上一頁
            navigation.goBack();
        } catch (error) {
            console.error("儲存失敗:", error);
            Alert.alert('儲存失敗', '無法更新您的資料，請稍後再試。');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <TopNavBar 
                title="編輯個人資料" 
                showMenu={false} 
                showInfo={false} 
                showRightMenu={false} 
                showBack={true}
                onBackPress={() => navigation.goBack()}
            />
            
            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.container}>
                    {/* 頭像區域 */}
                    <View style={styles.avatarWrapper}>
                        <View style={styles.avatarContainer}>
                            <Ionicons name="person" size={60} color="#FFF" />
                        </View>
                        <TouchableOpacity style={styles.editBadge} activeOpacity={0.7}>
                            <Ionicons name="camera-outline" size={20} color={COLORS.avatarEditIcon} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.headerName}>{name || "您的名字"}</Text>
                    <Text style={styles.headerSubtitle}>{currentUser?.email || "未登入 Email"}</Text>

                    {/* 輸入框區塊 */}
                    <View style={[styles.mainSettingsContainer, { backgroundColor: COLORS.settingsCardBg }]}>
                        
                        <View style={styles.settingRow}>
                            <Text style={styles.settingLabel}>使用者名稱</Text>
                            <TextInput
                                style={styles.settingInput}
                                value={name}
                                onChangeText={setName}
                                placeholder="請輸入名稱"
                                placeholderTextColor="#999"
                                selectionColor={COLORS.primary}
                            />
                        </View>
                        <View style={styles.divider} />

                        <View style={styles.settingRow}>
                            <Text style={styles.settingLabel}>學校</Text>
                            <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center' }}>
                                <TouchableOpacity 
                                    style={styles.departmentTag}
                                    onPress={() => setIsSchoolModalVisible(true)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={{ 
                                        color: COLORS.editProfileTagText,
                                        fontSize: 14, 
                                        fontWeight: '600',
                                        textAlign: 'center'
                                    }}>
                                        {school || "+ 選擇學校"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.divider} />

                        <View style={styles.settingRow}>
                            <Text style={styles.settingLabel}>學系</Text>
                            <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center' }}>
                                <TouchableOpacity 
                                    style={styles.departmentTag}
                                    onPress={() => setIsDeptModalVisible(true)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={{ 
                                        color: COLORS.editProfileTagText,
                                        fontSize: 14, 
                                        fontWeight: '600',
                                        textAlign: 'center'
                                    }}>
                                        {department || "+ 選擇學系"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.divider} />

                        <View style={styles.settingRow}>
                            <Text style={styles.settingLabel}>班級</Text>
                                <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center' }}>
                                    <TouchableOpacity 
                                        style={styles.departmentTag}
                                        onPress={() => setIsClassModalVisible(true)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={{ 
                                            color: COLORS.editProfileTagText,
                                            fontSize: 14, 
                                            fontWeight: '600',
                                            textAlign: 'center'
                                        }}>
                                            {className || "+ 選擇班級"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                        </View>
                        <View style={styles.divider} />

                        <View style={styles.settingRow}>
                            <Text style={styles.settingLabel}>學號</Text>
                            <TextInput
                                style={styles.settingInput}
                                value={studentId}
                                onChangeText={setStudentId}
                                placeholder="請輸入學號"
                                placeholderTextColor="#999"
                                selectionColor={COLORS.primary}
                            />
                        </View>

                    </View>

                    <TouchableOpacity 
                        style={[styles.saveButton, isSaving && { opacity: 0.7 }]} 
                        onPress={handleSave} 
                        disabled={isSaving}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.saveButtonText}>{isSaving ? "儲存中..." : "儲存設定"}</Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* 學校選擇下拉 Modal */}
            <Modal
                visible={isSchoolModalVisible}
                transparent={true}
                animationType="none"
                onRequestClose={() => setIsSchoolModalVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay} 
                    activeOpacity={1} 
                    onPress={() => setIsSchoolModalVisible(false)}
                >
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>選擇學校</Text>
                        </View>
                        <FlatList
                            data={schools}
                            contentContainerStyle={styles.modalListContainer}
                            showsVerticalScrollIndicator={false}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => {
                                const isSelected = school === item;
                                return (
                                        <TouchableOpacity 
                                            style={[styles.modalItem, isSelected && styles.modalItemSelected]}
                                            onPress={() => {
                                                setIsSchoolModalVisible(false);
                                                setTimeout(() => {
                                                    setSchool(item);
                                                }, 250);
                                            }}
                                            activeOpacity={0.7}
                                        >
                                        <Text style={[styles.modalItemText, isSelected && styles.modalItemTextSelected]}>
                                            {item}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>

            {/* 學系選擇下拉 Modal */}
            <Modal
                visible={isDeptModalVisible}
                transparent={true}
                animationType="none"
                onRequestClose={() => setIsDeptModalVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay} 
                    activeOpacity={1} 
                    onPress={() => setIsDeptModalVisible(false)}
                >
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>選擇學系</Text>
                        </View>
                        <FlatList
                            data={departmentsData}
                            contentContainerStyle={styles.modalListContainer}
                            showsVerticalScrollIndicator={false}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => {
                                const isSelected = department === item;
                                return (
                                        <TouchableOpacity 
                                            style={[styles.modalItem, isSelected && styles.modalItemSelected]}
                                            onPress={() => {
                                                setIsDeptModalVisible(false);
                                                setTimeout(() => {
                                                    setDepartment(item);
                                                    setClassName('');
                                                }, 250);
                                            }}
                                            activeOpacity={0.7}
                                        >
                                        <Text style={[styles.modalItemText, isSelected && styles.modalItemTextSelected]}>
                                            {item}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>

            {/* 學系班級選擇彈窗 */}
            <Modal
                visible={isClassModalVisible}
                transparent={true}
                animationType="none"
                onRequestClose={() => setIsClassModalVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay} 
                    activeOpacity={1} 
                    onPress={() => setIsClassModalVisible(false)}
                >
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>選擇班級</Text>
                            </View>
                            <FlatList
                                data={getAvailableClasses()}
                                contentContainerStyle={styles.modalListContainer}
                                showsVerticalScrollIndicator={false}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => {
                                    const isSelected = className === item;
                                    return (
                                        <TouchableOpacity 
                                            style={[styles.modalItem, isSelected && styles.modalItemSelected]}
                                            onPress={() => {
                                                setIsClassModalVisible(false);
                                                setTimeout(() => {
                                                    setClassName(item);
                                                }, 250);
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[styles.modalItemText, isSelected && styles.modalItemTextSelected]}>
                                                {item}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>
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
        marginTop: 40,
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
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.avatarEditBg,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 4,
    },
    headerName: {
        marginTop: 15,
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    headerSubtitle: {
        marginTop: 5,
        fontSize: 14,
        color: '#666',
    },
    mainSettingsContainer: {
        width: 330,
        marginTop: 30,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        paddingVertical: 10,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    settingLabel: {
        fontSize: 16,
        color: '#333',
        width: 100, // 固定寬度對齊
    },
    settingInput: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        textAlign: 'right', // 靠右對齊
        height: 30,
        paddingHorizontal: 8,
    },
    departmentTag: {
        backgroundColor: COLORS.editProfileTagBg, 
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 100,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        marginHorizontal: 15,
    },
    saveButton: {
        marginTop: 40,
        width: 330,
        height: 50,
        backgroundColor: COLORS.editProfileSaveBtn || '#D0B589', 
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    // --- 學系選擇 Modal 樣式 (登入畫面風格) ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: COLORS.background || '#F8F7F2',
        borderRadius: 30,
        width: '85%',
        maxHeight: '70%',
        paddingTop: 25,
        paddingBottom: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
            },
            android: {
                elevation: 6,
            }
        })
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingBottom: 15,
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.text || '#333',
    },
    modalListContainer: {
        paddingHorizontal: 20,
    },
    modalItem: {
        width: "100%",
        height: 55,
        backgroundColor: "#FFF",
        borderRadius: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#E6E5DF",
    },
    modalItemSelected: {
        backgroundColor: COLORS.modalSelectedBg || "#D0B589",
        borderColor: COLORS.modalSelectedBg || "#D0B589",
    },
    modalItemText: {
        fontSize: 16,
        color: COLORS.text || '#333',
        fontWeight: '500',
    },
    modalItemTextSelected: {
        color: '#000000',
        fontWeight: 'bold',
    }
});