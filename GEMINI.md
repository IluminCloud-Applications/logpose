Backend em Python (Docker), Frontend em React.

O frontend será construído em ShadCN UI. Com React

# App
É um dashboard para CEO da empresa de Direct Response. O foco é visualizar exatamente de onde vem o lucro da operação, quais são as melhores campanhas, conjuntos, anúncios e etc.

Deve ter a integração com o Facebook para obter informações relevantes como o valor investido, cliques, e etc.
E informações de integração de pagamento (webhook, salvo no postgres 14) de plataformas como PayT e Kiwify.

O dashboard é para um CEO, ele precisa em poucos segundos ter uma noção de como está a saúde financeira da operação. Ou seja, ele precisa ver os principais indicadores de performance (KPIs) de forma clara e objetiva. A posição do elemento importa e MUITO, pois elementos essênciais precisam ter mais visibilidade, além disso, precisa ter uma UI/UX bonita.

No index.css faça o modo dark/white (default white)

# Branding
O nome do app é LOG POSE, uma inspiração ao anime One Piece que tem o LOG POSE que é um instrumento que os piratas usam para navegar na Grand Line. O LOG POSE é um instrumento que indica a direção que os piratas devem seguir para encontrar a ilha de Laugh Tale.

- O Design precisa ser constante, é um app, o design do modal em uma página deve ser igual em todas. O design de uma table, precisa ser igual em todas, SEMPRE faça o design constante.

# Tecnologia
É um White Label, ou seja, assim que inicia o aplicativo deve enviar para /setup, uma página onde coloca o nome, email, e senha (e confirmar senha) para o usuário salvar o usuário de administrador. Essa será a única vez que terá o usuário de administrador, pois no login não terá esqueci a senha ou cadastrar.

A ideia é o usuário acessar ao iniciar o app (em qualquer rota) redirecionar para /setup para ele configurar a primeira vez. E quando configurar, ao acessar /setup redirecionar para a página de dashboard/login, pois ele já cadastrou.

# Tools
## ShadCN (biblioteca de componentes prontos)
Use a tools do ShadCN para obter a documentação de como utilizar os componentes prontos dessa biblioteca.

## Context7 (documentação)
Use a tools do Context7 para obter a documentação de bibliotecas ou frameworks, seu conhecimento deve estar desatualizado, por isso, utilize essa tool para obter a documentação atualizada, exemplo: utilizar o Context7 para obter a documentação do Langchain.

# Design
Sou extremamente exigente com o design, cada detalhe importa.

# Organização
Faça uma organização no código com os arquivos, pastas e subpastas como sugerido a seguir.

Preciso que cada arquivo tenha no **máximo 200 linhas de código** e que seja com bons nomes e bem organizado.

Exemplo de uma boa organização para uma página de login. 


# Exemplo
## Frontend
Se o app for frontend (React) seria mais ou menos assim dentro de pages/
pages/login/
pages/login/index.tsx
pages/login/form.tsx
pages/login/components/modalForgot.tsx
etc.

A ideia é, separar os arquivos de acordo ao que cada um faz, ao invés de ser apenas 1 para a página inteira, e também a slug da página ser o mesmo nome da pasta, que nesse caso é login.

## Backend
exemplo no backend (normalmente Python), uma API para a página de login seria mais ou menos assim:
api/
api/login/ # mesmo nome da slug da página para identificar que as APIs daqui são usadas na página login
api/login/get_user.py # api para obter usuários
api/login/forgot_password.py # api para ativar a lógica de esqueci a senha, seja enviando email ou outro tipo definido pelo dev.
database/core/ # lógica de conexão e retries
database/models/ # tables criadas, exemplo, login.py para a table de login

Esse é só um exemplo, nem toda página de login tem essas APIs, mas é só para entender que cada arquivo é bem separado e organizado de uma maneira fácil de encontrar pra dar manutenção no código.


# Regras
- Arquivos com bons nomes para identificar.
- Organizado com pastas e subpastas.
- Máximo 200 linhas de código por arquivo.
- Não precisa documentação.
- Não abra navegador
- Não faça o deploy
- Não inicie o app (docker compose up/npm run dev)
- SEMPRE use shadcn, use a tool para baixar o elemento entender exemplos do design antes de criar o componente.