import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
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
import { router } from 'expo-router';
import { fetchCheckIns, fetchMatchStatus, submitCheckIn } from '../store/matchThunks';

function buildCalendarCells(checkInByDay) {
  const monthDate = new Date();
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const startOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = startOfMonth.getDay();

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
}

function CalendarGrid({ cells }) {
  return (
    <View
      style={{
        flex: 1,
        minWidth: 150,
        borderWidth: 1,
        borderColor: '#00000022',
        borderRadius: 12,
        padding: 10,
        backgroundColor: '#FFFFFF',
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
          <Text key={d} style={{ width: '14.2857%', textAlign: 'center', color: '#475569', fontSize: 11 }}>
            {d}
          </Text>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((cell) => (
          <View
            key={cell.key}
            style={{
              width: '14.2857%',
              paddingVertical: 4,
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
                      minWidth: 22,
                      height: 22,
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
                  <Text style={{ color: '#111827', fontSize: 11 }}>{cell.day}</Text>
                </View>
                <View
                  style={{
                    marginTop: 2,
                    width: 6,
                    height: 6,
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
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: '#16A34A' }} />
          <Text style={{ color: '#475569', fontSize: 10 }}>Did</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: '#F59E0B' }} />
          <Text style={{ color: '#475569', fontSize: 10 }}>Partial</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: '#DC2626' }} />
          <Text style={{ color: '#475569', fontSize: 10 }}>Missed</Text>
        </View>
      </View>
    </View>
  );
}

export default function MatchPage() {
  const dispatch = useDispatch();
  const logScrollRef = useRef(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);

  const {
    displayName,
    category,
    targetPerWeek,
    partnerName,
    myCheckinsByDate,
    partnerCheckinsByDate,
  } = useSelector((state) => state.accountability);
  const token = useSelector((state) => state.auth.token);
  const authUser = useSelector((state) => state.auth.user);
  const lastAlertedPartnerRef = useRef(null);

  useEffect(() => {
    logScrollRef.current?.scrollToEnd?.({ animated: true });
  }, [messages.length]);

  useEffect(() => {
    if (!token) router.replace('/login');
  }, [token]);

  useEffect(() => {
    if (!token || !category) return;

    const poll = () => {
      dispatch(fetchMatchStatus({ token }));
      dispatch(fetchCheckIns({ token }));
    };

    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [token, category, dispatch]);

  useEffect(() => {
    if (!partnerName) return;
    if (partnerName === 'Searching...') return;
    if (lastAlertedPartnerRef.current === partnerName) return;

    lastAlertedPartnerRef.current = partnerName;
    Alert.alert('You have a match!', `You're paired with ${partnerName}.`);
  }, [partnerName]);

  const STATUS_API = {
    'Did It': 'did_it',
    Partial: 'partial',
    Missed: 'missed',
  };

  const handleCheckIn = (result) => {
    if (!token) return;
    const status = STATUS_API[result];
    if (!status) return;
    dispatch(submitCheckIn({ token, status }));
  };

  const youCalendar = useMemo(
    () => buildCalendarCells(myCheckinsByDate || {}),
    [myCheckinsByDate]
  );
  const partnerCalendar = useMemo(
    () => buildCalendarCells(partnerCheckinsByDate || {}),
    [partnerCheckinsByDate]
  );

  const youLabel = authUser?.username || 'You';
  const partnerLabel =
    partnerName && partnerName !== 'Searching...' ? partnerName : 'Partner';

  const handleSendMessage = () => {
    const trimmed = messageText.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, text: trimmed, timestamp: new Date().toLocaleString() },
    ]);
    setMessageText('');
  };

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
            {youCalendar.title}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <View style={{ flex: 1, minWidth: 150 }}>
              <Text style={{ marginBottom: 6, fontWeight: '600', color: '#334155' }}>{youLabel}</Text>
              <CalendarGrid cells={youCalendar.cells} />
            </View>
            <View style={{ flex: 1, minWidth: 150 }}>
              <Text style={{ marginBottom: 6, fontWeight: '600', color: '#334155' }}>{partnerLabel}</Text>
              <CalendarGrid cells={partnerCalendar.cells} />
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
