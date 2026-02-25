import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Alterado
import { useApp } from '../context/AppContext';

function hojeISO(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const TABS = [
  { key: 'sono', label: '😴 Sono' },
  { key: 'eletrolitos', label: '💧 Eletrólitos' },
  { key: 'remedio', label: '💊 Medicação' },
  { key: 'estrategias', label: '🧠 Estratégias' },
  { key: 'mensal', label: '📈 Mensal' },
];

export default function InfoScreen() {
  const [activeTab, setActiveTab] = useState('sono');
  const { state } = useApp();
  const insets = useSafeAreaInsets(); // Adicionado

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}> {/* Alterado */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📚 Informações</Text>
      </View>
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && { color: '#fff' }]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 100 }}>
        {activeTab === 'sono' && <SonoInfo />}
        {activeTab === 'eletrolitos' && <EletroInfo />}
        {activeTab === 'remedio' && <RemedioInfo />}
        {activeTab === 'estrategias' && <EstrategiaInfo />}
        {activeTab === 'mensal' && <MensalInfo state={state} />}
      </ScrollView>
    </View>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoCardTitle}>{title}</Text>
      <Text style={styles.infoCardText}>{text}</Text>
    </View>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <View style={styles.tip}>
      <Text style={styles.tipText}>{text}</Text>
    </View>
  );
}

function SonoInfo() {
  return (
    <View>
      <InfoCard title="🌙 Por que o sono é crucial no TDAH?" text="Privação de sono agrava desatenção, impulsividade e regulação emocional — já comprometidas no TDAH." />
      <Tip text="✅ Recomendação: 7-9 horas com horários consistentes, mesmo nos fins de semana." />
      <InfoCard title="📱 Higiene do sono" text="Evite telas 1 hora antes de dormir. A luz azul inibe a melatonina. Crie rotina: banho morno, leitura leve, ambiente fresco." />
      <Tip text="⚠️ Atenção: Estimulantes tomados tarde dificultam o sono. Converse com seu médico." />
    </View>
  );
}

function EletroInfo() {
  return (
    <View>
      <InfoCard title="💧 Hidratação e TDAH" text="Desidratação leve (1-2%) já impacta concentração e memória — funções comprometidas no TDAH." />
      <Tip text="✅ Meta: 2-3 litros de água por dia." />
      <InfoCard title="🧂 Eletrólitos importantes" text="Magnésio: Reduz hiperatividade, melhora sono.\n\nZinco: Relacionado à síntese de dopamina.\n\nFerro: Deficiência agrava TDAH. Avalie com seu médico." />
      <Tip text="⚠️ Importante: Não inicie suplementação sem orientação médica." />
    </View>
  );
}

function RemedioInfo() {
  return (
    <View>
      <InfoCard title="💊 Venvanse — Como funciona" text="Pró-fármaco ativado no organismo. Início em 1-2h, pico entre 3-5h, duração total de até 12h." />
      <Tip text="✅ Horário ideal: Tome ao acordar. Consistência maximiza o efeito terapêutico." />
      <InfoCard title="🍽️ Alimentação e medicação" text="Estimulantes reduzem apetite. Tome café da manhã nutritivo ANTES da dose." />
      <Tip text="⚠️ Nunca ajuste doses sem consultar seu médico." />
      <InfoCard title="🌙 Rebote ao fim do efeito" text="Retorno dos sintomas, irritabilidade leve e fome são normais. Planeje atividades de menor demanda cognitiva para esse período." />
    </View>
  );
}

function EstrategiaInfo() {
  return (
    <View>
      <InfoCard title="⏱️ Modo Caverna — Pomodoro 20/5" text="20min de foco + 5min de pausa. Para TDAH, sessões mais curtas são mais eficazes. Após 4 sessões (1 ciclo), faça uma pausa maior." />
      <InfoCard title="📝 Body doubling" text="Estudar na presença de outra pessoa (mesmo virtual) aumenta foco no TDAH." />
      <Tip text="✅ Organização: Listas curtas de 3-5 itens. Muitas tarefas visíveis sobrecarregam." />
      <InfoCard title="🎵 Música e foco" text="Lo-fi, instrumentais ou ruído branco melhoram concentração. Evite letras em tarefas de leitura." />
    </View>
  );
}

