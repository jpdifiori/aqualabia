import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, usePathname, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GlobalHeader } from '@/components/GlobalHeader';
import { View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkNavigation() {
      if (isLoading) return;

      if (!session) {
        // 1. Unauthenticated users: Redirect if not on a public route
        const publicRoutes = ['/landing', '/(auth)/login', '/(auth)/signup', '/login', '/signup'];
        if (!publicRoutes.includes(pathname)) {
          console.log("🔒 Guard: Redirecting unauthenticated user to /landing");
          router.replace('/landing');
        }
        return;
      }

      // 2. Authenticated users: Only force redirect if on a public-only route or root
      const publicOnlyRoutes = ['/landing', '/(auth)/login', '/(auth)/signup', '/login', '/signup', '/', '/(tabs)'];
      const isPublicOnly = publicOnlyRoutes.includes(pathname);
      const isRoot = pathname === '/';

      if (!isPublicOnly && !isRoot) {
        return;
      }

      try {
        const { data: pools, error } = await supabase
          .from('pools')
          .select('id')
          .eq('user_id', session.user.id)
          .limit(1);

        if (error) {
          console.error("Layout Navigation Error:", error.message);
          return;
        }

        const hasPool = pools && pools.length > 0;

        if (!hasPool && !pathname.includes('onboarding')) {
          console.log("⚠️ Guard: Missing pool, redirecting to onboarding");
          router.replace('/onboarding/pool-setup');
        } else if (hasPool && (isPublicOnly || isRoot)) {
          console.log("🏠 Guard: Logged in, redirecting to dashboard");
          router.replace('/(tabs)');
        }
      } catch (err) {
        console.error("Critical Navigation Error:", err);
      }
    }

    checkNavigation();
  }, [session, isLoading, pathname]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          header: () => <GlobalHeader />,
          headerShown: true,
        }}
      >
        <Stack.Screen name="landing" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: true }} />
        <Stack.Screen name="onboarding" options={{ headerShown: true }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: true }} />
        <Stack.Screen name="profile" options={{ presentation: 'transparentModal', headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
