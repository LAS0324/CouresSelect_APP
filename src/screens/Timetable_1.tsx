import React, { useEffect, useState } from 'react';
import {
    SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity,
    View, Dimensions
} from 'react-native';
import { PinchGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue, useAnimatedStyle, useAnimatedScrollHandler,
    scrollTo, useAnimatedRef, SharedValue
} from 'react-native-reanimated';
import { useCourse } from '../context/CourseContext';
import TopNavBar from '../navigation/TopNavBar';
import { calculateCourseLayout } from '../utils/timetableUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = 45;
const HEADER_HEIGHT = 40;
const SEMESTER_START_DATE = new Date('2026-02-23');
const INITIAL_CELL_WIDTH = (SCREEN_WIDTH - 30 - SIDEBAR_WIDTH) / 5;

// --- 獨立子組件：解決 Hook 規則與效能問題 ---

const AnimatedDayCell = ({ label, width }: { label: string, width: SharedValue<number> }) => {
    const animatedStyle = useAnimatedStyle(() => ({ width: width.value }));
    return (
        <Animated.View style={[styles.dayLabelCell, animatedStyle]}>
            <Text style={styles.dayLabelText}>{label}</Text>
        </Animated.View>
    );
};

const AnimatedTimeCell = ({ period, height }: { period: any, height: SharedValue<number> }) => {
    const animatedStyle = useAnimatedStyle(() => ({ height: height.value }));
    const timeOpacity = useAnimatedStyle(() => ({ opacity: height.value > 75 ? 1 : 0 }));
    return (
        <Animated.View style={[styles.timeSideCell, animatedStyle]}>
            <Text style={styles.timeSideId}>{String(period.id)}</Text>
            <Animated.Text style={[styles.timeSideTime, timeOpacity]}>
                {`${String(period.start)}\n${String(period.end)}`}
            </Animated.Text>
        </Animated.View>
    );
};

const GridLineH = ({ index, height }: { index: number, height: SharedValue<number> }) => {
    const style = useAnimatedStyle(() => ({ top: index * height.value }));
    return <Animated.View style={[styles.gridLineH, style]} />;
};

const GridLineV = ({ index, width }: { index: number, width: SharedValue<number> }) => {
    const style = useAnimatedStyle(() => ({ left: index * width.value }));
    return <Animated.View style={[styles.gridLineV, style]} />;
};

