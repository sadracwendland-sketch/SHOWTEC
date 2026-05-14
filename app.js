// ===============================
// CONFIGURAÇÕES
// ===============================
const AUTOMATE_URL =
  "https://defaultc18e5a39b8224257bd2a34c15bd7b4.77.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/8d7d7c22d76e4bab80ccb6c69ec213bd/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=CiMry-yaLyxnARZq1XlAZMDSjeJ7zE9szZ0tjbW-3zw";

const LOCAL_EVENTO    = "Agrobrasilia";
const ADMIN_PASSWORD  = "stine2026";
const STORAGE_QUEUE    = "stine_fila_offline";
const STORAGE_ADMIN    = "stine_parametros_admin";
const STORAGE_ENVIADOS = "stine_enviados";

// ===============================
// UTILITÁRIO
// ===============================
function el(id) { return document.getElementById(id); }

// ===============================
// FILA OFFLINE
// ===============================
function getFila() { return JSON.parse(localStorage.getItem(STORAGE_QUEUE) || "[]"); }
function setFila(fila) { localStorage.setItem(STORAGE_QUEUE, JSON.stringify(fila)); }

// ===============================
// STATUS CONEXÃO
// ===============================
function atualizarStatusConexao() {
  var online = navigator.onLine;
  var fila   = getFila();
  if (el("onlineStatus"))  el("onlineStatus").classList[online ? "remove" : "add"]("d-none");
  if (el("offlineStatus")) el("offlineStatus").classList[online ? "add" : "remove"]("d-none");
  if (el("offlineCount"))  el("offlineCount").innerText = fila.length;
  if (el("offlineModule")) {
    if (!online || fila.length > 0) el("offlineModule").classList.remove("d-none");
    else el("offlineModule").classList.add("d-none");
  }
}

// ===============================
// LOG LOCAL
// ===============================
function salvarLog(acao, payload, status) {
  var log = JSON.parse(localStorage.getItem("stine_log") || "[]");
  log.push({ dataHora: new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }), acao, status, nome: payload.Nome || "", cidade: payload.Cidade || "" });
  localStorage.setItem("stine_log", JSON.stringify(log));
}

// ===============================
// HASH
// ===============================
function gerarHashRegistro(payload) {
  return btoa(payload.Nome + payload.Telefone + payload.produtividade_sc_ha + payload.produtividade_milho_sc_ha);
}

// ===============================
// CULTURA ATIVA
// ===============================
function aplicarCulturaAtiva(cultura) {
  var mostrarSoja  = !cultura || cultura === "Soja"  || cultura === "Ambas";
  var mostrarMilho = !cultura || cultura === "Milho" || cultura === "Ambas";
  if (el("secaoEstimativaSoja"))  el("secaoEstimativaSoja").style.display  = mostrarSoja  ? "" : "none";
  if (el("secaoEstimativaMilho")) el("secaoEstimativaMilho").style.display = mostrarMilho ? "" : "none";
  if (el("paramSojaDisplay"))     el("paramSojaDisplay").style.display     = mostrarSoja  ? "" : "none";
  if (el("paramMilhoDisplay"))    el("paramMilhoDisplay").style.display    = mostrarMilho ? "" : "none";
  ["vagens","graos","produtividade"].forEach(function(id) { if (el(id)) el(id).required = mostrarSoja; });
  ["graos_milho","produtividade_milho"].forEach(function(id) { if (el(id)) el(id).required = mostrarMilho; });
}

function alternarCamposAdmin(cultura) {
  if (el("adminCamposSoja"))  el("adminCamposSoja").style.display  = (cultura === "Milho") ? "none" : "";
  if (el("adminCamposMilho")) el("adminCamposMilho").style.display = (cultura === "Soja")  ? "none" : "";
}

// ===============================
// ADMIN
// ===============================
function abrirAdmin() {
  if (el("adminSection"))  el("adminSection").style.display  = "none";
  if (el("senhaInput"))    el("senhaInput").value            = "";
  if (el("senhaErro"))     el("senhaErro").style.display     = "none";
  if (el("senhaSection"))  el("senhaSection").style.display  = "flex";
  try { el("senhaInput").focus(); } catch(e) {}
}

function fecharSenha() {
  if (el("senhaSection")) el("senhaSection").style.display = "none";
}

