// CONFIGURAÇÃO FIXA DO ALUNO
const CONFIG_ALUNO = {
  turma: "8A",
  numeroChamada: 8,
  apiUrl: "https://boletim-api.profbt.com.br"
};

// PIN MANTIDO SOMENTE EM MEMÓRIA DURANTE A SESSÃO
let pinSessao = "";

// INSTÂNCIAS DOS GRÁFICOS
let graficoMedias = null;
let graficoEvolucao = null;
let graficoFaltas = null;

// 1. DADOS FICTÍCIOS BRUTOS DO 8º ANO (REPOSITÓRIO LOCAL / PADRÃO)
let dadosBoletim = [
  { disciplina: "Língua Portuguesa", tri1: 82, tri2: "7,8", tri3: 85, faltas: [2, 1, 1] },
  { disciplina: "Matemática", tri1: 52, tri2: "5,8", tri3: null, faltas: [3, 2, 1] },
  { disciplina: "Ciências", tri1: "8,1", tri2: 76, tri3: 8.0, faltas: [1, 2, 0] },
  { disciplina: "História", tri1: 7.0, tri2: 84, tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Geografia", tri1: 68, tri2: 7.3, tri3: "7,9", faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa", tri1: 86, tri2: "8,1", tri3: 8.7, faltas: [1, 0, 0] },
  { disciplina: "Arte", tri1: 9.0, tri2: 92, tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Educação Física", tri1: 95, tri2: 9.0, tri3: "9,4", faltas: [0, 1, 0] },
  { disciplina: "Educação Digital", tri1: 88, tri2: 9.1, tri3: 93, faltas: [1, 0, 1] },
  { disciplina: "Educação Financeira", tri1: 74, tri2: "7,8", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Estudo Orientado", tri1: 8.0, tri2: 83, tri3: "8,5", faltas: [0, 1, 0] },
  { disciplina: "Redação e Leitura", tri1: 62, tri2: "6,8", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico", tri1: 48, tri2: 5.6, tri3: "6,0", faltas: [2, 2, 1] },
  { disciplina: "Literatura Arte e Movimento", tri1: "7,7", tri2: 80, tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Práticas Experimentais", tri1: 58, tri2: "6,2", tri3: 6.4, faltas: [1, 1, 1] }
];

// 2. FUNÇÃO PARA NORMALIZAR AS NOTAS DOS DADOS ANTIGOS (0 a 10)
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  let valorTexto = String(valor).replace(',', '.');
  let numero = parseFloat(valorTexto);

  if (isNaN(numero)) {
    return null;
  }

  if (numero > 10 && numero <= 100) {
    numero = numero / 10;
  }

  if (numero >= 0 && numero <= 10) {
    return numero;
  }

  return null;
}

// 3. AUTENTICAÇÃO E CONEXÃO COM A API
async function fazerLogin() {
  const inputPin = document.getElementById("input-pin");
  const msgLogin = document.getElementById("msg-login");
  const pinDigitado = inputPin.value.trim();

  if (!pinDigitado) {
    msgLogin.style.color = "#c62828";
    msgLogin.textContent = "Por favor, digite seu PIN.";
    return;
  }

  msgLogin.style.color = "#d32f2f";
  msgLogin.textContent = "Conectando...";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/abrir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinDigitado
      })
    });

    if (resposta.status === 401) {
      msgLogin.style.color = "#c62828";
      msgLogin.textContent = "Turma, chamada ou PIN inválidos.";
      return;
    }

    if (resposta.status === 429) {
      msgLogin.style.color = "#c62828";
      msgLogin.textContent = "Muitas tentativas. Aguarde um minuto e tente novamente.";
      return;
    }

    if (!resposta.ok) {
      msgLogin.style.color = "#c62828";
      msgLogin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
      return;
    }

    const resultado = await resposta.json();

    // Guardar PIN em memória na sessão e limpar input
    pinSessao = pinDigitado;
    inputPin.value = "";

    // DADOS DA API > DADOS LOCAIS
    if (resultado.dados !== null && Array.isArray(resultado.dados.disciplinas)) {
      dadosBoletim = resultado.dados.disciplinas;
    }

    // Exibir área principal do boletim
    document.getElementById("area-login").style.display = "none";
    document.getElementById("conteudo-boletim").style.display = "block";

    carregarBoletim();

  } catch (erro) {
    msgLogin.style.color = "#c62828";
    msgLogin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
  }
}

// 4. PROCESSAMENTO E EXIBIÇÃO NO BOLETIM
function carregarBoletim() {
  const corpoTabela = document.getElementById("corpo-tabela");
  corpoTabela.innerHTML = "";

  let somaMediasGerais = 0;
  let qtdDisciplinasComMedia = 0;
  let totalFaltasGeral = 0;
  let contBomDesempenho = 0;
  let contAtencao = 0;

  dadosBoletim.forEach((item) => {
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    const notasValidas = [n1, n2, n3].filter(n => n !== null);
    let media = null;

    if (notasValidas.length > 0) {
      const soma = notasValidas.reduce((acc, curr) => acc + curr, 0);
      media = soma / notasValidas.length;
      somaMediasGerais += media;
      qtdDisciplinasComMedia++;
    }

    const arrayFaltas =