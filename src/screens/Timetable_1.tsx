import React, { useEffect, useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useCourse } from '../context/CourseContext'; // 引入共享籃子
import TopNavBar from '../navigation/TopNavBar';

// 根據「3/23-3/29 為第五週」反推，第一週週一為 2026-02-23
const SEMESTER_START_DATE = new Date('2026-02-23');

const TimetableScreen = () => {
    const [selectedDay, setSelectedDay] = useState(0);
    const [isWeeklyMode, setIsWeeklyMode] = useState(false);
    const [currentWeek, setCurrentWeek] = useState(1);

    // 從籃子拿取選中的課程資料
    const { selectedCourses } = useCourse();

    const days = [
        { label: '一', en: 'Mon' },
        { label: '二', en: 'Tue' },
        { label: '三', en: 'Wed' },
        { label: '四', en: 'Thu' },
        { label: '五', en: 'Fri' },
    ];

    // 節次資訊
    const periods = [
        { id: '0M', time: '07:10\n08:00' },
        { id: '01', time: '08:10\n09:00' },
        { id: '02', time: '09:10\n10:00' },
        { id: '03', time: '10:10\n11:00' },
        { id: '04', time: '11:10\n12:00' },
        { id: '0N', time: '12:10\n13:20' },
        { id: '05', time: '13:30\n14:20' },
        { id: '06', time: '14:30\n15:20' },
        { id: '07', time: '15:30\n16:20' },
        { id: '08', time: '16:30\n17:20' },
        { id: '0E', time: '17:30\n18:20' },
        { id: '09', time: '18:30\n19:15' },
        { id: '10', time: '19:15\n20:00' },
        { id: '11', time: '20:10\n20:55' },
        { id: '12', time: '20:55\n21:40' },
    ];

    // 動態計算正確週數
    useEffect(() => {
        const today = new Date();
        const diffInMs = today.getTime() - SEMESTER_START_DATE.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        const week = Math.floor(diffInDays / 7) + 1;

        if (week >= 1 && week <= 18) {
            setCurrentWeek(week);
        } else if (week > 18) {
            setCurrentWeek(18);
        } else {
            setCurrentWeek(1);
        }
    }, []);

    // 核心邏輯：過濾出該天、該節次的課程
    const getCoursesBySlot = (dayIdx: number, periodId: string) => {
        // 格式對應 Context 中的 "1-02" (星期-節次)
        const slotKey = `${dayIdx + 1}-${periodId}`;
        return selectedCourses.filter(course => course.timeSlots.includes(slotKey));
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <TopNavBar title="課表" />
            <View style={styles.container}>

                {/* Header 部分 */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.subTitle}>114下學期 第{currentWeek}週</Text>
                    </View>
                    <View style={styles.switchContainer}>
                        <Text style={styles.switchLabel}>一週預覽模式</Text>
                        <Switch
                            value={isWeeklyMode}
                            onValueChange={setIsWeeklyMode}
                            trackColor={{ false: "#767577", true: '#7B886F' }}
                            thumbColor={isWeeklyMode ? "#FFF" : "#f4f3f4"}
                        />
                    </View>
                </View>

                {/* 星期切換鈕 */}
                <View style={styles.daySelector}>
                    {days.map((day, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.dayButton, selectedDay === index && styles.dayButtonActive]}
                            onPress={() => setSelectedDay(index)}
                        >
                            <Text style={[styles.dayEn, selectedDay === index && styles.textActive]}>{day.en}</Text>
                            <Text style={[styles.dayCn, selectedDay === index && styles.textActive]}>{day.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 課表主體 */}
                <View style={styles.tableCard}>
                    <View style={styles.tableHeader}>
                        <View style={{ flex: 0.6 }} />
                        <View style={{ flex: 3, flexDirection: 'row' }}>
                            <Text style={[styles.headerColText, { flex: 1.2 }]}>課堂名稱</Text>
                            <Text style={[styles.headerColText, { flex: 1 }]}>上課教室</Text>
                            <Text style={[styles.headerColText, { flex: 1 }]}>授課老師</Text>
                        </View>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                        {periods.map((p) => {
                            // 動態抓取課程
                            const dayCourses = getCoursesBySlot(selectedDay, p.id);

                            return (
                                <View key={p.id} style={styles.periodRow}>
                                    {/* 左側節次與時間 */}
                                    <View style={styles.timeLabelContainer}>
                                        <Text style={styles.periodLabel}>{p.id}</Text>
                                        <Text style={styles.timeRangeText}>{p.time}</Text>
                                    </View>

                                    {/* 右側課程內容：若有課則渲染，沒課則留空 */}
                                    <View style={styles.courseCellContainer}>
                                        {dayCourses.length > 0 ? (
                                            dayCourses.map((c, i) => (
                                                <View key={i} style={[
                                                    styles.courseEntry,
                                                    dayCourses.length > 1 && styles.clashHighlight
                                                ]}>
                                                    <Text style={styles.courseNameText} numberOfLines={2}>{c.name}</Text>
                                                    <Text style={styles.courseDetailText}>{c.location}</Text>
                                                    <Text style={styles.courseDetailText}>{c.teacher}</Text>
                                                </View>
                                            ))
                                        ) : (
                                            <View style={styles.emptyPeriodSpacer} />
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </ScrollView>
                </View>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 20
    },
    mainTitle: { fontSize: 36, fontWeight: 'bold', color: '#1A1A1A' },
    subTitle: { fontSize: 22, color: '#444', marginTop: 2 },
    switchContainer: { alignItems: 'center' },
    switchLabel: { fontSize: 11, color: '#888', marginBottom: 2 },

    daySelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    dayButton: {
        width: 62,
        height: 72,
        borderRadius: 31,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 3
    },
    dayButtonActive: { backgroundColor: '#7B886F' },
    dayEn: { fontSize: 15, color: '#1A1A1A', fontWeight: '600' },
    dayCn: { fontSize: 15, color: '#1A1A1A' },
    textActive: { color: '#FFF' },

    tableCard: {
        flex: 1,
        backgroundColor: '#EFF2F4',
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        padding: 15,
        paddingBottom: 0
    },
    tableHeader: {
        flexDirection: 'row',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#CFD8DC'
    },
    headerColText: { textAlign: 'center', fontSize: 12, color: '#1A1A1A', fontWeight: 'bold' },

    periodRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#CFD8DC',
        minHeight: 85
    },
    timeLabelContainer: {
        flex: 0.6,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
        borderRightWidth: 0.5,
        borderRightColor: '#CFD8DC'
    },
    periodLabel: { fontSize: 15, fontWeight: 'bold', color: '#1A1A1A' },
    timeRangeText: { fontSize: 12, color: '#1A1A1A', textAlign: 'center', lineHeight: 14 },

    courseCellContainer: { flex: 3, justifyContent: 'center' },
    courseEntry: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        width: '100%'
    },
    clashHighlight: {
        borderLeftWidth: 4,
        borderLeftColor: '#D88A63',
        backgroundColor: 'rgba(216, 138, 99, 0.08)'
    },
    courseNameText: { flex: 1.2, textAlign: 'center', fontSize: 13, color: '#263238', fontWeight: '600', paddingHorizontal: 4 },
    courseDetailText: { flex: 1, textAlign: 'center', fontSize: 12, color: '#546E7A' },
    emptyPeriodSpacer: { flex: 1, height: 85 },
});

export default TimetableScreen;