// ===============================
// CONFIGURAÇÕES
// ===============================
const AUTOMATE_URL =
  "https://defaultc18e5a39b8224257bd2a34c15bd7b4.77.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/8d7d7c22d76e4bab80ccb6c69ec213bd/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=CiMry-yaLyxnARZq1XlAZMDSjeJ7zE9szZ0tjbW-3zw";

const ADMIN_PASSWORD = "stine2026";

const STORAGE_QUEUE = "stine_fila_offline";
const STORAGE_ADMIN = "stine_parametros_admin";
const STORAGE_ENVIADOS = "stine_enviados";

// ===============================
// ELEMENTOS
// ===============================
const form = document.getElementById("stineForm");

// Campos ocultos
const variedadeSojaInput = document.getElementById("variedade_soja");
const populacaoFinalSojaInput = document.getElementById("populacao_final_soja");
const hibridoMilhoInput = document.getElementById("hibrido_milho");
const pmgMilhoInput = document.getElementById("pmg_milho");
const populacaoFinalMilhoInput = document.getElementById("populacao_final_milho");

// Textos exibidos
const variedadeSojaText = document.getElementById("variedadeSojaText");
const populacaoFinalSojaText = document.getElementById("populacaoFinalSojaText");
const hibridoMilhoText = document.getElementById("hibridoMilhoText");
const pmgMilhoText = document.getElementById("pmgMilhoText");
const populacaoFinalMilhoText = document.getElementById("populacaoFinalMilhoText");

// ===============================
// FILA OFFLINE
// ===============================
function getFila() {
  return JSON.parse(localStorage.getItem(STORAGE_QUEUE) || "[]");
}
function setFila(fila) {
  localStorage.setItem(STORAGE_QUEUE, JSON.stringify(fila));
}

// ===============================
// STATUS CONEXÃO
// ===============================
function atualizarStatusConexao() {
  var online = navigator.onLine;
  var fila = getFila();

  var onlineEl = document.getElementById("onlineStatus");
  var offlineEl = document.getElementById("offlineStatus");
  var moduloOffline = document.getElementById("offlineModule");
  var contadorEl = document.getElementById("offlineCount");

  if (online) {
    onlineEl?.classList.remove("d-none");
    offlineEl?.classList.add("d-none");
  } else {
    onlineEl?.classList.add("d-none");
    offlineEl?.classList.remove("d-none");
  }

  if (contadorEl) contadorEl.innerText = fila.length;

  if (moduloOffline) {
    if (!online || fila.length > 0) moduloOffline.classList.remove("d-none");
    else moduloOffline.classList.add("d-none");
  }
}

// ===============================
// LOG LOCAL
// ===============================
function salvarLog(acao, payload, status) {
  var log = JSON.parse(localStorage.getItem("stine_log") || "[]");
  log.push({
    dataHora: new Date().toLocaleString("pt-BR", {
       timeZone: "America/Sao_Paulo"
}),
    acao, 
    status,
    nome: payload.Nome || "",
    cidade: payload.Cidade || ""
  });

  localStorage.setItem("stine_log", JSON.stringify(log));
}


// ===============================
// HASH
// ===============================
function gerarHashRegistro(payload) {
  return btoa(
    payload.Nome +
    payload.Telefone +
    payload.produtividade_sc_ha +
    payload.produtividade_milho_sc_ha
  );
}

// ===============================
// CULTURA ATIVA — controla visibilidade e required das seções
// ===============================
function aplicarCulturaAtiva(cultura) {
  var secaoSoja  = document.getElementById("secaoEstimativaSoja");
  var secaoMilho = document.getElementById("secaoEstimativaMilho");
  var paramSoja  = document.getElementById("paramSojaDisplay");
  var paramMilho = document.getElementById("paramMilhoDisplay");

  // "Ambas" é o padrão quando nenhuma cultura foi salva ainda
  var mostrarSoja  = !cultura || cultura === "Soja"  || cultura === "Ambas";
  var mostrarMilho = !cultura || cultura === "Milho" || cultura === "Ambas";

  // Mostrar / esconder seções do formulário
  if (secaoSoja)  secaoSoja.style.display  = mostrarSoja  ? "" : "none";
  if (secaoMilho) secaoMilho.style.display = mostrarMilho ? "" : "none";

  // Mostrar / esconder blocos nos parâmetros técnicos
  if (paramSoja)  paramSoja.style.display  = mostrarSoja  ? "" : "none";
  if (paramMilho) paramMilho.style.display = mostrarMilho ? "" : "none";

  // Ajustar required nos campos de soja
  ["vagens", "graos", "produtividade"].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.required = mostrarSoja;
  });

  // Ajustar required nos campos de milho
  ["graos_milho", "produtividade_milho"].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.required = mostrarMilho;
  });
}

