import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import TopNavBar from '../navigation/TopNavBar';
import { COLORS } from '../styles/theme';

export default function PersonalSettings() {
    const [name, setName] = useState('王辰左');
    const [tempName, setTempName] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleEditPress = () => {
        setTempName(name); // 點擊時，把現在的名字帶入編輯框
        setIsModalVisible(true);
    };

    const handleConfirm = () => {
        // 先檢查如果名字長度大於 8 個字，就跳出提示並阻擋存檔
        if (tempName.length > 8) {
            Alert.alert('輸入錯誤', '名字長度不可超過八個字');
            return;
        }
        
        setName(tempName); // 按下確定，更新名字
        setIsModalVisible(false);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <TopNavBar title="設定" showMenu={false} showInfo={false} />
            
            <ScrollView contentContainerStyle={styles.container}>
                {/* 頭像與編輯圓圈組合區 */}
                <View style={styles.avatarWrapper}>
                    {/* 內層頭像區域：大小 100x100 */}
                    <View style={styles.avatarContainer}>
                        {/* 使用預設的人頭 Icon，若你有 28.svg 也可以用 <Image source={require('../../assets/28.svg')} /> 或 SVG component 取代這行 */}
                        <Ionicons name="person" size={60} color="#FFF" />
                    </View>
                    
                    {/* 右下角的 36x36 圓圈 */}
                    <View style={styles.editBadge}>
                        {/* 使用 Ionicons 來暫代 photo 圖示，大小 24x24 */}
                        <Ionicons name="image-outline" size={24} color={COLORS.avatarEditIcon} />
                    </View>
                </View>
                
                {/* 姓名與編輯區 (使用 TouchableOpacity 包起來讓整個範圍可點，並利用 row 讓筆跟著字體大小移動) */}
                <TouchableOpacity onPress={handleEditPress} style={styles.nameContainer} activeOpacity={0.7}>
                    <View style={styles.nameBox}>
                        <Text style={styles.nameText}>{name}</Text>
                    </View>
                    <View style={styles.editIconContainer}>
                        {/* 使用 Ionicons 來暫代 edit.svg，大小 24x24 */}
                        <Ionicons name="pencil" size={24} color={COLORS.nameEditIcon} />
                    </View>
                </TouchableOpacity>

                {/* Email 顯示區塊 */}
                <View style={styles.emailContainer}>
                    <Text style={styles.emailText}>Ray123321@gmail.com</Text>
                </View>

                {/* 班級、學號、學院標籤區塊 */}
                <View style={styles.tagsContainer}>
                    <View style={styles.tagBadge}>
                        <Text style={styles.tagText}>數位二甲</Text>
                    </View>
                    <View style={styles.tagBadge}>
                        <Text style={styles.tagText}>111319100</Text>
                    </View>
                    <View style={styles.tagBadge}>
                        <Text style={styles.tagText}>理學院</Text>
                    </View>
                </View>

                {/* 330px 設定選項容器 */}
                <View style={[styles.mainSettingsContainer, { backgroundColor: COLORS.settingsCardBg }]}>
                    {/* 這裡可以放設定項目 */}
                </View>
                
                <Text style={{ marginTop: 20 }}>設定內容</Text>
            </ScrollView>

            {/* 彈出式修改名字對話框 (Modal) */}
            <Modal visible={isModalVisible} transparent animationType="fade">
                <KeyboardAvoidingView 
                    style={styles.modalOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    // 這行可以微調讓彈窗避開鍵盤後，能在剩餘視窗再偏上 (而不是卡死在正中央)
                    keyboardVerticalOffset={Platform.OS === 'ios' ? -50 : 0} 
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>修改名字</Text>
                        <Text style={styles.modalSubtitle}>請輸入新的名字</Text>
                        
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.modalInput}
                                value={tempName}
                                onChangeText={setTempName}
                                autoFocus
                                returnKeyType="done"
                                onSubmitEditing={handleConfirm}
                                selectionColor="#007AFF" // iOS 預設的深藍色標記
                            />
                        </View>

                        <View style={styles.dividerX} />
                        
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalButton} onPress={() => setIsModalVisible(false)} activeOpacity={0.7}>
                                <Text style={styles.modalButtonTextCancel}>取消</Text>
                            </TouchableOpacity>
                            
                            <View style={styles.dividerY} />
                            
                            <TouchableOpacity style={styles.modalButton} onPress={handleConfirm} activeOpacity={0.7}>
                                <Text style={styles.modalButtonTextConfirm}>確定</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { 
        flex: 1, 
        backgroundColor: '#FAF7ED', 
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
    },
    container: {
        flexGrow: 1,
        alignItems: 'center', // 確保包含頭像在內的內容都會在正中間 (水平置中)
        paddingBottom: 60,    // 讓底部保留一點空間，確保可以滑到底
    },
    avatarWrapper: {
        marginTop: 50,         // 距離 top-nav-bar 50
        width: 100,
        height: 100,
        position: 'relative',  // 讓裡面的 editBadge 可以設定 absolute 依靠它定位
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,      // 讓外框變成完美圓形 (100 / 2)
        backgroundColor: '#D1C8B4', // 給個預設底色
        alignItems: 'center',  // 讓裡面的 Icon 置中
        justifyContent: 'center',
        overflow: 'hidden',    // 確保未來的圖片不會超出圓形
    },
    editBadge: {
        position: 'absolute',  // 疊在頭像上方
        bottom: 0,            // 往右下偏移 5px
        right: -10,             // 往右下偏移 5px
        width: 36,
        height: 36,
        borderRadius: 18,      // 36 / 2
        backgroundColor: COLORS.avatarEditBg, // 由 styles(theme.ts) 控管圓圈顏色
        alignItems: 'center',
        justifyContent: 'center', // 確保 24x24 圖示在最中間
        
        // --- 加上微小陰影，才不會跟頭像或背景融為一體 (可選) ---
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 4,
    },
    nameContainer: {
        flexDirection: 'row',
        marginTop: 30, // 距離頭像 30px
        alignItems: 'center',
        justifyContent: 'center',
    },
    nameBox: {
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nameText: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    editIconContainer: {
        marginLeft: 8, // 筆與文字之間的距離
        justifyContent: 'center',
        alignItems: 'center',
    },
    emailContainer: {
        marginTop: 15,       // 距離名字下方 10px
        height: 24,          // 固定高度 24
        backgroundColor: '#D9D9D9',
        borderRadius: 15,    // 圓角 15
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16, // 讓寬度隨著文字撐開的同時左右留點空隙，不會太貼邊
    },
    emailText: {
        fontSize: 15,        // 字體大小 12
        color: '#000000',
    },
    
    tagsContainer: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 10,
    },
    tagBadge: {
        height: 24,          // 高度 24
        backgroundColor: '#D9D9D9',
        borderRadius: 15,    // borderRadius 15
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    tagText: {
        fontSize: 12,        // 字體 12
        color: '#000000',
    },
    mainSettingsContainer: {
        width: 330,
        height: 500, // 先給定一個高度方便顯示
        marginTop: 40,
        borderRadius: 12,
        // pure black stroke (border), opacity 20%
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.2)',
        // drop shadow
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4, // for android
    },

    // --- 彈出層 (iOS 樣式對話框) 的樣式 ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        justifyContent: 'flex-start',   // 為了讓 KeyboardAvoidingView 和 paddingTop 控制比例，改為從上往下推
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? '70%' : '20%', // 把他推到螢幕上面約 1/3 的位置 (手機畫面邊緣跟鍵盤之間偏上)
    },
    modalContent: {
        width: 270,
        backgroundColor: '#2A2A2C', // 仿 iOS 深色樣式背景
        borderRadius: 14,
        paddingTop: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 3,
    },
    modalSubtitle: {
        fontSize: 13,
        color: '#EBEBF5', // 稍微淡一點的白色
        marginBottom: 15,
    },
    inputContainer: {
        width: '85%',
        backgroundColor: '#1C1C1E', // 輸入框深色背景
        borderWidth: 1,
        borderColor: '#38383A',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 5,
        marginBottom: 20,
    },
    modalInput: {
        fontSize: 15,
        color: '#FFFFFF',
        padding: 0,
        height: 24,
    },
    dividerX: {
        width: '100%',
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#4D4D50',
    },
    modalButtons: {
        flexDirection: 'row',
        width: '100%',
        height: 46,
    },
    modalButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dividerY: {
        width: StyleSheet.hairlineWidth,
        height: '100%',
        backgroundColor: '#4D4D50',
    },
    modalButtonTextCancel: {
        fontSize: 17,
        color: '#0A84FF', // iOS 藍色連結顏色
        fontWeight: '400',
    },
    modalButtonTextConfirm: {
        fontSize: 17,
        color: '#0A84FF', // iOS 藍色連結顏色
        fontWeight: '600',
    }
});