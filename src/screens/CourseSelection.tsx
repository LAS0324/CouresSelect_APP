import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TextInput, ScrollView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // 需要安裝 expo-icons

const CourseSelectionScreen = () => {
    const [searchText, setSearchText] = useState('');

    // 模擬資料庫抓取的課程資料
    const mockCourses = [
        {
            id: '1',
            name: '計算機概論',
            teacher: '王大明 教授',
            time: '週一第7~8節',
            location: '明德樓624',
            type: '必修',
            credits: '3學分',
        },
        {
            id: '2',
            name: '數位科技概論',
            teacher: '李小美 教授',
            time: '週二第3~4節',
            location: '公館校區D102',
            type: '選修',
            credits: '2學分',
        },
        // 可持續增加...
    ];

    const handleAddCourse = (course: any) => {
        console.log('匯入課表:', course.name);
        // 這裡未來會接第一頁的課表狀態更新
        alert(`已將「${course.name}」加入待選清單！`);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* 標題與搜尋欄 */}
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

                {/* 篩選標題 */}
                <View style={styles.filterHeader}>
                    <Text style={styles.filterTitle}>篩選課程</Text>
                    <TouchableOpacity style={styles.advanceSearch}>
                        <MaterialCommunityIcons name="filter-variant" size={20} color="#333" />
                        <Text style={styles.advanceText}>進階查詢</Text>
                    </TouchableOpacity>
                </View>

                {/* 課程卡片列表 */}
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                    {mockCourses.map((course) => (
                        <View key={course.id} style={styles.courseCard}>
                            {/* 卡片上方標籤 */}
                            <View style={styles.tagContainer}>
                                <View style={[styles.tag, { backgroundColor: '#FFE082' }]}>
                                    <Text style={styles.tagText}>{course.type}</Text>
                                </View>
                                <View style={[styles.tag, { backgroundColor: '#FFCCBC' }]}>
                                    <Text style={styles.tagText}>{course.credits}</Text>
                                </View>
                            </View>

                            {/* 中間資訊區 */}
                            <View style={styles.infoRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.courseName}>{course.name}</Text>

                                    <View style={styles.detailItem}>
                                        <Ionicons name="time-outline" size={18} color="#333" />
                                        <Text style={styles.detailText}>{course.time}</Text>
                                    </View>

                                    <View style={styles.detailItem}>
                                        <Ionicons name="location-outline" size={18} color="#333" />
                                        <Text style={styles.detailText}>{course.location}</Text>
                                    </View>
                                </View>

                                {/* 教授資訊 (靠右) */}
                                <View style={styles.teacherInfo}>
                                    <Ionicons name="person-outline" size={18} color="#333" />
                                    <Text style={styles.teacherText}>{course.teacher}</Text>
                                </View>
                            </View>

                            {/* 卡片底部 */}
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
            </View>
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
        // 陰影
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
        backgroundColor: '#7B886F', // 橄欖綠按鈕
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default CourseSelectionScreen;