function confirmarSenha() {
  var senha = el("senhaInput") ? el("senhaInput").value : "";
  if (senha !== ADMIN_PASSWORD) {
    if (el("senhaErro"))  el("senhaErro").style.display = "block";
    if (el("senhaInput")) el("senhaInput").value = "";
    return;
  }
  if (el("senhaSection")) el("senhaSection").style.display = "none";

  var dados = JSON.parse(localStorage.getItem(STORAGE_ADMIN) || "{}");
  if (el("admin_cultura"))         { el("admin_cultura").value         = dados.cultura               || "Ambas"; alternarCamposAdmin(el("admin_cultura").value); }
  if (el("admin_variedade_soja"))  el("admin_variedade_soja").value    = dados.variedade_soja         || "";
  if (el("admin_pop_soja"))        el("admin_pop_soja").value          = dados.populacao_final_soja   || "";
  if (el("admin_hibrido_milho"))   el("admin_hibrido_milho").value     = dados.hibrido_milho          || "";
  if (el("admin_pmg_milho"))       el("admin_pmg_milho").value         = dados.pmg_milho              || "";
  if (el("admin_pop_milho"))       el("admin_pop_milho").value         = dados.populacao_final_milho  || "";
  if (el("msgAdminSucesso"))       el("msgAdminSucesso").style.display = "none";
  if (el("adminSection"))          el("adminSection").style.display    = "flex";
}

function salvarAdmin() {
  var dados = {
    cultura:               el("admin_cultura")        ? el("admin_cultura").value        : "Ambas",
    variedade_soja:        el("admin_variedade_soja") ? el("admin_variedade_soja").value : "",
    populacao_final_soja:  el("admin_pop_soja")       ? el("admin_pop_soja").value       : "",
    hibrido_milho:         el("admin_hibrido_milho")  ? el("admin_hibrido_milho").value  : "",
    pmg_milho:             el("admin_pmg_milho")      ? el("admin_pmg_milho").value      : "",
    populacao_final_milho: el("admin_pop_milho")      ? el("admin_pop_milho").value      : ""
  };
  if (!dados.cultura) dados.cultura = "Ambas";
  localStorage.setItem(STORAGE_ADMIN, JSON.stringify(dados));
  carregarParametrosAdmin();
  if (el("msgAdminSucesso")) {
    el("msgAdminSucesso").style.display = "block";
    setTimeout(function() {
      if (el("msgAdminSucesso")) el("msgAdminSucesso").style.display = "none";
      fecharAdmin();
    }, 1500);
  } else {
    fecharAdmin();
  }
}

function fecharAdmin() {
  if (el("adminSection")) el("adminSection").style.display = "none";
}

// ===============================
// CARREGAR PARÂMETROS ADMIN
// ===============================
function carregarParametrosAdmin() {
  var dados = JSON.parse(localStorage.getItem(STORAGE_ADMIN) || "{}");
  if (dados.variedade_soja) {
    if (el("variedade_soja"))       el("variedade_soja").value            = dados.variedade_soja;
    if (el("variedadeSojaText"))    el("variedadeSojaText").innerText     = dados.variedade_soja;
  }
  if (dados.populacao_final_soja) {
    if (el("populacao_final_soja"))  el("populacao_final_soja").value     = dados.populacao_final_soja;
    if (el("populacaoFinalSojaText")) el("populacaoFinalSojaText").innerText = dados.populacao_final_soja;
  }
  if (dados.hibrido_milho) {
    if (el("hibrido_milho"))        el("hibrido_milho").value             = dados.hibrido_milho;
    if (el("hibridoMilhoText"))     el("hibridoMilhoText").innerText      = dados.hibrido_milho;
  }
  if (dados.pmg_milho) {
    if (el("pmg_milho"))            el("pmg_milho").value                 = dados.pmg_milho;
    if (el("pmgMilhoText"))         el("pmgMilhoText").innerText          = dados.pmg_milho;
  }
  if (dados.populacao_final_milho) {
    if (el("populacao_final_milho"))  el("populacao_final_milho").value   = dados.populacao_final_milho;
    if (el("populacaoFinalMilhoText")) el("populacaoFinalMilhoText").innerText = dados.populacao_final_milho;
  }
  aplicarCulturaAtiva(dados.cultura || "Ambas");
}

