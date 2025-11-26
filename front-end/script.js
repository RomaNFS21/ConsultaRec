const db = {
    get(key) { return JSON.parse(localStorage.getItem(key)) || []; },
    set(key, data) { localStorage.setItem(key, JSON.stringify(data)); },

    init() {
        if (this.get('especialidades').length === 0) {
            this.set('especialidades', [
                { id: 1, nome: "Clínica Geral", icone: "fa-user-doctor", descricao: "Atendimento primário e check-ups." },
                { id: 2, nome: "Cardiologia", icone: "fa-heart-pulse", descricao: "Saúde do coração e sistema circulatório." },
                { id: 3, nome: "Pediatria", icone: "fa-baby", descricao: "Acompanhamento de crianças e adolescentes." },
                { id: 4, nome: "Urologia", icone: "fa-mars", descricao: "Trato urinário e sistema reprodutor masculino." },
                { id: 5, nome: "Ginecologia", icone: "fa-venus", descricao: "Saúde da mulher e sistema reprodutor feminino." },
                { id: 6, nome: "Dermatologia", icone: "fa-hand-dots", descricao: "Cuidados com a pele, cabelos e unhas." },
                { id: 7, nome: "Psicologia", icone: "fa-brain", descricao: "Terapia, saúde mental e bem-estar emocional." }
            ]);
        }

        if (this.get('funcionarios').length === 0) {
            this.set('funcionarios', [
                { id: 20252411, nome: "Dr. César", cpf: "123.456.891-00", cargo: "Gerente", especialidade: "Clínica Geral" },
                { id: 20252611, nome: "Dra. Julia Santos", cpf: "456.789.101-12", cargo: "Chefe Cardiologista", especialidade: "Cardiologia" },
                { id: 20252511, nome: "Dra. Karol Mendes", cpf: "033.127.450-09", cargo: "Pediatra", especialidade: "Pediatria" },
                { id: 20252711, nome: "Dra. Cecília Oliveira", cpf: "809.562.310-27", cargo: "Ginecologista", especialidade: "Ginecologia" },
                { id: 20252811, nome: "Dr. Ruan Carlos", cpf: "694.218.570-03", cargo: "Urologista", especialidade: "Urologia" },
                { id: 20252911, nome: "Dr. Luis Vilas Boas", cpf: "152.740.980-51", cargo: "Dermatologista", especialidade: "Dermatologia" },
                { id: 20253011, nome: "Dr. Rafael Dias", cpf: "522.896.723-19", cargo: "Terapeuta", especialidade: "Psicologia" }
            ]);
        }

        if (this.get('pacientes').length === 0) {
            this.set('pacientes', [
                { id: 1, nome: "Peterson Siqueira", cpf: "111.222.333-44", telefone: "81999990000", email: "peter@email.com" },
                { id: 2, nome: "Maria Oliveira", cpf: "999.888.777-66", telefone: "81988887777", email: "maria@email.com" }
            ]);
        }
        if (this.get('consultas').length === 0) { this.set('consultas', []); }
    }
};

db.init();

const state = { user: null, type: null };

