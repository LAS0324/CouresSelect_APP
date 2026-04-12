import React, { useEffect, useState, useMemo, useCallback } from 'react'; // 💡 增加 useCallback
import {
    ActivityIndicator, Alert, Platform, SafeAreaView,
    StatusBar, StyleSheet, Text, TextInput,
    TouchableOpacity, View, FlatList // 💡 引入 FlatList
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { initializeApp, getApps } from 'firebase/app';
// 💡 改用 getDocs 提升一次性讀取速度
import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore';
import { useCourse } from '../context/CourseContext';
import TopNavBar from '../navigation/TopNavBar';
import AdvancedSearchModal from '../components/AdvancedSearchModal';

const firebaseConfig = {
    apiKey: "AIzaSyBAKhdryuoSlPhhgedbxb5-pL24TtAzfzA",
    authDomain: "courseapp-788ad.firebaseapp.com",
    projectId: "courseapp-788ad",
    storageBucket: "courseapp-788ad.firebasestorage.app",
    messagingSenderId: "650322013005",
    appId: "1:650322013005:web:5855bdc8aa1c0dc70be504",
    measurementId: "G-L6FBFFW8PM"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

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
    const { addCourse, currentSemester } = useCourse();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentFilters, setCurrentFilters] = useState<any>(null);

    // 💡 1. 改用 getDocs 進行一次性高速抓取
    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                const courseCollection = collection(db, 'Semesters', currentSemester, 'Courses');
                // 調到 1000 筆通常足以涵蓋大部分系所需求，且不會過慢
                const q = query(courseCollection, limit(1000));
                const querySnapshot = await getDocs(q);

                const courseList: any[] = [];
                querySnapshot.forEach((doc) => {
                    courseList.push({ ...doc.data(), id: doc.id });
                });
                setCourses(courseList);
            } catch (error) {
                console.error("Firebase 讀取錯誤: ", error);
            }
            setLoading(false);
        };
        fetchCourses();
    }, [currentSemester]);

    const handleAddCourse = (course: any) => {
        addCourse({
            id: course.id,
            name: course.title,
            teacher: course.teacher,
            timeSlots: course.timeSlots,
            location: formatLocation(course.location),
        });
        Alert.alert('加入成功', `已將「${course.title}」匯入待選清單！`);
    };

    const filteredCourses = useMemo(() => {
        const result = courses.filter((course: any) => {
            const searchLower = searchText.toLowerCase();
            const matchSearch = (course.title || "").toLowerCase().includes(searchLower) ||
                (course.teacher || "").toLowerCase().includes(searchLower);

            if (!matchSearch) return false;

            if (currentFilters) {
                const { dept, classGroup, day, startSlot, endSlot } = currentFilters;
                const dbClassName = course.className || "";
                const matchDept = dept ? dbClassName.includes(dept) : true;
                const isGeneral = dbClassName.includes("全校") || dbClassName.includes("大學部") || dbClassName.includes("通識");
                const matchClass = classGroup ? (dbClassName.includes(classGroup) || isGeneral) : true;
                const matchTime = (day && startSlot && endSlot) ?
                    (course.timeSlots || []).some((slot: string) => {
                        const [d, s] = slot.split('-');
                        return d === day && s >= startSlot && s <= endSlot;
                    }) : true;

                return matchDept && matchClass && matchTime;
            }
            return true;
        });

        return result.sort((a, b) => {
            const getWeight = (c: any) => {
                if (c.electiveType === "必修" && c.requirementType === "專門課程") return 1;
                if (c.electiveType === "選修" && c.requirementType === "專門課程") return 2;
                if (c.electiveType === "必修" && c.requirementType === "校共同課程") return 3;
                if (c.electiveType === "選修" && c.requirementType === "通識課程") return 4;
                return 5;
            };
            return getWeight(a) - getWeight(b);
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

                {/* 2. 學分 Tag - 在這裡手動加上「學分」二字 */}
                <View style={[styles.tag, { backgroundColor: '#FFCCBC' }]}>
                    <Text style={styles.tagText}>
                        {/* 💡 這裡加上字串模板，讓數字後面跟著「學分」 */}
                        {course.credits ? `${course.credits} 學分` : '0 學分'}
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
            <TopNavBar title="選課" />
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
                        <Text style={{ marginTop: 10, color: '#666' }}>正在從雲端抓取課程...</Text>
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