// Fotos que mostram a execução de cada exercício do catálogo.
// Vêm do Free Exercise DB (github.com/yuhonas/free-exercise-db), um banco de domínio público (Unlicense).
// Cada exercício tem duas fotos, o começo e o fim do movimento, que a janela alterna como um GIF.
// A versão fica fixa num commit para as fotos não mudarem de repente.

const ENDERECO_DEMONSTRACOES =
  'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5/exercises/';

// Nome no app → pasta no Free Exercise DB. Exercícios cadastrados pelo admin não têm fotos.
const DEMONSTRACOES = {
  'Supino reto': 'Barbell_Bench_Press_-_Medium_Grip',
  'Supino inclinado': 'Barbell_Incline_Bench_Press_-_Medium_Grip',
  'Supino declinado': 'Decline_Barbell_Bench_Press',
  'Supino reto com halteres': 'Dumbbell_Bench_Press',
  'Supino inclinado com halteres': 'Incline_Dumbbell_Press',
  'Supino na máquina': 'Machine_Bench_Press',
  'Crucifixo com halteres': 'Dumbbell_Flyes',
  'Crucifixo inclinado': 'Incline_Dumbbell_Flyes',
  'Crossover': 'Cable_Crossover',
  'Crossover baixo': 'Low_Cable_Crossover',
  'Peck deck': 'Butterfly',
  'Flexão de braço': 'Pushups',
  'Mergulho nas paralelas': 'Dips_-_Chest_Version',

  'Puxada frontal': 'Wide-Grip_Lat_Pulldown',
  'Puxada com triângulo': 'V-Bar_Pulldown',
  'Puxada supinada': 'Underhand_Cable_Pulldowns',
  'Barra fixa': 'Pullups',
  'Pulldown': 'Straight-Arm_Pulldown',
  'Remada curvada': 'Bent_Over_Barbell_Row',
  'Remada cavalinho': 'T-Bar_Row_with_Handle',
  'Remada baixa': 'Seated_Cable_Rows',
  'Remada unilateral': 'One-Arm_Dumbbell_Row',
  'Remada na máquina': 'Leverage_Iso_Row',
  'Pullover na polia': 'Rope_Straight-Arm_Pulldown',
  'Levantamento terra': 'Barbell_Deadlift',
  'Hiperextensão lombar': 'Hyperextensions_Back_Extensions',

  'Agachamento livre': 'Barbell_Full_Squat',
  'Agachamento no Smith': 'Smith_Machine_Squat',
  'Agachamento hack': 'Hack_Squat',
  'Agachamento goblet': 'Goblet_Squat',
  'Agachamento búlgaro': 'Split_Squat_with_Dumbbells',
  'Leg press': 'Leg_Press',
  'Cadeira extensora': 'Leg_Extensions',
  'Mesa flexora': 'Lying_Leg_Curls',
  'Cadeira flexora': 'Seated_Leg_Curl',
  'Afundo': 'Dumbbell_Lunges',
  'Passada': 'Barbell_Walking_Lunge',
  'Cadeira adutora': 'Thigh_Adductor',
  'Panturrilha em pé': 'Standing_Calf_Raises',
  'Panturrilha sentada': 'Seated_Calf_Raise',
  'Panturrilha no leg press': 'Calf_Press_On_The_Leg_Press_Machine',

  'Elevação pélvica': 'Barbell_Hip_Thrust',
  'Ponte de glúteo': 'Butt_Lift_Bridge',
  'Agachamento sumô': 'Plie_Dumbbell_Squat',
  'Cadeira abdutora': 'Thigh_Abductor',
  'Coice na polia': 'One-Legged_Cable_Kickback',
  'Glúteo na máquina': 'Glute_Kickback',
  'Stiff': 'Stiff-Legged_Barbell_Deadlift',
  'Levantamento terra romeno': 'Romanian_Deadlift',
  'Subida no banco': 'Dumbbell_Step_Ups',

  'Desenvolvimento com halteres': 'Dumbbell_Shoulder_Press',
  'Desenvolvimento com barra': 'Barbell_Shoulder_Press',
  'Desenvolvimento na máquina': 'Machine_Shoulder_Military_Press',
  'Desenvolvimento Arnold': 'Arnold_Dumbbell_Press',
  'Elevação lateral': 'Side_Lateral_Raise',
  'Elevação lateral na polia': 'Standing_Low-Pulley_Deltoid_Raise',
  'Elevação frontal': 'Front_Dumbbell_Raise',
  'Crucifixo inverso': 'Reverse_Flyes',
  'Face pull': 'Face_Pull',
  'Remada alta': 'Upright_Barbell_Row',
  'Encolhimento': 'Barbell_Shrug',

  'Rosca direta': 'Barbell_Curl',
  'Rosca com barra W': 'EZ-Bar_Curl',
  'Rosca alternada': 'Dumbbell_Alternate_Bicep_Curl',
  'Rosca martelo': 'Hammer_Curls',
  'Rosca scott': 'Preacher_Curl',
  'Rosca concentrada': 'Concentration_Curls',
  'Rosca inclinada': 'Incline_Dumbbell_Curl',
  'Rosca na polia': 'Standing_Biceps_Cable_Curl',

  'Tríceps na polia': 'Triceps_Pushdown',
  'Tríceps corda': 'Triceps_Pushdown_-_Rope_Attachment',
  'Tríceps unilateral na polia': 'Cable_One_Arm_Tricep_Extension',
  'Tríceps testa': 'EZ-Bar_Skullcrusher',
  'Tríceps francês': 'Standing_Dumbbell_Triceps_Extension',
  'Tríceps coice': 'Tricep_Dumbbell_Kickback',
  'Mergulho no banco': 'Bench_Dips',
  'Supino fechado': 'Close-Grip_Barbell_Bench_Press',

  'Rosca punho': 'Palms-Up_Barbell_Wrist_Curl_Over_A_Bench',
  'Rosca punho inversa': 'Palms-Down_Wrist_Curl_Over_A_Bench',
  'Rosca inversa': 'Reverse_Barbell_Curl',
  'Caminhada do fazendeiro': 'Farmers_Walk',

  'Abdominal supra': 'Crunches',
  'Abdominal infra': 'Reverse_Crunch',
  'Abdominal bicicleta': 'Air_Bike',
  'Abdominal oblíquo': 'Oblique_Crunches_-_On_The_Floor',
  'Abdominal na polia': 'Cable_Crunch',
  'Prancha': 'Plank',
  'Prancha lateral': 'Side_Bridge',
  'Elevação de pernas': 'Flat_Bench_Lying_Leg_Raise',
  'Elevação de pernas na barra': 'Hanging_Leg_Raise',
  'Roda abdominal': 'Ab_Roller',
  'Giro russo': 'Russian_Twist'
};

// As duas fotos do exercício, ou nenhuma se ele não estiver na lista.
function fotosDaDemonstracao(nome) {
  const pasta = DEMONSTRACOES[nome];
  return pasta ? [0, 1].map(numero => `${ENDERECO_DEMONSTRACOES}${pasta}/${numero}.jpg`) : [];
}
