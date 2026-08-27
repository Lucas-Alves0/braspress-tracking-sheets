// Função para salvar na raiz do projeto, informações padrão
function configurarPropriedades() {

  const properties = PropertiesService.getScriptProperties();

  properties.setProperties({
    BRASPRESS_USER: 'user1234',
    BRASPRESS_PASSWORD: 'user1234',
    SPREADSHEET_ID: 'ID-DA-SUA-PLANILHA',
    SHEET: 'ABA-PLANILHA'
  });

  Logger.log('Credenciais configuradas com sucesso!');
}

// Função para verificar quais os dados salvos
function verificarProperties() {

  const properties = PropertiesService.getScriptProperties();

  const todas = properties.getProperties();

  Logger.log(todas);
}
