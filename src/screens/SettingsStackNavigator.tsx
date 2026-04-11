import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import EditProfile from './EditProfile_4';
import PersonalSettings from './personal_settings_4';

export type SettingsStackParamList = {
    PersonalSettingsMain: undefined;
    EditProfile: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export default function SettingsStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="PersonalSettingsMain" component={PersonalSettings} />
            <Stack.Screen name="EditProfile" component={EditProfile} />
        </Stack.Navigator>
    );
}