const app = {
    navegar(viewId) {
        document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
        const target = document.getElementById(`view-${viewId}`);
        if (target) target.classList.add('active');
    },

    abrirModalLogin(tipo) {
        if (state.user && state.type === tipo) {
            if (tipo === 'medico') admin.init();
            else paciente.init();
            return;
        }
        const modal = document.getElementById('modal-login');
        state.type = tipo;
        modal.style.display = 'block';

        const hint = document.getElementById('hint-login');
        if (tipo === 'medico') {
            document.getElementById('login-title').innerText = "Acesso Médico";
            document.getElementById('label-login').innerText = "ID (ex: 20252411)";
            hint.innerHTML = "<b>Admins:</b> 20252411 (César) ou 20252611 (Julia)";
        } else {
            document.getElementById('login-title').innerText = "Acesso Paciente";
            document.getElementById('label-login').innerText = "CPF";
            hint.innerHTML = "<b>Dica:</b> CPF 111.222.333-44";
        }
    },

    fecharModalLogin() {
        document.getElementById('modal-login').style.display = 'none';
        document.getElementById('form-login').reset();
    },

    login(val) {
        if (state.type === 'medico') {
            const user = db.get('funcionarios').find(f => f.id == val || f.cpf == val);
            if (user) {
                app.salvarSessao(user, 'medico');
                app.fecharModalLogin();
                admin.init();
            }
            else alert("Funcionário não encontrado.");
        } else {
            const user = db.get('pacientes').find(p => p.cpf === val);
            if (user) {
                app.salvarSessao(user, 'paciente');
                app.fecharModalLogin();
                paciente.init();
            }
            else alert("Paciente não encontrado.");
        }
    },

    salvarSessao(user, type) {
        state.user = user; state.type = type;
        localStorage.setItem('session_user', JSON.stringify(user));
        localStorage.setItem('session_type', type);
    },

    carregarSessao() {
        const savedUser = localStorage.getItem('session_user');
        const savedType = localStorage.getItem('session_type');
        if (savedUser && savedType) {
            state.user = JSON.parse(savedUser);
            state.type = savedType;
        }
    },

    logout() {
        state.user = null; state.type = null;
        localStorage.removeItem('session_user');
        localStorage.removeItem('session_type');
        if (document.getElementById('view-home')) app.navegar('home');
        else window.location.href = 'index.html';
    },

    notify(msg) {
        const box = document.getElementById('msg-box');
        if (box) {
            box.innerText = msg; box.style.display = 'block';
            setTimeout(() => box.style.display = 'none', 3000);
        } else alert(msg);
    },

    cadastrarNovoPaciente(e) {
        e.preventDefault();
        const nome = document.getElementById('cad-nome').value;
        const cpf = document.getElementById('cad-cpf').value;
        const pacientes = db.get('pacientes');
        if (pacientes.find(p => p.cpf === cpf)) return alert("CPF já cadastrado!");
        pacientes.push({ id: Date.now(), nome, cpf, telefone: document.getElementById('cad-telefone').value });
        db.set('pacientes', pacientes);
        alert("Cadastrado!");
        window.location.href = "index.html";
    }
};

