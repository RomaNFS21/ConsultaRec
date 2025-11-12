Lider Tecnico: Victor Barros Roma

Integrantes:
- Cauã Henrique Melo Almeida
- João Felipe Bonifácio Barros Da Silva
- Luis Henrique Vilas Boas Silva De Sousa
- Pedro Henrique Marques Feitosa
- Rafael Medeiros Machado Dias
- Ruan Carlos Oliveira da Silva

Desafio 3 - Sistema de Agendamento de Consultas em Unidade Básica de Saúde

Projeto de Agendamento UBS
Este projeto é um sistema de agendamento online simples, desenvolvido em Flask (Python) e JavaScript, que simula o fluxo de trabalho entre pacientes (Usuários Comuns) e médicos (Administradores) em uma Unidade Básica de Saúde (UBS).

Funcionalidades Principais Implementadas
O sistema inclui melhorias de UX e funcionalidades essenciais de gestão:

Agendamento em Cascata: Seleção de Especialidade → Médico → Data/Hora.

Bloqueio de Horário: Não permite agendamentos duplicados (1 consulta por hora/médico).

UX Aprimorada: Destaque visual (simulado em azul) para dias disponíveis no calendário ao selecionar um médico.

Minha Agenda: Visualização das consultas agendadas, incluindo o status atual.

Gestão de Perfil: Capacidade de visualizar e atualizar Nome, Telefone e Endereço.

Cancelamento: Paciente pode cancelar consultas, alterando o status para CANCELADA.

Gestão de Disponibilidade Recorrente: Interface aprimorada para cadastrar horários de plantão para múltiplos dias da semana de uma só vez.

Grade Semanal (Dashboard): Visualização da agenda para os próximos 7 dias, mostrando slots ocupados e disponíveis.

Gestão de Status: Capacidade de alterar o status das consultas (Ex: PENDENTE, CONFIRMADA, REALIZADA).

Visualização Completa do Paciente: Ao ver a agenda, o médico visualiza o nome completo e telefone do paciente.

Estrutura de Arquivos
/
|-- app.py              # Backend (Flask): Rotas, lógica de negócio, autenticação e CRUD.
|-- script.js           # Frontend Logic: Manipulação do DOM, chamadas AJAX e lógica do lado do cliente.
|-- style.css           # Estilos: Contém o design moderno e "soft" da interface.
|-- index.html          # Página Principal: Contém as seções de Agendamento, Disponibilidade e Agenda.
|-- login.html          # Página de Login.
|-- registro.html       # Página de Registro (inclui campos de perfil e especialidades para médicos).
|
|-- db_users.json       # DB Usuários: Dados de login, perfil e especialidades dos médicos.
|-- db_appointments.json# DB Agendamentos: Consultas marcadas e seus status.
|-- db_availabilities.json# DB Disponibilidade: Horários de plantão recorrentes dos médicos.
|-- README.txt          # Este arquivo.

**Como Rodar o Projeto**

Este projeto requer Python 3 e a biblioteca Flask.

1. Pré-requisito: Instalar o Flask
Abra seu terminal e execute: py -m pip install Flask

2. Ativação do Servidor
Navegue até o diretório raiz do projeto no seu terminal: cd /caminho/para/seu/projeto/

3. Execute o script principal: py app.py

4. Acesso: Acesse: http://127.0.0.1:5000 em seu navegador.

5. Desativar o Servidor: No terminal onde o servidor está rodando, pressione Ctrl + C.
