import { Platform, SafeAreaView, StatusBar, Text, View } from 'react-native';
import TopNavBar from '../navigation/TopNavBar';

export default function Comment() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FAF7ED', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
            <TopNavBar title="課堂評論" />
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>評論頁面</Text>
            </View>
        </SafeAreaView>
    );
}