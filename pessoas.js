// Pessoas de referência — uma é sorteada cada vez que a página abre ou o humano é ligado.
// Fotos genéricas de PNGimg.com (licença CC BY-NC 4.0: uso não comercial, com crédito).
// "altura" é a altura aproximada de cada pessoa (adultos ~1,60–1,85 m; crianças menos).
// Para adicionar a sua: coloque o PNG (fundo transparente, corpo inteiro) na pasta "pessoas"
// e acrescente uma linha aqui.
const PESSOAS = [
  { arquivo: "pessoas/pessoa1.png", altura: 1.75 },
  { arquivo: "https://pngimg.com/uploads/man/man_PNG6532.png", altura: 1.8 },
  { arquivo: "https://pngimg.com/uploads/man/man_PNG6524.png", altura: 1.8 },
  { arquivo: "https://pngimg.com/uploads/man/man_PNG6523.png", altura: 1.75 },
  { arquivo: "https://pngimg.com/uploads/man/man_PNG6506.png", altura: 1.82 },
  { arquivo: "https://pngimg.com/uploads/man/man_PNG6504.png", altura: 1.78 },
  { arquivo: "https://pngimg.com/uploads/businessman/businessman_PNG6586.png", altura: 1.8 },
  { arquivo: "https://pngimg.com/uploads/businessman/businessman_PNG6580.png", altura: 1.83 },
  { arquivo: "https://pngimg.com/uploads/girls/girls_PNG6494.png", altura: 1.65 },
  { arquivo: "https://pngimg.com/uploads/girls/girls_PNG6436.png", altura: 1.63 },
  { arquivo: "https://pngimg.com/uploads/children/children_PNG18069.png", altura: 1.35 },
  { arquivo: "https://pngimg.com/uploads/children/children_PNG18034.png", altura: 1.3 },
  { arquivo: "https://pngimg.com/uploads/children/children_PNG18005.png", altura: 1 },
  { arquivo: "https://pngimg.com/uploads/children/children_PNG17972.png", altura: 1.15 },
  { arquivo: "https://pngimg.com/uploads/student/student_PNG24.png", altura: 1.58 },
  { arquivo: "https://pngimg.com/uploads/teacher/teacher_PNG94.png", altura: 1.76 },
  { arquivo: "https://pngimg.com/uploads/teacher/teacher_PNG92.png", altura: 1.64 },
  { arquivo: "https://pngimg.com/uploads/teacher/teacher_PNG40.png", altura: 1.62 },
  { arquivo: "https://pngimg.com/uploads/teacher/teacher_PNG19.png", altura: 1.66 },
  { arquivo: "https://pngimg.com/uploads/doctor/doctor_PNG16024.png", altura: 1.64 },
  { arquivo: "https://pngimg.com/uploads/doctor/doctor_PNG15991.png", altura: 1.76 },
  { arquivo: "https://pngimg.com/uploads/doctor/doctor_PNG15986.png", altura: 1.78 },
  { arquivo: "https://pngimg.com/uploads/doctor/doctor_PNG15956.png", altura: 1.75 },
  { arquivo: "https://pngimg.com/uploads/chef/chef_PNG24.png", altura: 1.74 },
  { arquivo: "https://pngimg.com/uploads/chef/chef_PNG4.png", altura: 1.75 },
  { arquivo: "https://pngimg.com/uploads/chef/chef_PNG2.png", altura: 1.63 },
  { arquivo: "https://pngimg.com/uploads/chef/chef_PNG1.png", altura: 1.77 },
  { arquivo: "https://pngimg.com/uploads/waiter/waiter_PNG6.png", altura: 1.78 },
  { arquivo: "https://pngimg.com/uploads/stewardess/stewardess_PNG70.png", altura: 1.68 },
  { arquivo: "https://pngimg.com/uploads/stewardess/stewardess_PNG43.png", altura: 1.65 },
  { arquivo: "https://pngimg.com/uploads/stewardess/stewardess_PNG28.png", altura: 1.66 },
  { arquivo: "https://pngimg.com/uploads/stewardess/stewardess_PNG5.png", altura: 1.67 },
  { arquivo: "https://pngimg.com/uploads/farmer/farmer_PNG13.png", altura: 1.75 },
  { arquivo: "https://pngimg.com/uploads/farmer/farmer_PNG12.png", altura: 1.73 },
  { arquivo: "https://pngimg.com/uploads/farmer/farmer_PNG9.png", altura: 1.76 },
  { arquivo: "https://pngimg.com/uploads/viking/viking_PNG8.png", altura: 1.82 }
];
