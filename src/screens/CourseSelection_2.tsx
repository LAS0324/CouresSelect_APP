import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Platform, SafeAreaView,
    StatusBar, StyleSheet, Text, TextInput,
    TouchableOpacity, View,
    FlatList,
    LayoutAnimation, // 💡 引入動畫庫
    UIManager
} from 'react-native';
import coursesData from '../../courses/courses.json';
import AdvancedSearchModal from '../components/AdvancedSearchModal';
import { useCourse } from '../context/CourseContext';
import TopNavBar from '../navigation/TopNavBar';

// 啟用 Android 的 LayoutAnimation
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const BUILDING_MAP: { [key: string]: string } = {
    'A': '行政大樓', 'B': '科學館', 'C': '明德樓', 'D': '芳蘭樓',
    'E': '創意館', 'F': '視聽館', 'G': '至善樓', 'H': '圖書館',
    'J': '運動場', 'K': '體育館', 'L': '學生活動中心', 'M': '藝術館',
    'N': '櫻花廣場', 'O': '第一宿舍', 'P': '第二宿舍', 'Q': '禮堂',
    'R': '資源回收場', 'S': '文薈樓', 'T': '排球場', 'U': '機車停車棚',
    'V': '校門', 'W': '網球場', 'X': '美術館', 'Y': '篤行樓', 'Z': '泳健館'
};

const formatLocation = (code: string) => {
    if (!code) return '未定';
    const prefix = code.charAt(0).toUpperCase();
    const roomNumber = code.substring(1);
    return BUILDING_MAP[prefix] ? `${BUILDING_MAP[prefix]}${roomNumber}` : code;
};