// Oculta/exibe os grupos de campos no modal admin em tempo real
function alternarCamposAdmin(cultura) {
  var camposSoja  = document.getElementById("adminCamposSoja");
  var camposMilho = document.getElementById("adminCamposMilho");
  if (camposSoja)  camposSoja.style.display  = (cultura === "Milho") ? "none" : "";
  if (camposMilho) camposMilho.style.display = (cultura === "Soja")  ? "none" : "";
}

// ===============================
// ADMIN
// ===============================
function abrirAdmin() {
  var senha = prompt("Digite a senha:");

  if (senha !== ADMIN_PASSWORD) {
    alert("Senha incorreta");
    return;
  }

  var modalEl = document.getElementById("adminModal");

  if (!modalEl) {
    alert("Modal não encontrado");
    return;
  }

  var modal = new bootstrap.Modal(modalEl);
  modal.show();

  // Preenche os campos com valores já salvos
  var dados = JSON.parse(localStorage.getItem(STORAGE_ADMIN) || "{}");

  // ▼ carrega seleção de cultura ativa e aplica visibilidade imediata dos campos
  var culturaEl = document.getElementById("admin_cultura");
  if (culturaEl) {
    culturaEl.value = dados.cultura || "Ambas";
    alternarCamposAdmin(culturaEl.value);
  }

  document.getElementById("admin_variedade_soja").value = dados.variedade_soja || "";
  document.getElementById("admin_pop_soja").value = dados.populacao_final_soja || "";
  document.getElementById("admin_hibrido_milho").value = dados.hibrido_milho || "";
  document.getElementById("admin_pmg_milho").value = dados.pmg_milho || "";
  document.getElementById("admin_pop_milho").value = dados.populacao_final_milho || "";
}

function salvarAdmin() {
  var dados = {
    // ▼ salva cultura ativa junto com os demais parâmetros
    cultura: document.getElementById("admin_cultura") ? document.getElementById("admin_cultura").value : "Ambas",

    variedade_soja: document.getElementById("admin_variedade_soja").value,
    populacao_final_soja: document.getElementById("admin_pop_soja").value,
    hibrido_milho: document.getElementById("admin_hibrido_milho").value,
    pmg_milho: document.getElementById("admin_pmg_milho").value,
    populacao_final_milho: document.getElementById("admin_pop_milho").value
  };

  localStorage.setItem(STORAGE_ADMIN, JSON.stringify(dados));

  carregarParametrosAdmin();

  alert("Parâmetros salvos com sucesso!");

  var modal = bootstrap.Modal.getInstance(document.getElementById("adminModal"));
  if (modal) modal.hide();
}

function carregarParametrosAdmin() {
  var dados = JSON.parse(localStorage.getItem(STORAGE_ADMIN) || "{}");

  if (dados.variedade_soja) {
    variedadeSojaInput.value = dados.variedade_soja;
    variedadeSojaText.innerText = dados.variedade_soja;
  }
  if (dados.populacao_final_soja) {
    populacaoFinalSojaInput.value = dados.populacao_final_soja;
    populacaoFinalSojaText.innerText = dados.populacao_final_soja;
  }
  if (dados.hibrido_milho) {
    hibridoMilhoInput.value = dados.hibrido_milho;
    hibridoMilhoText.innerText = dados.hibrido_milho;
  }
  if (dados.pmg_milho) {
    pmgMilhoInput.value = dados.pmg_milho;
    pmgMilhoText.innerText = dados.pmg_milho;
  }
  if (dados.populacao_final_milho) {
    populacaoFinalMilhoInput.value = dados.populacao_final_milho;
    populacaoFinalMilhoText.innerText = dados.populacao_final_milho;
  }

  // ▼ aplica visibilidade das seções conforme cultura salva
  aplicarCulturaAtiva(dados.cultura || "Ambas");
}

window.addEventListener("DOMContentLoaded", () => {
  carregarParametrosAdmin();
  atualizarStatusConexao();
});

// ===============================
// ENVIO
// ===============================
async function enviarPayload(payload) {
  var r = await fetch(AUTOMATE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!r.ok) {
    throw new Error("Erro HTTP " + r.status);
  }
}

