import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react'; // 💡 增加 useCallback
import {
    ActivityIndicator, Alert,
    FlatList // 💡 引入 FlatList
    ,

    Platform, SafeAreaView,
    StatusBar, StyleSheet, Text, TextInput,
    TouchableOpacity, View
} from 'react-native';
import coursesData from '../../courses/courses.json';
import AdvancedSearchModal from '../components/AdvancedSearchModal';
import { useCourse } from '../context/CourseContext';
import TopNavBar from '../navigation/TopNavBar';

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

const CourseSelectionScreen = ({ navigation }: any) => {
    const [searchText, setSearchText] = useState('');
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { addCourse, currentSemester } = useCourse();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentFilters, setCurrentFilters] = useState<any>(null);

    // 💡 1. 讀取本地 JSON 資料
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
                    // 💡 不要只用 courseId，因為有些通識課的 courseId 可能是空的或重複的
                    // 用 "類別-序號" 這種絕對不會重複的組合
                    id: `course-${index}-${course.courseId || 'no-id'}`,
                    timeSlots: course.timeSlots || parseTimeToSlots(course.time)
                }));
                // 如果需要根據 currentSemester 切換不同的檔案，可在此處處理

                setCourses(courseList);
            } catch (error) {
                console.error("讀取本地資料錯誤: ", error);
            }
            setLoading(false);
        };
        fetchCourses();
    }, [currentSemester]);

    const handleAddCourse = (course: any) => {
        addCourse({
            id: course.id || '',
            name: course.title || '',
            teacher: course.teacher || '',
            timeSlots: course.timeSlots || [],
            location: formatLocation(course.location) || '未定',
        });
        Alert.alert('加入成功', `已將「${course.title}」匯入待選清單！`);
    };

    const filteredCourses = useMemo(() => {
        // 💡 1. 建立去重 Map
        const uniqueMap = new Map();

        const result = courses.filter((course: any) => {
            // --- 基本搜尋文字過濾 ---
            const searchLower = searchText.toLowerCase();
            const matchSearch = !searchText ||
                (course.title || "").toLowerCase().includes(searchLower) ||
                (course.teacher || "").toLowerCase().includes(searchLower);

            if (!matchSearch) return false;

            // --- 進階查詢邏輯 ---
            if (currentFilters) {
                const { dept, classGroup, day, startSlot, endSlot } = currentFilters;
                const dbClassName = String(course.className || "");

                // 💡 A. 定義「(不限)」邏輯：只要是 undefined、空字串或標註為 (不限) 都視為不限
                const isDeptUnlimited = !dept || dept === "(不限)" || dept === "不限";
                const isClassUnlimited = !classGroup || classGroup === "(不限)" || classGroup === "不限";

                // 解析使用者年級
                const userGrade = (!isClassUnlimited) ? classGroup.match(/[一二三四]/)?.[0] : null;

                // 💡 B. 班級匹配判斷 (只要包含該系或該班就過)
                const matchesDept = isDeptUnlimited ? true : dbClassName.includes(dept);
                const matchesClass = isClassUnlimited ? true : dbClassName.includes(classGroup);

                // 💡 C. 身份感知：全校/通識課程邏輯
                // 只要包含「通識」、「全校」、「大學部」、「共同」，就屬於潛在可選課程
                const isGeneral = dbClassName.includes("通識") ||
                    dbClassName.includes("全校") ||
                    dbClassName.includes("大學部") ||
                    dbClassName.includes("共同");

                let canTakeGeneral = false;
                if (isGeneral) {
                    if (isClassUnlimited) {
                        canTakeGeneral = true; // 沒選班級，全看
                    } else if (userGrade === "一") {
                        // 大一：排除專門給大二以上的課
                        canTakeGeneral = !dbClassName.includes("二到四") && !dbClassName.includes("大二");
                    } else {
                        // 大二以上：排除專門給大一的課
                        canTakeGeneral = !dbClassName.includes("大一通識");
                    }
                }

                // 💡 D. 最終判定：(系所符合 且 班級符合) OR (符合身份的通識/共同課)
                const classPass = (isDeptUnlimited && isClassUnlimited)
                    ? true
                    : ((matchesDept && matchesClass) || canTakeGeneral);

                // 💡 E. 時間區間判斷
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

        // 💡 2. 徹底去重
        result.forEach(c => {
            if (!uniqueMap.has(c.id)) uniqueMap.set(c.id, c);
        });

        return Array.from(uniqueMap.values()).sort((a, b) => {
            // 必修排前面
            if (a.electiveType === "必修" && b.electiveType !== "必修") return -1;
            if (a.electiveType !== "必修" && b.electiveType === "必修") return 1;
            return 0;
        });
    }, [courses, searchText, currentFilters]);

    // 💡 2. 定義 FlatList 的渲染項目 (優化效能)
    const renderCourseItem = useCallback(({ item: course }: { item: any }) => (
        <View style={styles.courseCard}>
            <View style={styles.tagContainer}>
                {/* 1. 必選修 */}
                <View style={[styles.tag, { backgroundColor: '#FFE082' }]}>
                    <Text style={styles.tagText}>{course.electiveType || course.type || '必修'}</Text>
                </View>

                <View style={[styles.tag, { backgroundColor: '#FFCCBC' }]}>
                    <Text style={styles.tagText}>
                        {/* 💡 先將原始資料轉為字串並移除原本就有的「學分」二字，再統一補上 */}
                        {course.credits
                            ? `${String(course.credits).replace('學分', '').trim()} 學分`
                            : '0 學分'}
                    </Text>
                </View>

                {/* 3. 課程類別 - 增加容錯，確保抓到資料 */}
                <View style={[styles.tag, { backgroundColor: '#B3E5FC' }]}>
                    <Text style={styles.tagText}>
                        {/* 這裡要確保 Key 跟 Firebase 一模一樣 */}
                        {course.requirementType || '一般課程'}
                    </Text>
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
    ), [courses]); // 當 courses 改變時重新生成

    return (
        <SafeAreaView style={styles.safeArea}>
            <TopNavBar 
                title="選課" 
                onNotificationPress={() => navigation.navigate('NotificationScreen')} 
            />
            <View style={styles.container}>
                {/* 💡 搜尋列與標題 */}
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
                    refreshing={loading}
                    onRefresh={() => {/* 這裡可以放手動刷新的邏輯 */ }}
                    // 💡 效能關鍵設定
                    initialNumToRender={8}
                    windowSize={5}
                    removeClippedSubviews={true}
                    showsVerticalScrollIndicator={false}
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
                    setCurrentFilters(filters);
                    setIsModalVisible(false);
                }}
            />
        </SafeAreaView>
    );
};

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