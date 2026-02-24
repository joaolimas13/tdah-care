import AsyncStorage from '@react-native-async-storage/async-storage';

export async function salvarDados(key: string, value: any) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Erro ao salvar:', e);
  }
}

export async function carregarDados(key: string) {
  try {
    const val = await AsyncStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch (e) {
    console.error('Erro ao carregar:', e);
    return null;
  }
}

export async function removerDados(key: string) {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {}
}

export function hojeISO(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function fmtHora(d: Date | null) {
  if (!d || isNaN(d.getTime())) return '--:--';
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}