const CourseSelectionScreen = () => {
    const [searchText, setSearchText] = useState('');
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    // 💡 取得 selectedCourses 用於過濾
    const { addCourse, currentSemester, selectedCourses } = useCourse();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentFilters, setCurrentFilters] = useState<any>(null);

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                const parseTimeToSlots = (timeStr: string) => {
                    if (!timeStr) return [];
                    const dayMap: { [key: string]: string } = {
                        '一': '1', '二': '2', '三': '3', '四': '4', '五': '5', '六': '6', '日': '7'
                    };
                    const slots: string[] = [];
                    const regex = /([一二三四五六日])\(([^)]+)\)/g;
                    let match;
                    while ((match = regex.exec(timeStr)) !== null) {
                        const dayNum = dayMap[match[1]];
                        if (dayNum) {
                            match[2].split(',').forEach(p => slots.push(`${dayNum}-${p.trim()}`));
                        }
                    }
                    return slots;
                };

                const courseList = coursesData.map((course: any, index: number) => ({
                    ...course,
                    id: course.courseId ? course.courseId.toString() : index.toString(),
                    timeSlots: course.timeSlots || parseTimeToSlots(course.time)
                }));
                setCourses(courseList);
            } catch (error) {
                console.error("讀取本地資料錯誤: ", error);
            }
            setLoading(false);
        };
        fetchCourses();
    }, [currentSemester]);

    const handleAddCourse = (course: any) => {
        // 💡 觸發佈局動畫：下一次 State 更新導致的畫面變動會帶有動畫效果
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        addCourse({
            id: course.id || '',
            name: course.title || '',
            teacher: course.teacher || '',
            timeSlots: course.timeSlots || [],
            location: formatLocation(course.location) || '未定',
        });
        // 移除 Alert，改用流暢的卡片消失感
    };

    const filteredCourses = useMemo(() => {
        // 💡 1. 先獲取已選課程的 ID 列表 (轉成 Set 提高查詢效能)
        const selectedIds = new Set(selectedCourses.map(c => String(c.id)));

        const result = courses.filter((course: any) => {
            // 💡 2. 核心邏輯：如果這堂課已經在課表裡，直接過濾掉不顯示
            if (selectedIds.has(String(course.id))) return false;

            const searchLower = searchText.toLowerCase();
            const matchSearch = !searchText ||
                (course.title || "").toLowerCase().includes(searchLower) ||
                (course.teacher || "").toLowerCase().includes(searchLower);

            if (!matchSearch) return false;

            if (currentFilters) {
                const { dept, classGroup, day, startSlot, endSlot } = currentFilters;
                const dbClassName = String(course.className || "");
                const isDeptUnlimited = !dept || dept === "(不限)" || dept === "不限";
                const isClassUnlimited = !classGroup || classGroup === "(不限)" || classGroup === "不限";
                const userGrade = (!isClassUnlimited) ? classGroup.match(/[一二三四]/)?.[0] : null;

                const matchesDept = isDeptUnlimited ? true : dbClassName.includes(dept);
                const matchesClass = isClassUnlimited ? true : dbClassName.includes(classGroup);
                const isGeneral = dbClassName.includes("通識") || dbClassName.includes("全校") || dbClassName.includes("大學部") || dbClassName.includes("共同");

                let canTakeGeneral = false;
                if (isGeneral) {
                    if (isClassUnlimited) {
                        canTakeGeneral = true;
                    } else if (userGrade === "一") {
                        canTakeGeneral = !dbClassName.includes("二到四") && !dbClassName.includes("大二");
                    } else {
                        canTakeGeneral = !dbClassName.includes("大一通識");
                    }
                }

                const classPass = (isDeptUnlimited && isClassUnlimited) ? true : ((matchesDept && matchesClass) || canTakeGeneral);

                const isTimeUnlimited = !day || day === "(不限)" || !startSlot || !endSlot;
                const matchTime = isTimeUnlimited ? true :
                    (course.timeSlots || []).some((slot: string) => {
                        const [d, s] = slot.split('-');
                        const currentSlotIdx = parseInt(s, 10) || 0;
                        const startIdx = parseInt(startSlot, 10);
                        const endIdx = parseInt(endSlot, 10);
                        return d === day && currentSlotIdx >= startIdx && currentSlotIdx <= endIdx;
                    });

                return classPass && matchTime;
            }
            return true;
        });

        return result.sort((a, b) => {
            if (a.electiveType === "必修" && b.electiveType !== "必修") return -1;
            if (a.electiveType !== "必修" && b.electiveType === "必修") return 1;
            return 0;
        });
    }, [courses, searchText, currentFilters, selectedCourses]); // 💡 監聽 selectedCourses

    const renderCourseItem = useCallback(({ item: course }: { item: any }) => (
        <View style={styles.courseCard}>
            <View style={styles.tagContainer}>
                <View style={[styles.tag, { backgroundColor: '#FFE082' }]}>
                    <Text style={styles.tagText}>{course.electiveType || course.type || '必修'}</Text>
                </View>
                <View style={[styles.tag, { backgroundColor: '#FFCCBC' }]}>
                    <Text style={styles.tagText}>
                        {course.credits ? `${String(course.credits).replace('學分', '').trim()} 學分` : '0 學分'}
                    </Text>
                </View>
                <View style={[styles.tag, { backgroundColor: '#B3E5FC' }]}>
                    <Text style={styles.tagText}>{course.requirementType || '一般課程'}</Text>
                </View>
            </View>

            <View style={styles.infoRow}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.courseName}>{course.title}</Text>
                    <View style={styles.detailItem}>
                        <Ionicons name="time-outline" size={18} color="#333" />
                        <Text style={styles.detailText}>{course.time}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Ionicons name="location-outline" size={18} color="#333" />
                        <Text style={styles.detailText}>{formatLocation(course.location)}</Text>
                    </View>
                </View>
                <View style={styles.teacherInfo}>
                    <Ionicons name="person-outline" size={18} color="#333" />
                    <Text style={styles.teacherText}>{course.teacher}</Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <TouchableOpacity onPress={() => console.log('打開評論區')}>
                    <Text style={styles.reviewLink}>查看評論</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => handleAddCourse(course)}
                >
                    <Ionicons name="add" size={30} color="#FFF" />
                </TouchableOpacity>
            </View>
        </View>
    ), [selectedCourses]); // 💡 當已選清單變動時重新生成渲染函式

    return (
        <SafeAreaView style={styles.safeArea}>
            <TopNavBar title="選課" />
            <View style={styles.container}>
                <FlatList
                    data={filteredCourses}
                    renderItem={renderCourseItem}
                    keyExtractor={(item) => item.id}
                    ListHeaderComponent={
                        <View>
                            <View style={styles.searchSection}>
                                <View style={styles.searchBar}>
                                    <Ionicons name="search" size={20} color="#888" style={{ marginRight: 10 }} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="搜尋課程名稱或是授課老師..."
                                        value={searchText}
                                        onChangeText={setSearchText}
                                    />
                                </View>
                            </View>
                            <View style={styles.filterHeader}>
                                <Text style={styles.filterTitle}>篩選課程</Text>
                                <TouchableOpacity
                                    style={styles.advanceSearch}
                                    onPress={() => setIsModalVisible(true)}
                                >
                                    <MaterialCommunityIcons name="filter-variant" size={20} color="#333" />
                                    <Text style={styles.advanceText}>進階查詢</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    }
                    ListEmptyComponent={
                        !loading ? (
                            <View style={{ marginTop: 50, alignItems: 'center' }}>
                                <Text style={{ color: '#888', fontSize: 16 }}>找不到符合條件的課程 😢</Text>
                                {currentFilters && (
                                    <TouchableOpacity onPress={() => setCurrentFilters(null)}>
                                        <Text style={{ color: '#7B886F', marginTop: 10, textDecorationLine: 'underline' }}>清除所有篩選</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ) : null
                    }
                    ListFooterComponent={<View style={{ height: 20 }} />}
                    initialNumToRender={8}
                    windowSize={5}
                />

                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#7B886F" />
                        <Text style={{ marginTop: 10, color: '#666' }}>正在讀取課程資料...</Text>
                    </View>
                )}
            </View>

            <AdvancedSearchModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onSearch={(filters) => {
                    // 💡 搜尋過濾時也可以加上動畫
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setCurrentFilters(filters);
                    setIsModalVisible(false);
                }}
            />
        </SafeAreaView>
    );
};

