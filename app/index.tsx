import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Alterado
import { useApp } from '../context/AppContext';

const FASES_REMEDIO = [
  { min: 0, max: 60, titulo: '🌅 Absorção (0–1h)', cor: '#1565C0', desc: 'O remédio está sendo absorvido. Você pode não sentir efeito ainda.' },
  { min: 60, max: 180, titulo: '📈 Início da ação (1–3h)', cor: '#1976D2', desc: 'O fármaco começa a agir. Leve aumento de alerta e melhora no foco.' },
  { min: 180, max: 300, titulo: '🚀 Pico terapêutico (3–5h)', cor: '#00897B', desc: 'Momento de maior eficácia. Aproveite para tarefas de alto foco.' },
  { min: 300, max: 480, titulo: '⚡ Ação plena (5–8h)', cor: '#2E7D32', desc: 'Plena ação. Foco sustentado. Lembre-se de se alimentar mesmo sem fome.' },
  { min: 480, max: 600, titulo: '📉 Declínio gradual (8–10h)', cor: '#F57F17', desc: 'O efeito começa a declinar. Leve retorno da agitação.' },
  { min: 600, max: 720, titulo: '🌙 Fase de rebote (10–12h)', cor: '#E65100', desc: 'Pode sentir irritabilidade leve e fome. Evite decisões importantes.' },
  { min: 720, max: 99999, titulo: '⏹️ Efeito encerrado', cor: '#C62828', desc: 'O Venvanse completou sua duração. Descanse e alimente-se bem.' },
];