// ===============================
// LIMPEZA DO FORMULÁRIO
// ===============================
function limparFormularioPreservandoAdmin() {

  // Salva todos os 5 parâmetros técnicos (hidden) antes do reset
  var variedadeSoja      = variedadeSojaInput.value;
  var populacaoSoja      = populacaoFinalSojaInput.value;
  var hibridoMilho       = hibridoMilhoInput.value;
  var pmgMilho           = pmgMilhoInput.value;
  var populacaoMilho     = populacaoFinalMilhoInput.value;

  form.reset(); // limpa tudo — inclusive estimativas de soja e milho

  // Limpeza explícita dos campos de estimativa (garante em Android e campos hidden via display:none)
  ["vagens", "graos", "produtividade", "graos_milho", "produtividade_milho"].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = "";
  });

  // Restaura parâmetros técnicos nos inputs hidden
  variedadeSojaInput.value      = variedadeSoja;
  populacaoFinalSojaInput.value = populacaoSoja;
  hibridoMilhoInput.value       = hibridoMilho;
  pmgMilhoInput.value           = pmgMilho;
  populacaoFinalMilhoInput.value = populacaoMilho;

  // Restaura os textos exibidos na tela
  variedadeSojaText.innerText      = variedadeSoja;
  populacaoFinalSojaText.innerText = populacaoSoja;
  hibridoMilhoText.innerText       = hibridoMilho;
  pmgMilhoText.innerText           = pmgMilho;
  populacaoFinalMilhoText.innerText = populacaoMilho;
}
  
// ===============================
// SUBMIT
// ===============================
if (form) {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    var payload = {
      DataHora: new Date().toISOString(),

      Segue_Redes: form.segue ? form.segue.value : "",
      Aceite_LGPD: form.lgpd && form.lgpd.checked ? "Sim" : "Não",

      Nome: form.nome.value,
      Cargo: form.cargo ? form.cargo.value : "",
      empresa_fazenda: form.empresa ? form.empresa.value : "",

      Telefone: form.telefone.value,
      Email: form.email.value,
      Cidade: form.cidade.value,
      UF: form.uf.value,
      Area_Soja_ha: form.area.value,

      planta_stine: form.planta_stine ? form.planta_stine.value : "",
      qual_stine: form.qual_stine ? form.qual_stine.value : "",
      fornecedor_semente: form.fornecedor_semente ? form.fornecedor_semente.value : "",

      // SOJA
      variedade_soja: variedadeSojaInput.value,
      populacao_final_soja: populacaoFinalSojaInput.value,
      vagens_planta: form.vagens.value,
      graos_vagem: form.graos.value,
      produtividade_sc_ha: form.produtividade.value,

      // MILHO
      hibrido_milho: hibridoMilhoInput.value,
      pmg_milho: pmgMilhoInput.value,
      populacao_final_milho: populacaoFinalMilhoInput.value,
      graos_espiga_milho: form.graos_milho ? form.graos_milho.value : "",
      produtividade_milho_sc_ha: form.produtividade_milho ? form.produtividade_milho.value : ""
    };

    var hash = gerarHashRegistro(payload);
    var enviados = JSON.parse(localStorage.getItem(STORAGE_ENVIADOS) || "[]");

    if (enviados.includes(hash)) {
      alert("Este registro já foi enviado.");
      return;
    }

    var fila = getFila();

    try {
      if (navigator.onLine) {
        console.log("Payload enviado:", payload);
        await enviarPayload(payload);

        enviados.push(hash);
        localStorage.setItem(STORAGE_ENVIADOS, JSON.stringify(enviados));

        salvarLog("enviado", payload, "ok");
        alert("Participação enviada com sucesso!");
      } else {
        fila.push({ hash: hash, payload: payload });
        setFila(fila);

        salvarLog("salvo_offline", payload, "pendente");
        alert("Sem internet. Dados salvos localmente.");
      }
    } catch (erro) {
      console.error("Erro no envio (submit):", erro);

      fila.push({ hash: hash, payload: payload });
      setFila(fila);

      salvarLog("salvo_offline", payload, "pendente");
      alert("Falha no envio. Registro salvo offline.");
    }

    limparFormularioPreservandoAdmin();
    atualizarStatusConexao();
  });
}

