import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCourse } from '../../context/CourseContext';
import TopNavBar from '../../navigation/TopNavBar';

export default function Credit({ navigation }: any) {
    const { generalCreditsTotal, mustCreditsTotal, majorCreditsTotal, flexibleCreditsTotal } = useCourse();

    const handlePress = (route: string) => {
        navigation.navigate(route);
    };

    // 其他學分暫時寫死
    const mustCredits = mustCreditsTotal || 0;
    const arrayCredits = majorCreditsTotal || 0;
    const flexibleCredits = flexibleCreditsTotal || 0;
    const currentTotal = mustCredits + generalCreditsTotal + arrayCredits + flexibleCredits;
    const TOTAL_REQUIRED = 128;

    // 計算半圓旋轉角度 (-45 度為 0%， 135 度為 100%)
    // 總共 180 度範圍 -> 比例 * 180 - 45
    const progressRatio = Math.min(currentTotal / TOTAL_REQUIRED, 1);
    const radius = 140;
    const circumference = Math.PI * radius;
    const strokeDashoffset = circumference - (progressRatio * circumference);

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <TopNavBar title="學分檢核" />
            
            <ScrollView contentContainerStyle={styles.container}>
                {/* 頂部半圓進度與總學分 */}
                <View style={styles.topSection}>
                    <View style={styles.svgWrapper}>
                        <Svg width="300" height="160" viewBox="0 0 300 160">
                            {/* 灰色背景底 */}
                            <Path 
                                d="M 10 150 A 140 140 0 0 1 290 150" 
                                fill="none" 
                                stroke="#D3D3D3" 
                                strokeWidth="20" 
                                strokeLinecap="round" 
                            />
                            {/* 綠色進度條 （當 currentTotal 為 0 時，使用極小的 strokeDasharray 或完全不渲染避免圓點出現） */}
                            {currentTotal > 0 && (
                                <Path 
                                    d="M 10 150 A 140 140 0 0 1 290 150" 
                                    fill="none" 
                                    stroke="#23A85B" 
                                    strokeWidth="20" 
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                />
                            )}
                        </Svg>
                    </View>

                    <View style={styles.centerContent}>
                        <Text style={styles.totalCreditsLabel}>總學分</Text>
                        <View style={styles.treeBox}>
                            <Text style={styles.treeText}>封面的樹</Text>
                            <Text style={styles.treeText}>(成長動畫)</Text>
                            <Text style={styles.scoreText}>
                                {currentTotal} <Text style={styles.scoreTotal}>/128</Text>
                            </Text>
                        </View>
                    </View>
                </View>

                {/* 學分類別列表 */}
                <View style={styles.listSection}>
                    <CreditCard title="校必修學分" current={mustCredits} total={14} onPress={() => handlePress('CreditDetailMust')} />
                    <CreditCard title="通識學分" current={generalCreditsTotal} total={18} onPress={() => handlePress('CreditDetailGeneral')} />
                    <CreditCard title="系專門課程" current={arrayCredits} total={91} onPress={() => handlePress('CreditDetailMajor')} />
                    <CreditCard title="彈性課程" current={flexibleCredits} total={5} onPress={() => handlePress('CreditDetailFlexible')} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function CreditCard({ title, current, total, onPress }: { title: string; current: number; total: number; onPress: () => void }) {
    const percentage = (current / total) * 100;
    return (
        <TouchableOpacity activeOpacity={0.8} style={styles.card} onPress={onPress}>
            <View style={styles.cardTop}>
                <Text style={styles.cardTitle}>{title}</Text>
                <View style={styles.cardRight}>
                    <Text style={styles.cardScore}>{current}/{total}</Text>
                    <Ionicons name="chevron-forward" size={24} style={styles.arrow} />
                </View>
            </View>
            <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FAF7ED',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
        paddingBottom: 40,
    },
    /* 頂部區域 */
    topSection: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 30,
        position: 'relative',
        height: 200,
    },
    svgWrapper: {
        width: 300,
        height: 160,
        position: 'absolute',
        top: 0,
        alignItems: 'center',
    },
    
    
    centerContent: {
        alignItems: 'center',
        marginTop: 40, // 調整文字區塊的位置
        zIndex: 10,
    },
    totalCreditsLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#654321', // 深咖啡色
        marginBottom: 8,
    },
    treeBox: {
        backgroundColor: '#C5E1A5', // 淺綠色背景
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    treeText: {
        fontSize: 18,
        fontWeight: '900',
        color: '#000',
        marginBottom: 2,
    },
    scoreText: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#654321', // 深咖啡色
        marginTop: 4,
    },
    scoreTotal: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#654321',
    },
    /* 列表區域 */
    listSection: {
        paddingHorizontal: 24,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginBottom: 20,
        // 陰影
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#654321', // 深咖啡色
    },
    cardRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardScore: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#654321',
        marginRight: 8,
    },
    arrow: {
        color: '#654321', // 只要改這裡就能變色
        marginLeft: 4,
    },
    progressBarBg: {
        height: 10,
        backgroundColor: '#E0E0E0',
        borderRadius: 5,
        width: '100%',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#23A85B', // 綠色
        borderRadius: 5,
    },
});