import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    SafeAreaView, StyleSheet, Text, TouchableOpacity,
    View
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    SharedValue, clamp,
    useAnimatedStyle,
    useSharedValue
} from 'react-native-reanimated';
import { useCourse } from '../context/CourseContext';
import TopNavBar from '../navigation/TopNavBar';
import { calculateCourseLayout } from '../utils/timetableUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = 45;
const HEADER_HEIGHT = 40;
const SEMESTER_START_DATE = new Date('2026-02-23');
const INITIAL_CELL_WIDTH = (SCREEN_WIDTH - 30 - SIDEBAR_WIDTH) / 5;

// --- 子組件 ---

const AnimatedDayCell = ({ label, width }: { label: string, width: SharedValue<number> }) => {
    const style = useAnimatedStyle(() => ({ width: width.value }));
    return <Animated.View style={[styles.dayLabelCell, style]}><Text style={styles.dayLabelText}>{label}</Text></Animated.View>;
};

const AnimatedTimeCell = ({ period, height, isLast }: { period: any, height: SharedValue<number>, isLast: boolean }) => {
    const style = useAnimatedStyle(() => ({
        height: height.value,
        borderBottomWidth: isLast ? 0 : 0.3,
    }));
    return (
        <Animated.View style={[styles.timeSideCell, style]}>
            <Text style={styles.timeSideId}>{String(period.id)}</Text>
            <Animated.Text style={[styles.timeSideTime, useAnimatedStyle(() => ({ opacity: height.value > 75 ? 1 : 0 }))]}>
                {`${period.start}\n${period.end}`}
            </Animated.Text>
        </Animated.View>
    );
};

const HLine = ({ index, h, w }: { index: number, h: SharedValue<number>, w: SharedValue<number> }) => {
    const style = useAnimatedStyle(() => ({ top: index * h.value, width: w.value * 5 }));
    return <Animated.View style={[styles.gridLineH, style]} />;
};

const VLine = ({ index, w, h, periodsCount }: { index: number, w: SharedValue<number>, h: SharedValue<number>, periodsCount: number }) => {
    const style = useAnimatedStyle(() => ({
        left: index * w.value,
        height: periodsCount * h.value
    }));
    return <Animated.View style={[styles.gridLineV, style]} />;
};

