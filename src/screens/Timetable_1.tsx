import React, { useEffect, useState, useMemo } from 'react';
import {
    Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet,
    Text, TouchableOpacity, View, Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCourse } from '../context/CourseContext';
import TopNavBar from '../navigation/TopNavBar';
import { getGridData, sortOverlappingCourses } from '../utils/timetableUtils';

const SEMESTER_START_DATE = new Date('2026-02-23');

const TimetableScreen = () => {
    // --- 狀態管理 ---
    const [viewMode, setViewMode] = useState<'Week' | 'Day'>('Week');
    const [selectedDay, setSelectedDay] = useState(0); // 專供 Day 模式使用
    const [currentWeek, setCurrentWeek] = useState(1);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1.0);

    const { selectedCourses, removeCourse } = useCourse();

    const days = [
        { label: '一', en: 'Mon' }, { label: '二', en: 'Tue' },
        { label: '三', en: 'Wed' }, { label: '四', en: 'Thu' }, { label: '五', en: 'Fri' },
    ];

    const periods = [
        { id: '0M', time: '07:10\n08:00' }, { id: '01', time: '08:10\n09:00' },
        { id: '02', time: '09:10\n10:00' }, { id: '03', time: '10:10\n11:00' },
        { id: '04', time: '11:10\n12:00' }, { id: '0N', time: '12:10\n13:20' },
        { id: '05', time: '13:30\n14:20' }, { id: '06', time: '14:30\n15:20' },
        { id: '07', time: '15:30\n16:20' }, { id: '08', time: '16:30\n17:20' },
        { id: '0E', time: '17:30\n18:20' }, { id: '09', time: '18:30\n19:15' },
        { id: '10', time: '19:15\n20:00' }, { id: '11', time: '20:10\n20:55' },
        { id: '12', time: '20:55\n21:40' },
    ];

    // 動態計算週數
    useEffect(() => {
        const today = new Date();
        const diffInMs = today.getTime() - SEMESTER_START_DATE.getTime();
        const week = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 7)) + 1;
        setCurrentWeek(week >= 1 && week <= 18 ? week : (week > 18 ? 18 : 1));
    }, []);

    // 💡 核心資料：Week 模式用的二維網格
    const gridData = useMemo(() => getGridData(selectedCourses, periods), [selectedCourses]);

    // 💡 核心資料：Day 模式用的當天過濾
    const getCoursesBySlot = (dayIdx: number, periodId: string) => {
        const slotKey = `${dayIdx + 1}-${periodId}`;
        return selectedCourses.filter(course => course.timeSlots.includes(slotKey));
    };

    // --- Week 模式專用子組件 ---
    const TimetableCell = ({ dayIdx, pIdx }: { dayIdx: number, pIdx: number }) => {
        const cellCourses = gridData[dayIdx][pIdx];
        const sorted = sortOverlappingCourses(cellCourses);

        return (
            <View style={styles.gridCell}>
                <View style={styles.pillContainer}>
                    {sorted.map((course, idx) => (
                        <TouchableOpacity
                            key={`${course.id}-${idx}`}
                            onLongPress={() => setIsDeleteMode(true)}
                            style={[styles.coursePill, { flex: 1, backgroundColor: '#FFF' }]}
                        >
                            {zoomLevel > 1.3 && <Text style={styles.pillText} numberOfLines={1}>{course.name}</Text>}
                            {isDeleteMode && (
                                <TouchableOpacity style={styles.deleteBadge} onPress={() => removeCourse(course.id)}>
                                    <Text style={{ color: '#FFF', fontSize: 10 }}>×</Text>
                                </TouchableOpacity>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <TopNavBar title="課表" />
            <View style={styles.container}>

                {/* 1️⃣ Switch Button 切換器 */}
                <View style={styles.header}>
                    <Text style={styles.subTitle}>114下學期 第{currentWeek}週</Text>
                    <View style={styles.customSwitch}>
                        <TouchableOpacity
                            style={[styles.switchOption, viewMode === 'Week' && styles.switchActive]}
                            onPress={() => { setViewMode('Week'); setIsDeleteMode(false); }}
                        >
                            <Text style={[styles.switchText, viewMode === 'Week' && styles.switchTextActive]}>WEEK</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.switchOption, viewMode === 'Day' && styles.switchActive]}
                            onPress={() => { setViewMode('Day'); setIsDeleteMode(false); }}
                        >
                            <Text style={[styles.switchText, viewMode === 'Day' && styles.switchTextActive]}>DAY</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {viewMode === 'Week' ? (
                    /* 2️⃣ WEEK 模式佈局 */
                    <View style={styles.weekWrapper}>
                        <View style={styles.weekHeader}>
                            <View style={{ width: 40 }} />
                            {days.map((d, i) => (
                                <View key={i} style={styles.weekDayLabel}>
                                    <Text style={styles.weekHeaderText}>{d.label}</Text>
                                </View>
                            ))}
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.gridBody}>
                                <View style={styles.timeColumn}>
                                    {periods.map(p => (
                                        <View key={p.id} style={styles.timeCell}>
                                            <Text style={styles.timeCellId}>{p.id}</Text>
                                            <Text style={styles.timeCellTime}>{p.time.split('\n')[0]}</Text>
                                        </View>
                                    ))}
                                </View>
                                <View style={styles.gridContainer}>
                                    {periods.map((_, pIdx) => (
                                        <View key={pIdx} style={styles.gridRow}>
                                            {days.map((_, dIdx) => (
                                                <TimetableCell key={dIdx} dayIdx={dIdx} pIdx={pIdx} />
                                            ))}
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>
                        <TouchableOpacity style={styles.zoomToggle} onPress={() => setZoomLevel(zoomLevel === 1.0 ? 1.5 : 1.0)}>
                            <Text>{zoomLevel === 1.0 ? "🔍 放大顯示文字" : "🤏 縮小看全圖"}</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    /* 3️⃣ DAY 模式佈局 (恢復你原本的設計) */
                    <View style={{ flex: 1 }}>
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
                        <View style={styles.tableCard}>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {periods.map((p) => {
                                    const dayCourses = getCoursesBySlot(selectedDay, p.id);
                                    return (
                                        <View key={p.id} style={styles.periodRow}>
                                            <View style={styles.timeLabelContainer}>
                                                <Text style={styles.periodLabel}>{p.id}</Text>
                                                <Text style={styles.timeRangeText}>{p.time}</Text>
                                            </View>
                                            <View style={styles.courseCellContainer}>
                                                {dayCourses.map((c, i) => (
                                                    <View key={i} style={[styles.courseEntry, dayCourses.length > 1 && styles.clashHighlight]}>
                                                        <Text style={styles.courseNameText}>{c.name}</Text>
                                                        <Text style={styles.courseDetailText}>{c.location}</Text>
                                                        <Text style={styles.courseDetailText}>{c.teacher}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

// ... 你的樣式表 ...
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FAF7ED' },
    container: { flex: 1, paddingHorizontal: 15 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15 },
    subTitle: { fontSize: 20, fontWeight: 'bold', color: '#6D5D4B' },

    // Switch Button
    customSwitch: { flexDirection: 'row', backgroundColor: '#E6E1D3', borderRadius: 20, padding: 3, width: 120 },
    switchOption: { flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: 17 },
    switchActive: { backgroundColor: '#FFF', elevation: 2 },
    switchText: { fontSize: 12, fontWeight: 'bold', color: '#A09687' },
    switchTextActive: { color: '#6D5D4B' },

    // Week Grid
    weekWrapper: { flex: 1, backgroundColor: '#D4C3A3', borderRadius: 20, overflow: 'hidden' },
    weekHeader: { flexDirection: 'row', paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.1)' },
    weekDayLabel: { flex: 1, alignItems: 'center' },
    weekHeaderText: { fontWeight: 'bold', color: '#6D5D4B' },
    gridBody: { flexDirection: 'row' },
    timeColumn: { width: 40, alignItems: 'center' },
    timeCell: { height: 70, justifyContent: 'center', alignItems: 'center' },
    timeCellId: { fontSize: 12, fontWeight: 'bold', color: '#6D5D4B' },
    timeCellTime: { fontSize: 8, color: '#8E7E6A' },
    gridContainer: { flex: 1 },
    gridRow: { flexDirection: 'row', height: 70 },
    gridCell: { flex: 1, borderWidth: 0.2, borderColor: 'rgba(255,255,255,0.3)', padding: 2 },
    pillContainer: { flex: 1, flexDirection: 'row' },
    coursePill: { borderRadius: 6, marginHorizontal: 1, justifyContent: 'center', alignItems: 'center' },
    pillText: { fontSize: 8, color: '#6D5D4B', fontWeight: '600' },
    deleteBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#FF6B6B', width: 14, height: 14, borderRadius: 7, justifyContent: 'center', alignItems: 'center' },
    zoomToggle: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#FFF', padding: 10, borderRadius: 20, elevation: 5 },

    // Day Mode (你原本的樣式)
    daySelector: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    dayButton: { width: 60, height: 70, borderRadius: 30, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 2 },
    dayButtonActive: { backgroundColor: '#7B886F' },
    dayEn: { fontSize: 12, color: '#1A1A1A' },
    dayCn: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
    textActive: { color: '#FFF' },
    tableCard: { flex: 1, backgroundColor: '#EFF2F4', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 15 },
    periodRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#CFD8DC', minHeight: 80 },
    timeLabelContainer: { flex: 0.6, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#CFD8DC' },
    periodLabel: { fontSize: 16, fontWeight: 'bold' },
    timeRangeText: { fontSize: 10, textAlign: 'center' },
    courseCellContainer: { flex: 3, paddingLeft: 10, justifyContent: 'center' },
    courseEntry: { paddingVertical: 10 },
    clashHighlight: { borderLeftWidth: 4, borderLeftColor: '#D88A63', backgroundColor: 'rgba(216, 138, 99, 0.05)' },
    courseNameText: { fontSize: 14, fontWeight: 'bold' },
    courseDetailText: { fontSize: 12, color: '#666' }
});

export default TimetableScreen;