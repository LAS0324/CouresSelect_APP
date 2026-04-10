import { Ionicons } from '@expo/vector-icons';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useCourse } from '../../context/CourseContext';
import { COLORS } from '../../styles/theme';

import { getApps, initializeApp } from 'firebase/app';
import { collection, getDocs, getFirestore } from 'firebase/firestore';

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
// 使用 React.memo 包裝每一個 Course 的元件，這樣在勾選一個課程時，不會導致畫面中上百個其他沒變動的課程被重新渲染。
const CourseItem = memo(({ course, isSelected, toggleCourse }: { course: any; isSelected: boolean; toggleCourse: (id: string) => void }) => {
    return (
        <TouchableOpacity 
            style={[styles.courseCard, isSelected && styles.courseCardSelected]} 
            onPress={() => toggleCourse(course.id)}
            activeOpacity={0.8}  // 調整點擊透明度
        >
            <Ionicons 
                name={isSelected ? "checkbox" : "square-outline"} 
                size={28} 
                color={isSelected ? "#23A85B" : "#111"} 
                style={styles.checkboxIcon}
            />
            <View style={styles.courseInfo}>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <Text style={styles.courseDomain}>{course.className}</Text>
            </View>
            <Text style={styles.courseCredits}>{course.credits}</Text>
        </TouchableOpacity>
    );
}, (prevProps, nextProps) => {
    // 只有當此課程的 isSelected 狀態改變時才重新渲染
    return prevProps.isSelected === nextProps.isSelected;
});

const DOMAINS = [
    '生涯職能',
    '品德、思考與社會',
    '文史哲領域',
    '藝術美感與設計',
    '環境與自然科學',
    '數位科技與傳播',
    '外國語言與文化'
];

const CATEGORIES = [
    '全部',
    '已選取',
    ...DOMAINS,
    '其他'
];

