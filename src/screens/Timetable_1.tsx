import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    SafeAreaView, ScrollView, StyleSheet,
    Text, TouchableOpacity, View
} from 'react-native';
import { GestureHandlerRootView, PinchGestureHandler, State } from 'react-native-gesture-handler';
import { useCourse } from '../context/CourseContext';
import TopNavBar from '../navigation/TopNavBar';
import { calculateCourseLayout } from '../utils/timetableUtils';

const { width } = Dimensions.get('window');
const INITIAL_CELL_WIDTH = (width - 30 - 45) / 5; // container padding 15*2=30, sidebar 45

const SEMESTER_START_DATE = new Date('2026-02-23');

const TimetableScreen = () => {
    const [viewMode, setViewMode] = useState<'Week' | 'Day'>('Week');
    const [currentWeek, setCurrentWeek] = useState(1);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [cellHeight, setCellHeight] = useState(60);
    const [tempHeight, setTempHeight] = useState(60);
    const [cellWidth, setCellWidth] = useState(INITIAL_CELL_WIDTH);
    const [tempWidth, setTempWidth] = useState(INITIAL_CELL_WIDTH);

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
            // 先計算並限制寬度的放大倍率
            let newWidth = cellWidth * event.nativeEvent.scale;
            newWidth = Math.min(Math.max(newWidth, INITIAL_CELL_WIDTH), INITIAL_CELL_WIDTH * 2.5);
            setTempWidth(newWidth);

            // 根據寬度是否已經到達極限來決定高度能不能繼續放大
            // 計算實際發生的放大倍率 (受限於外層寬度的2倍極限)
            const effectiveScale = newWidth / cellWidth;
            
            let newHeight = cellHeight * effectiveScale;
            newHeight = Math.min(Math.max(newHeight, 45), 180);
            setTempHeight(newHeight);
        }
    };

    const onPinchHandlerStateChange = (event: any) => {
        if (event.nativeEvent.state === State.END) {
            setCellHeight(tempHeight);
            setCellWidth(tempWidth);
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
                            <PinchGestureHandler onGestureEvent={onPinchGestureEvent} onHandlerStateChange={onPinchHandlerStateChange}>
                                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                                    <View style={{ width: 45 + tempWidth * 5, flexDirection: 'column', flex: 1 }}>
                                        <View style={styles.weekDayHeader}>
                                            <View style={{ width: 45 }} />
                                            {days.map((d, i) => (
                                                <View key={i} style={[styles.dayLabelCell, { flex: undefined, width: tempWidth }]}><Text style={styles.dayLabelText}>{d.label}</Text></View>
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

                                                <View style={[styles.canvas, { height: periods.length * tempHeight, width: tempWidth * 5 }]}>
                                                    <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setIsDeleteMode(false)} />

                                                    {periods.map((_, i) => <View key={i} style={[styles.gridLineH, { top: i * tempHeight }]} />)}

                                                    {selectedCourses.map((course) => {
                                                        const layout = calculateCourseLayout(course, selectedCourses, tempHeight);
                                                        const isClashed = layout.widthPercent < 100;
                                                        
                                                        // 判斷格子目前的實際絕對寬度與高度，決定是否「足夠寬敞」能顯示所有資訊
                                                        const cellActualWidth = tempWidth * (layout.widthPercent / 100);
                                                        const cellActualHeight = layout.height;
                                                        const isSpacious = cellActualWidth > 45 && cellActualHeight > 60; // 寬度大於 45 且高度足夠時判定為寬敞
                                                        
                                                        // 字體大小隨放大比例增加
                                                        const fontSize = tempHeight < 65 ? 8 : (tempHeight < 100 ? 10 : 12);

                                                        // 👉 依照當前的各自高度動態計算可以顯示的行數或字數
                                                        // 直向（衝堂時）：每字大約佔字體大小+2，預留上下間距約 15
                                                        const maxVerticalChars = Math.max(1, Math.floor((cellActualHeight - 20) / (fontSize + 2)));
                                                        // 橫向（平時）：每行大約佔字體大小+4，預留間距 10
                                                        const maxLines = Math.max(1, Math.floor((cellActualHeight - 10) / (fontSize + 4)));

                                                        const courseNameArray = Array.from(course.name);
                                                        // 如果衝堂且還不夠寬敞，只取目前高度塞得下的字數
                                                        const displayArray = (isClashed && !isSpacious) ? courseNameArray.slice(0, maxVerticalChars) : courseNameArray;

                                                        // 若夠寬敞，直接呈現與一般課程一樣的「水平排版」並嘗試顯示完整資訊（移除過度的裁切）
                                                        const forceNormalLayout = isSpacious;

                                                        return (
                                                            <TouchableOpacity
                                                                key={course.id}
                                                                activeOpacity={0.8}
                                                                onLongPress={() => setIsDeleteMode(true)}
                                                                style={[
                                                                    styles.courseItem,
                                                                    {
                                                                        top: layout.top,
                                                                        height: layout.height,
                                                                        // 💡 更新為依據 tempWidth 計算的絕對寬度與位置
                                                                        width: tempWidth * (layout.widthPercent / 100),
                                                                        left: (layout.day * tempWidth) + (tempWidth * (layout.leftOffsetPercent / 100)),
                                                                        // 💡 無論是否衝堂，皆垂直置中與水平置中
                                                                        justifyContent: 'center',
                                                                        alignItems: 'center',
                                                                        zIndex: isDeleteMode ? 100 : 1 // 💡 確保有紅叉叉時在最上層
                                                                    }
                                                                ]}
                                                            >
                                                                <View style={styles.courseTextContainer}>
                                                                    {(isClashed && !forceNormalLayout) ? (
                                                                        <>
                                                                            {displayArray.map((char, index) => {
                                                                                const vMap: Record<string, string> = { '(': '︵', ')': '︶', '（': '︵', '）': '︶', '[': '︻', ']': '︼', '【': '︻', '】': '︼' };
                                                                                const verticalChar = vMap[char] || char;
                                                                                return (
                                                                                    <Text key={index} style={[styles.unifiedText, { fontSize }]} numberOfLines={1}>{verticalChar}</Text>
                                                                                );
                                                                            })}
                                                                            {courseNameArray.length > maxVerticalChars && (
                                                                                <Text style={[styles.unifiedText, { fontSize, marginTop: -2 }]} numberOfLines={1}>...</Text>
                                                                            )}
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            {/* 放大格子時，動態依照高度決定橫向排版要顯示的行數 */}
                                                                            <Text style={[styles.unifiedText, { fontSize }]} numberOfLines={isSpacious ? undefined : maxLines}>{course.name}</Text>
                                                                            {isSpacious && (
                                                                                <>
                                                                                    <Text style={[styles.unifiedText, { fontSize, marginTop: 2 }]} numberOfLines={undefined}>{course.location}</Text>
                                                                                    <Text style={[styles.unifiedText, { fontSize }]} numberOfLines={undefined}>{course.teacher}</Text>
                                                                                </>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </View>
                                                            </TouchableOpacity>
                                                        );
                                                    })}

                                                    {isDeleteMode && selectedCourses.map((course) => {
                                                        const layout = calculateCourseLayout(course, selectedCourses, tempHeight);
                                                        const leftCoord = (layout.day * tempWidth) + (tempWidth * (layout.leftOffsetPercent / 100));
                                                        const rectWidth = tempWidth * (layout.widthPercent / 100);
                                                        return (
                                                            <TouchableOpacity
                                                                key={`delete-${course.id}`}
                                                                style={[styles.deleteBadge, { 
                                                                    top: layout.top - 6,
                                                                    left: leftCoord + rectWidth - 12
                                                                }]}
                                                                onPress={() => removeCourse(course.id)}
                                                            >
                                                                <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>×</Text>
                                                            </TouchableOpacity>
                                                        );
                                                    })}
                                                </View>
                                            </View>
                                        </ScrollView>
                                    </View>
                                </ScrollView>
                            </PinchGestureHandler>
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FAF7ED' },
    container: { flex: 1, paddingHorizontal: 15, paddingBottom: 15 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15 },
    subTitle: { fontSize: 20, fontWeight: 'bold', color: '#6D5D4B' },
    customSwitch: { flexDirection: 'row', backgroundColor: 'transparent', borderRadius: 20, borderWidth: 2, borderColor: '#D0B589', width: 140, height: 36 },
    switchOption: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 18 },
    switchActive: { backgroundColor: '#D0B589' },
    switchText: { fontSize: 13, fontWeight: 'bold', color: '#D0B589' },
    switchTextActive: { color: '#FFF' },
    weekWrapper: { flex: 1, backgroundColor: '#D0B589', borderRadius: 20, overflow: 'hidden' }, // 💡 修正背景色
    weekDayHeader: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 8 },
    dayLabelCell: { flex: 1, alignItems: 'center' },
    dayLabelText: { fontWeight: 'bold', color: '#6D5D4B' },
    timetableBody: { flexDirection: 'row', flex: 1 },
    timeSidebar: { width: 45, backgroundColor: 'rgba(255,255,255,0.1)' },
    timeSideCell: { justifyContent: 'center', alignItems: 'center', borderBottomWidth: 0.3, borderColor: 'rgba(255,255,255,0.3)' },
    timeSideId: { fontSize: 13, fontWeight: 'bold', color: '#6D5D4B' },
    timeSideTime: { fontSize: 8, color: '#8E7E6A', textAlign: 'center', marginTop: 2 },
    canvas: { flex: 1, position: 'relative' },
    gridLineH: { position: 'absolute', width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.3)', zIndex: 0 },
    gridLineV: { position: 'absolute', width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.3)', zIndex: 0 },
    courseItem: {
        position: 'absolute',
        backgroundColor: '#FFFFFF',
        borderRadius:16, // 💡 恢復圓角設計
        paddingHorizontal: 2,
        borderWidth: 0.5,
        borderColor: '#E6E1D3',
        alignItems: 'center', // 💡 確保內部元件水平置中
    },
    courseTextContainer: {
        width: '100%',
        alignItems: 'center', // 💡 確保文字元件水平置中
        justifyContent: 'center',
    },
    unifiedText: {
        fontWeight: 'bold',
        color: '#6D5D4B',
        textAlign: 'center',
        lineHeight: 12
    },
    deleteBadge: {
        position: 'absolute',
        backgroundColor: '#FF6B6B',
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100 // 💡 確保圖層遠大於所有課堂
    },
});

export default TimetableScreen;