const paciente = {
    init() {
        app.navegar('paciente');
        document.getElementById('paciente-nome-display').innerText = state.user.nome;
        this.carregarEspecialidades();
        this.carregarMeusAgendamentos();
        const inputData = document.getElementById('p-data');
        if (inputData) inputData.addEventListener('change', () => this.atualizarHorariosDisponiveis());
    },

    carregarEspecialidades() {
        const sel = document.getElementById('p-select-esp');
        if (!sel) return;
        sel.innerHTML = '<option value="">Selecione...</option>';
        db.get('especialidades').forEach(e => sel.innerHTML += `<option value="${e.nome}">${e.nome}</option>`);
    },

    filtrarMedicosPorEspecialidade() {
        const esp = document.getElementById('p-select-esp').value;
        const selProf = document.getElementById('p-select-prof');
        selProf.innerHTML = '<option value="">Selecione...</option>';
        selProf.disabled = !esp;
        document.getElementById('p-hora').innerHTML = '<option value="">Selecione data e médico...</option>';
        if (esp) {
            const medicos = db.get('funcionarios').filter(f => f.especialidade === esp);
            if (medicos.length === 0) selProf.innerHTML = '<option>Nenhum médico disponível</option>';
            medicos.forEach(m => selProf.innerHTML += `<option value="${m.id}">${m.nome}</option>`);
            selProf.onchange = () => this.atualizarHorariosDisponiveis();
        }
    },

    atualizarHorariosDisponiveis() {
        const idProf = document.getElementById('p-select-prof').value;
        const dataSelecionada = document.getElementById('p-data').value;
        const selectHora = document.getElementById('p-hora');
        if (!idProf || !dataSelecionada) {
            selectHora.innerHTML = '<option value="">Preencha médico e data...</option>';
            return;
        }

        const dataObj = new Date(dataSelecionada + 'T00:00:00');
        const diaSemana = dataObj.getDay();
        let horariosPossiveis = [];

        if (diaSemana === 0) {
            selectHora.innerHTML = '<option value="">Fechado aos Domingos</option>'; return;
        } else if (diaSemana === 6) {
            horariosPossiveis = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00"];
        } else {
            horariosPossiveis = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
        }

        const dataFormatada = dataSelecionada.split('-').reverse().join('/');
        const ocupados = db.get('consultas')
            .filter(c => c.id_profissional == idProf && c.data === dataFormatada && c.status !== 'Cancelada')
            .map(c => c.horario);

        selectHora.innerHTML = '<option value="">Selecione um horário...</option>';
        horariosPossiveis.forEach(h => {
            if (!ocupados.includes(h)) selectHora.innerHTML += `<option value="${h}">${h}</option>`;
            else selectHora.innerHTML += `<option value="${h}" disabled style="color:red">${h} (Ocupado)</option>`;
        });
    },

    agendar(e) {
        e.preventDefault();
        const idProf = document.getElementById('p-select-prof').value;
        const hora = document.getElementById('p-hora').value;
        const data = document.getElementById('p-data').value;
        if (!idProf || !data || !hora) return alert("Preencha todos os campos!");

        const dataFormatada = data.split('-').reverse().join('/');
        const conflito = db.get('consultas').find(c => c.id_profissional == idProf && c.data == dataFormatada && c.horario == hora && c.status !== 'Cancelada');

        if (conflito) return alert("Erro: Horário já ocupado!");

        const consultas = db.get('consultas');
        consultas.push({
            id: Date.now(),
            cpf_paciente: state.user.cpf,
            nome_paciente: state.user.nome,
            id_profissional: idProf,
            data: dataFormatada,
            horario: hora,
            status: 'Agendada'
        });
        db.set('consultas', consultas);
        app.notify("Agendado!");
        this.carregarMeusAgendamentos();
        this.atualizarHorariosDisponiveis();
        document.getElementById('form-agendamento-paciente').reset();
    },

    carregarMeusAgendamentos() {
        const tbody = document.querySelector('#tabela-meus-agendamentos tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        const minhas = db.get('consultas').filter(c => c.cpf_paciente === state.user.cpf);
        minhas.forEach(c => {
            const med = db.get('funcionarios').find(f => f.id == c.id_profissional);
            const statusClass = c.status === 'Concluída' ? 'color:green' : (c.status === 'Cancelada' ? 'color:red' : 'color:blue');
            tbody.innerHTML += `<tr><td>${c.data}</td><td>${c.horario}</td><td>${med ? med.nome : '?'}</td><td><strong style="${statusClass}">${c.status || 'Agendada'}</strong></td><td>${c.status !== 'Cancelada' && c.status !== 'Concluída' ? `<button onclick="paciente.cancelar(${c.id})" class="btn-logout">X</button>` : '-'}</td></tr>`;
        });
    },

    cancelar(id) {
        if (confirm("Cancelar consulta?")) {
            let consultas = db.get('consultas');
            const idx = consultas.findIndex(c => c.id === id);
            if (idx !== -1) {
                consultas[idx].status = 'Cancelada';
                db.set('consultas', consultas);
                this.carregarMeusAgendamentos();
                if (document.getElementById('p-data').value) this.atualizarHorariosDisponiveis();
            }
        }
    }
};

const admin = {
    admins: [20252411, 20252611],

    init() {
        app.navegar('medico');
        document.getElementById('medico-nome-display').innerText = state.user.nome;
        document.getElementById('medico-cargo-display').innerText = state.user.cargo;
        const isAdmin = this.admins.includes(parseInt(state.user.id));
        
        const displayStyle = isAdmin ? 'flex' : 'none';
        ['btn-dash', 'btn-equipe', 'btn-pacientes'].forEach(id => {
            if (document.getElementById(id)) document.getElementById(id).style.display = displayStyle;
        });

        if (isAdmin) {
            this.showTab('dash');
            this.updateStats();
        } else {
            this.showTab('consultas');
        }
    },

    showTab(id) {
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.sidebar-menu button').forEach(b => b.classList.remove('active'));

        document.getElementById(`tab-${id}`).classList.add('active');
        if (id === 'consultas') document.getElementById('btn-agenda').classList.add('active');
        if (id === 'dash' && document.getElementById('btn-dash')) document.getElementById('btn-dash').classList.add('active');

        if (id === 'funcionarios') this.listarFuncionarios();
        if (id === 'consultas') this.listarConsultas();
        if (id === 'pacientes') this.listarPacientes();
    },

    updateStats() {
        document.getElementById('stat-pacientes').innerText = db.get('pacientes').length;
        document.getElementById('stat-equipe').innerText = db.get('funcionarios').length;
        document.getElementById('stat-consultas').innerText = db.get('consultas').length;
    },

    listarConsultas() {
        const tbody = document.querySelector('#admin-tabela-consultas tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const isAdmin = this.admins.includes(parseInt(state.user.id));
        const todasConsultas = db.get('consultas');
        const funcionarios = db.get('funcionarios');

        const consultasFiltradas = isAdmin
            ? todasConsultas
            : todasConsultas.filter(c => c.id_profissional == state.user.id);

        if (consultasFiltradas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">Nenhuma consulta encontrada.</td></tr>';
            return;
        }

        consultasFiltradas.forEach(c => {
            const med = funcionarios.find(f => f.id == c.id_profissional);
            const status = c.status || 'Agendada';

            let acoes = '-';
            if (status === 'Agendada') {
                acoes = `
                    <button class="btn-add" style="padding:5px 10px; font-size:0.8rem" onclick="admin.concluirConsulta(${c.id})">✅ Concluir</button>
                    <button class="btn-edit" style="padding:5px 10px; font-size:0.8rem" onclick="admin.remarcarConsulta(${c.id})">🔄 Remarcar</button>
                `;
            }

            tbody.innerHTML += `
                <tr>
                    <td>${c.data} às ${c.horario}</td>
                    <td>${c.nome_paciente}</td>
                    <td>${med ? med.nome : '?'}</td>
                    <td><strong style="${status === 'Concluída' ? 'color:green' : (status === 'Cancelada' ? 'color:red' : 'color:blue')}">${status}</strong></td>
                    <td>${acoes}</td>
                </tr>
            `;
        });
    },

    concluirConsulta(id) {
        if (confirm("Marcar consulta como concluída?")) {
            let consultas = db.get('consultas');
            const index = consultas.findIndex(c => c.id === id);
            if (index !== -1) {
                consultas[index].status = 'Concluída';
                db.set('consultas', consultas);
                this.listarConsultas();
                app.notify("Consulta concluída com sucesso!");
            }
        }
    },

    remarcarConsulta(id) {
        const novaData = prompt("Nova Data (DD/MM/AAAA):");
        if (!novaData) return;
        const novoHorario = prompt("Novo Horário (HH:MM):");
        if (!novoHorario) return;

        const consultas = db.get('consultas');
        const consultaAtual = consultas.find(c => c.id === id);

        const conflito = consultas.find(c =>
            c.id_profissional == consultaAtual.id_profissional &&
            c.data == novaData &&
            c.horario == novoHorario &&
            c.id !== id &&
            c.status !== 'Cancelada'
        );

        if (conflito) return alert("Erro: Esse horário já está ocupado!");

        const index = consultas.findIndex(c => c.id === id);
        if (index !== -1) {
            consultas[index].data = novaData;
            consultas[index].horario = novoHorario;
            db.set('consultas', consultas);
            this.listarConsultas();
            app.notify("Consulta remarcada!");
        }
    },

    listarFuncionarios() {
        const tbody = document.querySelector('#admin-tabela-funcionarios tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        db.get('funcionarios').forEach(f => {
            tbody.innerHTML += `<tr><td>${f.id}</td><td>${f.nome}</td><td>${f.especialidade || f.cargo}</td><td>${f.cpf}</td><td><button class="btn-logout" onclick="admin.deletarFunc(${f.id})">Remover</button></td></tr>`;
        });
    },

    abrirModalCadastroFuncionario() { document.getElementById('modal-cad-func').style.display = 'block'; },

    cadastrarFuncionario(e) {
        e.preventDefault();
        const nome = document.getElementById('mf-nome').value;
        const cpf = document.getElementById('mf-cpf').value;
        const cargo = document.getElementById('mf-cargo').value;
        const novoId = Math.floor(20250000 + Math.random() * 9000);
        const funcs = db.get('funcionarios');
        funcs.push({ id: novoId, nome, cpf, cargo: "Médico", especialidade: cargo });
        db.set('funcionarios', funcs);
        document.getElementById('modal-cad-func').style.display = 'none';
        document.getElementById('form-cad-func').reset();
        app.notify("Funcionário cadastrado!");
        this.listarFuncionarios();
        this.updateStats();
    },

    deletarFunc(id) {
        if (confirm("Remover este funcionário?")) {
            db.set('funcionarios', db.get('funcionarios').filter(f => f.id !== id));
            this.listarFuncionarios();
            this.updateStats();
        }
    },

    listarPacientes() {
        const tbody = document.querySelector('#admin-tabela-pacientes tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        db.get('pacientes').forEach(p => {
            tbody.innerHTML += `
                <tr>
                    <td>${p.nome}</td>
                    <td>${p.cpf}</td>
                    <td>${p.telefone}</td>
                    <td style="display: flex; gap: 10px;">
                        <button class="btn-edit" onclick="admin.editarPaciente(${p.id})" title="Editar">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn-logout" onclick="admin.deletarPaciente(${p.id})" title="Excluir" style="padding: 6px 12px;">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>`;
        });
    },

    editarPaciente(id) {
        const pacientes = db.get('pacientes');
        const p = pacientes.find(x => x.id === id);

        if (p) {
            const novoNome = prompt("Editar Nome:", p.nome);
            if (novoNome !== null) { 
                p.nome = novoNome;
                p.telefone = prompt("Editar Telefone:", p.telefone) || p.telefone;
                db.set('pacientes', pacientes);
                this.listarPacientes();
                app.notify("Paciente atualizado!");
            }
        }
    },

    deletarPaciente(id) {
        if (confirm("Tem certeza que deseja excluir este paciente do sistema?")) {
            let lista = db.get('pacientes');
            lista = lista.filter(p => p.id !== id);
            db.set('pacientes', lista);
            this.listarPacientes();
            this.updateStats();
            app.notify("Paciente removido.");
        }
    }
};

