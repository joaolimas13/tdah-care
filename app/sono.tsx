import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Colors } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { hojeISO } from '../utils/storage';

const QUALIDADES = [
  { value: 'otima', label: '😊 Ótima — Acordei muito descansado' },
  { value: 'boa', label: '🙂 Boa — Acordei bem' },
  { value: 'regular', label: '😐 Regular — Cansado mas ok' },
  { value: 'ruim', label: '😔 Ruim — Muito cansado' },
  { value: 'pessima', label: '😫 Péssima — Mal consegui dormir' },
];

const HOURS = [4, 5, 6, 7, 8, 9, 10, 11];

export default function SonoScreen() {
  const { state, setState, salvar } = useApp();
  const [horasSel, setHorasSel] = useState<number | null>(null);
  const [qualidade, setQualidade] = useState('boa');
  const [obs, setObs] = useState('');
  const [qualMenuOpen, setQualMenuOpen] = useState(false);

  function salvarSono() {
    if (state.currentDate !== hojeISO()) {
      Alert.alert('Atenção', 'Só é possível registrar sono para o dia atual.');
      return;
    }
    if (!horasSel) { Alert.alert('Atenção', 'Selecione quantas horas dormiu!'); return; }
    const registro = {
      data: new Date().toLocaleDateString('pt-BR'),
      horas: horasSel,
      qualidade,
      obs,
    };
    const novoSono = [registro, ...state.sono].slice(0, 7);
    setState(s => ({ ...s, sono: novoSono }));
    salvar({ sono: novoSono });
    setHorasSel(null);
    setObs('');
    Alert.alert('✅', 'Sono salvo!');
  }

  const qMap: Record<string, string> = {
    otima: '😊 Ótima', boa: '🙂 Boa', regular: '😐 Regular', ruim: '😔 Ruim', pessima: '😫 Péssima'
  };
  const badgeClass = (q: string) => ['otima', 'boa'].includes(q) ? styles.badgeOk : ['regular'].includes(q) ? styles.badgeWarn : styles.badgeBad;
  const badgeTextColor = (q: string) => ['otima', 'boa'].includes(q) ? Colors.success : ['regular'].includes(q) ? Colors.warning : Colors.danger;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>😴 Sono</Text>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Registro */}
        <View style={styles.card}>
          <View style={styles.sonoVisual}>
            <View style={styles.sonoCircle}>
              <Text style={styles.sonoHoras}>{horasSel ?? '—'}</Text>
              <Text style={styles.sonoLabel}>de sono</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sonoInfo}>Recomendado: <Text style={{ color: Colors.primary, fontWeight: '700' }}>7-9 horas</Text></Text>
              <Text style={{ fontSize: 13, color: Colors.textLight, marginTop: 6, lineHeight: 18 }}>
                Sono regular melhora foco e resposta ao medicamento.
              </Text>
            </View>
          </View>

          {/* Horas Grid */}
          <Text style={styles.label}>⏰ Quantas horas dormiu?</Text>
          <View style={styles.hoursGrid}>
            {HOURS.map(h => (
              <TouchableOpacity
                key={h}
                style={[styles.hourBtn, horasSel === h && styles.hourBtnSel]}
                onPress={() => setHorasSel(h)}
              >
                <Text style={[styles.hourBtnText, horasSel === h && { color: '#fff' }]}>{h}h</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 16 }}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Outro valor..."
              keyboardType="decimal-pad"
              onChangeText={val => {
                const n = parseFloat(val);
                if (!isNaN(n)) setHorasSel(n);
              }}
            />
            <Text style={{ color: Colors.textLight, fontSize: 14 }}>horas</Text>
          </View>

          {/* Qualidade */}
          <Text style={styles.label}>😴 Qualidade do sono</Text>
          <TouchableOpacity style={styles.select} onPress={() => setQualMenuOpen(!qualMenuOpen)}>
            <Text style={{ fontSize: 14, color: Colors.text }}>{qMap[qualidade]}</Text>
            <Text style={{ color: Colors.textLight }}>▾</Text>
          </TouchableOpacity>
          {qualMenuOpen && (
            <View style={styles.dropdown}>
              {QUALIDADES.map(q => (
                <TouchableOpacity
                  key={q.value}
                  style={[styles.dropdownItem, qualidade === q.value && { backgroundColor: '#EEF2FF' }]}
                  onPress={() => { setQualidade(q.value); setQualMenuOpen(false); }}
                >
                  <Text style={{ fontSize: 14, color: Colors.text }}>{q.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Observações */}
          <Text style={[styles.label, { marginTop: 16 }]}>📝 Observações (opcional)</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            placeholder="Ex: Acordei várias vezes..."
            multiline
            value={obs}
            onChangeText={setObs}
          />

          <TouchableOpacity style={[styles.btn, { marginTop: 16 }]} onPress={salvarSono}>
            <Text style={styles.btnText}>💾 Salvar Registro</Text>
          </TouchableOpacity>
        </View>

        {/* Histórico */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📅 Últimos registros</Text>
          {state.sono.length === 0 ? (
            <Text style={{ color: Colors.textLight, textAlign: 'center', padding: 10 }}>Nenhum registro ainda</Text>
          ) : (
            state.sono.map((r, i) => (
              <View key={i} style={styles.histItem}>
                <View>
                  <Text style={{ fontWeight: '700', fontSize: 14, color: Colors.text }}>{r.data}</Text>
                  <Text style={{ fontSize: 13, color: Colors.textLight }}>{qMap[r.qualidade]}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontWeight: '700', color: Colors.primary, fontSize: 16 }}>{r.horas}h</Text>
                  <View style={[styles.badge, badgeClass(r.qualidade)]}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: badgeTextColor(r.qualidade) }}>
                      {r.horas >= 7 ? 'OK' : 'Baixo'}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { backgroundColor: Colors.primaryDark, padding: 20 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  scroll: { flex: 1, padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  cardTitle: { fontSize: 12, color: Colors.textLight, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 },
  sonoVisual: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 16 },
  sonoCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  sonoHoras: { fontSize: 28, fontWeight: '800', color: '#fff' },
  sonoLabel: { fontSize: 10, color: 'rgba(255,255,255,0.85)' },
  sonoInfo: { fontSize: 14, color: Colors.textLight },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 6 },
  hoursGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 0 },
  hourBtn: { width: '22%', padding: 10, borderWidth: 2, borderColor: Colors.border, borderRadius: 10, backgroundColor: Colors.inputBg, alignItems: 'center' },
  hourBtnSel: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  hourBtnText: { fontSize: 14, fontWeight: '600', color: Colors.text },
  input: { borderWidth: 2, borderColor: Colors.border, borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: Colors.inputBg },
  select: { borderWidth: 2, borderColor: Colors.border, borderRadius: 10, padding: 12, backgroundColor: Colors.inputBg, flexDirection: 'row', justifyContent: 'space-between' },
  dropdown: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, backgroundColor: '#fff', marginTop: 4, overflow: 'hidden' },
  dropdownItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  btn: { backgroundColor: Colors.primary, borderRadius: 12, padding: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  histItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeOk: { backgroundColor: '#E8F5E9' },
  badgeWarn: { backgroundColor: '#FFF8E1' },
  badgeBad: { backgroundColor: '#FFEBEE' },
});