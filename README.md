# App Agrícola — Registro de Visitas Técnicas (Evoluído)

Aplicação React Native + Expo para auditoria técnica em propriedades rurais /
terminais logísticos, evoluída a partir do Guia de Estudo Dirigido com os
três níveis de desafio e os requisitos funcionais/não funcionais solicitados.

## Como rodar o projeto

```bash
npm install
npx expo start
```

Escaneie o QR Code com o app **Expo Go** (Android/iOS) ou rode em um
emulador com `npx expo start --android` / `--ios`.

> Pré-requisitos: Node.js instalado e Expo CLI (`npm install -g expo-cli`, opcional).

### Solução de problemas comuns (ERESOLVE / conflito de dependências)

Se aparecer um erro `ERESOLVE unable to resolve dependency tree` mencionando
`react-dom` ou `react-native-web`, é porque o `npm` tentou instalar uma
versão de `react-dom` mais nova que a exigida pelo Expo SDK 51 (que usa
`react@18.2.0`). O `package.json` deste projeto já fixa as versões corretas
(`react-dom@18.2.0` e `react-native-web@~0.19.10`), então basta:

```bash
rm -rf node_modules package-lock.json   # no Windows (PowerShell): rd /s /q node_modules & del package-lock.json
npm install
```

Se mesmo assim o conflito persistir (por exemplo, ao instalar algum pacote
extra manualmente), use:

```bash
npm install --legacy-peer-deps
```

Ou, preferencialmente, deixe o próprio Expo escolher versões compatíveis ao
adicionar novas bibliotecas:

```bash
npx expo install nome-do-pacote
```

## Estrutura do projeto

```
meu-app-agricola/
├── App.js
├── app.json
├── package.json
└── src/
    ├── components/
    │   ├── BotaoCustomizado.js
    │   ├── IndicadorPrecisaoGPS.js   (RF02)
    │   └── ItemContato.js            (Nível Sênior)
    ├── screens/
    │   ├── RegistroVisitaScreen.js   (tela principal — todos os desafios)
    │   └── HistoricoScreen.js        (RF01)
    ├── styles/
    │   └── globalStyles.js           (RNF02)
    └── utils/
        └── storage.js                (RF01)
```

## Onde cada exigência foi implementada

### Nível Júnior — Tratamento avançado de permissões negadas
`src/screens/RegistroVisitaScreen.js`, função `capturarFotoEvidencia`.
Ao negar a permissão de câmera, o app verifica `canAskAgain`:
- Se `false` ("Não perguntar novamente"), exibe um alerta com o botão
  **"Abrir Configurações"**, que chama `Linking.openSettings()`.
- Caso contrário, exibe a solicitação padrão, permitindo nova tentativa.

### Nível Pleno — Telemetria com acelerômetro (trava de segurança)
`src/screens/RegistroVisitaScreen.js`, funções `verificarEstabilidadeDispositivo`
e `finalizarRelatorioAuditoria`.
Durante o fechamento da auditoria, o app monitora o `Accelerometer` por uma
janela curta, calcula a aceleração vetorial agregada (magnitude do vetor
`x, y, z`) e, se o pico ultrapassar **2.0g**, bloqueia o envio com o alerta
**"Instabilidade Física Detectada"**.

### Nível Sênior — Paginação, busca nativa e FlatList performática
`src/screens/RegistroVisitaScreen.js`, funções `buscarPaginaDeContatos`,
`aoDigitarBusca` e `carregarMaisContatos`, junto com `src/components/ItemContato.js`.
- Carregamento paginado via `pageSize` / `pageOffset` do `expo-contacts`.
- Campo de busca (`TextInput`) que filtra pelo parâmetro nativo `name` da
  própria consulta `Contacts.getContactsAsync`, e não em memória.
- `FlatList` com `getItemLayout`, `removeClippedSubviews`,
  `initialNumToRender`/`maxToRenderPerBatch`/`windowSize` ajustados e item
  extraído como componente `React.memo` para reuso e menor consumo de RAM.
- Scroll infinito via `onEndReached`.

### RF01 — Histórico local e persistência
`src/utils/storage.js` (AsyncStorage) + `src/screens/HistoricoScreen.js`.
Cada auditoria concluída é salva localmente e pode ser consultada na tela
**Histórico de Auditorias**, inclusive sem conexão com a internet.

### RF02 — Feedback visual de precisão de GPS
`src/components/IndicadorPrecisaoGPS.js`, usado tanto na tela de registro
quanto no histórico. Verde (<10m) / Amarelo (10–30m) / Vermelho (>30m).

### RNF01 — Degradação graciosa
Todo acesso a hardware (`Location`, `ImagePicker`, `Contacts`, `Accelerometer`)
está envolto em `try/catch`, com verificações prévias (`hasServicesEnabledAsync`,
`Accelerometer.isAvailableAsync`) e mensagens amigáveis em vez de crash —
por exemplo, GPS desligado, câmera ausente ou sensor indisponível.

### RNF02 — UI/UX responsiva
`src/styles/globalStyles.js` e o menu em `App.js` usam `Dimensions` /
`useWindowDimensions` para adaptar a largura dos cards e o número de
colunas conforme o tamanho da tela e a orientação (retrato/paisagem).

## Observação sobre a rolagem da tela (correção aplicada)

A tela `RegistroVisitaScreen.js` não usa mais um `ScrollView` com um
`FlatList` de contatos aninhado dentro dele — essa combinação trava o
gesto de rolagem no Android (é um antipadrão avisado pelo próprio React
Native: "VirtualizedLists should never be nested inside plain ScrollViews
with the same orientation"). Agora a tela inteira é **um único `FlatList`**:
as seções de GPS e foto formam o `ListHeaderComponent`, os contatos são o
`data` paginado, e o botão "Finalizar" é o `ListFooterComponent`. Isso
resolve o travamento e mantém a rolagem funcionando mesmo com foto e
localização preenchidas.

## Observação sobre emuladores

O acelerômetro pode não estar disponível em alguns emuladores. Nesse caso,
`Accelerometer.isAvailableAsync()` retorna `false` e a trava de segurança é
ignorada (RNF01), permitindo que o restante do fluxo funcione normalmente.
Em dispositivo físico, é possível testar o Nível Pleno sacudindo o aparelho
durante o toque em "Finalizar e Assinar Auditoria".
