import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import Credit_3 from './Credit_3';
import CreditDetailFlexible from './CreditDetail_Flexible';
import CreditDetailGeneral from './CreditDetail_General';
import CreditDetailMajor from './CreditDetail_Major';
import CreditDetailMust from './CreditDetail_Must';

const Stack = createNativeStackNavigator();

export default function CreditStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="CreditMain" component={Credit_3} />
            <Stack.Screen name="CreditDetailMust" component={CreditDetailMust} />
            <Stack.Screen name="CreditDetailGeneral" component={CreditDetailGeneral} />
            <Stack.Screen name="CreditDetailMajor" component={CreditDetailMajor} />
            <Stack.Screen name="CreditDetailFlexible" component={CreditDetailFlexible} />
        </Stack.Navigator>
    );
}