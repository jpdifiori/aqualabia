import { Stack } from 'expo-router';

export default function AnalysisLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false, // Root stack handles the global header
            }}
        >
            <Stack.Screen name="water" />
            <Stack.Screen name="strip" />
            <Stack.Screen name="recommendation" />
        </Stack>
    );
}
