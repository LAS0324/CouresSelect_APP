import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import TopNavBar from '../navigation/TopNavBar';
import { COLORS } from '../styles/theme';

const darkModeSvgData = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMjFDOS41IDIxIDcuMzc1IDIwLjEyNSA1LjYyNSAxOC4zNzVDMy44NzUgMTYuNjI1IDMgMTQuNSAzIDEyQzMgOS41IDMuODc1IDcuMzc1IDUuNjI1IDUuNjI1QzcuMzc1IDMuODc1IDkuNSAzIDEyIDNDMTIuMjMzMyAzIDEyLjQ2MjUgMy4wMDgzMyAxMi42ODc1IDMuMDI1QzEyLjkxMjUgMy4wNDE2NyAxMy4xMzMzIDMuMDY2NjcgMTMuMzUgMy4xQzEyLjY2NjcgMy41ODMzMyAxMi4xMjA4IDQuMjEyNSAxMS43MTI1IDQuOTg3NUMxMS4zMDQyIDUuNzYyNSAxMS4xIDYuNiAxMS4xIDcuNUMxMS4xIDkgMTEuNjI1IDEwLjI3NSAxMi42NzUgMTEuMzI1QzEzLjcyNSAxMi4zNzUgMTUgMTIuOSAxNi41IDEyLjlDMTcuNDE2NyAxMi45IDE4LjI1ODMgMTIuNjk1OCAxOS4wMjUgMTIuMjg3NUMxOS43OTE3IDExLjg3OTIgMjAuNDE2NyAxMS4zMzMzIDIwLjkgMTAuNjVDMjAuOTMzMyAxMC44NjY3IDIwLjk1ODMgMTEuMDg3NSAyMC45NzUgMTEuMzEyNUMyMC45OTE3IDExLjUzNzUgMjEgMTEuNzY2NyAyMSAxMkMyMSAxNC41IDIwLjEyNSAxNi42MjUgMTguMzc1IDE4LjM3NUMxNi42MjUgMjAuMTI1IDE0LjUgMjEgMTIgMjFaTTEyIDE5QzEzLjQ2NjcgMTkgMTQuNzgzMyAxOC41OTU4IDE1Ljk1IDE3Ljc4NzVDMTcuMTE2NyAxNi45NzkyIDE3Ljk2NjcgMTUuOTI1IDE4LjUgMTQuNjI1QzE4LjE2NjcgMTQuNzA4MyAxNy44MzMzIDE0Ljc3NSAxNy41IDE0LjgyNUMxNy4xNjY3IDE0Ljg3NSAxNi44MzMzIDE0LjkgMTYuNSAxNC45QzE0LjQ1IDE0LjkgMTIuNzA0MiAxNC4xNzkyIDExLjI2MjUgMTIuNzM3NUM5LjgyMDgzIDExLjI5NTggOS4xIDkuNTUgOS4xIDcuNUM5LjEgNy4xNjY2NyA5LjEyNSA2LjgzMzMzIDkuMTc1IDYuNUM5LjIyNSA2LjE2NjY3IDkuMjkxNjcgNS44MzMzMyA5LjM3NSA1LjVDOC4wNzUgNi4wMzMzMyA3LjAyMDgzIDYuODgzMzMgNi4yMTI1IDguMDVDNS40MDQxNyA5LjIxNjY3IDUgMTAuNTMzMyA1IDEyQzUgMTMuOTMzMyA1LjY4MzMzIDE1LjU4MzMgNy4wNSAxNi45NUM4LjQxNjY3IDE4LjMxNjcgMTAuMDY2NyAxOSAxMiAxOVoiIGZpbGw9IiNGRkZGRkYiLz48L3N2Zz4=";
const chevronForwardSvgData = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIuNiAxMkw4IDcuNEw5LjQgNkwxNS40IDEyTDkuNCAxOEw4IDE2LjZMMTIuNiAxMloiIGZpbGw9IiMwMDAwMDAiLz48L3N2Zz4=";

