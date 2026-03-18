import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useDispatch } from 'react-redux';
import { router } from 'expo-router';
import { apiFetch } from '../lib/api';
import { setAuth } from '../store/authSlice';

export default function LoginPage() {
  const dispatch = useDispatch();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    const u = username.trim();
    if (!u || !password) {
      setError('Please enter a username and password.');
      return;
    }

    setLoading(true);
    try {
      const data =
        mode === 'login'
          ? await apiFetch('/api/auth/login/', { body: { username: u, password } })
          : await apiFetch('/api/auth/register/', {
              body: { username: u, password, display_name: displayName.trim() || null },
            });

      dispatch(setAuth({ token: data.token, user: data.user }));
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 6 }}>
        Accountability
      </Text>
      <Text style={{ color: '#475569', marginBottom: 18 }}>
        {mode === 'login' ? 'Log in to continue' : 'Create your account'}
      </Text>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <Pressable
          onPress={() => setMode('login')}
          style={{
            flex: 1,
            borderWidth: 2,
            borderColor: mode === 'login' ? '#111827' : '#00000022',
            borderRadius: 10,
            paddingVertical: 10,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontWeight: '700' }}>Log in</Text>
        </Pressable>
        <Pressable
          onPress={() => setMode('register')}
          style={{
            flex: 1,
            borderWidth: 2,
            borderColor: mode === 'register' ? '#111827' : '#00000022',
            borderRadius: 10,
            paddingVertical: 10,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontWeight: '700' }}>Sign up</Text>
        </Pressable>
      </View>

      {mode === 'register' ? (
        <>
          <Text style={{ marginBottom: 6 }}>Display name (optional)</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="e.g. Sam"
            style={{
              borderWidth: 1,
              borderColor: '#00000022',
              padding: 12,
              borderRadius: 12,
              marginBottom: 12,
              backgroundColor: 'white',
            }}
          />
        </>
      ) : null}

      <Text style={{ marginBottom: 6 }}>Username</Text>
      <TextInput
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
        placeholder="username"
        style={{
          borderWidth: 1,
          borderColor: '#00000022',
          padding: 12,
          borderRadius: 12,
          marginBottom: 12,
          backgroundColor: 'white',
        }}
      />

      <Text style={{ marginBottom: 6 }}>Password</Text>
      <TextInput
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholder="password"
        style={{
          borderWidth: 1,
          borderColor: '#00000022',
          padding: 12,
          borderRadius: 12,
          marginBottom: 12,
          backgroundColor: 'white',
        }}
      />

      {error ? (
        <Text style={{ color: '#DC2626', marginBottom: 10 }}>{error}</Text>
      ) : null}

      <Pressable
        disabled={loading}
        onPress={handleSubmit}
        style={({ pressed }) => [
          {
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: 'center',
            backgroundColor: '#111827',
            opacity: loading ? 0.7 : 1,
          },
          pressed && !loading ? { opacity: 0.9 } : null,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ color: 'white', fontWeight: '700' }}>
            {mode === 'login' ? 'Log in' : 'Create account'}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

