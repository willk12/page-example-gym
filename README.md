# Viva Academia

Site demonstrativo multipágina de uma academia fictícia, feito com React, Vite e React Router.

## Executar

Configure o chat na primeira execução:

```sh
Copy-Item .env.example .env
docker compose up -d postgres
```

Edite `.env` e defina valores secretos próprios para `SESSION_SECRET` e `CHAT_ADMIN_PASSWORD`. Depois instale as dependências e inicie frontend e servidor:

```sh
npm install
npm run dev
```

O Vite fica em `http://localhost:5173`; o servidor do chat usa a porta `3001`. O painel da equipe fica em `/atendimento`. A senha configurada em `CHAT_ADMIN_PASSWORD` é a credencial de entrada.

Se aparecer `EADDRINUSE` na porta do chat, configure uma porta livre em `.env`, por exemplo `CHAT_PORT=3002`, e reinicie `npm run dev`. O proxy do Vite acompanha `CHAT_PORT` automaticamente. Se a porta `5173` estiver ocupada, use o endereço alternativo informado pelo Vite no terminal.

`CHAT_GREETING` define a mensagem automática padrão, enviada uma vez no início de cada conversa nova. A equipe pode personalizar a mensagem no painel `/atendimento`; a versão do painel prevalece e fica salva no banco. Use **Restaurar padrão** para voltar ao texto de `CHAT_GREETING`. Alterações não modificam conversas existentes. Para personalizar pelo código, altere `CHAT_GREETING` em `.env` e reinicie o servidor.

Para rodar em produção numa VPS Node, crie um PostgreSQL, configure `DATABASE_URL`, `SESSION_SECRET` e `CHAT_ADMIN_PASSWORD` no ambiente do processo, então execute `npm run build` e `npm start`. O servidor entrega o site compilado e a API no mesmo host. Coloque-o atrás de HTTPS e de um proxy reverso que permita WebSocket; não exponha credenciais no frontend.

O compose local usa credenciais somente para desenvolvimento. Troque usuário e senha antes de qualquer implantação real.

Para validar a compilação e as regras de lint:

```sh
npm run build
npm run lint
```

## Identidade e movimento

A edição editorial usa GSAP, ScrollTrigger e CSS, com rolagem nativa. Na home, as modalidades formam três cenas sincronizadas ao scroll em telas de pelo menos 1024 × 720 px. Em telas menores ou com `prefers-reduced-motion: reduce`, as três cenas aparecem empilhadas. O carrossel mantém pausa, avanço manual e fades suaves.

Para adaptar a outra marca:

- Cores e materiais: tokens em `src/viva.css` (`--lime`, `--peach`, `--mint`, `--texture-opacity`) e texturas locais em `public/textures/`.
- Composição editorial e layouts: `src/editorial.css`.
- Durações, amplitudes, breakpoints e sequência de cores: `src/motion/config.js`.
- Fotografias, textos, modalidades e planos: `src/data/content.js`.

Não há painel de temas nem dependência de WebGL. O atendimento permanece separado da camada de animação.

Validação: `npm test`, `npm run lint` e `npm run build`. No Windows com execução de scripts do PowerShell restrita, use `npm.cmd`.

## Páginas

- Início: proposta, modalidades, prova social e planos em destaque.
- Modalidades: descrição das atividades.
- Planos: comparação de opções e preços de exemplo.
- A academia: história e valores fictícios.
- Contato: informações da unidade e formulário demonstrativo.
- Atendimento: chat em tempo real com conversas persistidas no PostgreSQL e painel restrito à equipe.

Os valores, endereço, telefone, horários e depoimentos são fictícios. O formulário só demonstra validação e confirmação no navegador; não envia nem armazena dados. As fotografias e fontes são carregadas de serviços externos e podem ser trocadas pelos ativos da marca real. O backend de chat é funcional, mas exige PostgreSQL ativo e configuração de segredos antes de iniciar.