const CoursePill = ({ course, allCourses, tempWidth, tempHeight, isDeleteMode, removeCourse, onLongPress }: any) => {
    const layout = calculateCourseLayout(course, allCourses, 1);

    const animatedStyle = useAnimatedStyle(() => {
        const w = tempWidth.value;
        const h = tempHeight.value;
        return {
            top: layout.top * h,
            height: layout.height * h - 2,
            width: (w * layout.widthPercent) / 100 - 2,
            left: layout.day * w + (w * layout.leftOffsetPercent) / 100 + 1,
            // 💡 關鍵修正 1：進入刪除模式時提高 zIndex，確保叉叉不會被遮擋
            zIndex: isDeleteMode ? 999 : 1,
        };
    });

    const textAnimatedStyle = useAnimatedStyle(() => {
        const dynamicSize = clamp(8.5 + (tempHeight.value - 45) * 0.04, 8.5, 12.5);
        return { fontSize: dynamicSize, lineHeight: dynamicSize + 3 };
    });

    const detailAnimatedStyle = useAnimatedStyle(() => ({
        display: tempHeight.value > 100 ? 'flex' : 'none',
        opacity: clamp((tempHeight.value - 100) / 20, 0, 1),
    }));

    const isClashed = layout.widthPercent < 100;

    return (
        <Animated.View style={[styles.courseItem, animatedStyle]}>
            <TouchableOpacity
                activeOpacity={0.8}
                onLongPress={onLongPress}
                style={styles.courseTouch}
            >
                <View style={styles.textWrapper}>
                    <View style={styles.courseTextContainer}>
                        <Animated.Text
                            style={[styles.unifiedText, textAnimatedStyle]}
                            numberOfLines={isClashed ? 0 : 2}
                        >
                            {String(course.name)}
                        </Animated.Text>

                        {isClashed ? (
                            <Animated.View style={[styles.detailContainer, detailAnimatedStyle]}>
                                <Animated.Text style={[styles.unifiedText, textAnimatedStyle]} numberOfLines={1}>{String(course.location)}</Animated.Text>
                                <Animated.Text style={[styles.unifiedText, textAnimatedStyle]} numberOfLines={1}>{String(course.teacher)}</Animated.Text>
                            </Animated.View>
                        ) : (
                            <View style={styles.detailContainer}>
                                <Animated.Text style={[styles.unifiedText, textAnimatedStyle]} numberOfLines={1}>{String(course.location)}</Animated.Text>
                                <Animated.Text style={[styles.unifiedText, textAnimatedStyle]} numberOfLines={1}>{String(course.teacher)}</Animated.Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>

            {isDeleteMode && (
                <TouchableOpacity
                    style={styles.deleteBadge}
                    onPress={() => removeCourse(course.id)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.deleteText}>×</Text>
                </TouchableOpacity>
            )}
        </Animated.View>
    );
};

// --- 主組件 ---

const TimetableScreen = ({ navigation }: any) => {
    const { selectedCourses, removeCourse } = useCourse();
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [currentWeek, setCurrentWeek] = useState(1);
    const [containerHeight, setContainerHeight] = useState(0);

    const tempWidth = useSharedValue(INITIAL_CELL_WIDTH);
    const tempHeight = useSharedValue(60);
    const baseWidth = useSharedValue(INITIAL_CELL_WIDTH);
    const baseHeight = useSharedValue(60);

    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);
    const startX = useSharedValue(0);
    const startY = useSharedValue(0);

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
    const days = [{ label: '一' }, { label: '二' }, { label: '三' }, { label: '四' }, { label: '五' }];

    useEffect(() => {
        const today = new Date();
        const start = new Date(SEMESTER_START_DATE);
        start.setHours(0, 0, 0, 0);
        const diffInMs = today.getTime() - start.getTime();
        const week = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 7)) + 1;
        setCurrentWeek(week >= 1 && week <= 18 ? week : (week > 18 ? 18 : 1));
    }, []);

    const panGesture = Gesture.Pan()
        .onStart(() => {
            startX.value = offsetX.value;
            startY.value = offsetY.value;
        })
        .onUpdate((event) => {
            const maxW = tempWidth.value * 5 - (SCREEN_WIDTH - 30 - SIDEBAR_WIDTH);
            const totalContentHeight = periods.length * tempHeight.value;
            const maxH = totalContentHeight - containerHeight;
            offsetX.value = clamp(startX.value - event.translationX, 0, Math.max(0, maxW));
            offsetY.value = clamp(startY.value - event.translationY, 0, Math.max(0, maxH));
        });

    const pinchGesture = Gesture.Pinch()
        .onUpdate((event) => {
            tempWidth.value = Math.min(Math.max(baseWidth.value * event.scale, INITIAL_CELL_WIDTH), 200);
            tempHeight.value = Math.min(Math.max(baseHeight.value * event.scale, 45), 180);
        })
        .onEnd(() => {
            baseWidth.value = tempWidth.value;
            baseHeight.value = tempHeight.value;
        });

    const composed = Gesture.Simultaneous(panGesture, pinchGesture);

    const headerStyle = useAnimatedStyle(() => ({ transform: [{ translateX: -offsetX.value }] }));
    const sidebarStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -offsetY.value }] }));
    const canvasStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: -offsetX.value }, { translateY: -offsetY.value }],
        width: tempWidth.value * 5,
        height: periods.length * tempHeight.value,
    }));

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={styles.safeArea}>
                <TopNavBar
                    title="課表"
                    onNotificationPress={() => navigation.navigate('NotificationScreen')}
                    onInfoPress={() => Alert.alert('課表', '\n1.在選課頁面所選課程將顯示於此，\n同個時段可以有複數堂課。\n\n2.長按課程可以進入刪除模式，\n點擊紅色×可以刪除課程。\n\n3.在課程較多或較密集時，\n建議使用雙指縮放功能放大課表，\n或是拖曳課表查看不同區域。')}
                />
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.subTitle}>114下 第{currentWeek}週</Text>
                    </View>
                    <View style={styles.weekWrapper}>
                        <View style={styles.headerRowContainer}>
                            <View style={styles.cornerBox} />
                            <View style={{ flex: 1, overflow: 'hidden' }}>
                                <Animated.View style={[styles.headerRow, headerStyle]}>
                                    {days.map((d, i) => <AnimatedDayCell key={i} label={d.label} width={tempWidth} />)}
                                </Animated.View>
                            </View>
                        </View>
                        <View style={styles.mainGridArea}>
                            <View style={{ width: SIDEBAR_WIDTH, overflow: 'hidden' }}>
                                <Animated.View style={sidebarStyle}>
                                    {periods.map((p, i) => (
                                        <AnimatedTimeCell key={p.id} period={p} height={tempHeight} isLast={i === periods.length - 1} />
                                    ))}
                                </Animated.View>
                            </View>
                            <GestureDetector gesture={composed}>
                                <View
                                    style={styles.canvasContainer}
                                    onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
                                >
                                    <Animated.View style={[styles.canvas, canvasStyle]}>
                                        <TouchableOpacity
                                            style={StyleSheet.absoluteFill}
                                            activeOpacity={1}
                                            onPress={() => setIsDeleteMode(false)}
                                        />
                                        {periods.map((_, i) => <HLine key={`h-${i}`} index={i} h={tempHeight} w={tempWidth} />)}
                                        <HLine index={periods.length} h={tempHeight} w={tempWidth} />
                                        {[0, 1, 2, 3, 4, 5].map((i) => (
                                            <VLine key={`v-${i}`} index={i} w={tempWidth} h={tempHeight} periodsCount={periods.length} />
                                        ))}
                                        {selectedCourses.map((course) => (
                                            <CoursePill
                                                key={course.id}
                                                course={course}
                                                allCourses={selectedCourses}
                                                tempWidth={tempWidth}
                                                tempHeight={tempHeight}
                                                isDeleteMode={isDeleteMode}
                                                removeCourse={removeCourse}
                                                // 💡 關鍵修正 2：移除縮小限制，直接允許進入刪除模式
                                                onLongPress={() => setIsDeleteMode(true)}
                                            />
                                        ))}
                                    </Animated.View>
                                </View>
                            </GestureDetector>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FAF7ED' },
    container: { flex: 1, paddingHorizontal: 15 },
    header: { marginVertical: 15 },
    subTitle: { fontSize: 20, fontWeight: 'bold', color: '#6D5D4B' },
    weekWrapper: { flex: 1, backgroundColor: '#D4C3A3', borderRadius: 20, overflow: 'hidden', marginBottom: 15 },
    headerRowContainer: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)', height: HEADER_HEIGHT },
    headerRow: { flexDirection: 'row' },
    cornerBox: { width: SIDEBAR_WIDTH, height: HEADER_HEIGHT },
    mainGridArea: { flexDirection: 'row', flex: 1 },
    canvasContainer: { flex: 1, overflow: 'hidden' },
    dayLabelCell: { alignItems: 'center', justifyContent: 'center', height: HEADER_HEIGHT },
    dayLabelText: { fontWeight: 'bold', color: '#6D5D4B' },
    timeSideCell: { justifyContent: 'center', alignItems: 'center', borderColor: 'rgba(255,255,255,0.3)', width: SIDEBAR_WIDTH },
    timeSideId: { fontSize: 13, fontWeight: 'bold', color: '#6D5D4B' },
    timeSideTime: { fontSize: 8, color: '#8E7E6A', textAlign: 'center' },
    canvas: { position: 'relative' },
    gridLineH: { position: 'absolute', height: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
    gridLineV: { position: 'absolute', width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
    courseItem: {
        position: 'absolute',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        elevation: 3,
        borderWidth: 0.5,
        borderColor: '#E6E1D3',
        overflow: 'visible' // 💡 確保叉叉可以浮現
    },
    textWrapper: { flex: 1, width: '100%', overflow: 'hidden', borderRadius: 8 },
    courseTouch: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 2, paddingVertical: 4 },
    courseTextContainer: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' },
    detailContainer: { width: '100%', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
    unifiedText: { fontWeight: 'bold', color: '#6D5D4B', textAlign: 'center' },
    deleteBadge: {
        position: 'absolute',
        top: -12,
        right: -12,
        backgroundColor: '#FF6B6B',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000,
        elevation: 5,
        borderWidth: 2,
        borderColor: '#FFF'
    },
    deleteText: { color: '#FFF', fontSize: 14, fontWeight: 'bold', lineHeight: 18 }
});

export default TimetableScreen;