const setingOptions = [
    {
        title: "教學導覽",
        icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDdDMTIgNS45MzkxMyAxMS41Nzg2IDQuOTIxNzIgMTAuODI4NCA0LjE3MTU3QzEwLjA3ODMgMy40MjE0MyA5LjA2MDg3IDMgOCAzSDJWMThIOUM5Ljc5NTY1IDE4IDEwLjU1ODcgMTguMzE2MSAxMS4xMjEzIDE4Ljg3ODdDMTEuNjgzOSAxOS40NDEzIDEyIDIwLjIwNDQgMTIgMjFNMTIgN1YyMU0xMiA3QzEyIDUuOTM5MTMgMTIuNDIxNCA0LjkyMTcyIDEzLjE3MTYgNC4xNzE1N0MxMy45MjE3IDMuNDIxNDMgMTQuOTM5MSAzIDE2IDNIMjJWMThIMTVDMTQuMjA0NCAxOCAxMy40NDEzIDE4LjMxNjEgMTIuODc4NyAxOC44Nzg3QzEyLjMxNjEgMTkuNDQxMyAxMiAyMC4yMDQ0IDEyIDIxIiBzdHJva2U9IiNGRkZFRkEiIHN0cm9rZS13aWR0aD0iMi41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+"
    },
    {
        title: "學校設置",
        icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDE3VjEwLjFMMTIgMTVMMSA5TDEyIDNMMjMgOVYxN0gyMVpNMTIgMjFMNSAxNy4yVjEyLjJMMTIgMTZMMTkgMTIuMlYxNy4yTDEyIDIxWiIgZmlsbD0iI0ZGRkVGQSIvPgo8L3N2Zz4="
    },
    {
        title: "關於應用程式",
        icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzExN18xNDEwKSI+CjxwYXRoIGQ9Ik0xMiAxNlYxMk0xMiA4SDEyLjAxTTIyIDEyQzIyIDE3LjUyMjggMTcuNTIyOCAyMiAxMiAyMkM2LjQ3NzE1IDIyIDIgMTcuNTIyOCAyIDEyQzIgNi40NzcxNSA2LjQ3NzE1IDIgMTIgMkMxNy41MjI4IDIgMjIgNi40NzcxNSAyMiAxMloiIHN0cm9rZT0iI0ZGRkVGQSIgc3Ryb2tlLXdpZHRoPSIyLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L2c+CjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzExN18xNDEwIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPg=="
    }
];

const logoutOption = {
    title: "登出",
    icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwLjE1IDEzSDhWMTFIMjAuMTVMMTguNiA5LjQ1TDIwIDhMMjQgMTJMMjAgMTZMMTguNiAxNC41NUwyMC4xNSAxM1pNMTUgOVY1SDVWMTlIMTVWMTVIMTdWMTlDMTcgMTkuNTUgMTYuODA0MiAyMC4wMjA4IDE2LjQxMjUgMjAuNDEyNUMxNi4wMjA4IDIwLjgwNDIgMTUuNTUgMjEgMTUgMjFINUM0LjQ1IDIxIDMuOTc5MTcgMjAuODA0MiAzLjU4NzUgMjAuNDEyNUMzLjE5NTgzIDIwLjAyMDggMyAxOS41NSAzIDE5VjVDMyA0LjQ1IDMuMTk1ODMgMy45NzkxNyAzLjU4NzUgMy41ODc1QzMuOTc5MTcgMy4xOTU4MyA0LjQ1IDMgNSAzSDE1QzE1LjU1IDMgMTYuMDIwOCAzLjE5NTgzIDE2LjQxMjUgMy41ODc1QzE2LjgwNDIgMy45NzkxNyAxNyA0LjQ1IDE3IDVWOUgxNVoiIGZpbGw9IiNGRkZFRkEiLz4KPC9zdmc+"
};

