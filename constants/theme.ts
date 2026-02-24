export const Colors = {
  primary: '#1565C0',
  primaryLight: '#1976D2',
  primaryDark: '#0D47A1',
  accent: '#29B6F6',
  bg: '#F0F4F8',
  text: '#1A237E',
  textLight: '#546E7A',
  success: '#2E7D32',
  white: '#FFFFFF',
  border: '#E3EAF2',
  inputBg: '#F8FAFF',
  warning: '#F57F17',
  danger: '#C62828',
  cavBg: '#0D0D1A',
  cavCard: '#141428',
  cavBorder: '#2D2D4E',
  cavText: '#E0E0FF',
  cavPurple: '#A78BFA',
  cavBlue: '#60A5FA',
};

export const METAS_FIXAS_DEFAULT = [
  { id: 'f1', texto: 'Tomar medicação', done: false, tipo: 'fixa', prioridade: 'alta' },
  { id: 'f2', texto: 'Beber 2L de água', done: false, tipo: 'fixa', prioridade: 'media' },
  { id: 'f3', texto: 'Fazer 30min de exercício', done: false, tipo: 'fixa', prioridade: 'media' },
  { id: 'f4', texto: 'Dormir antes das 23h', done: false, tipo: 'fixa', prioridade: 'baixa' },
];

export const FASES_REMEDIO = [
  { min: 0, max: 60, titulo: '🌅 Absorção (0–1h)', cor: '#1565C0', desc: 'O remédio está sendo absorvido. Você pode não sentir efeito ainda. Evite refeições pesadas.' },
  { min: 60, max: 180, titulo: '📈 Início da ação (1–3h)', cor: '#1976D2', desc: 'O fármaco começa a agir. Leve aumento de alerta e melhora no foco. É normal sentir a boca seca.' },
  { min: 180, max: 300, titulo: '🚀 Pico terapêutico (3–5h)', cor: '#00897B', desc: 'Momento de maior eficácia. Aproveite para tarefas de alto foco. Concentração está no máximo.' },
  { min: 300, max: 480, titulo: '⚡ Ação plena (5–8h)', cor: '#2E7D32', desc: 'Plena ação. Foco sustentado. Lembre-se de se alimentar mesmo sem fome.' },
  { min: 480, max: 600, titulo: '📉 Declínio gradual (8–10h)', cor: '#F57F17', desc: 'O efeito começa a declinar. Leve retorno da agitação ou dificuldade de foco.' },
  { min: 600, max: 720, titulo: '🌙 Fase de rebote (10–12h)', cor: '#E65100', desc: 'Pode sentir irritabilidade leve, fome e retorno dos sintomas. Evite decisões importantes.' },
  { min: 720, max: Infinity, titulo: '⏹️ Efeito encerrado', cor: '#C62828', desc: 'O Venvanse completou sua duração. Descanse, alimente-se bem.' },
];

export const DUR_REMEDIO = 12 * 60; // minutos
export const POM_FOCO = 20 * 60;    // segundos
export const POM_PAUSA = 5 * 60;    // segundos
export const SESS_CICLO = 4;