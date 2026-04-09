import { Ionicons } from '@expo/vector-icons'; // 使用已經安裝的 vector-icons 來暫代 SVG
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../styles/theme';

const menuSvgData = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMyAxOFYxNkgyMVYxOEgzWk0zIDEzVjExSDIxVjEzSDNaTTMgOFY2SDIxVjhIM1oiIGZpbGw9IiM3MTRDMEYiLz48L3N2Zz4=";

interface TopNavBarProps {
    title?: string;
    showMenu?: boolean;
    showInfo?: boolean;
    showRightMenu?: boolean;
}

const TopNavBar: React.FC<TopNavBarProps> = ({ title = '選課', showMenu = true, showInfo = true, showRightMenu = false }) => {
    return (
        <View style={styles.container}>
            {/* 最左邊：Menu 圖示 (24x24, 純黑色) */}
            {showMenu ? (
                <TouchableOpacity activeOpacity={0.7}>
                    <Ionicons name="menu" size={24} color={COLORS.navBarIcon} />
                </TouchableOpacity>
            ) : (
                <View style={{ width: 24 }} /> /* 佔位用，確保右側圖示不會跑版 */
            )}

            {/* 中間：Container (寬度 100, 高度 24) 包含文字 */}
            <View style={styles.centerContainer}>
                <Text style={styles.centerText}>{title}</Text>
            </View>

            {/* 最右邊：Notifications, Info, Menu 圖示 */}
            <View style={styles.rightContainer}>
                {showInfo && (
                    <TouchableOpacity activeOpacity={0.7} style={styles.iconMargin}>
                        <Ionicons name="information-circle-outline" size={24} color={COLORS.navBarIcon} />
                    </TouchableOpacity>
                )}
                <TouchableOpacity activeOpacity={0.7} style={showRightMenu ? styles.iconMargin : undefined}>
                    <Ionicons name="notifications-outline" size={24} color={COLORS.navBarIcon} />
                </TouchableOpacity>
                {showRightMenu && (
                    <TouchableOpacity activeOpacity={0.7}>
                        <Image source={{ uri: menuSvgData }} style={{ width: 24, height: 24, tintColor: COLORS.navBarIcon }} contentFit="contain" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%', // 跟手機一樣寬
        height: 35,    // 高度 35
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20, // 左右留點邊距
        backgroundColor: 'transparent',
        marginTop: 8, // 讓導覽列往下一點
    },
    centerContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,    
        right: 0,    
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: -1, // 避免覆蓋到兩側的按鈕點擊
    },
    centerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.navBarText, // 統一由 theme.ts 控管顏色
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconMargin: {
        marginRight: 15,
    },
});

export default TopNavBar;
