import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Meta {
  id: string | number;
  texto: string;
  done: boolean;
  tipo: 'fixa' | 'diaria';
  prioridade: 'alta' | 'media' | 'baixa';
}

export interface SonoRecord {
  data: string;
  horas: number;
  qualidade: string;
  obs: string;
}

export interface Remedio {
  horaRegistro: string;
}

export interface PomState {
  rodando: boolean;
  fase: 'foco' | 'pausa';
  seg: number;
  sessoes: number;
  ciclos: number;
  sessNoCiclo: number;
  minFoco: number;
  data: string;
}

export interface DailyData {
  sono: SonoRecord[];
  remedio: Remedio | null;
  metas: Meta[];
  metasFixas: Meta[];
  celular: { horas: number; minutos: number } | null;
  leitura: { paginas: number } | null;
  pom: { sessoes: number; ciclos: number; sessNoCiclo: number; minFoco: number; data: string } | null;
}

export interface AppState {
  dailyData: Record<string, DailyData>;
  currentDate: string;
  sono: SonoRecord[];
  remedio: Remedio | null;
  metas: Meta[];
  metasFixas: Meta[];
  metasHist: any[];
  celular: { horas: number; minutos: number } | null;
  leitura: { paginas: number } | null;
  pom: PomState;
}

interface AppContextType {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  salvar: (updates?: Partial<AppState>) => void;
  carregarDia: (dateISO: string) => void;
}

function hojeISO(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const METAS_FIXAS_DEFAULT: Meta[] = [
  { id: 'f1', texto: 'Tomar medicação', done: false, tipo: 'fixa', prioridade: 'alta' },
  { id: 'f2', texto: 'Beber 2L de água', done: false, tipo: 'fixa', prioridade: 'media' },
  { id: 'f3', texto: 'Fazer 30min de exercício', done: false, tipo: 'fixa', prioridade: 'media' },
  { id: 'f4', texto: 'Dormir antes das 23h', done: false, tipo: 'fixa', prioridade: 'baixa' },
];

const defaultPom: PomState = {
  rodando: false, fase: 'foco', seg: 20 * 60,
  sessoes: 0, ciclos: 0, sessNoCiclo: 0, minFoco: 0,
  data: hojeISO(),
};

const defaultState: AppState = {
  dailyData: {},
  currentDate: hojeISO(),
  sono: [],
  remedio: null,
  metas: [],
  metasFixas: METAS_FIXAS_DEFAULT.map(m => ({ ...m })),
  metasHist: [],
  celular: null,
  leitura: null,
  pom: { ...defaultPom },
};

const AppContext = createContext<AppContextType>({
  state: defaultState,
  setState: () => {},
  salvar: () => {},
  carregarDia: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const dailyRaw = await AsyncStorage.getItem('tdah_daily');
        const daily = dailyRaw ? JSON.parse(dailyRaw) : {};
        const mhistRaw = await AsyncStorage.getItem('tdah_mhist');
        const mhist = mhistRaw ? JSON.parse(mhistRaw) : [];
        const lastDate = await AsyncStorage.getItem('tdah_last_date');
        const mfRaw = await AsyncStorage.getItem('tdah_fixas');
        let metasFixas: Meta[] = mfRaw ? JSON.parse(mfRaw) : METAS_FIXAS_DEFAULT.map(m => ({ ...m }));
        const hoje = hojeISO();

        if (lastDate && lastDate !== hoje) {
          const prevData = daily[lastDate];
          if (prevData?.metas?.length > 0) {
            const entry = {
              data: lastDate,
              total: prevData.metas.length,
              concluidas: prevData.metas.filter((m: Meta) => m.done).length,
            };
            if (!mhist.find((h: any) => h.data === lastDate)) {
              mhist.unshift(entry);
              if (mhist.length > 60) mhist.splice(60);
            }
          }
          metasFixas = metasFixas.map((m: Meta) => ({ ...m, done: false }));
          await AsyncStorage.setItem('tdah_fixas', JSON.stringify(metasFixas));
        }

        const todayData = daily[hoje] || {};
        setState({
          dailyData: daily,
          currentDate: hoje,
          sono: todayData.sono || [],
          remedio: todayData.remedio || null,
          metas: todayData.metas || [],
          metasFixas,
          metasHist: mhist,
          celular: todayData.celular || null,
          leitura: todayData.leitura || null,
          pom: {
            ...defaultPom,
            sessoes: todayData.pom?.sessoes || 0,
            ciclos: todayData.pom?.ciclos || 0,
            sessNoCiclo: todayData.pom?.sessNoCiclo || 0,
            minFoco: todayData.pom?.minFoco || 0,
            data: hoje,
          },
        });
      } catch (e) {
        console.error(e);
      }
      setLoaded(true);
    }
    init();
  }, []);

  function salvar(updates?: Partial<AppState>) {
    setState(prev => {
      const merged = updates ? { ...prev, ...updates } : prev;
      const newDaily = {
        ...merged.dailyData,
        [merged.currentDate]: {
          sono: merged.sono,
          remedio: merged.remedio,
          metas: merged.metas,
          metasFixas: merged.metasFixas,
          celular: merged.celular,
          leitura: merged.leitura,
          pom: {
            sessoes: merged.pom.sessoes,
            ciclos: merged.pom.ciclos,
            sessNoCiclo: merged.pom.sessNoCiclo,
            minFoco: merged.pom.minFoco,
            data: merged.pom.data,
          },
        },
      };
      const finalState = { ...merged, dailyData: newDaily };
      AsyncStorage.setItem('tdah_daily', JSON.stringify(newDaily));
      AsyncStorage.setItem('tdah_mhist', JSON.stringify(merged.metasHist));
      AsyncStorage.setItem('tdah_fixas', JSON.stringify(merged.metasFixas));
      AsyncStorage.setItem('tdah_last_date', hojeISO());
      return finalState;
    });
  }

  function carregarDia(dateISO: string) {
    setState(prev => {
      const data = prev.dailyData[dateISO] || {};
      return {
        ...prev,
        currentDate: dateISO,
        sono: data.sono || [],
        remedio: data.remedio || null,
        metas: data.metas || [],
        celular: data.celular || null,
        leitura: data.leitura || null,
        pom: {
          ...defaultPom,
          sessoes: data.pom?.sessoes || 0,
          ciclos: data.pom?.ciclos || 0,
          sessNoCiclo: data.pom?.sessNoCiclo || 0,
          minFoco: data.pom?.minFoco || 0,
          data: dateISO,
        },
      };
    });
  }

  if (!loaded) return null;

  return (
    <AppContext.Provider value={{ state, setState, salvar, carregarDia }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}