export default function PersonalSettings() {
    const [name, setName] = useState('王辰左');
    const [tempName, setTempName] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

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
            <TopNavBar title="設定" showMenu={false} showInfo={false} showRightMenu={true} />
            
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
                
                {/* 姓名區 */}
                <TouchableOpacity onPress={handleEditPress} style={styles.nameContainer} activeOpacity={0.7}>
                    <View style={styles.nameBox}>
                        <Text style={styles.nameText}>{name}</Text>
                    </View>
                </TouchableOpacity>

                {/* Email 顯示區塊 */}
                <View style={styles.emailContainer}>
                    <Text style={styles.emailText}>Ray123321@gmail.com</Text>
                </View>

                {/* 班級、學號、學院標籤區塊 */}
                <View style={styles.tagsContainer}>
                    <View style={styles.tagBadge}>
                        <Text style={styles.tagText}>數位科技設計學系</Text>
                    </View>
                    <View style={styles.tagBadge}>
                        <Text style={styles.tagText}>數位二甲</Text>
                    </View>
                    <View style={styles.tagBadge}>
                        <Text style={styles.tagText}>111319100</Text>
                    </View>
                </View>

                {/* 330px 設定選項容器 */}
                <View style={[styles.mainSettingsContainer, { backgroundColor: COLORS.settingsCardBg }]}>
                    <View style={[styles.settingRow, { marginTop: 20 }]}>
                        <View style={[styles.settingIconCircle, { backgroundColor: COLORS.darkModeIconBg }]}>
                            <Image 
                                source={{ uri: darkModeSvgData }} 
                                style={{ width: 28, height: 28, tintColor: COLORS.darkModeIcon }} 
                                contentFit="contain" 
                            />
                        </View>
                        <View style={styles.settingTextContainer}>
                            <Text style={styles.settingText}>深夜模式</Text>
                        </View>
                        <Switch 
                            value={isDarkMode} 
                            onValueChange={setIsDarkMode} 
                            style={styles.settingSwitch}
                        />
                    </View>

                    {/* 其他四個一樣的選項 */}
                    {setingOptions.map((option, index) => (
                        <TouchableOpacity key={index} style={styles.settingRow} activeOpacity={0.7}>
                            <View style={[styles.settingIconCircle, { backgroundColor: COLORS.settingIconBg }]}>
                                <Image 
                                    source={{ uri: option.icon }} 
                                    style={{ width: 28, height: 28 }} 
                                    contentFit="contain" 
                                />
                            </View>
                            <View style={styles.settingTextContainer}>
                                <Text style={styles.settingText}>{option.title}</Text>
                            </View>
                            <Image 
                                source={{ uri: chevronForwardSvgData }} 
                                style={[styles.forwardIcon, { tintColor: COLORS.forwardIconColor }]} 
                                contentFit="contain" 
                            />
                        </TouchableOpacity>
                    ))}

                </View>

                {/* 登出獨立區域 */}
                <View style={[styles.mainSettingsContainer, { backgroundColor: COLORS.settingsCardBg, marginTop: 20, paddingBottom: 0 }]}>
                    <TouchableOpacity style={[styles.settingRow, { marginTop: 20, marginBottom: 20 }]} activeOpacity={0.7}>
                        <View style={[styles.settingIconCircle, { backgroundColor: COLORS.settingIconBg }]}>
                            <Image 
                                source={{ uri: logoutOption.icon }} 
                                style={{ width: 28, height: 28 }} 
                                contentFit="contain" 
                            />
                        </View>
                        <View style={styles.settingTextContainer}>
                            <Text style={styles.settingText}>{logoutOption.title}</Text>
                        </View>
                        <Image 
                            source={{ uri: chevronForwardSvgData }} 
                            style={[styles.forwardIcon, { tintColor: COLORS.forwardIconColor }]} 
                            contentFit="contain" 
                        />
                    </TouchableOpacity>
                </View>
                
            
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
        height: 'auto', // 讓內容撐開
        paddingBottom: 20, // 底部留點空間
        marginTop: 30,
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
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 290, // 從 310 改為 300，意即左右再往內各縮 5px
        height: 48, // 放大了圖像到 48
        marginTop: 40, // 加大間距（原為 20）
        alignSelf: 'center', // 置中於 330px 的方格內
    },
    settingIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 24, // 變成圓形
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingTextContainer: {
        height: 30,
        marginLeft: 10,
        justifyContent: 'center',
    },
    settingText: {
        fontSize: 16, // 從 16 變成 24
        color: '#000000', // 可在 theme 設定
    },
    settingSwitch: {
        marginLeft: 'auto', // 推到最右邊
        alignSelf: 'center', // 強制垂直置中
        transform: [{ scale: 0.9 }], // 將 0.8 改成 0.95 放大一點
    },    forwardIcon: {
        marginLeft: 'auto', // 把箭頭推到最右邊
        width: 24,
        height: 24,
        alignSelf: 'center',
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