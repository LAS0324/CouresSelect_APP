import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TextInput, ScrollView, TouchableOpacity, Platform, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCourse } from '../context/CourseContext';
import firestore from '@react-native-firebase/firestore'; // 確保已安裝此套件

// 大樓代號對照表
const BUILDING_MAP: { [key: string]: string } = {
    'Y': '明德樓',
    'A': '篤行樓',
    'B': '至善樓',
    'C': '勤學樓',
    'F': '芳蘭樓',
    'D': '公館校區',
    // 依據學校需求持續補齊
};

// 地點格式化工具
const formatLocation = (code: string) => {
    if (!code) return '未定';
    const prefix = code.charAt(0).toUpperCase();
    const roomNumber = code.substring(1);
    if (BUILDING_MAP[prefix]) {
        return `${BUILDING_MAP[prefix]}${roomNumber}`;
    }
    return code;
};

const CourseSelectionScreen = () => {
    const [searchText, setSearchText] = useState('');
    const [courses, setCourses] = useState<any[]>([]); // 存放雲端抓下來的課程
    const [loading, setLoading] = useState(true); // 載入狀態
    const { addCourse, currentSemester } = useCourse();

    // 從 Firebase 即時抓取課程資料
    useEffect(() => {
        const subscriber = firestore()
            .collection('Semesters')
            .doc(currentSemester) // 使用 Context 裡的 "114-2"
            .collection('Courses')
            .onSnapshot(querySnapshot => {
                const courseList: any[] = [];
                querySnapshot.forEach(documentSnapshot => {
                    courseList.push({
                        ...documentSnapshot.data(),
                        id: documentSnapshot.id,
                    });
                });
                setCourses(courseList);
                setLoading(false);
            }, error => {
                console.error("Firebase 讀取錯誤: ", error);
                setLoading(false);
            });

        return () => subscriber();
    }, [currentSemester]);

    const handleAddCourse = (course: any) => {
        addCourse({
            id: course.id,
            name: course.title, // 注意：資料庫欄位是 title
            teacher: course.teacher,
            timeSlots: course.timeSlots,
            location: course.location,
        });
        Alert.alert('加入成功', `已將「${course.title}」匯入待選清單！`);
    };

    // 搜尋過濾邏輯
    const filteredCourses = courses.filter(course => 
        course.title?.includes(searchText) || course.teacher?.includes(searchText)
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.mainTitle}>選課</Text>

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