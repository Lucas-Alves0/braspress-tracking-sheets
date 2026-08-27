function onOpen() {

// Cria menu interativo na planilha
  SpreadsheetApp.getUi()
    .createMenu('📦 Integração BrasPress')
    .addItem('📋 Atualizar Notas', 'validarPlanilha')
    .addToUi();

}

function consultaBraspress(cnpj, notaFiscal) {

// Carrega propriedades
  const properties = PropertiesService.getScriptProperties();
  
// Validação de credenciais
  const user = properties.getProperty('BRASPRESS_USER');
  const password = properties.getProperty('BRASPRESS_PASSWORD');

  if (!user || !password) {
    ui.alert('Credenciais não configuradas.');
  }
  
// Conexão API
  const token = Utilities.base64Encode(
    user + ':' + password
  );

  const url = `https://api.braspress.com/v3/tracking/byNf/${cnpj}/${notaFiscal}/json`;

  const options = {
    method: 'get',
    headers: {
      'Authorization': 'Basic ' + token
    },
    muteHttpExceptions: true
  };

// Resultado da requisição
  const response = UrlFetchApp.fetch(url, options);

  const statusCode = response.getResponseCode();
  const body = response.getContentText();

// Verifica se o status da requisição retornou correta
  if (statusCode !== 200) {
    ui.alert(`Erro BrasPress ${statusCode}: ${body}`);
  }

  return JSON.parse(body);
}

function validarPlanilha() {

// Carrega propriedades
  const properties = PropertiesService.getScriptProperties();
  const ui = SpreadsheetApp.getUi();

// Carrega planilha
  const spreadsheet = SpreadsheetApp.openById(properties.getProperty('SPREADSHEET_ID'));
  const sheet = spreadsheet.getSheetByName(properties.getProperty('SHEET'));

// Verifica se a aba existe e se axistem dados na planilha
  if (!sheet) {
    ui.alert(`Aba "${sheet}" não encontrada.`);
    return;
  };

  if (sheet.getDataRange().getValues() <= 1) {
    ui.alert(`Nenhum dado encontrado.`);
    return
  };


// Pega todos os dados da planilha
  const data = sheet.getDataRange().getValues();

  const rows = data.slice(1); // Remove o cabeçalho

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    const cnpj = String(row[7]).replace(/\D/g, ''); // Pega o CNPJ na planilha
    const notaFiscal = String(row[14]).trim(); // Pega a nota fiscal na planilha
    const previsaoEntregaPlanilha = String(row[16]).trim(); // Pega a última previsão da planilha (Caso haja)
    const statusPlanilha = String(row[17]).trim(); // Pega último status (Caso haja)
    const ultimaOcorrenciaPlanilha = String(row[18]).trim(); // Pega última ocorrência (Caso haja)

  // Verifica se tem CNPJ, Nota ou Última Ocorrência é igual "Entrega Realizada"
    if (!cnpj || !notaFiscal || ultimaOcorrenciaPlanilha === 'ENTREGA REALIZADA') continue;

    Logger.log(
      `Consultando NF ${notaFiscal} - ${cnpj}`
    );

    try {

    // Carrega resultado da consulta da nota na BrasPress
      const resultado = consultaBraspress(cnpj, notaFiscal);
      const linhaPlanilha = i + 2; // Define primeira linha da planilha

    // Valida se retornou resultados na consulta e altera status para "Não Coletado" caso não encontre
      if (!resultado.conhecimentos || resultado.conhecimentos.length === 0) {
        sheet
          .getRange(linhaPlanilha, 18)
          .setValue('Não Coletado');

          continue;
        };

      const conhecimento = resultado.conhecimentos[0];

    // Carrega dados de cada NF
      const status = conhecimento.status || '';
      const previsaoEntrega = conhecimento.previsaoEntrega || '';
      const ultimaOcorrencia = conhecimento.ultimaOcorrencia || '';

    // Valida se as informações encontradas são iguais as da planilha, se for não atualiza a linha, se diferente atualiza as linhas
      if (ultimaOcorrencia === ultimaOcorrenciaPlanilha && previsaoEntrega === previsaoEntregaPlanilha && status === statusPlanilha) {
        continue;
      };
      
      sheet
        .getRange(linhaPlanilha, 19)
        .setValue(ultimaOcorrencia);

      sheet
        .getRange(linhaPlanilha, 18)
        .setValue(status);

      sheet
        .getRange(linhaPlanilha, 17)
        .setValue(previsaoEntrega);

    } catch (error) {

      ui.alert(`Erro na NF ${notaFiscal}: ${error.message}`);
    
    };
  };
}
