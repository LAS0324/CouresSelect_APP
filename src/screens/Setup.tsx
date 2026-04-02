import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Modal, FlatList, TouchableWithoutFeedback } from 'react-native';
import { COLORS } from '../styles/theme';

// 定義組件接收的參數類型
interface SetupProps {
    onFinish: () => void;
}

const SetupScreen: React.FC<SetupProps> = ({ onFinish }) => {
    const [school, setSchool] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);

    const schools = ['國立臺北教育大學', '國立臺灣大學', '國立師範大學', '國立政治大學'];

    const handleSelect = (item: string) => {
        setSchool(item);
        setIsModalVisible(false);
    };

    // 處理「開始規劃」按鈕點擊
    const handleStartPlanning = () => {
        if (school) {
            console.log('完成設定！學校：', school);
            onFinish(); // 呼叫從 index.tsx 傳進來的跳轉函數
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.stepText}>STEP 01</Text>
                <Text style={styles.title}>選擇你的學校</Text>

                <TouchableOpacity
                    style={styles.dropdownTrigger}
                    onPress={() => setIsModalVisible(true)}
                >
                    <Text style={[styles.dropdownValue, !school && { color: '#AAA' }]}>
                        {school || '請選擇學校...'}
                    </Text>
                    <Text style={styles.arrow}>▼</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.nextBtn, !school && styles.disabledBtn]}
                    onPress={handleStartPlanning}
                    disabled={!school}
                >
                    <Text style={styles.nextBtnText}>開始規劃 ✨</Text>
                </TouchableOpacity>
            </View>

            <Modal visible={isModalVisible} transparent={true} animationType="slide" onRequestClose={() => setIsModalVisible(false)}>
                <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <TouchableOpacity style={styles.modalHeader} onPress={() => setIsModalVisible(false)}>
                                    <View style={styles.modalHandle} />
                                </TouchableOpacity>
                                <FlatList
                                    data={schools}
                                    keyExtractor={(item) => item}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity style={styles.optionItem} onPress={() => handleSelect(item)}>
                                            <Text style={styles.optionItemText}>{item}</Text>
                                        </TouchableOpacity>
                                    )}
                                />
                                <TouchableOpacity style={styles.closeBtn} onPress={() => setIsModalVisible(false)}>
                                    <Text style={{ color: COLORS.primary, fontWeight: 'bold', padding: 20 }}>取消</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: 40, flex: 1, justifyContent: 'center' },
    stepText: { color: COLORS.primary, fontWeight: 'bold', marginBottom: 10 },
    title: { fontSize: 26, fontWeight: 'bold', color: COLORS.text, marginBottom: 40 },
    dropdownTrigger: {
        backgroundColor: '#FFF',
        height: 65,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        borderWidth: 2,
        borderColor: '#E6E5DF',
    },
    dropdownValue: { fontSize: 17, color: COLORS.text },
    arrow: { color: COLORS.primary, fontSize: 12 },
    nextBtn: { backgroundColor: COLORS.primary, height: 60, borderRadius: 30, marginTop: 40, alignItems: 'center', justifyContent: 'center' },
    disabledBtn: { opacity: 0.3 },
    nextBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(235, 235, 235, 0.3)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingBottom: 40, maxHeight: '50%' },
    modalHeader: { alignItems: 'center', padding: 15 },
    modalHandle: { width: 40, height: 5, backgroundColor: '#E6E5DF', borderRadius: 10 },
    optionItem: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F5F5F5', alignItems: 'center' },
    optionItemText: { fontSize: 18, color: COLORS.text },
    closeBtn: { marginTop: 10, alignItems: 'center' }
});

export default SetupScreen;