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

    async login(val) {
        const url = 'http://127.0.0.1:5000/api/login';
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ valor: val, tipo: state.type })
            });

            const data = await response.json();

            if (response.ok) {
                app.salvarSessao(data.user, data.type);
                app.fecharModalLogin();
                if (data.type === 'medico') admin.init();
                else paciente.init();
            } else {
                alert(data.message || "Erro de autenticação.");
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
            alert('Erro ao conectar com a API. Verifique se o servidor Python está ativo.');
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

    async cadastrarNovoPaciente(e) {
        e.preventDefault();
        const nome = document.getElementById('cad-nome').value;
        const cpf = document.getElementById('cad-cpf').value;
        const telefone = document.getElementById('cad-telefone').value;
        const email = document.getElementById('cad-email').value;

        const dadosCadastro = { nome, cpf, telefone, email };

        try {
            const response = await fetch('http://127.0.0.1:5000/api/pacientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosCadastro),
            });
            const data = await response.json();

            if (response.ok) {
                document.getElementById('form-cadastro-paciente').reset();
                app.notify(`Sucesso! Paciente ${dadosCadastro.nome} cadastrado.`);
                setTimeout(() => { window.location.href = 'index.html'; }, 1500);
            } else {
                app.notify(data.message || 'Erro ao cadastrar paciente.');
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
            app.notify('Erro ao conectar com a API. Verifique se o servidor Python está ativo.');
        }
    }
};

const state = { user: null, type: null };

