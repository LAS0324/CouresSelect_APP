import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { initializeApp } from 'firebase/app';
import { collection, getFirestore, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useCourse } from '../context/CourseContext';
import TopNavBar from '../navigation/TopNavBar';


const firebaseConfig = {
    apiKey: "AIzaSyBAKhdryuoSlPhhgedbxb5-pL24TtAzfzA",
    authDomain: "courseapp-788ad.firebaseapp.com",
    projectId: "courseapp-788ad",
    storageBucket: "courseapp-788ad.firebasestorage.app",
    messagingSenderId: "650322013005",
    appId: "1:650322013005:web:5855bdc8aa1c0dc70be504",
    measurementId: "G-L6FBFFW8PM"
};

// 初始化 Firebase (確保不會重複初始化)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// 大樓代號對照表
const BUILDING_MAP: { [key: string]: string } = {
    'A': '行政大樓', 'B': '科學館', 'C': '明德樓', 'D': '芳蘭樓',
    'E': '創意館', 'F': '視聽館', 'G': '至善樓', 'H': '圖書館',
    'J': '運動場', 'K': '體育館', 'L': '學生活動中心', 'M': '藝術館',
    'N': '櫻花廣場', 'O': '第一宿舍', 'P': '第二宿舍', 'Q': '禮堂',
    'R': '資源回收場', 'S': '文薈樓', 'T': '排球場', 'U': '機車停車棚',
    'V': '校門', 'W': '網球場', 'X': '美術館', 'Y': '篤行樓', 'Z': '泳健館'
};

// 地點格式化工具
const formatLocation = (code: string) => {
    if (!code) return '未定';
    const prefix = code.charAt(0).toUpperCase();
    const roomNumber = code.substring(1);
    return BUILDING_MAP[prefix] ? `${BUILDING_MAP[prefix]}${roomNumber}` : code;
};

const CourseSelectionScreen = () => {
    const [searchText, setSearchText] = useState('');
    const [courses, setCourses] = useState<any[]>([]); // 存放雲端抓下來的課程
    const [loading, setLoading] = useState(true); // 載入狀態
    const { addCourse, currentSemester } = useCourse();

    
    // 從 Firebase 即時抓取課程資料
    useEffect(() => {
        // 1. 建立對應到 Firestore 的集合引用
        const courseCollection = collection(db, 'Semesters', currentSemester, 'Courses');

        // 2. 使用 JS SDK 的 onSnapshot 監聽
        const unsubscribe = onSnapshot(courseCollection, (querySnapshot) => {
            const courseList: any[] = [];
            querySnapshot.forEach((doc) => {
                courseList.push({
                    ...doc.data(),
                    id: doc.id,
                });
            });
            setCourses(courseList);
            setLoading(false);
        }, (error) => {
            console.error("Firebase 讀取錯誤: ", error);
            setLoading(false);
        });

        // 3. 組件卸載時取消監聽
        return () => unsubscribe();
    }, [currentSemester]);

    const handleAddCourse = (course: any) => {
        addCourse({
            id: course.id,
            name: course.title,
            teacher: course.teacher,
            timeSlots: course.timeSlots,
            location: formatLocation(course.location), // 這裡建議也加上 format，讓課表顯示中文
        });
        Alert.alert('加入成功', `已將「${course.title}」匯入待選清單！`);
    };

    // 搜尋過濾邏輯
    const filteredCourses = courses.filter(course =>
        course.title?.includes(searchText) || course.teacher?.includes(searchText)
    );

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
                    <TouchableOpacity style={styles.advanceSearch}>
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
                        {filteredCourses.map((course) => (
                            <View key={course.id} style={styles.courseCard}>
                                <View style={styles.tagContainer}>
                                    <View style={[styles.tag, { backgroundColor: '#FFE082' }]}>
                                        <Text style={styles.tagText}>{course.type || '必修'}</Text>
                                    </View>
                                    <View style={[styles.tag, { backgroundColor: '#FFCCBC' }]}>
                                        <Text style={styles.tagText}>{course.credits || '0學分'}</Text>
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
                                            {/* 使用代號轉換工具 */}
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
                        ))}
                    </ScrollView>
                )}
            </View>
        </SafeAreaView>
    );
};

// ... styles 保持不變 ...
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FAF7ED',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
    },
    container: { flex: 1, paddingHorizontal: 20 },
    mainTitle: { fontSize: 48, fontWeight: 'bold', color: '#1A1A1A', marginTop: 10, marginBottom: 20 },
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
    tag: {
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 15,
        marginRight: 10,
    },
    tagText: { fontSize: 14, fontWeight: '600' },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
    courseName: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    teacherInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
    teacherText: { fontSize: 16, marginLeft: 5 },
    detailItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    detailText: { fontSize: 18, marginLeft: 8 },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 10
    },
    reviewLink: { fontSize: 14, color: '#666', textDecorationLine: 'underline' },
    addButton: {
        backgroundColor: '#7B886F',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default CourseSelectionScreen;