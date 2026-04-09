import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import Credit_3 from './Credit_3';
import CreditDetail_3 from './CreditDetail_3';

const Stack = createNativeStackNavigator();

export default function CreditStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="CreditMain" component={Credit_3} />
            <Stack.Screen name="CreditDetail" component={CreditDetail_3} />
        </Stack.Navigator>
    );
}