const paciente = {
    async getData(key) {
        const response = await fetch(`http://127.0.0.1:5000/api/data/${key}`);
        return response.ok ? await response.json() : [];
    },

    init() {
        app.navegar('paciente');
        document.getElementById('paciente-nome-display').innerText = state.user.nome;
        this.carregarEspecialidades();
        this.carregarMeusAgendamentos();
        const inputData = document.getElementById('p-data');
        if (inputData) inputData.addEventListener('change', () => this.atualizarHorariosDisponiveis());
    },

    async carregarEspecialidades() {
        const sel = document.getElementById('p-select-esp');
        if (!sel) return;
        const especialidades = await this.getData('especialidades');
        sel.innerHTML = '<option value="">Selecione...</option>';
        especialidades.forEach(e => sel.innerHTML += `<option value="${e.nome}">${e.nome}</option>`);
    },

    async filtrarMedicosPorEspecialidade() {
        const esp = document.getElementById('p-select-esp').value;
        const selProf = document.getElementById('p-select-prof');
        selProf.innerHTML = '<option value="">Selecione...</option>';
        selProf.disabled = !esp;
        document.getElementById('p-hora').innerHTML = '<option value="">Selecione data e médico...</option>';
        
        if (esp) {
            const funcionarios = await this.getData('funcionarios');
            const medicos = funcionarios.filter(f => f.especialidade === esp);
            if (medicos.length === 0) selProf.innerHTML = '<option>Nenhum médico disponível</option>';
            medicos.forEach(m => selProf.innerHTML += `<option value="${m.id}">${m.nome}</option>`);
            selProf.onchange = () => this.atualizarHorariosDisponiveis();
        }
    },

    async atualizarHorariosDisponiveis() {
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
        const consultas = await this.getData('consultas');
        const ocupados = consultas
            .filter(c => c.id_profissional == idProf && c.data === dataFormatada && c.status !== 'Cancelada')
            .map(c => c.horario);

        selectHora.innerHTML = '<option value="">Selecione um horário...</option>';
        horariosPossiveis.forEach(h => {
            if (!ocupados.includes(h)) selectHora.innerHTML += `<option value="${h}">${h}</option>`;
            else selectHora.innerHTML += `<option value="${h}" disabled style="color:red">${h} (Ocupado)</option>`;
        });
    },

    async agendar(e) {
        e.preventDefault();
        const idProf = document.getElementById('p-select-prof').value;
        const hora = document.getElementById('p-hora').value;
        const data = document.getElementById('p-data').value;
        if (!idProf || !data || !hora) return alert("Preencha todos os campos!");

        const dataFormatada = data.split('-').reverse().join('/');
        
        const dadosAgendamento = {
            cpf_paciente: state.user.cpf,
            nome_paciente: state.user.nome,
            id_profissional: parseInt(idProf),
            data: dataFormatada,
            horario: hora,
        };

        try {
            const response = await fetch('http://127.0.0.1:5000/api/consultas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosAgendamento),
            });
            const dataResponse = await response.json();

            if (response.ok) {
                app.notify("Agendado!");
                this.carregarMeusAgendamentos();
                this.atualizarHorariosDisponiveis();
                document.getElementById('form-agendamento-paciente').reset();
            } else {
                alert(dataResponse.message || "Erro ao agendar consulta.");
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
            app.notify('Erro ao conectar com a API.');
        }
    },

    async carregarMeusAgendamentos() {
        const tbody = document.querySelector('#tabela-meus-agendamentos tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        const consultas = await this.getData('consultas');
        const funcionarios = await this.getData('funcionarios');
        const minhas = consultas.filter(c => c.cpf_paciente === state.user.cpf);

        minhas.forEach(c => {
            const med = funcionarios.find(f => f.id == c.id_profissional);
            const statusClass = c.status === 'Concluída' ? 'color:green' : (c.status === 'Cancelada' ? 'color:red' : 'color:blue');
            tbody.innerHTML += `<tr><td>${c.data}</td><td>${c.horario}</td><td>${med ? med.nome : '?'}</td><td><strong style="${statusClass}">${c.status || 'Agendada'}</strong></td><td>${c.status !== 'Cancelada' && c.status !== 'Concluída' ? `<button onclick="paciente.cancelar(${c.id})" class="btn-logout">X</button>` : '-'}</td></tr>`;
        });
    },

    async cancelar(id) {
        if (confirm("Cancelar consulta?")) {
            try {
                const response = await fetch(`http://127.0.0.1:5000/api/consultas/${id}/cancelar`, { method: 'POST' });
                const data = await response.json();
                if (response.ok) {
                    app.notify(data.message);
                    this.carregarMeusAgendamentos();
                    this.atualizarHorariosDisponiveis();
                } else {
                    alert(data.message);
                }
            } catch (error) {
                app.notify('Erro ao conectar com a API.');
            }
        }
    }
};

const admin = {
    admins: [20252411, 20252611],

    async getData(key) {
        const response = await fetch(`http://127.0.0.1:5000/api/data/${key}`);
        return response.ok ? await response.json() : [];
    },

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

    async updateStats() {
        const pacientes = await this.getData('pacientes');
        const funcionarios = await this.getData('funcionarios');
        const consultas = await this.getData('consultas');
        document.getElementById('stat-pacientes').innerText = pacientes.length;
        document.getElementById('stat-equipe').innerText = funcionarios.length;
        document.getElementById('stat-consultas').innerText = consultas.length;
    },

    async listarConsultas() {
        const tbody = document.querySelector('#admin-tabela-consultas tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const isAdmin = this.admins.includes(parseInt(state.user.id));
        const todasConsultas = await this.getData('consultas');
        const funcionarios = await this.getData('funcionarios');

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

    async concluirConsulta(id) {
        if (confirm("Marcar consulta como concluída?")) {
            try {
                const response = await fetch(`http://127.0.0.1:5000/api/consultas/${id}/concluir`, { method: 'POST' });
                const data = await response.json();
                if (response.ok) {
                    app.notify(data.message);
                    this.listarConsultas();
                } else {
                    alert(data.message);
                }
            } catch (error) {
                app.notify('Erro ao conectar com a API.');
            }
        }
    },

    async listarFuncionarios() {
        const tbody = document.querySelector('#admin-tabela-funcionarios tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        const funcionarios = await this.getData('funcionarios');
        funcionarios.forEach(f => {
            tbody.innerHTML += `<tr><td>${f.id}</td><td>${f.nome}</td><td>${f.especialidade || f.cargo}</td><td>${f.cpf}</td><td>-</td></tr>`;
        });
    },

    abrirModalCadastroFuncionario() { document.getElementById('modal-cad-func').style.display = 'block'; },

    async cadastrarFuncionario(e) {
        e.preventDefault();
        const nome = document.getElementById('mf-nome').value;
        const cpf = document.getElementById('mf-cpf').value;
        const cargo = document.getElementById('mf-cargo').value; 
        const especialidade = cargo;

        const dadosCadastro = { nome, cpf, cargo, especialidade };
        
        try {
            const response = await fetch('http://127.0.0.1:5000/api/funcionarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosCadastro),
            });
            const data = await response.json();

            if (response.ok) {
                document.getElementById('modal-cad-func').style.display = 'none';
                document.getElementById('form-cad-func').reset();
                app.notify(`Funcionário ${nome} cadastrado com ID: ${data.id}`);
                this.listarFuncionarios();
                this.updateStats();
            } else {
                alert(data.message || 'Erro ao cadastrar funcionário.');
            }
        } catch (error) {
            app.notify('Erro ao conectar com a API.');
        }
    },

    async listarPacientes() {
        const tbody = document.querySelector('#admin-tabela-pacientes tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        const pacientes = await this.getData('pacientes');

        pacientes.forEach(p => {
            tbody.innerHTML += `
                <tr>
                    <td>${p.nome}</td>
                    <td>${p.cpf}</td>
                    <td>${p.telefone}</td>
                    <td style="display: flex; gap: 10px;">
                        <button class="btn-logout" onclick="admin.deletarPaciente(${p.id})" title="Excluir" style="padding: 6px 12px;">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>`;
        });
    },

    async deletarPaciente(id) {
        if (confirm("Tem certeza que deseja excluir este paciente do sistema?")) {
            try {
                const response = await fetch(`http://127.0.0.1:5000/api/pacientes/${id}`, { method: 'DELETE' });
                const data = await response.json();
                if (response.ok) {
                    app.notify(data.message);
                    this.listarPacientes();
                    this.updateStats();
                } else {
                    alert(data.message);
                }
            } catch (error) {
                app.notify('Erro ao conectar com a API.');
            }
        }
    }
};

window.onload = function () {
    app.carregarSessao();
    
    if (document.getElementById('lista-especialidades')) {
        paciente.getData('especialidades').then(lista => {
            const grid = document.getElementById('lista-especialidades');
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
if (document.getElementById('p-select-esp')) document.getElementById('p-select-esp').onchange = () => paciente.filtrarMedicosPorEspecialidade();
if (document.getElementById('form-agendamento-paciente')) document.getElementById('form-agendamento-paciente').onsubmit = (e) => { paciente.agendar(e); };
if (document.getElementById('form-cadastro-paciente')) document.getElementById('form-cadastro-paciente').onsubmit = (e) => { app.cadastrarNovoPaciente(e); };
if (document.getElementById('form-cad-func')) document.getElementById('form-cad-func').onsubmit = (e) => { admin.cadastrarFuncionario(e); };

window.onclick = (e) => { 
    if (e.target.className === 'modal') e.target.style.display = 'none'; 
};
