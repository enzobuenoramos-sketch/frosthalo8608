// CONFIGURAÇÃO FIXA DO ALUNO
const CONFIG_ALUNO = {
  turma: "8A",
  numeroChamada: 8,
  apiUrl: "https://boletim-api.profbt.com.br"
};

// PIN MANTIDO SOMENTE EM MEMÓRIA DURANTE A SESSÃO
let pinSessao = "";

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

    const arrayFaltas = Array.isArray(item.faltas) ? item.faltas : [0, 0, 0];
    const totalFaltasDisciplina = arrayFaltas.reduce((acc, curr) => acc + (Number(curr) || 0), 0);
    totalFaltasGeral += totalFaltasDisciplina;

    let situacaoTexto = "";
    let classeSituacao = "";

    if (media === null) {
      situacaoTexto = "Nota ainda não disponível";
      classeSituacao = "situacao-indisponivel";
    } else if (media >= 6.0) {
      situacaoTexto = "Bom desempenho";
      classeSituacao = "situacao-bom";
      contBomDesempenho++;
    } else {
      situacaoTexto = "Atenção";
      classeSituacao = "situacao-atencao";
      contAtencao++;
    }

    const txt1 = n1 !== null ? n1.toFixed(1).replace('.', ',') : "—";
    const txt2 = n2 !== null ? n2.toFixed(1).replace('.', ',') : "—";
    const txt3 = n3 !== null ? n3.toFixed(1).replace('.', ',') : "—";
    const txtMedia = media !== null ? media.toFixed(1).replace('.', ',') : "—";

    const tr = document.createElement("tr");

    const tdDisc = document.createElement("td");
    const strongDisc = document.createElement("strong");
    strongDisc.textContent = item.disciplina;
    tdDisc.appendChild(strongDisc);

    const td1 = document.createElement("td");
    td1.textContent = txt1;

    const td2 = document.createElement("td");
    td2.textContent = txt2;

    const td3 = document.createElement("td");
    td3.textContent = txt3;

    const tdMedia = document.createElement("td");
    const strongMedia = document.createElement("strong");
    strongMedia.textContent = txtMedia;
    tdMedia.appendChild(strongMedia);

    const tdFaltas = document.createElement("td");
    tdFaltas.textContent = totalFaltasDisciplina;

    const tdSit = document.createElement("td");
    tdSit.className = classeSituacao;
    tdSit.textContent = situacaoTexto;

    tr.appendChild(tdDisc);
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(tdMedia);
    tr.appendChild(tdFaltas);
    tr.appendChild(tdSit);

    corpoTabela.appendChild(tr);
  });

  const mediaGeralCalculada = qtdDisciplinasComMedia > 0 ? (somaMediasGerais / qtdDisciplinasComMedia).toFixed(1).replace('.', ',') : "—";
  
  document.getElementById("card-media").textContent = mediaGeralCalculada;
  document.getElementById("card-faltas").textContent = totalFaltasGeral;
  document.getElementById("card-bom-desempenho").textContent = contBomDesempenho;
  document.getElementById("card-atencao").textContent = contAtencao;
  document.getElementById("card-frequencia").textContent = "92%";
}

// 5. ÁREA DE EDIÇÃO E FORMULÁRIO
function abrirEdicao() {
  document.getElementById("tabela-visualizacao").style.display = "none";
  document.getElementById("area-edicao").style.display = "block";
  document.getElementById("msg-edicao").textContent = "";

  const corpoEdicao = document.getElementById("corpo-tabela-edicao");
  corpoEdicao.innerHTML = "";

  dadosBoletim.forEach((item, idx) => {
    const tr = document.createElement("tr");

    const tdDisc = document.createElement("td");
    const strongDisc = document.createElement("strong");
    strongDisc.textContent = item.disciplina;
    tdDisc.appendChild(strongDisc);

    const fmtNota = (val) => {
      const n = normalizarNota(val);
      return n !== null ? String(n).replace('.', ',') : "";
    };

    const arrayFaltas = Array.isArray(item.faltas) ? item.faltas : [0, 0, 0];

    tr.appendChild(tdDisc);
    tr.appendChild(criarInputTd(`tri1_${idx}`, fmtNota(item.tri1)));
    tr.appendChild(criarInputTd(`tri2_${idx}`, fmtNota(item.tri2)));
    tr.appendChild(criarInputTd(`tri3_${idx}`, fmtNota(item.tri3)));
    tr.appendChild(criarInputTd(`f1_${idx}`, arrayFaltas[0] !== undefined ? arrayFaltas[0] : 0));
    tr.appendChild(criarInputTd(`f2_${idx}`, arrayFaltas[1] !== undefined ? arrayFaltas[1] : 0));
    tr.appendChild(criarInputTd(`f3_${idx}`, arrayFaltas[2] !== undefined ? arrayFaltas[2] : 0));

    corpoEdicao.appendChild(tr);
  });
}