// ===============================
// ENVIO
// ===============================
async function enviarPayload(payload) {
  var r = await fetch(AUTOMATE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error("Erro HTTP " + r.status);
}

// ===============================
// LIMPEZA DO FORMULÁRIO
// ===============================
function limparFormularioPreservandoAdmin() {
  var form = el("stineForm");
  if (!form) return;

  var vSoja  = el("variedade_soja")        ? el("variedade_soja").value        : "";
  var pSoja  = el("populacao_final_soja")  ? el("populacao_final_soja").value  : "";
  var hMilho = el("hibrido_milho")         ? el("hibrido_milho").value         : "";
  var pmg    = el("pmg_milho")             ? el("pmg_milho").value             : "";
  var pMilho = el("populacao_final_milho") ? el("populacao_final_milho").value : "";

  form.reset();

  ["vagens","graos","produtividade","graos_milho","produtividade_milho"].forEach(function(id) {
    if (el(id)) el(id).value = "";
  });

  if (el("variedade_soja"))          el("variedade_soja").value            = vSoja;
  if (el("populacao_final_soja"))    el("populacao_final_soja").value      = pSoja;
  if (el("hibrido_milho"))           el("hibrido_milho").value             = hMilho;
  if (el("pmg_milho"))               el("pmg_milho").value                 = pmg;
  if (el("populacao_final_milho"))   el("populacao_final_milho").value     = pMilho;
  if (el("variedadeSojaText"))       el("variedadeSojaText").innerText     = vSoja;
  if (el("populacaoFinalSojaText"))  el("populacaoFinalSojaText").innerText  = pSoja;
  if (el("hibridoMilhoText"))        el("hibridoMilhoText").innerText      = hMilho;
  if (el("pmgMilhoText"))            el("pmgMilhoText").innerText          = pmg;
  if (el("populacaoFinalMilhoText")) el("populacaoFinalMilhoText").innerText = pMilho;
}

// ===============================
// SUBMIT
// ===============================
var stineForm = el("stineForm");
if (stineForm) {
  stineForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    var payload = {
      DataHora: new Date().toISOString(), Local: LOCAL_EVENTO,
      Segue_Redes:           stineForm.segue            ? stineForm.segue.value            : "",
      Aceite_LGPD:           stineForm.lgpd && stineForm.lgpd.checked ? "Sim" : "Não",
      Nome:                  stineForm.nome.value,
      Cargo:                 stineForm.cargo            ? stineForm.cargo.value            : "",
      empresa_fazenda:       stineForm.empresa          ? stineForm.empresa.value          : "",
      Telefone:              stineForm.telefone.value,
      Email:                 stineForm.email.value,
      Cidade:                stineForm.cidade.value,
      UF:                    stineForm.uf.value,
      Area_Soja_ha:          stineForm.area.value,
      planta_stine:          stineForm.planta_stine     ? stineForm.planta_stine.value     : "",
      qual_stine:            stineForm.qual_stine       ? stineForm.qual_stine.value       : "",
      fornecedor_semente:    stineForm.fornecedor_semente ? stineForm.fornecedor_semente.value : "",
      variedade_soja:        el("variedade_soja")        ? el("variedade_soja").value        : "",
      populacao_final_soja:  el("populacao_final_soja")  ? el("populacao_final_soja").value  : "",
      vagens_planta:         stineForm.vagens.value,
      graos_vagem:           stineForm.graos.value,
      produtividade_sc_ha:   stineForm.produtividade.value,
      hibrido_milho:         el("hibrido_milho")         ? el("hibrido_milho").value         : "",
      pmg_milho:             el("pmg_milho")             ? el("pmg_milho").value             : "",
      populacao_final_milho: el("populacao_final_milho") ? el("populacao_final_milho").value : "",
      graos_espiga_milho:    stineForm.graos_milho       ? stineForm.graos_milho.value       : "",
      produtividade_milho_sc_ha: stineForm.produtividade_milho ? stineForm.produtividade_milho.value : ""
    };

    var hash     = gerarHashRegistro(payload);
    var enviados = JSON.parse(localStorage.getItem(STORAGE_ENVIADOS) || "[]");
    if (enviados.includes(hash)) { alert("Este registro já foi enviado."); return; }

    var fila = getFila();
    try {
      if (navigator.onLine) {
        await enviarPayload(payload);
        enviados.push(hash);
        localStorage.setItem(STORAGE_ENVIADOS, JSON.stringify(enviados));
        salvarLog("enviado", payload, "ok");
        alert("Participação enviada com sucesso!");
      } else {
        fila.push({ hash: hash, payload: payload }); setFila(fila);
        salvarLog("salvo_offline", payload, "pendente");
        alert("Sem internet. Dados salvos localmente.");
      }
    } catch (erro) {
      console.error("Erro no envio:", erro);
      fila.push({ hash: hash, payload: payload }); setFila(fila);
      salvarLog("salvo_offline", payload, "pendente");
      alert("Falha no envio. Registro salvo offline.");
    }
    limparFormularioPreservandoAdmin();
    atualizarStatusConexao();
  });
}