function MensalInfo({ state }: any) {
  const today = new Date();
  let sonoTotal = 0, sonoN = 0, metasConcl = 0, metasTotal = 0, focoTotal = 0, focoN = 0, remedioN = 0, diasDados = 0;

  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = hojeISO(d);
    const dd = state.dailyData[iso];
    if (dd) {
      diasDados++;
      if (dd.sono && dd.sono[0]) { sonoTotal += dd.sono[0].horas; sonoN++; }
      const all = [...(dd.metas || []), ...(dd.metasFixas || [])];
      if (all.length > 0) { metasConcl += all.filter((m: any) => m.done).length; metasTotal += all.length; }
      if (dd.pom && dd.pom.minFoco > 0) { focoTotal += dd.pom.minFoco; focoN++; }
      if (dd.remedio) remedioN++;
    }
  }

  if (diasDados === 0) {
    return (
      <View style={styles.infoCard}>
        <Text style={{ color: '#546E7A', fontSize: 14, textAlign: 'center' }}>
          Registre dados diariamente para gerar o relatório mensal.
        </Text>
      </View>
    );
  }

  const avgSono = sonoN > 0 ? (sonoTotal / sonoN).toFixed(1) : null;
  const pctMetas = metasTotal > 0 ? Math.round((metasConcl / metasTotal) * 100) : null;
  const avgFoco = focoN > 0 ? Math.round(focoTotal / focoN) : null;
  const pctRemedio = Math.round((remedioN / diasDados) * 100);

  return (
    <View>
      <View style={styles.mensalHeader}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 4 }}>📋 Relatório Clínico</Text>
        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
          {today.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} · {diasDados} dias registrados
        </Text>
      </View>
      <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 3 }}>
        {avgSono && <MRow label="Média de sono" value={`${avgSono}h`} ok={parseFloat(avgSono) >= 7} />}
        {pctMetas !== null && <MRow label="Taxa de metas" value={`${pctMetas}%`} ok={pctMetas >= 70} />}
        {avgFoco !== null && <MRow label="Média de foco" value={`${avgFoco}min`} ok={avgFoco >= 40} />}
        <MRow label="Dias com medicação" value={`${remedioN}/${diasDados}`} ok={pctRemedio >= 70} />
      </View>
      <View style={styles.infoCard}>
        <Text style={{ fontSize: 13, color: '#546E7A', lineHeight: 22, fontStyle: 'italic' }}>
          ⚠️ Este relatório é informativo e não substitui avaliação profissional.
        </Text>
      </View>
    </View>
  );
}

function MRow({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EEF2F7', gap: 8 }}>
      <Text style={{ fontSize: 14, color: '#546E7A', flex: 1 }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '700', color: '#1A237E' }}>{value}</Text>
      <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, backgroundColor: ok ? '#E8F5E9' : '#FFF8E1' }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: ok ? '#2E7D32' : '#F57F17' }}>{ok ? 'Normal' : 'Atenção'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' }, // Alterado
  header: { backgroundColor: '#0D47A1', padding: 20 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 2, borderColor: '#E3EAF2', backgroundColor: '#fff', marginRight: 8 },
  tabActive: { backgroundColor: '#1565C0', borderColor: '#1565C0' },
  tabText: { fontSize: 13, color: '#1A237E', fontWeight: '500' },
  infoCard: { backgroundColor: '#F0F7FF', borderLeftWidth: 4, borderLeftColor: '#1565C0', borderRadius: 12, padding: 16, marginBottom: 12 },
  infoCardTitle: { fontSize: 15, fontWeight: '700', color: '#1565C0', marginBottom: 8 },
  infoCardText: { fontSize: 14, color: '#546E7A', lineHeight: 22 },
  tip: { backgroundColor: '#FFF8E1', borderLeftWidth: 4, borderLeftColor: '#FFB300', borderRadius: 12, padding: 14, marginBottom: 12 },
  tipText: { fontSize: 13, color: '#5D4037', lineHeight: 22 },
  mensalHeader: { borderRadius: 14, padding: 16, marginBottom: 12, backgroundColor: '#0D47A1' },
});
