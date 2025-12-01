# 🏥 ConsultaRec - Sistema de Agendamento UBS

> **Desafio 3 - Arquitetura Cliente-Servidor** > 🟢 **Status:** Concluído e Atualizado (30/11/2025)

O **ConsultaRec** é uma solução digital desenvolvida para modernizar o agendamento de consultas em Unidades Básicas de Saúde (UBS), focando na experiência do usuário e na integridade dos dados.

---

## 👥 Equipe de Desenvolvimento

| Função | Nome |
| :--- | :--- |
| **Líder Técnico** | **Victor Barros Roma** |
| Integrante | Cauã Henrique Melo Almeida |
| Integrante | João Felipe Bonifácio Barros Da Silva |
| Integrante | Luis Henrique Vilas Boas Silva De Sousa |
| Integrante | Pedro Henrique Marques Feitosa |
| Integrante | Rafael Medeiros Machado Dias |
| Integrante | Ruan Carlos Oliveira da Silva |

---

## 🚀 Principais Implementações (Atualização Recente)

Nesta etapa do projeto, o foco foi a migração completa da arquitetura para um modelo **Cliente-Servidor** robusto.

### ⚙️ 1. Migração de Persistência
**De:** `localStorage` (Navegador/Cliente)  
**Para:** JSON via API REST (Servidor Centralizado)

* **🎯 Objetivo:** Eliminar a dependência do armazenamento local (que prendia os dados ao navegador do usuário) e garantir que todas as informações (pacientes, agendamentos, funcionários) sejam persistidas de forma centralizada no servidor.
* **🛠️ Ação Técnica:** Refatoração completa do `front-end/script.js`. O código agora utiliza a Fetch API para se comunicar **exclusivamente** com o `back-end/app.py` para todas as operações de CRUD (Cadastro, Leitura, Atualização e Deleção).

### 🔗 2. Documentação da API (`back-end/app.py`)

Abaixo estão os *endpoints* implementados no servidor Flask para gerenciar o fluxo de dados do sistema:

#### 🔐 Autenticação
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `POST` | `/api/login` | Autenticação segura para Pacientes e Médicos. |

#### 🩺 Gestão de Consultas
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `POST` | `/api/consultas` | Agendamento de novas consultas. |
| `POST` | `/api/consultas/<id>/cancelar` | Cancelamento de consulta existente. |
| `POST` | `/api/consultas/<id>/concluir` | Marcação de consulta como realizada (Área Médica). |

#### 👥 Gestão de Usuários
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `POST` | `/api/pacientes` | Cadastro de novos pacientes. |
| `DELETE` | `/api/pacientes/<id>` | Remoção de paciente do sistema. |
| `POST` | `/api/funcionarios` | Cadastro de novos membros da equipe (Admin). |

#### 📂 Leitura de Dados
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/data/<key>` | Rota dinâmica para leitura de listas (`pacientes`, `funcionarios`, `consultas`, `especialidades`). |

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído sobre uma arquitetura Full Stack leve:

* **Back-end:** Python 3 + Flask (API REST)
* **Front-end:** HTML5, CSS3, JavaScript (ES6+)
* **Persistência:** Arquivos JSON (Simulando banco de dados NoSQL)
* **Ícones:** FontAwesome

---

## ▶️ Como Executar o Projeto

Para facilitar a avaliação, incluímos um script de inicialização automática.

1.  Certifique-se de ter o **Python 3** instalado em sua máquina.
2.  Na raiz do projeto, dê um duplo clique no arquivo:
    ```bash
    iniciar.bat
    ```
    > *Este script ativará o ambiente virtual (se configurado), iniciará o servidor Flask e abrirá o navegador automaticamente.*

**Execução Manual (Alternativa):**
```bash
# Terminal 1 - Iniciar Servidor
cd back-end
python app.py

# Terminal 2 - Acessar
# Abra o arquivo front-end/index.html no seu navegador ou acesse [http://127.0.0.1:5000](http://127.0.0.1:5000) se configurado para servir estáticos.
