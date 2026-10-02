// =====================================================
// BOLETIM DIGITAL - 8º ANO
// Dados fictícios para demonstração
// =====================================================

// disciplina, 1º tri, 2º tri, 3º tri, faltas
const disciplinas = [
    ["Língua Portuguesa", 82, "7,8", 85, [2, 1, 1]],
    ["Matemática", 52, "5,8", null, [3, 2, 1]],
    ["Ciências", "8,1", 76, 8.0, [1, 2, 0]],
    ["História", 7.0, 84, null, [1, 1, 1]],
    ["Geografia", 68, 7.3, "7,9", [0, 1, 1]],
    ["Língua Inglesa", 86, "8,1", 8.7, [1, 0, 0]],
    ["Arte", 9.0, 92, null, [1, 1, 0]],
    ["Educação Física", 95, 9.0, "9,4", [0, 1, 0]],
    ["Educação Digital", 88, 9.1, 93, [1, 0, 1]],
    ["Educação Financeira", 74, "7,8", null, [1, 1, 1]],
    ["Estudo Orientado", 8.0, 83, "8,5", [0, 1, 0]],
    ["Redação e Leitura", 62, "6,8", null, [2, 1, 1]],
    ["Pensamento Lógico", 48, 5.6, "6,0", [2, 2, 1]],
    ["Literatura Arte e Movimento", "7,7", 80, null, [1, 0, 1]],
    ["Práticas Experimentais", 58, "6,2", 6.4, [1, 1, 1]]
];


// =====================================================
// NORMALIZAR NOTA
// =====================================================

function normalizarNota(valor) {
    if (valor === null || valor === undefined || valor === "") {
        return null;
    }

    const numero = Number(String(valor).replace(",", "."));

    if (Number.isNaN(numero)) {
        return null;
    }

    if (numero >= 0 && numero <= 10) {
        return numero;
    }

    if (numero > 10 && numero <= 100) {
        return numero / 10;
    }

    return null;
}


// =====================================================
// CALCULAR MÉDIA
// =====================================================

function calcularMedia(notas) {
    const validas = notas
        .map(normalizarNota)
        .filter(nota => nota !== null);

    if (validas.length === 0) {
        return null;
    }

    const soma = validas.reduce(
        (total, nota) => total + nota,
        0
    );

    return soma / validas.length;
}


// =====================================================
// SOMAR FALTAS
// =====================================================

function calcularFaltas(faltas) {
    return faltas.reduce(
        (total, falta) => total + falta,
        0
    );
}


// =====================================================
// DEFINIR SITUAÇÃO
// =====================================================

function definirSituacao(media) {
    if (media === null) {
        return "Nota ainda não disponível";
    }

    if (media >= 6) {
        return "Bom desempenho";
    }

    return "Atenção";
}


// =====================================================
// FORMATAR NOTA
// =====================================================

function formatarNota(nota) {
    if (nota === null) {
        return "Ainda não lançada";
    }

    return nota.toFixed(1).replace(".", ",");
}


// =====================================================
// CRIAR TABELA
// =====================================================

function preencherTabela() {
    const tabela = document.getElementById("tabela-boletim");

    tabela.innerHTML = "";

    disciplinas.forEach(dados => {
        const nome = dados[0];
        const notas = dados.slice(1, 4);
        const faltas = dados[4];

        const notasNormalizadas = notas.map(normalizarNota);
        const media = calcularMedia(notas);
        const totalFaltas = calcularFaltas(faltas);
        const situacao = definirSituacao(media);

        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${nome}</td>
            <td>${formatarNota(notasNormalizadas[0])}</td>
            <td>${formatarNota(notasNormalizadas[1])}</td>
            <td>${formatarNota(notasNormalizadas[2])}</td>
            <td>${formatarNota(media)}</td>
            <td>${totalFaltas}</td>
            <td>${situacao}</td>
        `;

        tabela.appendChild(linha);
    });
}


// =====================================================
// CRIAR RESUMO
// =====================================================

function preencherResumo() {
    const medias = disciplinas
        .map(dados => calcularMedia(dados.slice(1, 4)))
        .filter(media => media !== null);

    const mediaGeral =
        medias.reduce((total, media) => total + media, 0)
        / medias.length;

    const totalFaltas = disciplinas.reduce(
        (total, dados) => total + calcularFaltas(dados[4]),
        0
    );

    const bomDesempenho = disciplinas.filter(dados => {
        const media = calcularMedia(dados.slice(1, 4));
        return media !== null && media >= 6;
    }).length;

    const atencao = disciplinas.filter(dados => {
        const media = calcularMedia(dados.slice(1, 4));
        return media !== null && media < 6;
    }).length;

    document.getElementById("media-geral").textContent =
        formatarNota(mediaGeral);

    document.getElementById("total-faltas").textContent =
        totalFaltas;

    document.getElementById("bom-desempenho").textContent =
        bomDesempenho;

    document.getElementById("atencao").textContent =
        atencao;

    // Frequência fictícia apenas para demonstração.
    // No futuro será calculada de outra forma.
    document.getElementById("frequencia").textContent = "92%";
}


// =====================================================
// INICIAR
// =====================================================

preencherTabela();
preencherResumo();