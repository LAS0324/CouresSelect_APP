import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, FlatList, Keyboard, KeyboardAvoidingView, Modal, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { COLORS } from '../styles/theme';

// 匯入從 JSON 抓取的資料
import classNamesData from '../../courses/classNames.json';
import departmentsData from '../../courses/departments.json';

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

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// 定義組件接收的參數類型
interface SetupProps {
    onFinish: () => void;
}

const SetupScreen: React.FC<SetupProps> = ({ onFinish }) => {
    const [step, setStep] = useState(1);
    const [school, setSchool] = useState('');
    const [name, setName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [department, setDepartment] = useState('');
    const [className, setClassName] = useState('');
    
    const [isSaving, setIsSaving] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'school' | 'department' | 'class'>('school');

    const schools = ['國立臺北教育大學', '國立臺灣大學', '國立師範大學', '國立政治大學'];

    const handleSelect = (item: string) => {
        if (modalType === 'school') {
            setSchool(item);
        } else if (modalType === 'department') {
            setDepartment(item);
            // 當前學系改變時，清空已經選好的班級
            if (className && !className.includes(item.slice(0, 2))) {
                setClassName('');
            }
        } else if (modalType === 'class') {
            setClassName(item);
        }
        setModalVisible(false);
    };

    const getModalData = () => {
        if (modalType === 'school') return schools;
        if (modalType === 'department') return departmentsData;
        if (modalType === 'class') {
            // 如果已經選擇學系，僅過濾出相應學系的班級
            if (department) {
                // 為了處理 "資訊科學系" 對應到 "資科"、"自然科學教育學系" 對應到 "自" 等縮寫，抓取前幾個字進行模糊匹配
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
                                : department === '文化創意產業經營學系' ? '文'
                                : department === '音樂學系' ? '音'
                                : department === '體育學系' ? '體'
                                : department === '教育學系' ? '教育'
                                : department === '特殊教育學系' ? '特'
                                : department.slice(0, 2); // 預設方案
                
                return classNamesData.filter((cls: string) => cls.startsWith(shortDept));
            }
            // 沒選學系的情況，回傳所有班級
            return classNamesData;
        }
        return [];
    };

    // 處理「開始規劃」按鈕點擊
    const handleStartPlanning = async () => {
        if (!name || !studentId || !department || !className) {
            Alert.alert("資料不完整", "請填寫所有欄位");
            return;
        }
        
        setIsSaving(true);
        try {
            const currentUser = auth.currentUser;
            if (currentUser) {
                // 將資料儲存至 Firestore
                await setDoc(doc(db, "users", currentUser.uid), {
                    school,
                    name,
                    studentId,
                    department,
                    className,
                    setupCompleted: true // 標記為完成設定
                }, { merge: true });
                
                console.log('完成設定！', { school, name, studentId, department, className });
                onFinish(); // 呼叫從 index.tsx 傳進來的跳轉函數
            } else {
                Alert.alert("錯誤", "找不到使用者登入資訊，請重新登入。");
            }
        } catch (error) {
            console.error("儲存失敗:", error);
            Alert.alert("儲存失敗", "發生未知錯誤，請重試。");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                style={styles.keyBoardContainer} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.content}>
                    {step === 1 ? (
                        <>
                            <Text style={styles.stepText}>STEP 01</Text>
                            <Text style={styles.title}>選擇你的學校</Text>

                            <TouchableOpacity
                                style={styles.dropdownTrigger}
                                onPress={() => {
                                    Keyboard.dismiss();
                                    setModalType('school');
                                    setModalVisible(true);
                                }}
                            >
                                <Text style={[styles.dropdownValue, !school && { color: '#AAA' }]}>
                                    {school || '請選擇學校...'}
                                </Text>
                                <Text style={styles.arrow}>▼</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.nextBtn, !school && styles.disabledBtn]}
                                onPress={() => setStep(2)}
                                disabled={!school}
                            >
                                <Text style={styles.nextBtnText}>下一步</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <Text style={styles.stepText}>STEP 02</Text>
                            <Text style={styles.title}>基本資料設定</Text>
                            
                            <TextInput 
                                style={styles.textInput}
                                placeholder="名稱 (不超過8個字)"
                                placeholderTextColor="#AAA"
                                value={name}
                                onChangeText={setName}
                                maxLength={8}
                            />
                            
                            <TextInput 
                                style={styles.textInput}
                                placeholder="學號"
                                placeholderTextColor="#AAA"
                                value={studentId}
                                onChangeText={setStudentId}
                            />

                            <View style={styles.rowInputs}>
                                <TouchableOpacity 
                                    style={[styles.dropdownTrigger, styles.halfDropdown]} 
                                    onPress={() => {
                                        Keyboard.dismiss();
                                        setModalType('department');
                                        setModalVisible(true);
                                    }}
                                >
                                    <Text style={[styles.dropdownValue, !department && { color: '#AAA' }]} numberOfLines={1}>
                                        {department || '選擇學系'}
                                    </Text>
                                    <Text style={styles.arrow}>▼</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={[styles.dropdownTrigger, styles.halfDropdown]} 
                                    onPress={() => {
                                        Keyboard.dismiss();
                                        setModalType('class');
                                        setModalVisible(true);
                                    }}
                                >
                                    <Text style={[styles.dropdownValue, !className && { color: '#AAA' }]} numberOfLines={1}>
                                        {className || '選擇班級'}
                                    </Text>
                                    <Text style={styles.arrow}>▼</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={[styles.nextBtn, (!name || !studentId || !department || !className || isSaving) && styles.disabledBtn]}
                                onPress={handleStartPlanning}
                                disabled={!name || !studentId || !department || !className || isSaving}
                            >
                                <Text style={styles.nextBtnText}>{isSaving ? '儲存中...' : '開始規劃 ✨'}</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.backBtn}
                                onPress={() => setStep(1)}
                            >
                                <Text style={styles.backBtnText}>回上一步</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </KeyboardAvoidingView>

            <Modal 
                visible={modalVisible} 
                transparent={true} 
                animationType="none" 
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay} 
                    activeOpacity={1} 
                    onPress={() => setModalVisible(false)}
                >
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {modalType === 'school' ? '選擇學校' : modalType === 'department' ? '選擇學系' : '選擇班級'}
                            </Text>
                        </View>
                        <FlatList
                            data={getModalData()}
                            contentContainerStyle={styles.modalListContainer}
                            showsVerticalScrollIndicator={false}
                            keyExtractor={(item, index) => item + index}
                            renderItem={({ item }) => {
                                const isSelected = 
                                    (modalType === 'school' && school === item) ||
                                    (modalType === 'department' && department === item) ||
                                    (modalType === 'class' && className === item);
                                    
                                return (
                                    <TouchableOpacity 
                                        style={[styles.optionItem, isSelected && styles.optionItemSelected]} 
                                        onPress={() => handleSelect(item)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.optionItemText, isSelected && styles.optionItemTextSelected]}>
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
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    keyBoardContainer: { flex: 1 },
    content: { padding: 40, flex: 1, justifyContent: 'center' },
    stepText: { color: COLORS.primary, fontWeight: 'bold', marginBottom: 10 },
    title: { fontSize: 26, fontWeight: 'bold', color: COLORS.text, marginBottom: 40 },
    dropdownTrigger: {
        backgroundColor: '#FFF',
        height: 65,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        borderWidth: 2,
        borderColor: '#E6E5DF',
        marginBottom: 15,
    },
    textInput: {
        backgroundColor: '#FFF',
        height: 65,
        borderRadius: 20,
        paddingHorizontal: 20,
        borderWidth: 2,
        borderColor: '#E6E5DF',
        fontSize: 17,
        color: COLORS.text,
        marginBottom: 15,
    },
    rowInputs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfDropdown: {
        flex: 1,
        marginHorizontal: 5,
        paddingHorizontal: 15,
    },
    dropdownValue: { fontSize: 17, color: COLORS.text, flex: 1 },
    arrow: { color: COLORS.primary, fontSize: 12, marginLeft: 5 },
    nextBtn: { backgroundColor: COLORS.primary, height: 60, borderRadius: 30, marginTop: 25, alignItems: 'center', justifyContent: 'center' },
    disabledBtn: { opacity: 0.3 },
    nextBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    backBtn: { marginTop: 20, alignItems: 'center' },
    backBtnText: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold' },
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
    optionItem: {
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
    optionItemText: {
        fontSize: 16,
        color: COLORS.text || '#333',
        fontWeight: '500',
    },
    optionItemSelected: {
        backgroundColor: COLORS.modalSelectedBg || "#D0B589",
        borderColor: COLORS.modalSelectedBg || "#D0B589",
    },
    optionItemTextSelected: {
        color: '#000000',
        fontWeight: 'bold',
    },
    closeBtn: { marginTop: 10, alignItems: 'center' }
});

export default SetupScreen;