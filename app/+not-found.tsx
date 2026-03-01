import Colors from '@/constants/colors';
import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Bulunamadı' }} />
            <View style={styles.container}>
                <Text style={styles.title}>Sayfa bulunamadı</Text>
                <Link href="/" style={styles.link}>
                    <Text style={styles.linkText}>Ana sayfaya dön</Text>
                </Link>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.background,
        padding: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '500' as const,
        color: Colors.textPrimary,
        marginBottom: 16,
    },
    link: {
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    linkText: {
        fontSize: 15,
        color: Colors.accent,
    },
});
