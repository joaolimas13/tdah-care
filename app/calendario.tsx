import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';

function hojeISO(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const QUAL_MAP: Record<string, string> = { otima: '😊 Ótima', boa: '🙂 Boa', regular: '😐 Regular', ruim: '😔 Ruim', pessima: '😫 Péssima' };

export default function CalendarioScreen() {
  const { state } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  function changeMonth(delta: number) {
    setCurrentDate(d => {
      const nd = new Date(d);
      nd.setMonth(nd.getMonth() + delta);
      return nd;
    });
    setSelectedDay(null);
  }

  const yr = currentDate.getFullYear();
  const mo = currentDate.getMonth();
  const firstDay = new Date(yr, mo, 1).getDay();
  const daysInMonth = new Date(yr, mo + 1, 0).getDate();
  const prevLast = new Date(yr, mo, 0).getDate();
  const monthLabel = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const hoje = hojeISO();
  const dd = selectedDay ? state.dailyData[selectedDay] : null;

  function buildISO(day: number) {
    return `${yr}-${String(mo + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  const cells: { day: number; iso?: string; type: 'prev' | 'curr' | 'next' }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevLast - i, type: 'prev' });
  for (let i = 1; i <= daysInMonth; i++) cells.push({ day: i, iso: buildISO(i), type: 'curr' });
  const rem = 42 - cells.length;
  for (let i = 1; i <= rem; i++) cells.push({ day: i, type: 'next' });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🗓️ Histórico Diário</Text>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={styles.card}>
          <View style={styles.calNav}>
            <TouchableOpacity onPress={() => changeMonth(-1)} style={{ padding: 8 }}>
              <Text style={{ fontSize: 22, color: '#1565C0' }}>◀</Text>
            </TouchableOpacity>
            <Text style={styles.monthLabel}>{monthLabel}</Text>
            <TouchableOpacity onPress={() => changeMonth(1)} style={{ padding: 8 }}>
              <Text style={{ fontSize: 22, color: '#1565C0' }}>▶</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.grid}>
            {DIAS_SEMANA.map(d => (
              <View key={d} style={styles.dayHeader}>
                <Text style={styles.dayHeaderText}>{d}</Text>
              </View>
            ))}
          </View>
          <View style={styles.grid}>
            {cells.map((cell, i) => {
              if (cell.type !== 'curr') {
                return <View key={i} style={styles.dayCell}><Text style={styles.dayInactive}>{cell.day}</Text></View>;
              }
              const isToday = cell.iso === hoje;
              const isSel = cell.iso === selectedDay;
              const data = state.dailyData[cell.iso!];
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.dayCell, styles.dayCellActive, isToday && styles.dayCellToday, isSel && styles.dayCellSel]}
                  onPress={() => setSelectedDay(cell.iso!)}
                >
                  <Text style={[styles.dayNum, isSel && { color: '#fff' }]}>{cell.day}</Text>
                  {data && data.sono && data.sono[0] && (
                    <Text style={{ fontSize: 7, color: data.sono[0].horas >= 7 ? '#2E7D32' : '#F57F17' }}>
                      😴{data.sono[0].horas}h
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {selectedDay && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {new Date(selectedDay + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
            {!dd ? (
              <Text style={{ color: '#546E7A', textAlign: 'center', padding: 10 }}>Nenhum dado registrado.</Text>
            ) : (
              <View>
                {dd.sono && dd.sono[0] && (
                  <View style={styles.relSec}>
                    <Text style={styles.relSecTitle}>😴 Sono</Text>
                    <Row label="Horas" value={`${dd.sono[0].horas}h`} />
                    <Row label="Qualidade" value={QUAL_MAP[dd.sono[0].qualidade] || dd.sono[0].qualidade} />
                  </View>
                )}
                {dd.pom && dd.pom.sessoes > 0 && (
                  <View style={[styles.relSec, { borderLeftColor: '#7C3AED' }]}>
                    <Text style={styles.relSecTitle}>🏔️ Caverna</Text>
                    <Row label="Sessões" value={String(dd.pom.sessoes)} />
                    <Row label="Foco total" value={`${dd.pom.minFoco}min`} />
                  </View>
                )}
                {dd.celular && (
                  <View style={[styles.relSec, { borderLeftColor: '#F57F17' }]}>
                    <Text style={styles.relSecTitle}>📱 Tela</Text>
                    <Row label="Tempo" value={`${dd.celular.horas}h ${dd.celular.minutos}min`} />
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' }}>
      <Text style={{ fontSize: 14, color: '#546E7A', flex: 1 }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '700', color: '#1A237E' }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0F4F8' },
  header: { backgroundColor: '#0D47A1', padding: 20 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  scroll: { flex: 1, padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 3 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#1A237E', marginBottom: 16 },
  calNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  monthLabel: { fontSize: 16, fontWeight: '700', color: '#1A237E', textTransform: 'capitalize' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayHeader: { width: '14.28%', paddingBottom: 8, alignItems: 'center' },
  dayHeaderText: { fontSize: 10, color: '#546E7A', textTransform: 'uppercase' },
  dayCell: { width: '14.28%', minHeight: 48, padding: 4, alignItems: 'center' },
  dayCellActive: { borderRadius: 8, backgroundColor: '#F8FAFF' },
  dayCellToday: { borderWidth: 2, borderColor: '#1565C0', backgroundColor: '#EEF2FF' },
  dayCellSel: { backgroundColor: '#1565C0' },
  dayNum: { fontSize: 14, fontWeight: '600', color: '#1A237E' },
  dayInactive: { fontSize: 14, color: '#B0BEC5' },
  relSec: { backgroundColor: '#F8FAFF', borderRadius: 14, padding: 14, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#1565C0' },
  relSecTitle: { fontSize: 14, fontWeight: '700', color: '#1565C0', marginBottom: 8 },
});