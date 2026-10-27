# Braspress Tracking Sheets

Integração em Google Apps Script que consulta o rastreamento de notas fiscais
na API da Braspress e atualiza os dados correspondentes no Google Sheets.

## Como funciona

Ao abrir a planilha, o script adiciona o menu **📦 Integração BrasPress**. A
opção **📋 Atualizar Notas** executa a consulta linha a linha:

1. Lê o CNPJ e a nota fiscal de cada linha, a partir da segunda linha da aba.
2. Consulta `https://api.braspress.com/v3/tracking/byNf/{cnpj}/{notaFiscal}/json`
   usando autenticação Basic.
3. Atualiza previsão de entrega, status e última ocorrência quando os valores
   retornados forem diferentes dos que já estão na planilha.
4. Se a API não retornar conhecimentos para a nota, grava `Não Coletado` no
   campo de status.

Linhas sem CNPJ ou nota fiscal são ignoradas. Linhas cuja última ocorrência
seja exatamente `ENTREGA REALIZADA` também não são consultadas novamente.

## Estrutura esperada da planilha

O script espera uma linha de cabeçalho na primeira linha e os seguintes dados
nas colunas indicadas:

| Coluna | Conteúdo |
| --- | --- |
| H | CNPJ |
| O | Nota fiscal |
| Q | Previsão de entrega |
| R | Status |
| S | Última ocorrência |

O CNPJ é enviado à API somente com os dígitos. Os campos Q, R e S podem estar
vazios antes da primeira consulta.

## Configuração

1. Abra a planilha no Google Sheets e acesse **Extensões > Apps Script**.
2. Adicione os arquivos `integration.js` e `create_properties.js` ao projeto.
3. Em `create_properties.js`, substitua os valores de exemplo pelas credenciais
   da Braspress, pelo ID da planilha e pelo nome da aba:

   ```js
   BRASPRESS_USER: 'seu_usuario',
   BRASPRESS_PASSWORD: 'sua_senha',
   SPREADSHEET_ID: 'ID_DA_PLANILHA',
   SHEET: 'Nome da aba'
   ```

4. Execute `configurarPropriedades` uma vez e autorize as permissões solicitadas
   pelo Apps Script.
5. Recarregue a planilha e use **📦 Integração BrasPress > 📋 Atualizar Notas**.

O usuário que executa a configuração precisa ter acesso à planilha e permissão
para chamar serviços externos pelo Apps Script. A conta da Braspress precisa
ter acesso ao endpoint de rastreamento.

## Arquivos

- `integration.js`: cria o menu, consulta a API e atualiza a planilha.
- `create_properties.js`: configura e verifica as propriedades do script.

## Segurança e limitações conhecidas

- Troque todos os valores de exemplo antes de executar a configuração. Não
  compartilhe nem versione credenciais reais.
- `verificarProperties` registra todas as propriedades do script no log, o que
  inclui usuário e senha. Evite executá-la com credenciais reais.
- Na implementação atual, o tratamento de erro dentro de `consultaBraspress`
  tenta usar `ui.alert`, mas `ui` não está definido nessa função. Portanto,
  erros de credenciais ou respostas HTTP podem não ser exibidos corretamente.
