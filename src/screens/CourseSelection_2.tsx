import React, { useEffect, useState, useMemo } from 'react';
import {
    ActivityIndicator, Alert, Platform, SafeAreaView,
    ScrollView, StatusBar, StyleSheet, Text, TextInput,
    TouchableOpacity, View
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, onSnapshot, query, limit } from 'firebase/firestore';
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

    // 控制進階查詢視窗
    const [isModalVisible, setIsModalVisible] = useState(false);
    // 儲存進階篩選條件
    const [currentFilters, setCurrentFilters] = useState<any>(null);

    useEffect(() => {
        setLoading(true);
        const courseCollection = collection(db, 'Semesters', currentSemester, 'Courses');
        const q = query(courseCollection, limit(2000)); // 稍微增加限制筆數

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const courseList: any[] = [];
            querySnapshot.forEach((doc) => {
                courseList.push({ ...doc.data(), id: doc.id });
            });
            setCourses(courseList);
            setLoading(false);
        }, (error) => {
            console.error("Firebase 讀取錯誤: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
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

    // 💡 整合過濾邏輯：搜尋框 + 進階篩選
    // 💡 整合過濾邏輯：搜尋框 + 進階篩選 (針對你的資料庫格式優化)
    const filteredCourses = useMemo(() => {
        // 1. 先進行過濾
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

        // 💡 2. 進行自定義排序 (權重系統)
        return result.sort((a, b) => {
            const getWeight = (c: any) => {
                if (c.electiveType === "必修" && c.requirementType === "專門課程") return 1;
                if (c.electiveType === "選修" && c.requirementType === "專門課程") return 2;
                if (c.electiveType === "必修" && c.requirementType === "校共同課程") return 3;
                if (c.electiveType === "選修" && c.requirementType === "通識課程") return 4;
                return 5; // 剩下的排最後
            };

            return getWeight(a) - getWeight(b);
        });
    }, [courses, searchText, currentFilters]);
    return (
        <SafeAreaView style={styles.safeArea}>
            <TopNavBar title="選課" />
            <View style={styles.container}>
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

                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <ActivityIndicator size="large" color="#7B886F" />
                        <Text style={{ textAlign: 'center', marginTop: 10, color: '#666' }}>正在從雲端抓取課程...</Text>
                    </View>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                        {filteredCourses.length > 0 ? (
                            filteredCourses.map((course) => (
                                <View key={course.id} style={styles.courseCard}>
                                    <View style={styles.tagContainer}>
                                        {/* 1. 必選修 Tag */}
                                        <View style={[styles.tag, { backgroundColor: '#FFE082' }]}>
                                            <Text style={styles.tagText}>{course.electiveType || '必修'}</Text>
                                        </View>

                                        {/* 2. 學分 Tag - 修正重複字眼 */}
                                        <View style={[styles.tag, { backgroundColor: '#FFCCBC' }]}>
                                            <Text style={styles.tagText}>{course.credits ? `${course.credits} 學分` : '0 學分'}</Text>
                                        </View>

                                        {/* 3. 課程類別 Tag - 增加預設值防止空白 */}
                                        <View style={[styles.tag, { backgroundColor: '#B3E5FC' }]}>
                                            <Text style={styles.tagText}>
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
                            ))
                        ) : (
                            <View style={{ marginTop: 50, alignItems: 'center' }}>
                                <Text style={{ color: '#888', fontSize: 16 }}>找不到符合條件的課程 😢</Text>
                                {currentFilters && (
                                    <TouchableOpacity onPress={() => setCurrentFilters(null)}>
                                        <Text style={{ color: '#7B886F', marginTop: 10, textDecorationLine: 'underline' }}>清除所有篩選</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </ScrollView>
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
    searchSection: { marginBottom: 25 },
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    tagContainer: { flexDirection: 'row', marginBottom: 10 },
    tag: { paddingHorizontal: 15, paddingVertical: 5, borderRadius: 15, marginRight: 10 },
    tagText: { fontSize: 14, fontWeight: '600' },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
    courseName: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    teacherInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
    teacherText: { fontSize: 16, marginLeft: 5 },
    detailItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    detailText: { fontSize: 18, marginLeft: 8 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 10 },
    reviewLink: { fontSize: 14, color: '#666', textDecorationLine: 'underline' },
    addButton: { backgroundColor: '#7B886F', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' }
});

export default CourseSelectionScreen;