window.onload = function () {
    app.carregarSessao();
    if (typeof app.renderHomeServices === 'function') app.renderHomeServices();

    const grid = document.getElementById('lista-especialidades');
    if (grid) {
        const lista = db.get('especialidades');
        grid.innerHTML = '';
        lista.forEach(esp => {
            grid.innerHTML += `
                <div class="card-service" style="width: 100%; max-width: 300px; text-align: left;">
                    <div style="display:flex; justify-content:space-between; align-items:start;">
                        <i class="fa-solid ${esp.icone}" style="font-size: 2.5rem; padding:0; margin-bottom: 15px;"></i>
                        <span style="background: #e6f0fa; color: #004481; padding: 5px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: bold;">ID: ${esp.id}</span>
                    </div>
                    <h3 style="font-size: 1.5rem;">${esp.nome}</h3>
                    <p style="color: #666; font-size: 0.95rem;">${esp.descricao}</p>
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
                        <small style="color: var(--secondary); font-weight: bold;">Disponível para agendamento</small>
                    </div>
                </div>`;
        });
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'agendar') {
        window.history.replaceState({}, document.title, window.location.pathname);
        if (state.user && state.type === 'paciente') {
            paciente.init();
        } else if (document.getElementById('modal-login')) {
            app.abrirModalLogin('paciente');
        } else {
            window.location.href = 'index.html?action=agendar';
        }
    }
};

if (document.getElementById('form-login')) document.getElementById('form-login').onsubmit = (e) => { e.preventDefault(); app.login(document.getElementById('login-input').value); };
if (document.getElementById('form-agendamento-paciente')) document.getElementById('form-agendamento-paciente').onsubmit = (e) => { paciente.agendar(e); };
if (document.getElementById('form-cadastro-paciente')) document.getElementById('form-cadastro-paciente').onsubmit = (e) => { app.cadastrarNovoPaciente(e); };
if (document.getElementById('form-cad-func')) document.getElementById('form-cad-func').onsubmit = (e) => { admin.cadastrarFuncionario(e); };

window.onclick = (e) => { 
    if (e.target.className === 'modal') e.target.style.display = 'none'; 
};