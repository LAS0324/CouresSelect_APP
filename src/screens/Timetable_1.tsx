import React, { useEffect, useState } from 'react';
import {
    SafeAreaView, ScrollView, StyleSheet,
    Text, TouchableOpacity, View, TouchableWithoutFeedback
} from 'react-native';
import { PinchGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useCourse } from '../context/CourseContext';
import TopNavBar from '../navigation/TopNavBar';
import { calculateCourseLayout } from '../utils/timetableUtils';

const SEMESTER_START_DATE = new Date('2026-02-23');

const TimetableScreen = () => {
    const [viewMode, setViewMode] = useState<'Week' | 'Day'>('Week');
    const [currentWeek, setCurrentWeek] = useState(1);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [cellHeight, setCellHeight] = useState(60);
    const [tempHeight, setTempHeight] = useState(60);

    const { selectedCourses, removeCourse } = useCourse();

    const days = [{ label: '一' }, { label: '二' }, { label: '三' }, { label: '四' }, { label: '五' }];

    const periods = [
        { id: '0M', start: '07:10', end: '08:00' }, { id: '01', start: '08:10', end: '09:00' },
        { id: '02', start: '09:10', end: '10:00' }, { id: '03', start: '10:10', end: '11:00' },
        { id: '04', start: '11:10', end: '12:00' }, { id: '0N', start: '12:10', end: '13:20' },
        { id: '05', start: '13:30', end: '14:20' }, { id: '06', start: '14:30', end: '15:20' },
        { id: '07', start: '15:30', end: '16:20' }, { id: '08', start: '16:30', end: '17:20' },
        { id: '0E', start: '17:30', end: '18:20' }, { id: '09', start: '18:30', end: '19:15' },
        { id: '10', start: '19:15', end: '20:00' }, { id: '11', start: '20:10', end: '20:55' },
        { id: '12', start: '20:55', end: '21:40' },
    ];

    useEffect(() => {
        const today = new Date();
        const diffInMs = today.getTime() - SEMESTER_START_DATE.getTime();
        const week = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 7)) + 1;
        setCurrentWeek(week >= 1 && week <= 18 ? week : (week > 18 ? 18 : 1));
    }, []);

    const onPinchGestureEvent = (event: any) => {
        if (event.nativeEvent.state === State.ACTIVE) {
            let newHeight = cellHeight * event.nativeEvent.scale;
            newHeight = Math.min(Math.max(newHeight, 45), 180);
            setTempHeight(newHeight);
        }
    };

    const onPinchHandlerStateChange = (event: any) => {
        if (event.nativeEvent.state === State.END) {
            setCellHeight(tempHeight);
        }
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={styles.safeArea}>
                <TopNavBar title="課表" />
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.subTitle}>114下 第{currentWeek}週</Text>
                        <View style={styles.customSwitch}>
                            <TouchableOpacity style={[styles.switchOption, viewMode === 'Week' && styles.switchActive]} onPress={() => setViewMode('Week')}>
                                <Text style={[styles.switchText, viewMode === 'Week' && styles.switchTextActive]}>WEEK</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.switchOption, viewMode === 'Day' && styles.switchActive]} onPress={() => setViewMode('Day')}>
                                <Text style={[styles.switchText, viewMode === 'Day' && styles.switchTextActive]}>DAY</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {viewMode === 'Week' && (
                        <View style={styles.weekWrapper}>
                            <View style={styles.weekDayHeader}>
                                <View style={{ width: 45 }} />
                                {days.map((d, i) => (
                                    <View key={i} style={styles.dayLabelCell}><Text style={styles.dayLabelText}>{d.label}</Text></View>
                                ))}
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={styles.timetableBody}>
                                    <View style={styles.timeSidebar}>
                                        {periods.map(p => (
                                            <View key={p.id} style={[styles.timeSideCell, { height: tempHeight }]}>
                                                <Text style={styles.timeSideId}>{p.id}</Text>
                                                {tempHeight > 75 && <Text style={styles.timeSideTime}>{`${p.start}\n${p.end}`}</Text>}
                                            </View>
                                        ))}
                                    </View>

                                    <PinchGestureHandler onGestureEvent={onPinchGestureEvent} onHandlerStateChange={onPinchHandlerStateChange}>
                                        <View style={[styles.canvas, { height: periods.length * tempHeight }]}>
                                            <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setIsDeleteMode(false)} />

                                            {periods.map((_, i) => <View key={i} style={[styles.gridLineH, { top: i * tempHeight }]} />)}
                                            {[0, 1, 2, 3, 4].map(i => <View key={i} style={[styles.gridLineV, { left: `${i * 20}%` }]} />)}

                                            {selectedCourses.map((course) => {
                                                const layout = calculateCourseLayout(course, selectedCourses, tempHeight);
                                                const isClashed = layout.widthPercent < 100;
                                                const fontSize = tempHeight < 65 ? 8 : 10;

                                                const courseNameArray = Array.from(course.name);
                                                const displayArray = isClashed ? courseNameArray.slice(0, 5) : [course.name];

                                                return (
                                                    <TouchableOpacity
                                                        key={course.id}
                                                        activeOpacity={0.8}
                                                        onLongPress={() => setIsDeleteMode(true)}
                                                        style={[
                                                            styles.courseItem,
                                                            {
                                                                top: layout.top,
                                                                height: layout.height - 2,
                                                                width: `${layout.widthPercent / 5}%`,
                                                                left: `${(layout.day * 20) + (layout.leftOffsetPercent / 5)}%`,
                                                                // 💡 無論是否衝堂，皆垂直置中與水平置中
                                                                justifyContent: 'center',
                                                            }
                                                        ]}
                                                    >
                                                        <View style={styles.courseTextContainer}>
                                                            {isClashed ? (
                                                                <>
                                                                    {displayArray.map((char, index) => (
                                                                        <Text key={index} style={[styles.unifiedText, { fontSize }]}>{char}</Text>
                                                                    ))}
                                                                    {courseNameArray.length > 5 && (
                                                                        <Text style={[styles.unifiedText, { fontSize, marginTop: -2 }]}>...</Text>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Text style={[styles.unifiedText, { fontSize }]} numberOfLines={2}>{course.name}</Text>
                                                                    <Text style={[styles.unifiedText, { fontSize }]} numberOfLines={1}>{course.location}</Text>
                                                                    <Text style={[styles.unifiedText, { fontSize }]} numberOfLines={1}>{course.teacher}</Text>
                                                                </>
                                                            )}
                                                        </View>

                                                        {isDeleteMode && (
                                                            <TouchableOpacity style={styles.deleteBadge} onPress={() => removeCourse(course.id)}>
                                                                <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>×</Text>
                                                            </TouchableOpacity>
                                                        )}
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </PinchGestureHandler>
                                </View>
                            </ScrollView>
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FAF7ED' },
    container: { flex: 1, paddingHorizontal: 15 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15 },
    subTitle: { fontSize: 20, fontWeight: 'bold', color: '#6D5D4B' },
    customSwitch: { flexDirection: 'row', backgroundColor: '#E6E1D3', borderRadius: 20, padding: 3, width: 120 },
    switchOption: { flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: 17 },
    switchActive: { backgroundColor: '#FFF', elevation: 2 },
    switchText: { fontSize: 12, fontWeight: 'bold', color: '#A09687' },
    switchTextActive: { color: '#6D5D4B' },
    weekWrapper: { flex: 1, backgroundColor: '#D4C3A3', borderRadius: 20, overflow: 'hidden' },
    weekDayHeader: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 8 },
    dayLabelCell: { flex: 1, alignItems: 'center' },
    dayLabelText: { fontWeight: 'bold', color: '#6D5D4B' },
    timetableBody: { flexDirection: 'row', flex: 1 },
    timeSidebar: { width: 45, backgroundColor: 'rgba(255,255,255,0.1)' },
    timeSideCell: { justifyContent: 'center', alignItems: 'center', borderBottomWidth: 0.3, borderColor: 'rgba(255,255,255,0.3)' },
    timeSideId: { fontSize: 13, fontWeight: 'bold', color: '#6D5D4B' },
    timeSideTime: { fontSize: 8, color: '#8E7E6A', textAlign: 'center', marginTop: 2 },
    canvas: { flex: 1, position: 'relative' },
    gridLineH: { position: 'absolute', width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
    gridLineV: { position: 'absolute', width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.3)' },
    courseItem: {
        position: 'absolute',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingHorizontal: 2,
        elevation: 3,
        borderWidth: 0.5,
        borderColor: '#E6E1D3',
        alignItems: 'center', // 💡 確保內部元件水平置中
    },
    courseTextContainer: {
        width: '100%',
        alignItems: 'center', // 💡 確保文字元件水平置中
    },
    unifiedText: {
        fontWeight: 'bold',
        color: '#6D5D4B',
        textAlign: 'center',
        lineHeight: 12
    },
    deleteBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#FF6B6B',
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10
    },
});

export default TimetableScreen;