export default function CreditDetailGeneral({ navigation }: any) {
    const title = '通識學分';
    
    const { passedGeneralCourses, updateGeneralCredits } = useCourse();

    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('全部');
    
    // 初始化用 global state，若更改後尚未儲存就存在本地
    const [checkedCourses, setCheckedCourses] = useState<{ [key: string]: boolean }>(passedGeneralCourses || {});

    // 同步計算：直接檢查是否與原本有差異，不再依賴 useEffect，消除按鈕出現的延遲感/閃爍
    const hasUnsavedChanges = JSON.stringify(checkedCourses) !== JSON.stringify(passedGeneralCourses || {});

    // Toast 提示相關狀態
    const [showToast, setShowToast] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // 從 Firebase 的 everyone_need_18 中獲取
                const coursesRef = collection(db, 'Semesters', 'everyone_need_18', 'Courses');
                const snapshot = await getDocs(coursesRef);
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                // 通識課程通常要有領域名稱，確保沒壞掉，同時統一 className 的命名
                const filteredData = data.filter((c: any) => c.className && c.className.length > 0).map((c: any) => {
                    if (c.className && c.className.includes('品德思考與社會')) {
                        return { ...c, className: c.className.replace('品德思考與社會', '品德、思考與社會') };
                    }
                    return c;
                });
                
                setCourses(filteredData);
            } catch (error) {
                console.error('Fetch courses error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    // 使用 useCallback 避免 FlatList 的 items 需要被一直創建新函數，提升運作效能
    const toggleCourse = useCallback((courseId: string) => {
        setCheckedCourses(prev => ({
            ...prev,
            [courseId]: !prev[courseId]
        }));
    }, []);

    const confirmChanges = () => {
        // 計算勾起的課程總學分數
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
        
        updateGeneralCredits(checkedCourses, totalCredits);

        // 觸發 Toast 動畫
        setShowToast(true);
        fadeAnim.setValue(1); // 立即設為完全清楚

        Animated.sequence([
            Animated.delay(1000), // 縮短展示時間為 1 秒 (原本是 2 秒)
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500, // 將淡出動畫縮短為 0.5 秒 (原本是 1 秒)
                useNativeDriver: true,
            })
        ]).start(() => {
            // 動畫結束後隱藏組件 (避免擋住點擊)
            setShowToast(false);
        });
    };

    const handleDismissToast = () => {
        // 使用者提早按下關閉時，提早結束動畫並隱藏
        fadeAnim.stopAnimation();
        setShowToast(false);
    };

    // 篩選邏輯：搜尋字串 + 分類標籤
    const displayedCourses = courses.filter(course => {
        // 1. 搜尋比對 (依照課名或老師)
        const matchSearch = course.title?.includes(searchQuery) || (course.teacher && course.teacher.includes(searchQuery));
        
        // 2. 分類比對 (檢查 className)
        let matchTab = true;
        const normalizedClassName = course.className ? course.className.replace(/、/g, '') : '';

        if (activeTab === '已選取') {
            // 顯示目前有勾選的，或者是「原本就已經儲存為已選取」的課程
            // 這樣在「已選取」頁面取消勾選時，它才不會馬上消失，直到按下儲存才會真正移除
            matchTab = !!checkedCourses[course.id] || !!passedGeneralCourses[course.id];
        } else if (activeTab === '其他') {
            matchTab = !DOMAINS.some(domain => normalizedClassName.includes(domain.replace(/、/g, '')));
        } else if (activeTab !== '全部') {
            // 這個簡單的 includes 通常能滿足 '品德、思考與社會', '文史哲領域' 等字眼的匹配
            matchTab = normalizedClassName.includes(activeTab.replace(/、/g, ''));
        }
        
        return matchSearch && matchTab;
    }).sort((a, b) => {
        const getWeight = (className: string) => {
            const normalized = className ? className.replace(/、/g, '') : '';
            if (!normalized) return 999;
            for (let i = 0; i < DOMAINS.length; i++) {
                if (normalized.includes(DOMAINS[i].replace(/、/g, ''))) return i;
            }
            return 999; // 都不屬於 DOMAINS，就是 999
        };
        const weightA = getWeight(a.className);
        const weightB = getWeight(b.className);
        if (weightA !== weightB) return weightA - weightB;
        return (a.title || '').localeCompare(b.title || '');
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            
            <View style={styles.header}>
                <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#654321" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title}</Text>
                <View style={styles.rightPlaceholder} />
            </View>
            
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={22} color="#888" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="搜尋課程名稱或是授課老師..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
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
                        // 從 theme 中取得這個分類專屬的顏色（沒寫在 theme 裡的給預設值）
                        const tagColor = COLORS.tags[cat as keyof typeof COLORS.tags] || { bg: '#EAEAEA', border: '#CCCCCC', text: '#333333' };
                        const isActive = activeTab === cat;

                        return (
                            <TouchableOpacity 
                                key={index} 
                                onPress={() => setActiveTab(cat)}
                                style={[
                                    styles.tagBadge, 
                                    // 若是全部，或者被選中時才套用色彩，未選中可以統一灰或白底透明感
                                    isActive ? { backgroundColor: tagColor.bg, borderColor: tagColor.border } : { backgroundColor: '#F8F7F2', borderColor: '#EAEAEA' }
                                ]}
                            >
                                <Text style={[styles.tagText, isActive ? { color: tagColor.text } : { color: '#888' }]}>{cat}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

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
        // 設定與上面 searchContainer 一樣大的範圍：左右留白 20
        paddingHorizontal: 20, 
        marginBottom: 10,
        height: 38, // 固定標籤區域高度
    },
    tagsContainer: {
        alignItems: 'center',
    },
    tagBadge: {
        borderWidth: 1,
        borderRadius: 20,           
        paddingVertical: 6,
        paddingHorizontal: 16,
        marginRight: 10,            // 每個 Tag 之間的空隙
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
        backgroundColor: '#FDFBF7', // 預設淺色底
        borderColor: '#E8DED1',     // 預設淺色邊框
    },
    courseCardSelected: {
        backgroundColor: '#ebf7ee', // 綠色底
        borderColor: '#23A85B',     // 綠色邊框
    },
    checkboxIcon: {
        marginRight: 14,
        marginTop: -3,
        marginLeft: -4,
    },
    courseInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    courseTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 4,
    },
    courseDomain: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    courseCredits: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#444',
    },
    // ---- 懸浮按鈕樣式 ----
    floatingButtonContainer: {
        position: 'absolute',
        bottom: 30, // 距離底部的距離
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
        bottom: 90,    // 放在按鈕原本大致的上方 (30+約50高度)
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
        zIndex: 999, // 確保在最外層可點擊
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