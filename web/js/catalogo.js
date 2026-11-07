// Lista de exercícios que o admin pode colocar nas planilhas, por grupo muscular.

const CATALOGO = {
  Peito: ['Supino reto', 'Supino inclinado', 'Supino declinado', 'Crucifixo com halteres', 'Crossover', 'Flexão de braço', 'Peck deck'],
  Costas: ['Puxada frontal', 'Barra fixa', 'Remada curvada', 'Remada baixa', 'Remada unilateral', 'Pulldown', 'Levantamento terra'],
  Pernas: ['Agachamento livre', 'Agachamento no Smith', 'Leg press', 'Cadeira extensora', 'Mesa flexora', 'Afundo', 'Passada', 'Panturrilha em pé'],
  'Glúteos': ['Elevação pélvica', 'Agachamento sumô', 'Cadeira abdutora', 'Coice na polia', 'Stiff'],
  Ombros: ['Desenvolvimento com halteres', 'Elevação lateral', 'Elevação frontal', 'Crucifixo inverso', 'Encolhimento'],
  'Bíceps': ['Rosca direta', 'Rosca alternada', 'Rosca martelo', 'Rosca scott', 'Rosca concentrada'],
  'Tríceps': ['Tríceps na polia', 'Tríceps testa', 'Tríceps francês', 'Mergulho no banco', 'Supino fechado'],
  'Abdômen': ['Abdominal supra', 'Abdominal infra', 'Prancha', 'Prancha lateral', 'Elevação de pernas', 'Abdominal na polia']
};

const EXERCICIOS = Object.entries(CATALOGO).flatMap(([grupo, nomes]) =>
  nomes.map(nome => ({ nome, grupo }))
);
