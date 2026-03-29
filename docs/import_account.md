# 🛠 Documentação de Implementação: Automação de Extração Meta Ads (Python)

**Objetivo:** Transmitir o `access_token` e o `business_id` para listar dinamicamente todas as contas de anúncios e executar a extração em lote.

### 1. Requisitos de Biblioteca
O desenvolvedor deve utilizar a biblioteca `requests` para chamadas HTTP simples ou a `facebook-business` (SDK oficial). Recomendamos `requests` pela leveza.

```python
import requests
```

### 2. Função de Descoberta (Discovery Function)
Esta função deve ser o "gatilho" inicial. Ela recebe as credenciais e retorna uma lista de IDs.

**Parâmetros de Entrada:** `access_token`, `business_id`
**Endpoint:** `https://graph.facebook.com/v21.0/{business_id}/owned_ad_accounts`

#### Exemplo de Código Sugerido:
```python
def get_all_ad_accounts(business_id, access_token):
    url = f"https://graph.facebook.com/v21.0/{business_id}/owned_ad_accounts"
    params = {
        'access_token': access_token,
        'fields': 'account_id,name',
        'limit': 100  # Aumenta o limite por página
    }
    
    accounts = []
    response = requests.get(url, params=params).json()
    
    # Adiciona as contas da primeira página
    if 'data' in response:
        accounts.extend(response['data'])
        
    # Tratamento de Paginação (Caso tenha mais de 100 contas)
    while 'paging' in response and 'next' in response['paging']:
        response = requests.get(response['paging']['next']).json()
        accounts.extend(response['data'])
        
    return accounts
```

### 3. Integração com o Fluxo Existente
O desenvolvedor deve criar um loop que conecte a função acima com a sua lógica de extração atual:

```python
# 1. Coleta os dados mestre
token = "SEU_TOKEN_AQUI"
bm_id = "SEU_ID_DA_BM"

# 2. Busca todos os IDs automaticamente
lista_de_contas = get_all_ad_accounts(bm_id, token)

# 3. Executa a extração em cada conta encontrada
for conta in lista_de_contas:
    act_id = conta['id']  # Ex: "act_12345678"
    nome = conta['name']
    
    print(f"Iniciando extração da conta: {nome} ({act_id})...")
    
    # AQUI ENTRA A FUNÇÃO QUE VOCÊ JÁ TEM HOJE:
    # sua_funcao_de_extracao(act_id, token)
```

### 4. Pontos de Atenção para o Programador
* **Rate Limiting:** Se você tiver muitas contas (ex: 50+), a Meta pode bloquear por excesso de requisições. Sugerimos colocar um pequeno `time.sleep(1)` entre as extrações de cada conta.
* **Permissões:** Garantir que o Token gerado no [Facebook Developers](https://developers.facebook.com/) inclua `ads_read` e `business_management`.
* **Prefixo 'act_':** A API retorna o ID com o prefixo `act_`. Certifique-se de que a sua ferramenta atual aceita esse formato ou se precisa apenas dos números (usando `.replace('act_', '')`).