// ===============================
// ENVIO AUTOMÁTICO (COM ALERT DE SUCESSO)
// ===============================
async function enviarFilaAutomatico() {
  if (!navigator.onLine) return;

  var fila = getFila();
  if (fila.length === 0) return;

  var enviados = JSON.parse(localStorage.getItem(STORAGE_ENVIADOS) || "[]");
  var restante = [];
  var qtdEnviados = 0;

  for (var i = 0; i < fila.length; i++) {
    var item = fila[i];

    try {
      // garante campos de milho para registros antigos
      if (!item.payload.graos_espiga_milho) item.payload.graos_espiga_milho = "";
      if (!item.payload.produtividade_milho_sc_ha) item.payload.produtividade_milho_sc_ha = "";

     await enviarPayload(item.payload);
await new Promise(r => setTimeout(r, 300));

      enviados.push(item.hash);
      salvarLog("enviado", item.payload, "ok");
      qtdEnviados++;

    } 
    catch (erro) {
  console.error("Erro no envio da fila automática:", erro, item.payload);
  restante.push(item);
}
  }

  localStorage.setItem(STORAGE_ENVIADOS, JSON.stringify(enviados));
  setFila(restante);
  atualizarStatusConexao();

  // ALERT DE SUCESSO
  if (qtdEnviados > 0) {
    if (restante.length === 0) {
      alert("Sincronizado com sucesso! " + qtdEnviados + " cadastro(s) enviado(s).");
    } else {
      alert("Sincronização parcial: " + qtdEnviados + " enviado(s), " + restante.length + " pendente(s).");
    }
  }
}

// ===============================
// BOTÃO: SINCRONIZAR OFFLINE (MANUAL)
// ===============================
async function sincronizarOffline() {
  if (!navigator.onLine) {
    alert("Sem conexão com a internet.");
    return;
  }

  var fila = getFila();

  if (fila.length === 0) {
    alert("Nenhum cadastro offline para sincronizar.");
    return;
  }

  var enviados = JSON.parse(localStorage.getItem(STORAGE_ENVIADOS) || "[]");
  var restante = [];
  var qtdEnviados = 0;

  for (var i = 0; i < fila.length; i++) {
    var item = fila[i];

    try {
      // garante campos de milho para registros antigos
      if (!item.payload.graos_espiga_milho) item.payload.graos_espiga_milho = "";
      if (!item.payload.produtividade_milho_sc_ha) item.payload.produtividade_milho_sc_ha = "";

      await enviarPayload(item.payload);
      await new Promise(r => setTimeout(r, 300));

      enviados.push(item.hash);
      salvarLog("enviado", item.payload, "ok");
      qtdEnviados++;

    } 
    catch (erroEnvio) {
  console.error("Erro na sincronização manual:", erroEnvio, item.payload);
  restante.push(item);
}
  }

  localStorage.setItem(STORAGE_ENVIADOS, JSON.stringify(enviados));
  setFila(restante);

  var contadorEl = document.getElementById("offlineCount");
  if (contadorEl) {
    contadorEl.innerText = restante.length;
  }

  var moduloOffline = document.getElementById("offlineModule");
  if (restante.length === 0 && moduloOffline) {
    moduloOffline.classList.add("d-none");
  }

  atualizarStatusConexao();

  if (restante.length === 0) {
    alert("Sincronizado com sucesso! " + qtdEnviados + " cadastro(s) enviado(s).");
  } else {
    alert("Sincronização parcial: " + qtdEnviados + " enviado(s), " + restante.length + " pendente(s).");
  }
}

window.sincronizarOffline = sincronizarOffline;

// ===============================
// LISTENERS
// ===============================
window.addEventListener("online", function() {
  enviarFilaAutomatico();
  atualizarStatusConexao();
});

window.addEventListener("offline", function() {
  atualizarStatusConexao();
});

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", function() {
  carregarParametrosAdmin();
  enviarFilaAutomatico();
  atualizarStatusConexao();
});

// ===============================
// MÁSCARA TELEFONE (99)99999-9999
// ===============================
document.addEventListener("DOMContentLoaded", function() {
  var telefoneInput = document.getElementById("telefone");
  if (!telefoneInput) return;

  telefoneInput.addEventListener("input", function() {
    var v = telefoneInput.value.replace(/\D/g, "");

    if (v.length > 11) v = v.slice(0, 11);

    if (v.length > 6) {
      telefoneInput.value = "(" + v.slice(0,2) + ")" + v.slice(2,7) + "-" + v.slice(7);
    } else if (v.length > 2) {
      telefoneInput.value = "(" + v.slice(0,2) + ")" + v.slice(2);
    } else if (v.length > 0) {
      telefoneInput.value = "(" + v;
    } else {
      telefoneInput.value = "";
    }
  });

  telefoneInput.addEventListener("keypress", function(e) {
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  });
});

// ===============================
// ajuste falha no Android
// ===============================

function fecharAdmin() {
  var modal = document.getElementById("adminModal");

  // tenta fechar via Bootstrap
  if (typeof bootstrap !== "undefined") {
    var instance = bootstrap.Modal.getInstance(modal);
    if (instance) {
      instance.hide();
      return;
    }
  }

  // fallback Android (sem bootstrap)
  modal.style.display = "none";
}
