// Lista de exercícios que o admin pode colocar nas planilhas, por grupo muscular.
// Os nomes ficam salvos nas planilhas e nos registros: renomear um exercício separa o histórico antigo do novo.

const CATALOGO = {
  Peito: [
    'Supino reto', 'Supino inclinado', 'Supino declinado', 'Supino reto com halteres',
    'Supino inclinado com halteres', 'Supino na máquina', 'Crucifixo com halteres',
    'Crucifixo inclinado', 'Crossover', 'Crossover baixo', 'Peck deck', 'Flexão de braço',
    'Mergulho nas paralelas'
  ],
  Costas: [
    'Puxada frontal', 'Puxada com triângulo', 'Puxada supinada', 'Barra fixa', 'Pulldown',
    'Remada curvada', 'Remada cavalinho', 'Remada baixa', 'Remada unilateral',
    'Remada na máquina', 'Pullover na polia', 'Levantamento terra', 'Hiperextensão lombar'
  ],
  Pernas: [
    'Agachamento livre', 'Agachamento no Smith', 'Agachamento hack', 'Agachamento goblet',
    'Agachamento búlgaro', 'Leg press', 'Cadeira extensora', 'Mesa flexora',
    'Cadeira flexora', 'Afundo', 'Passada', 'Cadeira adutora', 'Panturrilha em pé',
    'Panturrilha sentada', 'Panturrilha no leg press'
  ],
  'Glúteos': [
    'Elevação pélvica', 'Ponte de glúteo', 'Agachamento sumô', 'Cadeira abdutora',
    'Coice na polia', 'Glúteo na máquina', 'Stiff', 'Levantamento terra romeno', 'Subida no banco'
  ],
  Ombros: [
    'Desenvolvimento com halteres', 'Desenvolvimento com barra', 'Desenvolvimento na máquina',
    'Desenvolvimento Arnold', 'Elevação lateral', 'Elevação lateral na polia', 'Elevação frontal',
    'Crucifixo inverso', 'Face pull', 'Remada alta', 'Encolhimento'
  ],
  'Bíceps': [
    'Rosca direta', 'Rosca com barra W', 'Rosca alternada', 'Rosca martelo', 'Rosca scott',
    'Rosca concentrada', 'Rosca inclinada', 'Rosca na polia'
  ],
  'Tríceps': [
    'Tríceps na polia', 'Tríceps corda', 'Tríceps unilateral na polia', 'Tríceps testa',
    'Tríceps francês', 'Tríceps coice', 'Mergulho no banco', 'Supino fechado'
  ],
  'Antebraço': ['Rosca punho', 'Rosca punho inversa', 'Rosca inversa', 'Caminhada do fazendeiro'],
  'Abdômen': [
    'Abdominal supra', 'Abdominal infra', 'Abdominal bicicleta', 'Abdominal oblíquo',
    'Abdominal na polia', 'Prancha', 'Prancha lateral', 'Elevação de pernas',
    'Elevação de pernas na barra', 'Roda abdominal', 'Giro russo'
  ]
};

// Exercícios que também trabalham outros grupos. Eles aparecem no filtro de cada um desses grupos.
// O grupo de cima (CATALOGO) continua sendo o principal; estes são os secundários.
const GRUPOS_EXTRAS = {
  // Pernas e glúteos andam juntos
  'Agachamento livre': ['Glúteos'],
  'Agachamento búlgaro': ['Glúteos'],
  'Afundo': ['Glúteos'],
  'Passada': ['Glúteos'],
  'Leg press': ['Glúteos'],
  'Stiff': ['Pernas'],
  'Levantamento terra romeno': ['Pernas'],
  'Agachamento sumô': ['Pernas'],
  'Subida no banco': ['Pernas'],
  'Elevação pélvica': ['Pernas'],
  'Cadeira abdutora': ['Pernas'],
  // Costas, lombar e posterior
  'Levantamento terra': ['Pernas', 'Glúteos'],
  'Hiperextensão lombar': ['Glúteos'],
  'Barra fixa': ['Bíceps'],
  'Puxada supinada': ['Bíceps'],
  // Ombros e parte de cima das costas
  'Remada alta': ['Costas'],
  'Encolhimento': ['Costas'],
  'Face pull': ['Costas'],
  'Crucifixo inverso': ['Costas'],
  // Peito e tríceps
  'Flexão de braço': ['Tríceps'],
  'Mergulho nas paralelas': ['Tríceps'],
  'Supino fechado': ['Peito'],
  // Braço e antebraço
  'Rosca martelo': ['Antebraço'],
  'Rosca inversa': ['Bíceps'],
  'Caminhada do fazendeiro': ['Costas']
};

const EXERCICIOS = Object.entries(CATALOGO).flatMap(([grupo, nomes]) =>
  nomes.map(nome => ({ nome, grupo, grupos: [grupo, ...(GRUPOS_EXTRAS[nome] ?? [])] }))
);
