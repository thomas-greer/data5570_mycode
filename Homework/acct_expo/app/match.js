import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  View,
  Text,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'expo-router';
import CheckInButton from '../components/CheckInButton';
import { addCheckIn } from '../store/accountabilitySlice';
import { router } from 'expo-router';

export default function MatchPage() {
  const dispatch = useDispatch();
  const logScrollRef = useRef(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);

  const { displayName, category, targetPerWeek, partnerName, checkIns } =
    useSelector((state) => state.accountability);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    logScrollRef.current?.scrollToEnd?.({ animated: true });
  }, [checkIns.length, messages.length]);

  useEffect(() => {
    if (!token) router.replace('/login');
  }, [token]);

  const handleCheckIn = (result) => {
    const now = new Date();
    dispatch(
      addCheckIn({
        result,
        timestamp: now.toLocaleString(),
        iso: now.toISOString(),
      })
    );
  };

  const handleSendMessage = () => {
    const trimmed = messageText.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, text: trimmed, timestamp: new Date().toLocaleString() },
    ]);
    setMessageText('');
  };

  const calendar = useMemo(() => {
    const monthDate = new Date();
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth(); // 0-11

    const startOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startWeekday = startOfMonth.getDay(); // 0=Sun

    const toDateKey = (d) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    const dotColorForResult = (result) => {
      if (result === 'Did It') return '#16A34A';
      if (result === 'Partial') return '#F59E0B';
      if (result === 'Missed') return '#DC2626';
      return null;
    };

    const checkInByDay = {};
    for (const c of checkIns) {
      const d =
        (c?.iso && new Date(c.iso)) ||
        (c?.timestamp && new Date(c.timestamp)) ||
        (c?.date && new Date(c.date));
      if (!d || Number.isNaN(d.getTime())) continue;
      const key = toDateKey(d);
      checkInByDay[key] = c?.result;
    }

    const todayKey = toDateKey(new Date());

    const cells = [];
    for (let i = 0; i < startWeekday; i++) {
      cells.push({ type: 'empty', key: `e-${i}` });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const key = toDateKey(d);
      const result = checkInByDay[key] || null;
      cells.push({
        type: 'day',
        key,
        day,
        isToday: key === todayKey,
        dotColor: result ? dotColorForResult(result) : null,
      });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ type: 'empty', key: `t-${cells.length}` });
    }

    const title = monthDate.toLocaleString(undefined, { month: 'long', year: 'numeric' });
    return { title, cells };
  }, [checkIns]);

  const messageItems = useMemo(
    () =>
      messages.map((m) => ({
        key: `msg-${m.id}`,
        timestamp: m.timestamp,
        text: m.text,
      })),
    [messages]
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <View style={{ flex: 1, padding: 20 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 12 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={{ fontSize: 24, marginBottom: 10 }}>Your Match</Text>

          <Text>User: {displayName}</Text>
          <Text>Goal: {category}</Text>
          <Text>Target Per Week: {targetPerWeek}</Text>
          <Text>Partner: {partnerName}</Text>

          <Text style={{ marginTop: 20, marginBottom: 10 }}>Daily Check-In</Text>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <CheckInButton title="Did It" onPress={() => handleCheckIn('Did It')} />
            <CheckInButton title="Partial" onPress={() => handleCheckIn('Partial')} />
            <CheckInButton title="Missed" onPress={() => handleCheckIn('Missed')} />
          </View>

          <Text style={{ marginTop: 20, marginBottom: 8, fontWeight: '600' }}>
            {calendar.title}
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: '#00000022',
              borderRadius: 12,
              padding: 10,
              backgroundColor: '#FFFFFF',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
                <Text key={d} style={{ width: '14.2857%', textAlign: 'center', color: '#475569' }}>
                  {d}
                </Text>
              ))}
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {calendar.cells.map((cell) => (
                <View
                  key={cell.key}
                  style={{
                    width: '14.2857%',
                    paddingVertical: 6,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: cell.type === 'empty' ? 0 : 1,
                  }}
                >
                  {cell.type === 'day' ? (
                    <View style={{ alignItems: 'center' }}>
                      <View
                        style={[
                          {
                            minWidth: 26,
                            height: 26,
                            borderRadius: 8,
                            alignItems: 'center',
                            justifyContent: 'center',
                          },
                          cell.isToday && {
                            borderWidth: 1,
                            borderColor: '#11182733',
                            backgroundColor: '#F1F5F9',
                          },
                        ]}
                      >
                        <Text style={{ color: '#111827' }}>{cell.day}</Text>
                      </View>
                      <View
                        style={{
                          marginTop: 4,
                          width: 8,
                          height: 8,
                          borderRadius: 999,
                          backgroundColor: cell.dotColor || 'transparent',
                        }}
                      />
                    </View>
                  ) : (
                    <Text>{' '}</Text>
                  )}
                </View>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: '#16A34A' }} />
                <Text style={{ color: '#475569' }}>Did It</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: '#F59E0B' }} />
                <Text style={{ color: '#475569' }}>Partial</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: '#DC2626' }} />
                <Text style={{ color: '#475569' }}>Missed</Text>
              </View>
            </View>
          </View>

          <Text style={{ marginTop: 20, marginBottom: 8, fontWeight: '600' }}>
            Messages
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: '#00000022',
              borderRadius: 12,
              padding: 10,
              backgroundColor: '#F8FAFC',
              height: 260,
            }}
          >
            <ScrollView
              ref={logScrollRef}
              onContentSizeChange={() =>
                logScrollRef.current?.scrollToEnd?.({ animated: true })
              }
            >
              {messageItems.length === 0 ? (
                <Text style={{ color: '#475569' }}>No messages yet.</Text>
              ) : (
                messageItems.map((item) => (
                  <View
                    key={item.key}
                    style={{
                      alignSelf: 'flex-end',
                      backgroundColor: '#DCFCE7',
                      borderRadius: 12,
                      paddingVertical: 8,
                      paddingHorizontal: 10,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: '#16A34A33',
                      maxWidth: '85%',
                    }}
                  >
                    <Text style={{ fontSize: 12, color: '#475569', marginBottom: 2 }}>
                      You •{' '}
                      {item.timestamp}
                    </Text>
                    <Text style={{ fontSize: 16, color: '#111827' }}>{item.text}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>

          <Text style={{ marginTop: 20 }}>
            <Link href="/">Go Back</Link>
          </Text>
        </ScrollView>

        <View
          style={{
            paddingTop: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <TextInput
            value={messageText}
            onChangeText={setMessageText}
            placeholder={`Message ${partnerName || 'your match'}...`}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: '#00000022',
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              backgroundColor: 'white',
            }}
            returnKeyType="send"
            onSubmitEditing={handleSendMessage}
          />
          <View style={{ width: 80 }}>
            <Button title="Send" onPress={handleSendMessage} />
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
