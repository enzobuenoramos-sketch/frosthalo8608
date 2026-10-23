// 1. DADOS FICTÍCIOS BRUTOS DO 8º ANO
const dadosBoletim = [
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

// 2. FUNÇÃO PARA NORMALIZAR AS NOTAS (0 a 10)
function normalizarNota(valor) {
  // Trata notas não lançadas, nulas ou vazias
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  // Converter para texto para substituir vírgula por ponto
  let valorTexto = String(valor).replace(',', '.');
  let numero = parseFloat(valorTexto);

  // Se não for um número válido, descarta
  if (isNaN(numero)) {
    return null;
  }

  // Valores maiores que 10 e menores ou iguais a 100 são divididos por 10
  if (numero > 10 && numero <= 100) {
    numero = numero / 10;
  }

  // Garante que está dentro da escala permitida (0 a 10)
  if (numero >= 0 && numero <= 10) {
    return numero;
  }

  return null; // Fora das regras
}

// 3. PROCESSAMENTO E EXIBIÇÃO NO BOLETIM
function carregarBoletim() {
  const corpoTabela = document.getElementById("corpo-tabela");
  corpoTabela.innerHTML = "";

  let somaMediasGerais = 0;
  let qtdDisciplinasComMedia = 0;
  let totalFaltasGeral = 0;
  let contBomDesempenho = 0;
  let contAtencao = 0;

  dadosBoletim.forEach((item) => {
    // Normalização das notas dos trimestres
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    // Cálculo da Média (ignora notas ausentes)
    const notasValidas = [n1, n2, n3].filter(n => n !== null);
    let media = null;

    if (notasValidas.length > 0) {
      const soma = notasValidas.reduce((acc, curr) => acc + curr, 0);
      media = soma / notasValidas.length;
      somaMediasGerais += media;
      qtdDisciplinasComMedia++;
    }

    // Soma do total de faltas da disciplina
    const totalFaltasDisciplina = item.faltas.reduce((acc, curr) => acc + curr, 0);
    totalFaltasGeral += totalFaltasDisciplina;

    // Definição da Situação
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

    // Formatação das notas para exibição na tabela
    const txt1 = n1 !== null ? n1.toFixed(1).replace('.', ',') : "—";
    const txt2 = n2 !== null ? n2.toFixed(1).replace('.', ',') : "—";
    const txt3 = n3 !== null ? n3.toFixed(1).replace('.', ',') : "—";
    const txtMedia = media !== null ? media.toFixed(1).replace('.', ',') : "—";

    // Criação da linha da tabela dinamicamente
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${item.disciplina}</strong></td>
      <td>${txt1}</td>
      <td>${txt2}</td>
      <td>${txt3}</td>
      <td><strong>${txtMedia}</strong></td>
      <td>${totalFaltasDisciplina}</td>
      <td class="${classeSituacao}">${situacaoTexto}</td>
    `;
    corpoTabela.appendChild(tr);
  });

  // Atualização dos Cards de Resumo
  const mediaGeralCalculada = qtdDisciplinasComMedia > 0 ? (somaMediasGerais / qtdDisciplinasComMedia).toFixed(1).replace('.', ',') : "—";
  
  document.getElementById("card-media").textContent = mediaGeralCalculada;
  document.getElementById("card-faltas").textContent = totalFaltasGeral;
  document.getElementById("card-bom-desempenho").textContent = contBomDesempenho;
  document.getElementById("card-atencao").textContent = contAtencao;

  // NOTA SOBRE FREQUÊNCIA:
  // O percentual de 92% abaixo é APENAS DEMONSTRATIVO para esta primeira etapa
  // e será calculado a partir de dados reais no futuro.
  document.getElementById("card-frequencia").textContent = "92%";
}

// Inicializa a montagem do boletim assim que a página carregar
carregarBoletim();