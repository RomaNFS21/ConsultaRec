Lider Tecnico: Victor Barros Roma

Integrantes:
- Cauã Henrique Melo Almeida
- João Felipe Bonifácio Barros Da Silva
- Luis Henrique Vilas Boas Silva De Sousa
- Pedro Henrique Marques Feitosa
- Rafael Medeiros Machado Dias
- Ruan Carlos Oliveira da Silva

Desafio 3 - Sistema de Agendamento de Consultas em Unidade Básica de Saúde

Lider Tecnico: Victor Barros Roma

Integrantes:
- Cauã Henrique Melo Almeida
- João Felipe Bonifácio Barros Da Silva
- Luis Henrique Vilas Boas Silva De Sousa
- Pedro Henrique Marques Feitosa
- Rafael Medeiros Machado Dias
- Ruan Carlos Oliveira da Silva

Desafio 3 - Sistema de Agendamento de Consultas em Unidade Básica de Saúde

---

### STATUS E INFRAESTRUTURA ATUALIZADA (2025-11-30)

O projeto foi totalmente migrado para uma arquitetura **Cliente-Servidor (Front-end com HTML/JS/CSS e Back-end com Flask API)**.

#### **Tecnologias de Backend**
* **Python:** Linguagem principal.
* **Flask:** Framework para criação da API REST.
* **JSON:** Arquivos utilizados para persistência de dados (simulando um banco de dados).

**** ATENÇÃO! ****

#### **Execução Rápida do Projeto**
Para iniciar o sistema (Front-end e Back-end) com um clique, execute o script **`iniciar.bat`** na **raiz do projeto**.

---

### O que foi feito> IMPLEMENTAÇÕES DA API

**Migração de Persistência (`localStorage` -> JSON via API)**
* **Objetivo:** Eliminar a dependência do `localStorage` (dados salvos apenas no navegador do cliente) e garantir que todos os dados sejam persistidos de forma centralizada nos arquivos `.json` do servidor.
* **Ação:** O `script.js` foi reescrito para usar a função `fetch()` e se comunicar **exclusivamente** com o `app.py` para todas as operações de leitura e escrita (CRUD: Cadastro, Leitura, Atualização, Deleção).

**Rotas da API Implementadas (`back-end/app.py`):**
* `POST /api/pacientes`: Cadastro de novos pacientes.
* `POST /api/funcionarios`: Cadastro de novos funcionários.
* `POST /api/login`: Autenticação de paciente ou médico.
* `GET /api/data/<key>`: Leitura de listas (pacientes, funcionários, consultas, especialidades).
* `POST /api/consultas`: Agendamento de consultas.
* `POST /api/consultas/<id>/cancelar`: Cancelamento de consulta.
* `POST /api/consultas/<id>/concluir`: Conclusão de consulta.
* `DELETE /api/pacientes/<id>`: Remoção de paciente.

---