// ... Styles 維持不變 ...
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FAF7ED',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
    },
    container: { flex: 1, paddingHorizontal: 20 },
    searchSection: { marginBottom: 25, marginTop: 10 },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E0E0E0',
        borderRadius: 25,
        paddingHorizontal: 20,
        height: 50,
    },
    input: { flex: 1, fontSize: 16 },
    filterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    filterTitle: { fontSize: 32, fontWeight: 'bold', color: '#1A1A1A' },
    advanceSearch: { flexDirection: 'row', alignItems: 'center' },
    advanceText: { fontSize: 18, marginLeft: 5, color: '#333' },
    courseCard: {
        backgroundColor: '#FFF',
        borderRadius: 30,
        padding: 20,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    tagContainer: { flexDirection: 'row', marginBottom: 10 },
    tag: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 15, marginRight: 8 },
    tagText: { fontSize: 13, fontWeight: '600' },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
    courseName: { fontSize: 22, fontWeight: 'bold', marginBottom: 8, color: '#333' },
    teacherInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
    teacherText: { fontSize: 15, marginLeft: 5 },
    detailItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    detailText: { fontSize: 16, marginLeft: 8 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 10 },
    reviewLink: { fontSize: 14, color: '#666', textDecorationLine: 'underline' },
    addButton: { backgroundColor: '#7B886F', width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(250, 247, 237, 0.8)',
        zIndex: 1000
    }
});

export default CourseSelectionScreen;