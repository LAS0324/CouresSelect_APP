import { Ionicons } from '@expo/vector-icons';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, Keyboard, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useCourse } from '../../context/CourseContext';
import { COLORS } from '../../styles/theme';

// 改為直接讀取本地端的 JSON 檔案，以節省 Firebase 的讀取次數 (Quota) 以及大幅增加載入速度！
const data114_1 = require('../../../courses/course114-1.json');
const data114_2 = require('../../../courses/courses.json');

// ---- 優化課程卡片渲染 ----
const CourseItem = memo(({ course, isSelected, toggleCourse }: { course: any; isSelected: boolean; toggleCourse: (id: string) => void }) => {
    // 判斷是否為通識課 (含有領域資訊)
    const isGeneral = course.requirementType?.includes('通識') || 
                      course.department?.includes('通識') || 
                      course.className?.includes('通識') || 
                      course.className?.includes('領域');

    const formatDomain = (className: string) => {
        if (!className) return '';
        const match = className.match(/([^課程]+領域)$/);
        return match ? match[1] : className;
    };

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
                <Text style={styles.courseDomain}>
                    {isGeneral ? formatDomain(course.className) : course.department}
                </Text>
            </View>
            <Text style={styles.courseCredits}>{course.credits} 學分</Text>
        </TouchableOpacity>
    );
}, (prevProps, nextProps) => {
    return prevProps.isSelected === nextProps.isSelected;
});

// 設定一個在組件外部的快取變數，避免每次進出頁面重複下載幾千筆資料
let cachedFlexibleCourses: any[] | null = null;

const Separator = () => <View style={{ height: 12 }} />;

const CATEGORIES = [
    '全部',
    '已選取'
];

export default function CreditDetailFlexible({ navigation }: any) {
    const title = '彈性課程';

    const { passedFlexibleCourses, updateFlexibleCredits } = useCourse();

    const [allFilteredCourses, setAllFilteredCourses] = useState<any[]>(cachedFlexibleCourses || []);
    const [displayCount, setDisplayCount] = useState(30);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('全部');
    
    // 初始化用 global state，若更改後尚未儲存就存在本地
    const [checkedCourses, setCheckedCourses] = useState<{ [key: string]: boolean }>(passedFlexibleCourses || {});

    // 當 global state 更新時，同步到畫面
    useEffect(() => {
        setCheckedCourses(passedFlexibleCourses || {});
    }, [passedFlexibleCourses]);

    // 同步計算：直接檢查是否與原本有差異
    const hasUnsavedChanges = JSON.stringify(checkedCourses) !== JSON.stringify(passedFlexibleCourses || {});

    // Toast 提示相關狀態
    const [showToast, setShowToast] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const fetchCourses = () => {
            try {
                // 改以本地 JSON 組合
                const combinedData = [...data114_1, ...data114_2];
                
                // 去除所有包含 碩 博 所 專班 的課程，並處理同名課程不重複
                const filteredData: any[] = [];
                const seenTitles = new Set();

                combinedData.forEach((c: any) => {
                    const program = c.program || '';
                    const title = c.title || '';
                    const className = c.className || '';
                    
                    if (program.includes('碩') || program.includes('博') || program.includes('專班')) return;
                    if (title.includes('碩') || title.includes('博')) return;
                    if (className.includes('碩') || className.includes('專班') || className.includes('博') || className.includes('所')) return;
                    
                    // 防重複課名
                    if (!seenTitles.has(title)) {
                        seenTitles.add(title);
                        // 給他一個假 ID（因為 Firebase 會幫忙生，本地需要自己產）
                        c.id = String(c.semester || 1) + String(c.courseId || Math.random());
                        filteredData.push(c);
                    }
                });
                
                cachedFlexibleCourses = filteredData;
                setAllFilteredCourses(filteredData);
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
            const targetCourse = allFilteredCourses.find((c: any) => c.id === id);
            if (targetCourse && targetCourse.credits) {
                const numStr = targetCourse.credits.toString().replace(/[^\d]/g, '');
                if (numStr) totalCredits += parseInt(numStr, 10);
            }
        });
        
        updateFlexibleCredits(checkedCourses, totalCredits);

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

    // 定義自訂排序權重 (如果有要用到的話)
    const displayedCourses = allFilteredCourses.filter(course => {
        // 1. 搜尋比對 (依照課名)
        const matchSearch = course.title?.includes(searchQuery);
        
        // 2. 分類比對
        let matchTab = true;
        if (activeTab === '已選取') {
            matchTab = !!checkedCourses[course.id] || !!passedFlexibleCourses[course.id];
        }
        
        return matchSearch && matchTab;
    });

    // 只取出目前指定數量的陣列，達到效能控制
    const paginatedCourses = displayedCourses.slice(0, displayCount);

    const loadMore = () => {
        if (displayCount < displayedCourses.length) {
            setDisplayCount(prev => prev + 30);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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

            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color="#23A85B" style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={paginatedCourses}
                        keyExtractor={(item) => item.id}
                        initialNumToRender={30}
                        maxToRenderPerBatch={30}
                        windowSize={5}
                        removeClippedSubviews={true}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 80 }}
                        onEndReached={loadMore}
                        onEndReachedThreshold={0.5}
                        ItemSeparatorComponent={Separator}
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
        </TouchableWithoutFeedback>
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
