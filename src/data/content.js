export const navigation = [
  { label: 'A academia', to: '/sobre' },
  { label: 'Modalidades', to: '/modalidades' },
  { label: 'Planos', to: '/planos' },
]

export const classes = [
  {
    number: '01',
    name: 'Musculação',
    summary: 'Equipamentos completos, orientação por perto e treino no seu ritmo.',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1000&q=85',
    alt: 'Pessoa treinando com pesos em uma academia',
    tag: 'Força',
  },
  {
    number: '02',
    name: 'Funcional',
    summary: 'Movimentos que levam mais disposição para tudo o que acontece fora daqui.',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1000&q=85',
    alt: 'Atleta fazendo exercício funcional',
    tag: 'Energia',
  },
  {
    number: '03',
    name: 'Ritmos',
    summary: 'Música alta, coreografias leves e aquela hora que passa voando.',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=85',
    alt: 'Turma em aula coletiva de movimento',
    tag: 'Coletivo',
  },
  {
    number: '04',
    name: 'Alongamento',
    summary: 'Um espaço para desacelerar, ganhar mobilidade e cuidar do corpo inteiro.',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=85',
    alt: 'Pessoa praticando alongamento em um estúdio',
    tag: 'Equilíbrio',
  },
]

export const plans = [
  {
    name: 'Essencial',
    price: '89',
    description: 'Seu começo, do seu jeito.',
    features: ['Musculação livre', 'Avaliação inicial', 'Acesso em horário comercial'],
  },
  {
    name: 'Completo',
    price: '119',
    description: 'Mais possibilidades na sua semana.',
    features: ['Musculação livre', 'Todas as aulas coletivas', 'Avaliação a cada 90 dias', 'Acesso todos os dias'],
    featured: true,
  },
  {
    name: 'Dupla',
    price: '99',
    description: 'Treinar junto também conta.',
    features: ['Tudo do plano Completo', 'Valor especial para duas pessoas', 'Convide alguém para treinar'],
  },
]

export const schedule = [
  { day: 'Segunda a sexta', hours: '06h às 22h' },
  { day: 'Sábado', hours: '08h às 14h' },
  { day: 'Domingo e feriados', hours: 'Fechado' },
]