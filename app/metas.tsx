import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Alterado
import { Colors } from '../constants/theme';
import type { Meta } from '../context/AppContext';
import { useApp } from '../context/AppContext';

const PRIO_COLORS: Record<string, string> = { alta: '#FFEBEE', media: '#FFF8E1', baixa: '#E8F5E9' };
const PRIO_TEXT: Record<string, string> = { alta: '#C62828', media: '#F57F17', baixa: '#2E7D32' };
const PRIO_LABEL: Record<string, string> = { alta: '🔴 Alta', media: '🟡 Média', baixa: '🟢 Baixa' };

export default function MetasScreen() {
  const { state, setState, salvar } = useApp();
  const [novaMetaTxt, setNovaMetaTxt] = useState('');
  const [tipoMeta, setTipoMeta] = useState<'diaria' | 'fixa'>('diaria');
  const [prioMeta, setPrioMeta] = useState<'alta' | 'media' | 'baixa'>('media');
  const [paginasInput, setPaginasInput] = useState('');
  const insets = useSafeAreaInsets(); // Adicionado

  const fixasDone = state.metasFixas.filter(m => m.done).length;
  const diariasDone = state.metas.filter(m => m.done).length;
  const tot = state.metasFixas.length + state.metas.length;
  const dn = fixasDone + diariasDone;
  const pct = tot > 0 ? Math.round((dn / tot) * 100) : 0;

  function adicionarMeta() {
    if (!novaMetaTxt.trim()) { Alert.alert('Atenção', 'Digite uma meta!'); return; }
    if (tipoMeta === 'fixa') {
      const novasFixas = [...state.metasFixas, { id: 'f' + Date.now(), texto: novaMetaTxt.trim(), done: false, tipo: 'fixa' as const, prioridade: prioMeta }];
      setState(s => ({ ...s, metasFixas: novasFixas }));
      salvar({ metasFixas: novasFixas });
    } else {
      const novasMetas = [...state.metas, { id: Date.now(), texto: novaMetaTxt.trim(), done: false, tipo: 'diaria' as const, prioridade: prioMeta }];
      setState(s => ({ ...s, metas: novasMetas }));
      salvar({ metas: novasMetas });
    }
    setNovaMetaTxt('');
  }

  function toggleMeta(id: any, isFixa: boolean) {
    if (isFixa) {
      const novasFixas = state.metasFixas.map(m => m.id === id ? { ...m, done: !m.done } : m);
      setState(s => ({ ...s, metasFixas: novasFixas }));
      salvar({ metasFixas: novasFixas });
    } else {
      const novasMetas = state.metas.map(m => m.id === id ? { ...m, done: !m.done } : m);
      setState(s => ({ ...s, metas: novasMetas }));
      salvar({ metas: novasMetas });
    }
  }

  function removerMeta(id: any, isFixa: boolean) {
    if (isFixa) {
      const novasFixas = state.metasFixas.filter(m => m.id !== id);
      setState(s => ({ ...s, metasFixas: novasFixas }));
      salvar({ metasFixas: novasFixas });
    } else {
      const novasMetas = state.metas.filter(m => m.id !== id);
      setState(s => ({ ...s, metas: novasMetas }));
      salvar({ metas: novasMetas });
    }
  }

  function salvarLeitura() {
    const val = parseInt(paginasInput);
    if (!val || val < 0) { Alert.alert('Atenção', 'Informe um número válido!'); return; }
    const novaLeitura = { paginas: val };
    setState(s => ({ ...s, leitura: novaLeitura }));
    salvar({ leitura: novaLeitura });
    Alert.alert('📚', 'Leitura registrada!');
  }

  const sortMetas = (arr: Meta[]) => [...arr].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const ord = { alta: 0, media: 1, baixa: 2 };
    return (ord[a.prioridade || 'media']) - (ord[b.prioridade || 'media']);
  });

  const renderMeta = (m: Meta, isFixa: boolean) => (
    <View key={String(m.id)} style={[styles.metaItem, m.done && styles.metaDone, { borderTopWidth: 2, borderTopColor: PRIO_COLORS[m.prioridade || 'media'] }]}>
      <TouchableOpacity style={[styles.metaCheck, m.done && styles.metaCheckDone]} onPress={() => toggleMeta(m.id, isFixa)}>
        {m.done && <Text style={{ color: '#fff', fontSize: 14 }}>✓</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={{ flex: 1 }} onPress={() => toggleMeta(m.id, isFixa)}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
          <Text style={[styles.metaTitulo, m.done && styles.metaTituloRiscado]}>{m.texto}</Text>
          <View style={[styles.prioTag, { backgroundColor: PRIO_COLORS[m.prioridade || 'media'] }]}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: PRIO_TEXT[m.prioridade || 'media'] }}>{PRIO_LABEL[m.prioridade || 'media']}</Text>
          </View>
          {isFixa && <Text style={{ fontSize: 10, color: Colors.textLight }}>📌</Text>}
        </View>
        <Text style={{ fontSize: 12, color: Colors.textLight }}>{m.done ? 'Concluída! 🎉' : 'Toque para concluir'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => removerMeta(m.id, isFixa)} style={{ padding: 4 }}>
        <Text style={{ color: '#B0BEC5', fontSize: 18 }}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}> {/* Alterado */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎯 Metas</Text>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Nova meta */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>➕ Nova meta</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Ex: Estudar 1h, Meditar..."
              value={novaMetaTxt}
              onChangeText={setNovaMetaTxt}
              returnKeyType="done"
              onSubmitEditing={adicionarMeta}
            />
            <TouchableOpacity style={styles.addBtn} onPress={adicionarMeta}>
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700' }}>+</Text>
            </TouchableOpacity>
          </View>
          {/* Tipo */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            {(['diaria', 'fixa'] as const).map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.tipoBtn, tipoMeta === t && styles.tipoBtnSel]}
                onPress={() => setTipoMeta(t)}
              >
                <Text style={[styles.tipoBtnText, tipoMeta === t && { color: '#fff' }]}>
                  {t === 'diaria' ? '📅 Diária' : '📌 Fixa'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Prioridade */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['alta', 'media', 'baixa'] as const).map(p => (
              <TouchableOpacity
                key={p}
                style={[styles.prioBtn, prioMeta === p && { backgroundColor: PRIO_COLORS[p], borderColor: PRIO_TEXT[p] }]}
                onPress={() => setPrioMeta(p)}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: PRIO_TEXT[p] }}>{PRIO_LABEL[p]}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={{ fontSize: 12, color: Colors.textLight, marginTop: 8 }}>
            📌 Fixas se repetem todo dia. 📅 Diárias somem à meia-noite.
          </Text>
        </View>

        {/* Lista de metas */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Metas de hoje</Text>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${pct}%` }]} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, marginTop: 6 }}>
            <Text style={{ fontSize: 13, color: Colors.textLight }}>{dn} concluídas</Text>
            <Text style={{ fontSize: 13, color: Colors.textLight }}>{pct}%</Text>
          </View>

          {state.metasFixas.length > 0 && (
            <>
              <View style={styles.secaoTitulo}>
                <Text style={{ fontWeight: '700', fontSize: 13, color: Colors.text }}>📌 Metas Fixas</Text>
                <View style={[styles.tag, { backgroundColor: '#E8EAF6' }]}>
                  <Text style={{ fontSize: 11, color: '#3949AB', fontWeight: '700' }}>se repetem todo dia</Text>
                </View>
              </View>
              {sortMetas(state.metasFixas).map(m => renderMeta(m, true))}
            </>
          )}

          {state.metas.length > 0 && (
            <>
              <View style={[styles.secaoTitulo, { marginTop: 12 }]}>
                <Text style={{ fontWeight: '700', fontSize: 13, color: Colors.text }}>📅 Metas Diárias</Text>
                <View style={[styles.tag, { backgroundColor: '#E8F5E9' }]}>
                  <Text style={{ fontSize: 11, color: '#2E7D32', fontWeight: '700' }}>somem amanhã</Text>
                </View>
              </View>
              {sortMetas(state.metas).map(m => renderMeta(m, false))}
            </>
          )}

          {state.metasFixas.length === 0 && state.metas.length === 0 && (
            <Text style={{ color: Colors.textLight, textAlign: 'center', padding: 16 }}>Nenhuma meta. Adicione acima!</Text>
          )}

          <TouchableOpacity style={styles.btnOutline} onPress={() => {
            const novasMetas = state.metas.filter(m => !m.done);
            setState(s => ({ ...s, metas: novasMetas }));
            salvar({ metas: novasMetas });
          }}>
            <Text style={{ color: Colors.primary, fontWeight: '700' }}>🗑️ Limpar diárias concluídas</Text>
          </TouchableOpacity>
        </View>

        {/* Páginas lidas */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📚 Páginas lidas hoje</Text>
          {state.leitura ? (
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.primary }}>📖 {state.leitura.paginas} páginas</Text>
                <View style={[styles.badge, state.leitura.paginas >= 20 ? styles.badgeOk : state.leitura.paginas >= 5 ? styles.badgeWarn : styles.badgeBad]}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: state.leitura.paginas >= 20 ? Colors.success : state.leitura.paginas >= 5 ? Colors.warning : Colors.danger }}>
                    {state.leitura.paginas >= 20 ? 'Ótimo' : state.leitura.paginas >= 5 ? 'Ok' : 'Baixo'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => { setState(s => ({ ...s, leitura: null })); salvar({ leitura: null }); setPaginasInput(''); }}>
                <Text style={{ color: Colors.textLight, fontSize: 13, marginTop: 8, textDecorationLine: 'underline' }}>Editar registro</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={{ fontSize: 13, color: Colors.textLight, marginBottom: 10 }}>Quantas páginas você leu hoje?</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Ex: 30"
                  keyboardType="numeric"
                  value={paginasInput}
                  onChangeText={setPaginasInput}
                />
                <TouchableOpacity style={styles.addBtn} onPress={salvarLeitura}>
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>💾</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Histórico */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📅 Histórico de metas</Text>
          {state.metasHist.length === 0 ? (
            <Text style={{ color: Colors.textLight, fontSize: 13, textAlign: 'center', padding: 10 }}>
              O histórico aparecerá aqui a partir de amanhã.
            </Text>
          ) : (
            state.metasHist.slice(0, 7).map((h: any, i: number) => {
              const pct = h.total > 0 ? Math.round((h.concluidas / h.total) * 100) : 0;
              const [y, mo, d] = h.data.split('-');
              const dataFmt = `${d}/${mo}/${y}`;
              return (
                <View key={i} style={styles.histCard}>
                  <View>
                    <Text style={{ fontWeight: '700', fontSize: 14, color: Colors.text }}>{dataFmt}</Text>
                    <Text style={{ fontSize: 13, color: Colors.textLight }}>{h.concluidas} de {h.total} metas concluídas</Text>
                  </View>
                  <View style={[styles.badge, pct >= 80 ? styles.badgeOk : pct >= 50 ? styles.badgeWarn : styles.badgeBad]}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: pct >= 80 ? Colors.success : pct >= 50 ? Colors.warning : Colors.danger }}>{pct}%</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Dica */}
        <View style={styles.card}>
          <View style={{ backgroundColor: '#FFF8E1', borderLeftWidth: 4, borderLeftColor: '#FFB300', borderRadius: 12, padding: 14 }}>
            <Text style={{ fontSize: 13, color: '#5D4037', lineHeight: 20 }}>
              <Text style={{ fontWeight: '700' }}>TDAH e metas: </Text>
              Divida tarefas grandes em passos pequenos. Cada ✅ libera dopamina!
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg }, // Alterado
  header: { backgroundColor: Colors.primaryDark, padding: 20 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  scroll: { flex: 1, padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  cardTitle: { fontSize: 12, color: Colors.textLight, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 },
  input: { borderWidth: 2, borderColor: Colors.border, borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: Colors.inputBg },
  addBtn: { backgroundColor: Colors.primary, borderRadius: 10, padding: 12, justifyContent: 'center', alignItems: 'center', minWidth: 48 },
  tipoBtn: { flex: 1, padding: 10, borderWidth: 2, borderColor: Colors.border, borderRadius: 10, alignItems: 'center', backgroundColor: Colors.inputBg },
  tipoBtnSel: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tipoBtnText: { fontSize: 13, fontWeight: '600', color: Colors.text },
  prioBtn: { flex: 1, padding: 8, borderWidth: 2, borderColor: Colors.border, borderRadius: 10, alignItems: 'center', backgroundColor: Colors.inputBg },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: Colors.inputBg, borderRadius: 12, marginBottom: 10 },
  metaDone: { backgroundColor: '#E8F5E9' },
  metaCheck: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: '#B0BEC5', alignItems: 'center', justifyContent: 'center' },
  metaCheckDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  metaTitulo: { fontSize: 14, fontWeight: '600', color: Colors.text },
  metaTituloRiscado: { textDecorationLine: 'line-through', color: Colors.textLight },
  prioTag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  secaoTitulo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  progressBg: { height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 4 },
  btnOutline: { borderWidth: 2, borderColor: Colors.primary, borderRadius: 12, padding: 12, alignItems: 'center', marginTop: 12 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeOk: { backgroundColor: '#E8F5E9' },
  badgeWarn: { backgroundColor: '#FFF8E1' },
  badgeBad: { backgroundColor: '#FFEBEE' },
  histCard: { backgroundColor: Colors.inputBg, borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
});