function pad(n: number) { return String(n).padStart(2, '0'); }
function fmtHora(d: Date) {
  if (!d || isNaN(d.getTime())) return '--:--';
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function HomeScreen() {
  const { state, setState, salvar } = useApp();
  const [horaInput, setHoraInput] = useState('');
  const [relatorioVisible, setRelatorioVisible] = useState(false);
  const [now, setNow] = useState(new Date());
  const insets = useSafeAreaInsets(); // Adicionado

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const hora = now.getHours();
  const greeting = hora < 12 ? 'Bom dia! 👋' : hora < 18 ? 'Boa tarde! 👋' : 'Boa noite! 👋';
  const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  // Remédio
  const remedio = state.remedio;
  let minPass = 0, pct = 0, minRest = 0;
  let horaEncerraTxt = '--:--', horaTomadaTxt = '--:--';
  let faseAtual = FASES_REMEDIO[0];

  if (remedio) {
    const hr = new Date(remedio.horaRegistro);
    minPass = Math.floor((now.getTime() - hr.getTime()) / 60000);
    pct = Math.min(100, (minPass / 720) * 100);
    minRest = Math.max(0, 720 - minPass);
    horaEncerraTxt = fmtHora(new Date(hr.getTime() + 720 * 60000));
    horaTomadaTxt = fmtHora(hr);
    faseAtual = FASES_REMEDIO.find(f => minPass >= f.min && minPass < f.max) || FASES_REMEDIO[FASES_REMEDIO.length - 1];
  }

  const hA = Math.floor(minPass / 60), mA = minPass % 60;
  const hR = Math.floor(minRest / 60), mR = minRest % 60;
  const remedioEncerrado = remedio && minRest <= 0;

  // Metas
  const metasFixas = state.metasFixas || [];
  const metas = state.metas || [];
  const dn = metasFixas.filter(m => m.done).length + metas.filter(m => m.done).length;
  const tot = metasFixas.length + metas.length;
  const pctMetas = tot > 0 ? Math.round((dn / tot) * 100) : 0;
  const ultimoSono = (state.sono || [])[0];
  const statRemedio = remedio ? (minRest > 0 ? `${hA}h` : 'Enc.') : '—';

  function registrarRemedio() {
    if (!horaInput) { Alert.alert('Atenção', 'Informe o horário! Ex: 08:30'); return; }
    const parts = horaInput.split(':');
    if (parts.length !== 2) { Alert.alert('Atenção', 'Use o formato HH:MM. Ex: 08:30'); return; }
    const hh = parseInt(parts[0]), mm = parseInt(parts[1]);
    if (isNaN(hh) || isNaN(mm)) { Alert.alert('Atenção', 'Horário inválido!'); return; }
    const n = new Date();
    const reg = new Date(n.getFullYear(), n.getMonth(), n.getDate(), hh, mm, 0);
    setState((s: any) => ({ ...s, remedio: { horaRegistro: reg.toISOString() } }));
    salvar({ remedio: { horaRegistro: reg.toISOString() } });
    setHoraInput('');
  }

  function resetarRemedio() {
    setState((s: any) => ({ ...s, remedio: null }));
    salvar({ remedio: null });
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}> {/* Alterado */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🧠 TDAH Care</Text>
          <Text style={styles.headerDate}>{dateStr}</Text>
        </View>
        <Text style={{ fontSize: 32 }}>👤</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.greeting}>
          <Text style={styles.greetingTitle}>{greeting}</Text>
          <Text style={styles.greetingSub}>Acompanhe seu dia com TDAH</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { icon: '😴', val: ultimoSono ? `${ultimoSono.horas}h` : '—', label: 'Sono' },
            { icon: '✅', val: `${dn}/${tot}`, label: 'Metas' },
            { icon: '💊', val: statRemedio, label: 'Remédio' },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={{ fontSize: 24 }}>{s.icon}</Text>
              <Text style={styles.statValue}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Remédio */}
        <View style={styles.remedioCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', color: '#1565C0', fontSize: 14 }}>💊 Venvanse (Lisdexanfetamina)</Text>
              <Text style={{ fontSize: 12, color: '#546E7A' }}>Duração: 12 horas</Text>
            </View>
            <View style={[styles.badge, remedioEncerrado ? { backgroundColor: '#FFF8E1' } : remedio ? { backgroundColor: '#E8F5E9' } : { backgroundColor: '#FFEBEE' }]}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: remedioEncerrado ? '#F57F17' : remedio ? '#2E7D32' : '#C62828' }}>
                {remedioEncerrado ? 'Encerrado' : remedio ? 'Ativo' : 'Não registrado'}
              </Text>
            </View>
          </View>

          {!remedio ? (
            <View>
              <Text style={{ fontSize: 13, color: '#546E7A', marginBottom: 10 }}>Registre o horário que tomou o remédio:</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Ex: 08:30"
                  value={horaInput}
                  onChangeText={setHoraInput}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
                <TouchableOpacity style={styles.btnPrimary} onPress={registrarRemedio}>
                  <Text style={styles.btnText}>💊 Tomei</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 13, color: '#546E7A' }}>Tomado às <Text style={{ fontWeight: '700', color: '#1A237E' }}>{horaTomadaTxt}</Text></Text>
                <Text style={{ fontSize: 13, color: '#546E7A' }}>Encerra às <Text style={{ fontWeight: '700', color: '#1A237E' }}>{horaEncerraTxt}</Text></Text>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, {
                  width: `${pct}%`,
                  backgroundColor: pct < 40 ? '#1565C0' : pct < 75 ? '#1976D2' : pct < 100 ? '#F57F17' : '#C62828'
                }]} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                <Text style={{ fontSize: 12, color: '#546E7A' }}>{hA}h no organismo</Text>
                <Text style={{ fontSize: 12, color: '#546E7A' }}>{minRest > 0 ? `${hR}h restantes` : 'Efeito encerrado'}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <View style={[styles.statCard, { flex: 1 }]}>
                  <Text style={styles.statValue}>{hA}h {pad(mA)}min</Text>
                  <Text style={styles.statLabel}>Tempo ativo</Text>
                </View>
                <View style={[styles.statCard, { flex: 1 }]}>
                  <Text style={styles.statValue}>{minRest > 0 ? `${hR}h ${pad(mR)}min` : 'Encerrado'}</Text>
                  <Text style={styles.statLabel}>Tempo restante</Text>
                </View>
              </View>
              <View style={[styles.faseBox, { borderLeftColor: faseAtual.cor }]}>
                <Text style={[styles.faseTitulo, { color: faseAtual.cor }]}>{faseAtual.titulo}</Text>
                <Text style={styles.faseDesc}>{faseAtual.desc}</Text>
              </View>
              {remedioEncerrado && (
                <View style={styles.avisoEncerrado}>
                  <Text style={{ color: '#F57F17', fontWeight: '700', fontSize: 14, marginBottom: 8 }}>⚠️ Efeito encerrado</Text>
                  <Text style={{ fontSize: 13, color: '#5D4037', lineHeight: 20 }}>
                    O Venvanse completou suas 12h. É normal sentir cansaço e retorno da fome.{'\n\n'}
                    💡 Evite tarefas de alto foco agora. Descanse e alimente-se bem.
                  </Text>
                </View>
              )}
              <TouchableOpacity style={styles.btnDanger} onPress={resetarRemedio}>
                <Text style={{ color: '#EF5350', fontWeight: '700', fontSize: 13 }}>🔄 Registrar nova dose</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Progresso */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Progresso de hoje</Text>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${pctMetas}%` }]} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            <Text style={{ fontSize: 13, color: '#546E7A' }}>{dn} de {tot} metas concluídas</Text>
            <Text style={{ fontSize: 13, color: '#546E7A' }}>{pctMetas}%</Text>
          </View>
        </View>

        {/* Sono */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📅 Último sono registrado</Text>
          {ultimoSono ? (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontWeight: '700', color: '#1A237E' }}>{ultimoSono.data}</Text>
                <Text style={{ fontSize: 13, color: '#546E7A' }}>{ultimoSono.horas}h dormidas</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: ultimoSono.horas >= 7 ? '#E8F5E9' : '#FFEBEE' }]}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: ultimoSono.horas >= 7 ? '#2E7D32' : '#C62828' }}>
                  {ultimoSono.horas >= 7 ? 'OK' : 'Baixo'}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={{ color: '#546E7A', fontSize: 14, textAlign: 'center' }}>Nenhum registro ainda</Text>
          )}
        </View>

        <TouchableOpacity style={styles.relatorioBtn} onPress={() => setRelatorioVisible(true)}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>📊 Gerar Relatório do Dia</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={relatorioVisible} transparent animationType="slide" onRequestClose={() => setRelatorioVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setRelatorioVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            <ScrollView>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#1A237E', marginBottom: 4 }}>📊 Relatório do Dia</Text>
              <Text style={{ color: '#546E7A', fontSize: 13, marginBottom: 20 }}>
                {now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </Text>
              <View style={{ borderRadius: 14, padding: 20, alignItems: 'center', backgroundColor: '#1565C0', marginBottom: 16 }}>
                <Text style={{ fontSize: 36 }}>{pctMetas >= 80 ? '🏆' : pctMetas >= 60 ? '⭐' : '💪'}</Text>
                <Text style={{ fontSize: 44, fontWeight: '800', color: '#fff' }}>{pctMetas}%</Text>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>das metas concluídas</Text>
              </View>
              <View style={{ backgroundColor: '#F8FAFF', borderRadius: 14, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#1565C0' }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#1565C0', marginBottom: 10 }}>📋 Resumo</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' }}>
                  <Text style={{ color: '#546E7A' }}>😴 Sono</Text>
                  <Text style={{ fontWeight: '700', color: '#1A237E' }}>{ultimoSono ? `${ultimoSono.horas}h` : 'Não registrado'}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' }}>
                  <Text style={{ color: '#546E7A' }}>🎯 Metas</Text>
                  <Text style={{ fontWeight: '700', color: '#1A237E' }}>{dn}/{tot} ({pctMetas}%)</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' }}>
                  <Text style style={{ color: '#546E7A' }}>🏔️ Foco</Text>
                  <Text style={{ fontWeight: '700', color: '#1A237E' }}>{state.pom?.minFoco || 0}min</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
                  <Text style={{ color: '#546E7A' }}>💊 Remédio</Text>
                  <Text style={{ fontWeight: '700', color: '#1A237E' }}>{remedio ? '✅ Tomado' : 'Não registrado'}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.btnPrimary} onPress={() => setRelatorioVisible(false)}>
                <Text style={styles.btnText}>✕ Fechar</Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' }, // Alterado
  header: { backgroundColor: '#0D47A1', padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerDate: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },
  scroll: { flex: 1, padding: 16 },
  greeting: { borderRadius: 16, padding: 20, marginBottom: 16, backgroundColor: '#1565C0' },
  greetingTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 4 },
  greetingSub: { color: 'rgba(255,255,255,0.9)', fontSize: 14 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, alignItems: 'center', elevation: 3 },
  statValue: { fontSize: 16, fontWeight: '800', color: '#1565C0' },
  statLabel: { fontSize: 10, color: '#546E7A' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, elevation: 3 },
  cardTitle: { fontSize: 12, color: '#546E7A', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 },
  remedioCard: { borderRadius: 16, padding: 20, marginBottom: 16, backgroundColor: '#E3F2FD', borderWidth: 2, borderColor: '#BBDEFB' },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  input: { borderWidth: 2, borderColor: '#E3EAF2', borderRadius: 10, padding: 12, fontSize: 16, backgroundColor: '#F8FAFF' },
  btnPrimary: { backgroundColor: '#1565C0', borderRadius: 12, padding: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnDanger: { borderWidth: 2, borderColor: '#EF5350', borderRadius: 12, padding: 10, alignItems: 'center', marginTop: 8 },
  progressBg: { height: 14, backgroundColor: '#E3EAF2', borderRadius: 7, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#1565C0', borderRadius: 7 },
  faseBox: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginTop: 12, borderLeftWidth: 4 },
  faseTitulo: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  faseDesc: { fontSize: 13, color: '#546E7A', lineHeight: 20 },
  avisoEncerrado: { backgroundColor: '#FFF8E1', borderWidth: 2, borderColor: '#FFE082', borderRadius: 12, padding: 16, marginTop: 12 },
  relatorioBtn: { backgroundColor: '#1565C0', borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 24, maxHeight: '90%' },
});
