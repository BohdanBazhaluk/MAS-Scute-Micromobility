# 🛴 Scute — Plataforma de Micromobilidade Inteligente

Projeto desenvolvido no âmbito da unidade curricular **40431 — Modelação e Análise de Sistemas**
**Grupo 23:** Bohdan Bazhaluk [131776] · Gabriel Sousa [131767] · Guilherme Lourenço [133142]

---

## 🚀 Sobre o Projeto

O **Scute** introduz uma plataforma de micromobilidade inteligente que combina o aluguer de veículos elétricos com um modelo gamificado.

O projeto foi desenvolvido como uma aplicação web sem backend (**HTML, CSS e JavaScript**), recorrendo à API **Mapbox** para visualização do mapa e ao **LocalStorage** para simular a persistência de dados.

Este primeiro incremento foca-se principalmente na implementação do **Épico #1 — Aluguer de Veículos**, cobrindo os fluxos de:

* Consulta do mapa de veículos
* Início de viagem
* Término de viagem
* Validação de cenários de erro e bloqueio

---

## 🌐 Recursos Oficiais

**Versão Online (Deployment)**
https://bohdanbazhaluk.github.io/scute/

**Repositório GitHub**
https://github.com/BohdanBazhaluk/scute

**Testes de Aceitação (Automação)**
https://drive.google.com/drive/folders/13N2IluO2bg_H4fAGbNDWHzvzKRCW9lC_?usp=sharing

---

## 💻 Como Correr Localmente

Não requer instalação de dependências nem backend.

Basta abrir diretamente:

```text
index.html → abrir com qualquer browser moderno
(Chrome, Firefox, Safari ou Edge)
```

Ou servir localmente:

```bash
npx serve .
```

---

## 👤 Utilizador de Teste

| Campo           | Valor         |
| --------------- | ------------- |
| Nome            | Mariana Silva |
| Pontos iniciais | 456 pts       |
| Subscrição      | Ativa         |

> **Nota:**
> O estado da aplicação é persistido em `LocalStorage`.

Para repor os dados iniciais:

**F12 → Application → Local Storage → apagar entradas com prefixo `scute_`**

---

## 🚲 Veículos Disponíveis (Dados de Demonstração)

| ID     | Tipo               | Bateria | Estado                     |
| ------ | ------------------ | ------- | -------------------------- |
| SC-001 | Trotinete elétrica | 88%     | Disponível                 |
| SC-002 | Trotinete elétrica | 15%     | Disponível (bateria baixa) |
| SC-003 | E-Bike             | 92%     | Disponível                 |
| SC-004 | E-Bike             | 67%     | Disponível                 |
| SC-005 | Bicicleta          | 100%    | Disponível                 |
| SC-006 | Trotinete elétrica | 55%     | Disponível                 |
| SC-007 | E-Bike             | 73%     | Manutenção                 |
| SC-008 | Bicicleta          | 100%    | Disponível                 |
| SC-009 | Trotinete elétrica | 41%     | Disponível                 |
| SC-010 | E-Bike             | 80%     | Manutenção                 |

### Casos de teste úteis

**Bloqueio por bateria baixa:**
`SC-002`

**Bloqueio por manutenção:**
`SC-007` ou `SC-010`

---

## 🛠️ Fluxo Principal (Épico #1)

### 1. Consultar Mapa

Abrir a aplicação e visualizar os veículos disponíveis.

### 2. Selecionar Veículo

Clicar num marcador no mapa para abrir o painel lateral.

### 3. Iniciar Viagem

Selecionar **"Iniciar Viagem"**.

Abre o scanner QR simulado.

### 4. Inserir Código Manualmente

Exemplo:

```text
SC-001
```

A viagem inicia e o temporizador arranca.

### 5. Terminar Viagem

Pode ser terminado por:

* Botão **Terminar Viagem**
* Botão de debug **Simular Afastamento 25m**

Após isso é apresentado o resumo da viagem.

---

## ⚠️ Limitações do Incremento 1

Por se tratar de um protótipo focado na fase **Construction (OpenUP)**, existem limitações conhecidas:

### Leitura física de QR Code

O scanner é simulado por introdução manual do ID.

Não existe acesso real à câmara.

---

### Dados estáticos

A frota e missões são geradas por dados fixos.

Não existe base de dados externa.

---

### Distância estimada

A distância da viagem é calculada com base no tempo.

Não utiliza GPS real.

---

### Marketplace parcial

Os pontos podem ser consumidos ao selecionar recompensas.

Contudo:

* Não gera cupões reais
* Não cria missões
* Não bloqueia veículos

Funciona apenas como placeholder funcional.

---

## 🧪 Testes de Aceitação Automáticos

A validação dos critérios de aceitação foi realizada com **Selenium IDE** (Chrome e Firefox).

### Cenários cobertos

### US1.1 — Consulta do mapa

* Carga com sucesso
* Erro de conectividade
* Erro de GPS

### US1.2 — Filtros

* Aplicação de filtros com resultados
* Aplicação de filtros sem resultados

### US1.3 — Início de viagem

* Início manual
* Bloqueio por bateria baixa
* Bloqueio por manutenção

### US1.4 — Fim de viagem

* Término manual
* Término automático por afastamento de 25 metros

Os ficheiros de teste e vídeo demonstrativo encontram-se na entrega oficial do projeto.

---

## 📁 Estrutura do Repositório

```text
├── index.html       # Interface principal
├── style.css        # Estilos (mobile-first, dark/green theme)
├── app.js           # Lógica da aplicação
└── README.md        # Documentação principal
```

---

## 🏗️ Tecnologias Utilizadas

* HTML5
* CSS3
* JavaScript (Vanilla)
* Mapbox API
* LocalStorage
* Selenium IDE
* GitHub Pages

---

## 📌 Estado do Incremento

**Incremento 1 concluído**

Implementação funcional dos casos principais do **Épico #1: Aluguer de Veículos**, com cenários de aceitação validados e deployment disponível publicamente.
