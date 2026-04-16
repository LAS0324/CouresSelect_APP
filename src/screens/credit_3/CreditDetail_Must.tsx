import { Ionicons } from '@expo/vector-icons';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, Keyboard, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useCourse } from '../../context/CourseContext';
import { COLORS } from '../../styles/theme';

import { getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBAKhdryuoSlPhhgedbxb5-pL24TtAzfzA",
    authDomain: "courseapp-788ad.firebaseapp.com",
    projectId: "courseapp-788ad",
    storageBucket: "courseapp-788ad.firebasestorage.app",
    messagingSenderId: "650322013005",
    appId: "1:650322013005:web:5855bdc8aa1c0dc70be504",
    measurementId: "G-L6FBFFW8PM"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// ---- 優化課程卡片渲染 ----
const CourseItem = memo(({ course, isSelected, toggleCourse }: { course: any; isSelected: boolean; toggleCourse: (id: string) => void }) => {
    return (
        <TouchableOpacity 
            style={[styles.courseCard, isSelected && styles.courseCardSelected]} 
            onPress={() => toggleCourse(course.id)}
            activeOpacity={0.8}
        >
            <Ionicons 
                name={isSelected ? "checkbox" : "square-outline"} 
                size={28} 
                color={isSelected ? "#23A85B" : "#111"} 
                style={styles.checkboxIcon}
            />
            <View style={styles.courseInfo}>
                <Text style={styles.courseTitle}>{course.title}</Text>
                {course.className?.includes('大三體育') && (
                    <Text style={styles.courseDomain}>{course.className}</Text>
                )}
            </View>
            <Text style={styles.courseCredits}>{course.credits} 學分</Text>
        </TouchableOpacity>
    );
}, (prevProps, nextProps) => {
    return prevProps.isSelected === nextProps.isSelected;
});

const CATEGORIES = [
    '全部',
    '已選取',
    '體育興趣',
    '其他'
];

export default function CreditDetailMust({ navigation }: any) {
    const title = '校必修學分';

    const { passedMustCourses, updateMustCredits } = useCourse();

    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('全部');
    
    // 建立搜尋框的 Ref，用來控制鍵盤彈出
    const searchInputRef = useRef<TextInput>(null);

    // 初始化用 global state，若更改後尚未儲存就存在本地
    const [checkedCourses, setCheckedCourses] = useState<{ [key: string]: boolean }>(passedMustCourses || {});

    // 當 global state (從 firebase 還原) 更新時，同步到本地
    useEffect(() => {
        setCheckedCourses(passedMustCourses || {});
    }, [passedMustCourses]);

    // 同步計算：直接檢查是否與原本有差異
    const hasUnsavedChanges = JSON.stringify(checkedCourses) !== JSON.stringify(passedMustCourses || {});

    // Toast 提示相關狀態
    const [showToast, setShowToast] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // 從 Firebase 的 MustCourse 中獲取
                const rawData = require('../../../courses/MustCourse.json');
                const data = rawData.map((c: any) => ({ ...c, id: String(c.courseId) }));
                
                setCourses(data);
            } catch (error) {
                console.error('Fetch courses error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const toggleCourse = useCallback((courseId: string) => {
        setCheckedCourses(prev => ({
            ...prev,
            [courseId]: !prev[courseId]
        }));
    }, []);

    const confirmChanges = () => {
        const selectedIds = Object.keys(checkedCourses).filter(id => checkedCourses[id]);
        let totalCredits = 0;
        selectedIds.forEach(id => {
            const targetCourse = courses.find((c: any) => c.id === id);
            if (targetCourse && targetCourse.credits) {
                // "2學分" => 2
                const numStr = targetCourse.credits.toString().replace(/[^\d]/g, '');
                if (numStr) totalCredits += parseInt(numStr, 10);
            }
        });
        
        updateMustCredits(checkedCourses, totalCredits);

        setShowToast(true);
        fadeAnim.setValue(1);

        Animated.sequence([
            Animated.delay(1000), 
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500, 
                useNativeDriver: true,
            })
        ]).start(() => {
            setShowToast(false);
        });
    };

    const handleDismissToast = () => {
        fadeAnim.stopAnimation();
        setShowToast(false);
    };

    // 定義自訂排序權重
    const sortOrder: { [key: string]: number } = {
        '閱讀與寫作(上)': 1,
        '閱讀與寫作(一)': 1,
        '閱讀與寫作(下)': 2,
        '閱讀與寫作(二)': 2,
        '英文(一)': 3,
        '英文(二)': 4,
        '體育(一)': 5,
        '體育(二)': 6,
        '體育(三)': 7,
        '體育(四)': 8,
    };

    const displayedCourses = courses.filter(course => {
        // 1. 搜尋比對 (依照課名)
        const matchSearch = course.title?.includes(searchQuery);
        
        // 2. 分類比對 (檢查 className)
        let matchTab = true;
        if (activeTab === '已選取') {
            matchTab = !!checkedCourses[course.id] || !!passedMustCourses[course.id];
        } else if (activeTab === '體育興趣') {
            matchTab = course.className && course.className.includes('體育興趣');
        } else if (activeTab === '其他') {
            matchTab = !(course.className && course.className.includes('體育興趣'));
        }
        
        return matchSearch && matchTab;
    }).sort((a, b) => {
        const orderA = sortOrder[a.title] || 999;
        const orderB = sortOrder[b.title] || 999;
        
        if (orderA !== orderB) {
            return orderA - orderB;
        }
        // 如果都不是指定順序（權重都是999），或是名稱相同，則根據 ID 或其它屬性排序確保穩定
        return (a.title || '').localeCompare(b.title || '');
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            
            {/* 只包覆上半部，點擊空白處可收起鍵盤 */}
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View>
                    <View style={styles.header}>
                        <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="chevron-back" size={24} color="#654321" />
                        </TouchableOpacity>
                        
                        {/* 點擊標題與右側空白處聚焦搜尋框，跳出鍵盤 */}
                        <TouchableOpacity 
                            style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }} 
                            activeOpacity={1} 
                            onPress={() => searchInputRef.current?.focus()}
                        >
                            <View style={{ flex: 1, alignItems: 'center' }}>
                                <Text style={styles.headerTitle}>{title}</Text>
                            </View>
                            <View style={styles.rightPlaceholder} />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.searchContainer}>
                        <View style={styles.searchBox}>
                            <Ionicons name="search" size={22} color="#888" style={styles.searchIcon} />
                            <TextInput
                                ref={searchInputRef}
                                style={styles.searchInput}
                                placeholder="搜尋課程名稱..."
                                placeholderTextColor="#999"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7} style={{ padding: 4 }}>
                                    <Ionicons name="close-circle" size={20} color="#B0B0B0" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* 橫向捲動分類標籤區塊 (範圍與搜尋欄同寬) */}
                    <View style={styles.tagsWrapper}>
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.tagsContainer}
                        >
                            {CATEGORIES.map((cat, index) => {
                                const tagColor = COLORS.tags[cat as keyof typeof COLORS.tags] || { bg: '#EAEAEA', border: '#CCCCCC', text: '#333333' };
                                const isActive = activeTab === cat;

                                return (
                                    <TouchableOpacity 
                                        key={index} 
                                        onPress={() => setActiveTab(cat)}
                                        style={[
                                            styles.tagBadge, 
                                            isActive ? { backgroundColor: tagColor.bg, borderColor: tagColor.border } : { backgroundColor: '#F8F7F2', borderColor: '#EAEAEA' }
                                        ]}
                                    >
                                        <Text style={[styles.tagText, isActive ? { color: tagColor.text } : { color: '#888' }]}>{cat}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </View>
            </TouchableWithoutFeedback>

            {/* 下半部 FlatList 獨立，確保滑動順暢且不被干擾 */}
            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color="#23A85B" style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={displayedCourses}
                        keyExtractor={(item) => item.id}
                        initialNumToRender={15}
                        maxToRenderPerBatch={20}
                        windowSize={5}
                        removeClippedSubviews={true}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 80 }}
                        renderItem={({ item: course }) => (
                            <CourseItem 
                                course={course} 
                                isSelected={!!checkedCourses[course.id]} 
                                toggleCourse={toggleCourse} 
                            />
                        )}
                    />
                )}
            </View>

            {hasUnsavedChanges && (
                <View style={styles.floatingButtonContainer}>
                    <TouchableOpacity style={styles.confirmButton} onPress={confirmChanges} activeOpacity={0.8}>
                        <Text style={styles.confirmButtonText}>儲存變更</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* 提示訊息 Toast，放在最後面讓它蓋在最上方 */}
            {showToast && (
                <Animated.View style={[styles.toastContainer, { opacity: fadeAnim }]}>
                    <Text style={styles.toastText}>已儲存變更</Text>
                    <TouchableOpacity onPress={handleDismissToast} style={styles.toastCloseBtn}>
                        <Ionicons name="close" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                </Animated.View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 50,
        backgroundColor: 'transparent',
    },
    backButton: {
        width: 40,
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#654321',
    },
    rightPlaceholder: {
        width: 40,
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginTop: 15,
        marginBottom: 10,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EAEAEA',
        borderRadius: 24,
        paddingHorizontal: 16,
        height: 48,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    tagsWrapper: {
        paddingHorizontal: 20, 
        marginBottom: 10,
        height: 38, 
    },
    tagsContainer: {
        alignItems: 'center',
    },
    tagBadge: {
        borderWidth: 1,
        borderRadius: 20,          
        paddingVertical: 6,
        paddingHorizontal: 16,
        marginRight: 10,            
    },
    tagText: {
        fontSize: 14,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    // ---- 課程卡片樣式 ----
    courseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 12,
        borderRadius: 12,
        borderWidth: 1.5,
        backgroundColor: '#FDFBF7', 
        borderColor: '#E8DED1',    
    },
    courseCardSelected: {
        backgroundColor: '#ebf7ee', 
        borderColor: '#23A85B',    
    },
    checkboxIcon: {
        marginRight: 14,
        marginTop: -3,
        marginLeft: -4,
    },
    courseInfo: {
        flex: 1,
        justifyContent: 'center',
        minHeight: 46, // 固定最小高度，確保是否顯示 className 時的高低一致
    },
    courseTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111',
    },
    courseDomain: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
        marginTop: 4,
    },
    courseCredits: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#444',
    },
    // ---- 懸浮按鈕樣式 ----
    floatingButtonContainer: {
        position: 'absolute',
        bottom: 30, 
        left: 20,
        right: 20,
        alignItems: 'center',
    },
    confirmButton: {
        backgroundColor: '#23A85B',
        width: '100%',
        paddingVertical: 14,
        borderRadius: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 6,
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    // ---- Toast 提示訊息樣式 ----
    toastContainer: {
        position: 'absolute',
        bottom: 90,    
        alignSelf: 'center',
        backgroundColor: '#333333',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 999, 
    },
    toastText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginRight: 10,
    },
    toastCloseBtn: {
        padding: 2,
    }
});