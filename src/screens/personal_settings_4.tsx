import { Platform, SafeAreaView, StatusBar, Text, View } from 'react-native';
import TopNavBar from '../navigation/TopNavBar';

export default function Comment() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FAF7ED', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
            <TopNavBar title="設定" />
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>設定</Text>
            </View>
        </SafeAreaView>
    );
}