// ===============================
// ENVIO AUTOMÁTICO
// ===============================
async function enviarFilaAutomatico() {
  if (!navigator.onLine) return;
  var fila = getFila();
  if (fila.length === 0) return;
  var enviados = JSON.parse(localStorage.getItem(STORAGE_ENVIADOS) || "[]");
  var restante = []; var qtdEnviados = 0;
  for (var i = 0; i < fila.length; i++) {
    var item = fila[i];
    try {
      if (!item.payload.graos_espiga_milho)        item.payload.graos_espiga_milho = "";
      if (!item.payload.produtividade_milho_sc_ha) item.payload.produtividade_milho_sc_ha = "";
      await enviarPayload(item.payload);
      await new Promise(function(r) { setTimeout(r, 300); });
      enviados.push(item.hash); salvarLog("enviado", item.payload, "ok"); qtdEnviados++;
    } catch (erro) { console.error("Erro fila:", erro); restante.push(item); }
  }
  localStorage.setItem(STORAGE_ENVIADOS, JSON.stringify(enviados));
  setFila(restante); atualizarStatusConexao();
  if (qtdEnviados > 0) alert(restante.length === 0 ? "Sincronizado! " + qtdEnviados + " enviado(s)." : "Parcial: " + qtdEnviados + " enviado(s), " + restante.length + " pendente(s).");
}

// ===============================
// SINCRONIZAÇÃO MANUAL
// ===============================
async function sincronizarOffline() {
  if (!navigator.onLine) { alert("Sem conexão."); return; }
  var fila = getFila();
  if (fila.length === 0) { alert("Nenhum cadastro offline."); return; }
  var enviados = JSON.parse(localStorage.getItem(STORAGE_ENVIADOS) || "[]");
  var restante = []; var qtdEnviados = 0;
  for (var i = 0; i < fila.length; i++) {
    var item = fila[i];
    try {
      if (!item.payload.graos_espiga_milho)        item.payload.graos_espiga_milho = "";
      if (!item.payload.produtividade_milho_sc_ha) item.payload.produtividade_milho_sc_ha = "";
      await enviarPayload(item.payload);
      await new Promise(function(r) { setTimeout(r, 300); });
      enviados.push(item.hash); salvarLog("enviado", item.payload, "ok"); qtdEnviados++;
    } catch (e) { console.error("Erro sinc:", e); restante.push(item); }
  }
  localStorage.setItem(STORAGE_ENVIADOS, JSON.stringify(enviados));
  setFila(restante);
  if (el("offlineCount")) el("offlineCount").innerText = restante.length;
  if (restante.length === 0 && el("offlineModule")) el("offlineModule").classList.add("d-none");
  atualizarStatusConexao();
  alert(restante.length === 0 ? "Sincronizado! " + qtdEnviados + " enviado(s)." : "Parcial: " + qtdEnviados + " enviado(s), " + restante.length + " pendente(s).");
}

// ===============================
// LISTENERS
// ===============================
window.addEventListener("online",  function() { enviarFilaAutomatico(); atualizarStatusConexao(); });
window.addEventListener("offline", function() { atualizarStatusConexao(); });

// ===============================
// INIT — único DOMContentLoaded
// ===============================
document.addEventListener("DOMContentLoaded", function() {

  carregarParametrosAdmin();
  enviarFilaAutomatico();
  atualizarStatusConexao();

  // Máscara telefone
  var tel = el("telefone");
  if (tel) {
    tel.addEventListener("input", function() {
      var v = tel.value.replace(/\D/g, "");
      if (v.length > 11) v = v.slice(0, 11);
      if      (v.length > 6) tel.value = "(" + v.slice(0,2) + ")" + v.slice(2,7) + "-" + v.slice(7);
      else if (v.length > 2) tel.value = "(" + v.slice(0,2) + ")" + v.slice(2);
      else if (v.length > 0) tel.value = "(" + v;
      else                   tel.value = "";
    });
    tel.onkeypress = function(e) { if (!/[0-9]/.test(e.key)) e.preventDefault(); };
  }

  // Botões admin — .onclick (binding mais primitivo e compatível com iPad Safari)
  if (el("btnAdmin"))          el("btnAdmin").onclick          = abrirAdmin;
  if (el("btnConfirmarSenha")) el("btnConfirmarSenha").onclick = confirmarSenha;
  if (el("btnFecharSenha"))    el("btnFecharSenha").onclick    = fecharSenha;
  if (el("btnSalvarAdmin"))    el("btnSalvarAdmin").onclick    = salvarAdmin;
  if (el("btnFecharAdmin"))    el("btnFecharAdmin").onclick    = fecharAdmin;
  if (el("btnFecharAdmin2"))   el("btnFecharAdmin2").onclick   = fecharAdmin;
  if (el("btnSincronizar"))    el("btnSincronizar").onclick    = sincronizarOffline;

  if (el("senhaInput")) el("senhaInput").onkeypress = function(e) { if (e.key === "Enter") confirmarSenha(); };
  if (el("admin_cultura")) el("admin_cultura").onchange = function() { alternarCamposAdmin(this.value); };

});