function criarInputTd(id, valor) {
  const td = document.createElement("td");
  const input = document.createElement("input");
  input.type = "text";
  input.id = id;
  input.value = valor !== null && valor !== undefined ? valor : "";
  td.appendChild(input);
  return td;
}

function fecharEdicao() {
  document.getElementById("area-edicao").style.display = "none";
  document.getElementById("tabela-visualizacao").style.display = "table";
}

// 6. VALIDAÇÃO E SALVAMENTO DOS DADOS NA API
function validarNotaDigitada(str) {
  if (str === null || str === undefined || str.trim() === "") {
    return { valido: true, valor: null };
  }
  const limpo = str.trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(limpo)) {
    return { valido: false };
  }
  const num = parseFloat(limpo);
  if (isNaN(num) || num < 0 || num > 10) {
    return { valido: false };
  }
  return { valido: true, valor: num };
}

function validarFaltaDigitada(str) {
  if (str === null || str === undefined || str.trim() === "") {
    return { valido: false };
  }
  const limpo = str.trim();
  if (!/^\d+$/.test(limpo)) {
    return { valido: false };
  }
  const num = parseInt(limpo, 10);
  if (isNaN(num) || num < 0) {
    return { valido: false };
  }
  return { valido: true, valor: num };
}

async function salvarAlteracoes() {
  const msgEdicao = document.getElementById("msg-edicao");
  msgEdicao.textContent = "";

  let temErro = false;
  const novasDisciplinas = [];

  dadosBoletim.forEach((item, idx) => {
    const elT1 = document.getElementById(`tri1_${idx}`);
    const elT2 = document.getElementById(`tri2_${idx}`);
    const elT3 = document.getElementById(`tri3_${idx}`);
    const elF1 = document.getElementById(`f1_${idx}`);
    const elF2 = document.getElementById(`f2_${idx}`);
    const elF3 = document.getElementById(`f3_${idx}`);

    [elT1, elT2, elT3, elF1, elF2, elF3].forEach(el => el.classList.remove("campo-invalido"));

    const vT1 = validarNotaDigitada(elT1.value);
    const vT2 = validarNotaDigitada(elT2.value);
    const vT3 = validarNotaDigitada(elT3.value);

    if (!vT1.valido) { elT1.classList.add("campo-invalido"); temErro = true; }
    if (!vT2.valido) { elT2.classList.add("campo-invalido"); temErro = true; }
    if (!vT3.valido) { elT3.classList.add("campo-invalido"); temErro = true; }

    const vF1 = validarFaltaDigitada(elF1.value);
    const vF2 = validarFaltaDigitada(elF2.value);
    const vF3 = validarFaltaDigitada(elF3.value);

    if (!vF1.valido) { elF1.classList.add("campo-invalido"); temErro = true; }
    if (!vF2.valido) { elF2.classList.add("campo-invalido"); temErro = true; }
    if (!vF3.valido) { elF3.classList.add("campo-invalido"); temErro = true; }

    if (!temErro) {
      novasDisciplinas.push({
        disciplina: item.disciplina,
        tri1: vT1.valor,
        tri2: vT2.valor,
        tri3: vT3.valor,
        faltas: [vF1.valor, vF2.valor, vF3.valor]
      });
    }
  });

  if (temErro) {
    msgEdicao.style.color = "#c62828";
    msgEdicao.textContent = "Verifique os campos destacados em vermelho. Notas devem ser entre 0 e 10 e faltas números inteiros.";
    return;
  }

  msgEdicao.style.color = "#d32f2f";
  msgEdicao.textContent = "Salvando...";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/salvar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinSessao,
        dados: {
          disciplinas: novasDisciplinas
        }
      })
    });

    if (!resposta.ok) {
      msgEdicao.style.color = "#c62828";
      msgEdicao.textContent = "Não foi possível salvar as alterações. Tente novamente.";
      return;
    }

    dadosBoletim = novasDisciplinas;
    carregarBoletim();
    fecharEdicao();

    msgEdicao.style.color = "#2e7d32";
    msgEdicao.textContent = "Dados salvos com sucesso.";

  } catch (erro) {
    msgEdicao.style.color = "#c62828";
    msgEdicao.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
  }
}