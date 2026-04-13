import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
    Modal, Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { ACADEMIES, DEPARTMENTS } from '../constants/departments';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSearch: (filters: {
        academy: string | null;
        dept: string | null;
        classGroup: string | null;
        day: string | null;
        startSlot: string | null;
        endSlot: string | null;
    }) => void;
}

const AdvancedSearchModal = ({ visible, onClose, onSearch }: Props) => {
    const [academy, setAcademy] = useState<string | null>("(不限)");
    const [dept, setDept] = useState<string | null>("(不限)");
    const [classGroup, setClassGroup] = useState<string | null>("(不限)");
    const [day, setDay] = useState<string | null>("(不限)");
    const [startSlot, setStartSlot] = useState<string | null>(null);
    const [endSlot, setEndSlot] = useState<string | null>(null);

    // 💡 補上 (不限) 的學院清單
    const academyOptions = useMemo(() => [
        { label: '(不限)', value: '(不限)' },
        ...ACADEMIES
    ], []);

    // 💡 補上 (不限) 的系所清單
    const departmentOptions = useMemo(() => {
        const baseDepts = academy && academy !== "(不限)"
            ? DEPARTMENTS[academy as keyof typeof DEPARTMENTS] || []
            : Object.values(DEPARTMENTS).flat();

        return [{ label: '(不限)', value: '(不限)' }, ...baseDepts];
    }, [academy]);

    // 💡 補上 (不限) 的班級清單
    const classOptions = useMemo(() => {
        if (!dept || dept === "(不限)") return [{ label: '(不限)', value: '(不限)' }];

        let classes: { label: string; value: string }[] = [{ label: '(不限)', value: '(不限)' }];
        const years = ['一', '二', '三', '四'];

        years.forEach(year => {
            if (dept === '語創' || dept === '藝設') {
                classes.push({ label: `${dept}${year}甲`, value: `${dept}${year}甲` });
                classes.push({ label: `${dept}${year}乙`, value: `${dept}${year}乙` });
            } else if (dept === '數資') {
                classes.push({ label: `數資${year}數學組`, value: `數資${year}數學組` });
                classes.push({ label: `數資${year}AI資教組`, value: `數資${year}AI資教組` });
            } else {
                classes.push({ label: `${dept}${year}甲`, value: `${dept}${year}甲` });
            }
        });
        return classes;
    }, [dept]);

    const slots = Array.from({ length: 14 }, (_, i) => {
        const val = (i + 1).toString().padStart(2, '0');
        return { label: `第 ${val} 節`, value: val };
    });

    const handleReset = () => {
        setAcademy("(不限)");
        setDept("(不限)");
        setClassGroup("(不限)");
        setDay("(不限)");
        setStartSlot(null);
        setEndSlot(null);
    };

    return (
        <Modal visible={visible} animationType="none" transparent={true} onRequestClose={onClose}>
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />

            <View style={styles.modalContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>進階查詢</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={28} color="#333" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                    <Text style={styles.label}>學院</Text>
                    <Dropdown
                        style={styles.dropdown}
                        data={academyOptions}
                        labelField="label"
                        valueField="value"
                        placeholder="請選擇學院"
                        value={academy}
                        onChange={item => {
                            setAcademy(item.value);
                            setDept("(不限)");
                        }}
                    />

                    <Text style={styles.label}>系所</Text>
                    <Dropdown
                        style={styles.dropdown}
                        data={departmentOptions}
                        labelField="label"
                        valueField="value"
                        placeholder="請選擇系所"
                        value={dept}
                        onChange={item => {
                            setDept(item.value);
                            setClassGroup("(不限)");
                        }}
                    />

                    <Text style={styles.label}>班級</Text>
                    <Dropdown
                        style={styles.dropdown}
                        data={classOptions}
                        labelField="label"
                        valueField="value"
                        placeholder="請選擇班級"
                        value={classGroup}
                        onChange={item => setClassGroup(item.value)}
                    />

                    <Text style={styles.label}>上課時間 (星期)</Text>
                    <Dropdown
                        style={styles.dropdown}
                        maxHeight={200}
                        data={[
                            { label: '(不限)', value: '(不限)' },
                            { label: '星期一', value: '1' }, { label: '星期二', value: '2' },
                            { label: '星期三', value: '3' }, { label: '星期四', value: '4' }, { label: '星期五', value: '5' }
                        ]}
                        labelField="label"
                        valueField="value"
                        placeholder="請選擇"
                        value={day}
                        onChange={item => setDay(item.value)}
                    />

                    <View style={styles.slotRange}>
                        <View style={{ width: '45%' }}>
                            <Text style={styles.label}>開始節次</Text>
                            <Dropdown style={styles.dropdown} maxHeight={200} data={slots} labelField="label" valueField="value" placeholder="請選擇" value={startSlot} onChange={item => setStartSlot(item.value)} />
                        </View>
                        <Text style={styles.slotSeparator}>至</Text>
                        <View style={{ width: '45%' }}>
                            <Text style={styles.label}>結束節次</Text>
                            <Dropdown style={styles.dropdown} maxHeight={200} data={slots} labelField="label" valueField="value" placeholder="請選擇" value={endSlot} onChange={item => setEndSlot(item.value)} />
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footerBtnGroup}>
                    <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                        <Text style={styles.resetBtnText}>重置</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.searchButton}
                        onPress={() => {
                            onSearch({
                                academy: academy === "(不限)" ? null : academy,
                                dept: dept === "(不限)" ? null : dept,
                                classGroup: classGroup === "(不限)" ? null : classGroup,
                                day: day === "(不限)" ? null : day,
                                startSlot,
                                endSlot
                            });
                            onClose();
                        }}
                    >
                        <Ionicons name="search" size={20} color="white" style={{ marginRight: 8 }} />
                        <Text style={styles.searchBtnText}>搜尋課程</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 20,
        height: '75%',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 10 },
            android: { elevation: 20 }
        })
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' },
    closeButton: { padding: 5 },
    label: { fontSize: 16, marginBottom: 8, color: '#666', fontWeight: '500' },
    dropdown: {
        height: 50,
        borderColor: '#E0E0E0',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 20,
        backgroundColor: '#FFF'
    },
    slotRange: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    slotSeparator: { fontSize: 16, color: '#666', marginTop: 25 },
    footerBtnGroup: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingBottom: Platform.OS === 'ios' ? 30 : 20 },
    resetButton: { flex: 1, height: 50, justifyContent: 'center', alignItems: 'center' },
    resetBtnText: { fontSize: 16, color: '#666' },
    searchButton: {
        flex: 2,
        backgroundColor: '#7B886F',
        height: 50,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});

export default AdvancedSearchModal;