const CoursePill = ({ course, allCourses, tempWidth, tempHeight, isDeleteMode, removeCourse }: any) => {
    // 這裡傳入 1 作為基準，計算出的 top/height 將在 animatedStyle 中乘以實際高度
    const layout = calculateCourseLayout(course, allCourses, 1);

    const animatedStyle = useAnimatedStyle(() => {
        const w = tempWidth.value;
        const h = tempHeight.value;
        return {
            top: layout.top * h,
            height: layout.height * h - 2,
            width: (w * layout.widthPercent) / 100 - 2,
            left: layout.day * w + (w * layout.leftOffsetPercent) / 100 + 1,
        };
    });

    const isClashed = layout.widthPercent < 100;
    const courseNameArray = Array.from(String(course.name));

    return (
        <Animated.View style={[styles.courseItem, animatedStyle]}>
            <TouchableOpacity activeOpacity={0.8} style={styles.courseTouch}>
                <View style={styles.courseTextContainer}>
                    {isClashed ? (
                        courseNameArray.slice(0, 5).map((char, index) => (
                            <Text key={index} style={styles.unifiedText}>{char}</Text>
                        ))
                    ) : (
                        <>
                            <Text style={styles.unifiedText} numberOfLines={2}>{String(course.name)}</Text>
                            <Text style={styles.unifiedText} numberOfLines={1}>{String(course.location)}</Text>
                            <Text style={styles.unifiedText} numberOfLines={1}>{String(course.teacher)}</Text>
                        </>
                    )}
                </View>
                {isDeleteMode && (
                    <TouchableOpacity style={styles.deleteBadge} onPress={() => removeCourse(course.id)}>
                        <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>×</Text>
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

// --- 主組件 ---

const TimetableScreen = () => {
    const { selectedCourses, removeCourse } = useCourse();
    const [currentWeek, setCurrentWeek] = useState(1);
    const [viewMode, setViewMode] = useState<'Week' | 'Day'>('Week');
    const [isDeleteMode, setIsDeleteMode] = useState(false);

    const tempWidth = useSharedValue(INITIAL_CELL_WIDTH);
    const tempHeight = useSharedValue(60);
    const baseWidth = useSharedValue(INITIAL_CELL_WIDTH);
    const baseHeight = useSharedValue(60);

    const stickyHeaderRef = useAnimatedRef<Animated.ScrollView>();
    const stickySidebarRef = useAnimatedRef<Animated.ScrollView>();

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

    const onVerticalScroll = useAnimatedScrollHandler((event) => {
        scrollTo(stickySidebarRef, 0, event.contentOffset.y, false);
    });

    const onHorizontalScroll = useAnimatedScrollHandler((event) => {
        scrollTo(stickyHeaderRef, event.contentOffset.x, 0, false);
    });

    const onPinchEvent = (event: any) => {
        'worklet';
        if (event.nativeEvent.state === State.ACTIVE) {
            const scale = event.nativeEvent.scale;
            tempWidth.value = Math.min(Math.max(baseWidth.value * scale, INITIAL_CELL_WIDTH), 200);
            tempHeight.value = Math.min(Math.max(baseHeight.value * scale, 45), 180);
        }
    };

    const onPinchStateChange = (event: any) => {
        if (event.nativeEvent.state === State.END) {
            baseWidth.value = tempWidth.value;
            baseHeight.value = tempHeight.value;
        }
    };

    const canvasAnimatedStyle = useAnimatedStyle(() => ({
        width: tempWidth.value * 5,
        height: periods.length * tempHeight.value,
    }));

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
                            <View style={styles.headerRowContainer}>
                                <View style={styles.cornerBox} />
                                <Animated.ScrollView ref={stickyHeaderRef} horizontal scrollEnabled={false} showsHorizontalScrollIndicator={false}>
                                    {days.map((d, i) => (
                                        <AnimatedDayCell key={i} label={d.label} width={tempWidth} />
                                    ))}
                                </Animated.ScrollView>
                            </View>

                            <View style={styles.mainGridArea}>
                                <View style={{ width: SIDEBAR_WIDTH }}>
                                    <Animated.ScrollView ref={stickySidebarRef} scrollEnabled={false} showsVerticalScrollIndicator={false}>
                                        {periods.map((p) => (
                                            <AnimatedTimeCell key={p.id} period={p} height={tempHeight} />
                                        ))}
                                    </Animated.ScrollView>
                                </View>

                                <Animated.ScrollView horizontal onScroll={onHorizontalScroll} scrollEventThrottle={16} showsHorizontalScrollIndicator={false}>
                                    <Animated.ScrollView onScroll={onVerticalScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false}>
                                        <PinchGestureHandler onGestureEvent={onPinchEvent} onHandlerStateChange={onPinchStateChange}>
                                            <Animated.View style={[styles.canvas, canvasAnimatedStyle]}>
                                                <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setIsDeleteMode(false)} />

                                                {/* 💡 背景格線改用子組件 */}
                                                {periods.map((_, i) => <GridLineH key={`h-${i}`} index={i} height={tempHeight} />)}
                                                {[0, 1, 2, 3, 4, 5].map((i) => <GridLineV key={`v-${i}`} index={i} width={tempWidth} />)}

                                                {selectedCourses.map((course) => (
                                                    <CoursePill
                                                        key={course.id}
                                                        course={course}
                                                        allCourses={selectedCourses}
                                                        tempWidth={tempWidth}
                                                        tempHeight={tempHeight}
                                                        isDeleteMode={isDeleteMode}
                                                        removeCourse={removeCourse}
                                                    />
                                                ))}
                                            </Animated.View>
                                        </PinchGestureHandler>
                                    </Animated.ScrollView>
                                </Animated.ScrollView>
                            </View>
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
    customSwitch: { flexDirection: 'row', backgroundColor: '#E6E1D3', borderRadius: 20, padding: 3, width: 120 },
    switchOption: { flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: 17 },
    switchActive: { backgroundColor: '#FFF', elevation: 2 },
    switchText: { fontSize: 12, fontWeight: 'bold', color: '#A09687' },
    switchTextActive: { color: '#6D5D4B' },
    weekWrapper: { flex: 1, backgroundColor: '#D4C3A3', borderRadius: 20, overflow: 'hidden' },
    headerRowContainer: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)', height: HEADER_HEIGHT },
    cornerBox: { width: SIDEBAR_WIDTH, height: HEADER_HEIGHT },
    mainGridArea: { flexDirection: 'row', flex: 1 },
    dayLabelCell: { alignItems: 'center', justifyContent: 'center', height: HEADER_HEIGHT },
    dayLabelText: { fontWeight: 'bold', color: '#6D5D4B' },
    timeSideCell: { justifyContent: 'center', alignItems: 'center', borderBottomWidth: 0.3, borderColor: 'rgba(255,255,255,0.3)', width: SIDEBAR_WIDTH },
    timeSideId: { fontSize: 13, fontWeight: 'bold', color: '#6D5D4B' },
    timeSideTime: { fontSize: 8, color: '#8E7E6A', textAlign: 'center' },
    canvas: { position: 'relative' },
    gridLineH: { position: 'absolute', width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
    gridLineV: { position: 'absolute', width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.3)' },
    courseItem: { position: 'absolute', backgroundColor: '#FFFFFF', borderRadius: 8, elevation: 3, borderWidth: 0.5, borderColor: '#E6E1D3', overflow: 'hidden' },
    courseTouch: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 2 },
    courseTextContainer: { width: '100%', alignItems: 'center' },
    unifiedText: { fontWeight: 'bold', color: '#6D5D4B', textAlign: 'center', fontSize: 9 },
    deleteBadge: { position: 'absolute', top: 2, right: 2, backgroundColor: '#FF6B6B', width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
});

export default TimetableScreen;