// --- CONFIGURAÇÃO E VARIÁVEIS DE PERSISTÊNCIA HTTP ---
const API_BASE_URL = '/api'; 
const STORAGE_KEY_EMAIL = 'loggedUserEmail';
const STORAGE_KEY_ROLE = 'loggedUserRole';
let loggedUserEmail = localStorage.getItem(STORAGE_KEY_EMAIL) || null;
let loggedUserRole = localStorage.getItem(STORAGE_KEY_ROLE) || null;

// Variável para médicos
const DOCTOR_DOMAIN = '@ubs.com';

// --- REFERÊNCIAS DO DOM (Gerais) ---
const userDisplay = document.getElementById('user-display');
const logoutBtn = document.getElementById('logout-btn');
const profileIcon = document.getElementById('profile-icon');
const navAgendar = document.getElementById('nav-agendar');
const navDisponibilidade = document.getElementById('nav-disponibilidade');
const navConsultas = document.getElementById('nav-consultas');
const contentArea = document.getElementById('content-area');
const navProfile = document.getElementById('nav-profile'); 

// --- REFERÊNCIAS DO DOM (Agendamento - index.html) ---
const userRoleSection = document.getElementById('agendar');
const agendamentoForm = document.getElementById('agendamento-form');
const specialtySelect = document.getElementById('agendamento-especialidade');
const doctorSelectGroup = document.getElementById('doctor-select-group');
const doctorEmailSelect = document.getElementById('doctor-email');
const timeSelectGroup = document.getElementById('time-select-group');
const dataInput = document.getElementById('data');
const horaInput = document.getElementById('hora');
const availabilityMessage = document.getElementById('availability-message');

// --- REFERÊNCIAS DO DOM (Disponibilidade - index.html) ---
const adminRoleSection = document.getElementById('disponibilidade');
const availabilityForm = document.getElementById('availability-form');
const availabilitySlotsContainer = document.getElementById('availability-slots');
const addAvailabilityBtn = document.getElementById('add-availability-slot');
const noAvailabilityMsg = document.getElementById('no-availability-msg');
const weeklyScheduleGrid = document.getElementById('weekly-schedule-grid'); 
const weeklyScheduleLoading = document.getElementById('weekly-schedule-loading'); 

// --- REFERÊNCIAS DO DOM (Agenda - index.html) ---
const tabelaBody = document.querySelector('#consultas-tabela tbody');
const noConsultasDiv = document.getElementById('no-consultas');
const tableHeaderOtherParty = document.getElementById('table-header-other-party');
const tableHeaderStatus = document.getElementById('table-header-status'); 

// --- REFERÊNCIAS DO DOM (Perfil - index.html) ---
const profileSection = document.getElementById('profile');
const profileForm = document.getElementById('profile-form');
const profileNameInput = document.getElementById('profile-name');
const profileEmailInput = document.getElementById('profile-email');
const profilePhoneInput = document.getElementById('profile-phone');
const profileAddressInput = document.getElementById('profile-address');
const profileRoleDisplay = document.getElementById('profile-role-display');
const profileMsg = document.getElementById('profile-msg');


// --- CONSTANTES ---
const DIAS_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const DIAS_SEMANA_MAP = {
    0: "Domingo", 1: "Segunda", 2: "Terça", 3: "Quarta", 4: "Quinta", 5: "Sexta", 6: "Sábado"
};

// --- VARIÁVEIS DE ESTADO ---
let doctorAvailabilitiesCache = [];

// --- FUNÇÕES DE AUXÍLIO HTTP E ERROS ---

function getAuthHeader() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loggedUserEmail}`
    };
}

async function handleResponse(response) {
    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { message: `Erro HTTP: ${response.status}` };
        }
        throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
    }
    return response.json();
}

// --- FUNÇÕES DE CONTROLE DE UI E AUTENTICAÇÃO ---

async function fetchAndPopulateSpecialties(selectElementId) {
    try {
        const specialties = await fetch(`${API_BASE_URL}/specialties`).then(handleResponse);
        const selectElement = document.getElementById(selectElementId);
        
        if (!selectElement) return specialties;
        
        if (selectElementId === 'agendamento-especialidade') {
            selectElement.innerHTML = '<option value="">Selecione a Especialidade</option>';
        } else if (selectElementId === 'specialties-checkboxes') {
             selectElement.innerHTML = '';
        }
        
        specialties.forEach(s => {
            if (selectElementId === 'agendamento-especialidade') {
                const option = document.createElement('option');
                option.value = s;
                option.textContent = s;
                selectElement.appendChild(option);
            } else {
                const div = document.createElement('div');
                div.innerHTML = `
                    <input type="checkbox" id="spec-${s.replace(/\s/g, '-')}" value="${s}">
                    <label for="spec-${s.replace(/\s/g, '-')}" style="font-size: 0.9em;">${s}</label>
                `;
                selectElement.appendChild(div);
            }
        });
        
        return specialties;
    } catch (error) {
        console.error("Erro ao buscar especialidades:", error.message);
        return [];
    }
}


function checkAuthStatus() {
    if (loggedUserEmail) {
        // Exibe os controles comuns
        const userName = loggedUserEmail.split('@')[0].capitalize();
        if (userDisplay) userDisplay.textContent = `Olá, ${userName}!`;
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (profileIcon) profileIcon.style.display = 'none';
        if (contentArea) contentArea.style.display = 'block';
        if (userDisplay) userDisplay.style.display = 'inline';
        if (navProfile) navProfile.style.display = 'list-item'; 

        // Controle de interface por papel (role)
        if (loggedUserRole === 'admin') {
            // Médico (Admin)
            if (navAgendar) navAgendar.style.display = 'none';
            if (navDisponibilidade) navDisponibilidade.style.display = 'list-item';
            
            if (userRoleSection) userRoleSection.style.display = 'none';
            if (adminRoleSection) adminRoleSection.style.display = 'block';

            loadDoctorAvailability();
            renderWeeklySchedule(); 

        } else {
            // Usuário Padrão
            if (navAgendar) navAgendar.style.display = 'list-item';
            if (navDisponibilidade) navDisponibilidade.style.display = 'none';
            
            if (userRoleSection) userRoleSection.style.display = 'block';
            if (adminRoleSection) adminRoleSection.style.display = 'none';
            
            fetchAndPopulateSpecialties('agendamento-especialidade');
        }
        
        if (navConsultas) navConsultas.style.display = 'list-item';
        renderizarConsultas();
        renderUserProfile(); 

    } else {
        // Deslogado
        if (userDisplay) userDisplay.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (profileIcon) profileIcon.style.display = 'block';
        if (navAgendar) navAgendar.style.display = 'none';
        if (navDisponibilidade) navDisponibilidade.style.display = 'none';
        if (navConsultas) navConsultas.style.display = 'none';
        if (contentArea) contentArea.style.display = 'none';
        if (navProfile) navProfile.style.display = 'none';
    }
}

// LOGOUT
if (logoutBtn) {
    logoutBtn.addEventListener('click', async function() {
        if (window.confirm('Deseja realmente sair?')) {
            try {
                await fetch(`${API_BASE_URL}/logout`, {
                    method: 'POST',
                    headers: getAuthHeader()
                });
            } catch (e) {
                console.warn("Falha no logout do servidor (OK):", e.message);
            }
            
            loggedUserEmail = null;
            loggedUserRole = null;
            localStorage.removeItem(STORAGE_KEY_EMAIL);
            localStorage.removeItem(STORAGE_KEY_ROLE);
            window.location.href = 'index.html'; 
        }
    });
}


// FUNÇÃO DE SETUP PARA PÁGINAS DE LOGIN/REGISTRO
function setupAuthListeners(pageType) {
    if (pageType === 'login') {
        const loginForm = document.getElementById('login-form');
        const loginMsg = document.getElementById('login-msg');

        if (loginForm) {
            loginForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                loginMsg.textContent = '';
                
                const email = document.getElementById('login-email').value;
                const senha = document.getElementById('login-senha').value;
                const role = document.getElementById('login-role').value; 

                if (!role) {
                    loginMsg.textContent = 'Erro: Selecione seu papel (Usuário/Médico).';
                    return;
                }
                
                try {
                    const response = await fetch(`${API_BASE_URL}/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, senha })
                    });

                    const data = await handleResponse(response);

                    // Validação extra de role (garante que o papel selecionado corresponde ao papel no BD)
                    if (data.role !== role) {
                        loginMsg.textContent = `Erro: Você se registrou como ${data.role.capitalize()}, mas tentou logar como ${role.capitalize()}.`;
                        return;
                    }

                    loggedUserEmail = data.email;
                    loggedUserRole = data.role;
                    localStorage.setItem(STORAGE_KEY_EMAIL, loggedUserEmail);
                    localStorage.setItem(STORAGE_KEY_ROLE, loggedUserRole);
                    loginForm.reset();
                    window.location.href = 'index.html';

                } catch (error) {
                    loginMsg.textContent = `Erro: ${error.message}`;
                }
            });
        }
    }

    if (pageType === 'register') {
        const registerForm = document.getElementById('register-form');
        const registerMsg = document.getElementById('register-msg');
        const roleSelect = document.getElementById('register-role');
        const emailInput = document.getElementById('register-email');
        const doctorFieldsDiv = document.getElementById('doctor-fields');
        const specialtyMsg = document.getElementById('specialty-msg');
        const nameInput = document.getElementById('register-name'); 

        // Popula as checkboxes de especialidades
        fetchAndPopulateSpecialties('specialties-checkboxes');
        
        // Listener para mostrar/esconder campos de médico baseado na role
        roleSelect.addEventListener('change', () => {
            const isDoctor = roleSelect.value === 'admin';
            doctorFieldsDiv.style.display = isDoctor ? 'block' : 'none';
        });

        if (registerForm) {
            registerForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                registerMsg.textContent = '';
                specialtyMsg.textContent = '';
                
                const role = roleSelect.value;
                const email = emailInput.value;
                const senha = document.getElementById('register-senha').value;
                const confirmSenha = document.getElementById('register-confirm-senha').value;
                const name = nameInput.value; 
                
                if (!role) {
                    registerMsg.textContent = 'Erro: Selecione seu papel (Usuário/Médico).';
                    return;
                }
                if (senha !== confirmSenha) {
                    registerMsg.textContent = 'Erro: As senhas não coincidem.';
                    return;
                }
                if (!name) {
                    registerMsg.textContent = 'Erro: O campo Nome é obrigatório.';
                    return;
                }


                let selectedSpecialties = [];
                
                if (role === 'admin') {
                    const checkboxes = document.querySelectorAll('#specialties-checkboxes input[type="checkbox"]:checked');
                    selectedSpecialties = Array.from(checkboxes).map(cb => cb.value);
                    
                    if (!email.toLowerCase().endsWith(DOCTOR_DOMAIN)) {
                         registerMsg.textContent = `Erro: Médicos devem usar o domínio ${DOCTOR_DOMAIN}.`;
                         return;
                    }
                    if (selectedSpecialties.length === 0) {
                        specialtyMsg.textContent = 'Médicos devem selecionar pelo menos uma especialidade.';
                        return;
                    }
                }

                try {
                    const payload = { email, senha, role, name }; 
                    if (role === 'admin') {
                        payload.specialties = selectedSpecialties;
                    }
                    
                    await fetch(`${API_BASE_URL}/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    window.alert('Registro concluído! Agora faça o login.');
                    window.location.href = 'login.html';

                } catch (error) {
                    registerMsg.textContent = `Erro: ${error.message}`;
                }
            });
        }
    }
}


// --- FUNÇÕES CRUD (Agendamento - Usuário Padrão) ---

if (specialtySelect) {
    specialtySelect.addEventListener('change', loadDoctorsBySpecialty);
}
if (doctorEmailSelect) {
    doctorEmailSelect.addEventListener('change', updateScheduleDataInput);
}
// O listener de data está sendo definido dentro de updateScheduleDataInput (Correção UX)

function resetAppointmentFormSteps() {
    doctorEmailSelect.innerHTML = '<option value="">Selecione o Médico</option>';
    horaInput.innerHTML = '<option value="">Selecione o Horário</option>';
    doctorSelectGroup.style.display = 'none';
    timeSelectGroup.style.display = 'none';
    availabilityMessage.style.display = 'none';
    dataInput.value = '';
    dataInput.classList.remove('available-date'); // Limpa o destaque
}

async function loadDoctorsBySpecialty() {
    const specialty = specialtySelect.value;
    resetAppointmentFormSteps();
    
    if (!specialty) return;

    try {
        const doctors = await fetch(`${API_BASE_URL}/doctors/by_specialty?specialty=${specialty}`).then(handleResponse);
        
        doctors.forEach(doctor => {
            const option = document.createElement('option');
            option.value = doctor.email;
            option.textContent = `${doctor.name} (${doctor.specialties.join(', ')})`;
            doctorEmailSelect.appendChild(option);
        });

        doctorSelectGroup.style.display = 'block';
        availabilityMessage.style.display = 'none';

    } catch (error) {
        doctorEmailSelect.innerHTML = '<option value="">Não há médicos disponíveis nesta especialidade.</option>';
        doctorEmailSelect.value = '';
        doctorSelectGroup.style.display = 'block';
        availabilityMessage.textContent = 'Não há consultas disponíveis no momento!';
        availabilityMessage.style.display = 'block';
        console.error("Erro ao buscar médicos:", error.message);
    }
}

// CORREÇÃO UX: Habilita Data, busca disponibilidade e adiciona listener para destaque azul
async function updateScheduleDataInput() {
    const doctorEmail = doctorEmailSelect.value;
    doctorAvailabilitiesCache = [];
    
    if (doctorEmail) {
        try {
            const availResponse = await fetch(`${API_BASE_URL}/availabilities/by_doctor?doctor_email=${doctorEmail}`);
            doctorAvailabilitiesCache = await handleResponse(availResponse);
            
            // Habilita a seleção de data e hora
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            dataInput.min = tomorrow.toISOString().split('T')[0];
            timeSelectGroup.style.display = 'block';
            availabilityMessage.style.display = 'none';
            dataInput.value = ''; 
            horaInput.innerHTML = '<option value="">Selecione o Horário</option>';
            dataInput.classList.remove('available-date');

            // Remove o listener anterior para evitar duplicação
            dataInput.removeEventListener('change', dataChangeListener);
            dataInput.addEventListener('change', dataChangeListener);

        } catch (error) {
            console.error("Erro ao carregar disponibilidade do médico:", error.message);
            timeSelectGroup.style.display = 'none';
            doctorAvailabilitiesCache = [];
        }
    } else {
        timeSelectGroup.style.display = 'none';
        dataInput.value = '';
        horaInput.innerHTML = '<option value="">Selecione o Horário</option>';
        dataInput.removeEventListener('change', dataChangeListener);
        dataInput.classList.remove('available-date');
    }
}

// Listener de mudança de data separado para o destaque UX
async function dataChangeListener() {
    const dateValue = dataInput.value;
    if (!dateValue) return;

    const selectedDate = new Date(dateValue.replace(/-/g, '/'));
    const dayOfWeek = DIAS_SEMANA[selectedDate.getDay()];
    
    const isAvailableDay = doctorAvailabilitiesCache.some(a => a.day === dayOfWeek);

    if (isAvailableDay) {
        dataInput.classList.add('available-date'); // Aplica o destaque azul
    } else {
        dataInput.classList.remove('available-date');
    }
    await updateAppointmentScheduleForm();
}


// Passo 3: Carregar Horários do Médico Selecionado (E corrigido o Bloqueio de Agendamento)
async function updateAppointmentScheduleForm() {
    const doctorEmail = doctorEmailSelect.value;
    const dateValue = dataInput.value;
    horaInput.innerHTML = '<option value="">Selecione o Horário</option>';
    availabilityMessage.style.display = 'none';
    
    if (!doctorEmail || !dateValue) return;

    const selectedDate = new Date(dateValue.replace(/-/g, '/'));
    const dayOfWeek = DIAS_SEMANA[selectedDate.getDay()];
    
    try {
        const allAvailabilities = doctorAvailabilitiesCache;
        const doctorAvailability = allAvailabilities.filter(a => a.day === dayOfWeek);

        if (doctorAvailability.length === 0) {
            horaInput.innerHTML = '<option value="">Nenhum horário disponível para este dia.</option>';
            availabilityMessage.textContent = `O médico selecionado não está de plantão na ${dayOfWeek}.`;
            availabilityMessage.style.display = 'block';
            return;
        }
        
        const avail = doctorAvailability[0];
        const start = parseInt(avail.start_time.split(':')[0]); 
        const end = parseInt(avail.end_time.split(':')[0]); 

        let availableHours = [];
        for (let h = start; h < end; h++) {
            const hourStr = String(h).padStart(2, '0') + ':00';
            availableHours.push(hourStr);
        }

        // CORREÇÃO BLOQUEIO: Usa a nova rota para obter TODOS os slots ocupados para esta data/médico
        const occupiedResponse = await fetch(`${API_BASE_URL}/appointments/occupied_slots?doctor_email=${doctorEmail}&data=${dateValue}`, { headers: getAuthHeader() });
        const bookedHours = await handleResponse(occupiedResponse);
        
        // Filtra horários removendo os já agendados
        const finalAvailableHours = availableHours.filter(h => !bookedHours.includes(h));

        horaInput.innerHTML = '<option value="">Selecione o Horário</option>';
        finalAvailableHours.forEach(h => {
            const option = document.createElement('option');
            option.value = h;
            option.textContent = h;
            horaInput.appendChild(option);
        });
        
        if (finalAvailableHours.length === 0) {
            horaInput.innerHTML = '<option value="">Nenhum horário disponível neste dia.</option>';
            availabilityMessage.textContent = 'Todos os horários neste dia estão ocupados.';
            availabilityMessage.style.display = 'block';
        }

    } catch (error) {
        console.error("Erro ao carregar disponibilidade:", error.message);
        horaInput.innerHTML = '<option value="">Erro ao carregar horários.</option>';
    }
}


// CREATE Agendamento (Usuário Padrão)
if (agendamentoForm) {
    agendamentoForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (loggedUserRole !== 'user') return;

        const data = dataInput.value;
        const hora = horaInput.value;
        const especialidade = specialtySelect.value;
        const doctor_email = doctorEmailSelect.value;
        
        if (!doctor_email) {
            window.alert('Por favor, selecione um médico.');
            return;
        }

        const payload = { data, hora, especialidade, doctor_email };
        
        try {
            await fetch(`${API_BASE_URL}/appointments`, {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify(payload)
            }).then(handleResponse);
            
            window.alert('Consulta agendada com sucesso! Status: PENDENTE.');

            agendamentoForm.reset();
            resetAppointmentFormSteps();
            renderizarConsultas();
            
            document.getElementById('consultas').scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            window.alert(`Erro ao agendar a consulta: ${error.message}`);
        }
    });
}

// READ Agendamentos (Comum)
async function renderizarConsultas() {
    if (!tabelaBody || !loggedUserEmail) return;

    tabelaBody.innerHTML = '';
    noConsultasDiv.style.display = 'none';

    if (tableHeaderOtherParty) {
        tableHeaderOtherParty.textContent = loggedUserRole === 'admin' ? 'Paciente (Telefone)' : 'Médico';
    }
    if (tableHeaderStatus) { 
         tableHeaderStatus.style.display = 'table-cell'; 
    }

    try {
        const appointments = await fetch(`${API_BASE_URL}/appointments`, {
            method: 'GET',
            headers: getAuthHeader()
        }).then(handleResponse);
        
        const statuses = await fetch(`${API_BASE_URL}/appointments/statuses`).then(handleResponse); 


        if (appointments.length === 0) {
            noConsultasDiv.style.display = 'block';
            return;
        }

        appointments.forEach(consulta => {
            const row = tabelaBody.insertRow();
            
            let otherPartyInfo;
            if (loggedUserRole === 'admin') {
                const patientName = consulta.patient_name || consulta.user_email.split('@')[0].capitalize();
                const patientPhone = consulta.patient_phone || 'N/A';
                otherPartyInfo = `${patientName} (${patientPhone})`;
            } else {
                const doctorEmail = consulta.doctor_email;
                otherPartyInfo = doctorEmail.split('@')[0].capitalize(); 
            }

            row.insertCell().textContent = formatarData(consulta.data); 
            row.insertCell().textContent = consulta.hora;
            row.insertCell().textContent = consulta.especialidade;
            row.insertCell().textContent = otherPartyInfo;
            
            // Coluna Status
            const statusCell = row.insertCell(); 
            statusCell.style.fontWeight = '600';
            statusCell.style.color = getStatusColor(consulta.status);
            
            const acoesCell = row.insertCell();

            if (loggedUserRole === 'admin') {
                // Admin pode MUDAR o status
                const selectStatus = document.createElement('select');
                selectStatus.classList.add('status-select');
                selectStatus.style.padding = '5px 8px';
                selectStatus.style.borderRadius = '4px';
                selectStatus.style.border = '1px solid #ccc';
                selectStatus.style.marginRight = '10px';
                
                statuses.forEach(status => {
                    const option = document.createElement('option');
                    option.value = status;
                    option.textContent = status;
                    if (status === consulta.status) {
                        option.selected = true;
                    }
                    // Desabilita a mudança para status CANCELADA ou REALIZADA
                    if (consulta.status === 'REALIZADA' || consulta.status === 'CANCELADA') {
                        selectStatus.disabled = true;
                    }
                    selectStatus.appendChild(option);
                });
                
                selectStatus.addEventListener('change', (e) => updateAppointmentStatus(consulta.id, e.target.value));

                statusCell.appendChild(selectStatus);
                acoesCell.textContent = ''; 

            } else {
                // Usuário Padrão só vê o status e o botão de Cancelar
                statusCell.textContent = consulta.status;
                
                if (consulta.status === 'PENDENTE' || consulta.status === 'CONFIRMADA') {
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Cancelar';
                    deleteButton.classList.add('btn', 'btn-cancel');
                    deleteButton.style.padding = '8px 15px';
                    deleteButton.style.fontSize = '0.9em';
                    deleteButton.style.background = '#e74c3c';
                    deleteButton.addEventListener('click', () => deletarConsulta(consulta.id));
                    acoesCell.appendChild(deleteButton);
                } else {
                    acoesCell.textContent = 'Finalizada';
                    acoesCell.style.color = getStatusColor(consulta.status);
                }
            }
        });

    } catch (error) {
        console.error('Erro ao carregar consultas:', error.message);
        if (noConsultasDiv) {
             noConsultasDiv.innerHTML = `<p class="empty-message" style="color:#e74c3c;"><i class="fas fa-exclamation-triangle"></i> Erro ao carregar dados. (Servidor inativo ou erro de autenticação)</p>`;
             noConsultasDiv.style.display = 'block';
        }
    }
}

// DELETE Agendamento (Usuário Padrão - Muda para CANCELADA)
async function deletarConsulta(id) {
    if (loggedUserRole !== 'user') return;

    if (window.confirm('Tem certeza que deseja cancelar esta consulta? O status será alterado para CANCELADA.')) {
        try {
            await fetch(`${API_BASE_URL}/appointments/${id}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            }).then(handleResponse);
            
            window.alert('Consulta cancelada com sucesso!');
            renderizarConsultas();
        } catch (error) {
            window.alert(`Erro ao cancelar a consulta: ${error.message}`);
        }
    }
}

// Função para Mudar o Status (Admin)
async function updateAppointmentStatus(id, newStatus) {
    if (loggedUserRole !== 'admin') return;
    
    if (window.confirm(`Tem certeza que deseja mudar o status desta consulta para ${newStatus}?`)) {
        try {
            await fetch(`${API_BASE_URL}/appointments/${id}/status`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify({ status: newStatus })
            }).then(handleResponse);
            
            window.alert(`Status atualizado para ${newStatus}.`);
            renderizarConsultas(); 
        } catch (error) {
            window.alert(`Erro ao atualizar status: ${error.message}`);
        }
    }
}

// --- FUNÇÕES DE GESTÃO DE DISPONIBILIDADE (Médico/Admin) ---

// Carregar disponibilidade existente
async function loadDoctorAvailability() {
    if (loggedUserRole !== 'admin') return;

    try {
        const availabilities = await fetch(`${API_BASE_URL}/availabilities/by_doctor?doctor_email=${loggedUserEmail}`).then(handleResponse);
        renderAvailabilitySlots(availabilities);

    } catch (error) {
        console.error('Erro ao carregar disponibilidade:', error.message);
        renderAvailabilitySlots([]);
    }
}

// CORREÇÃO: Criar slot de edição (Permitindo seleção múltipla)
function createAvailabilitySlot(days = ['Segunda'], startTime = '09:00', endTime = '17:00') {
    const slotDiv = document.createElement('div');
    slotDiv.classList.add('form-group', 'availability-slot');
    slotDiv.style.display = 'flex';
    slotDiv.style.gap = '10px';
    slotDiv.style.alignItems = 'flex-end';
    slotDiv.style.marginBottom = '15px';
    
    // Lista de dias da semana ÚTEIS (Segunda a Sexta) e Sábado/Domingo se necessário
    const availableDays = DIAS_SEMANA.filter(d => d !== 'Sábado' && d !== 'Domingo'); 
    
    // Construção das opções de seleção (agora com multiple)
    const optionsHtml = availableDays.map(d => 
        `<option value="${d}" ${days.includes(d) ? 'selected' : ''}>${d}</option>`
    ).join('');

    slotDiv.innerHTML = `
        <div style="flex: 2;">
            <label>Dias:</label>
            <select class="day-select" multiple size="5" required style="height: 100px;">
                ${optionsHtml}
            </select>
        </div>
        <div style="flex: 1;">
            <label>Início:</label>
            <input type="time" class="start-time-input" value="${startTime}" required>
        </div>
        <div style="flex: 1;">
            <label>Fim:</label>
            <input type="time" class="end-time-input" value="${endTime}" required>
        </div>
        <button type="button" class="btn btn-cancel remove-slot-btn" style="flex: 0 0 40px; margin-bottom: 0px; height: 38px;">
            <i class="fas fa-trash-alt"></i>
        </button>
    `;
    
    slotDiv.querySelector('.remove-slot-btn').addEventListener('click', () => {
        slotDiv.remove();
        if (availabilitySlotsContainer.children.length === 0) {
            noAvailabilityMsg.style.display = 'block';
        }
    });

    availabilitySlotsContainer.appendChild(slotDiv);
    noAvailabilityMsg.style.display = 'none';
}

function renderAvailabilitySlots(availabilities) {
    availabilitySlotsContainer.innerHTML = '';
    
    if (availabilities.length === 0) {
        noAvailabilityMsg.style.display = 'block';
        return;
    }
    
    // Agrupa os slots por horário (Início e Fim)
    const groupedAvailabilities = {};
    availabilities.forEach(avail => {
        const key = `${avail.start_time}-${avail.end_time}`;
        if (!groupedAvailabilities[key]) {
            groupedAvailabilities[key] = {
                days: [],
                start_time: avail.start_time,
                end_time: avail.end_time
            };
        }
        groupedAvailabilities[key].days.push(avail.day);
    });

    // Renderiza os slots agrupados
    Object.values(groupedAvailabilities).forEach(group => {
        createAvailabilitySlot(group.days, group.start_time, group.end_time);
    });

    noAvailabilityMsg.style.display = 'none';
}


if (addAvailabilityBtn) {
    addAvailabilityBtn.addEventListener('click', () => createAvailabilitySlot());
}

// Salvar disponibilidade (Recorrente)
if (availabilityForm) {
    availabilityForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const slots = document.querySelectorAll('.availability-slot');
        if (slots.length === 0) {
            window.alert('Adicione pelo menos um horário de plantão.');
            return;
        }

        const availabilities = [];
        let hasError = false;

        Array.from(slots).forEach(slot => {
            const daySelect = slot.querySelector('.day-select');
            const startTime = slot.querySelector('.start-time-input').value;
            const endTime = slot.querySelector('.end-time-input').value;
            
            const selectedDays = Array.from(daySelect.options)
                                      .filter(option => option.selected)
                                      .map(option => option.value);
            
            if (selectedDays.length === 0) {
                window.alert('Selecione pelo menos um dia para cada horário.');
                hasError = true;
                return;
            }
            
            selectedDays.forEach(day => {
                availabilities.push({ day, start_time: startTime, end_time: endTime });
            });
        });
        
        if (hasError) return;


        try {
            await fetch(`${API_BASE_URL}/availabilities`, {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify({ availabilities })
            }).then(handleResponse);
            window.alert('Disponibilidade semanal salva com sucesso!');
            loadDoctorAvailability(); 
            renderWeeklySchedule(); 
        } catch (error) {
            window.alert(`Erro ao salvar disponibilidade: ${error.message}`);
        }
    });
}


// NOVO: Renderizar Agenda Semanal do Médico (Recurso 4)
async function renderWeeklySchedule() {
    if (loggedUserRole !== 'admin' || !weeklyScheduleGrid) return;

    weeklyScheduleLoading.style.display = 'block';
    weeklyScheduleGrid.innerHTML = '';

    try {
        const weeklyData = await fetch(`${API_BASE_URL}/appointments/weekly_schedule`, {
            headers: getAuthHeader()
        }).then(handleResponse);
        
        weeklyScheduleLoading.style.display = 'none';

        // Ordena as chaves de data
        const sortedDates = Object.keys(weeklyData).sort();

        sortedDates.forEach(dateStr => {
            const dayData = weeklyData[dateStr];
            const column = document.createElement('div');
            column.classList.add('day-column');

            column.innerHTML = `
                <h4>${dayData.day} - ${formatarData(dateStr)}</h4>
            `;

            if (dayData.slots.length === 0) {
                const p = document.createElement('p');
                p.textContent = 'Sem plantão definido.';
                p.style.fontSize = '0.9em';
                p.style.color = '#7f8c8d';
                column.appendChild(p);
            } else {
                dayData.slots.forEach(slot => {
                    const slotDiv = document.createElement('div');
                    slotDiv.classList.add('slot', slot.type === 'AVAILABLE' ? 'available' : 'occupied');
                    
                    if (slot.type === 'AVAILABLE') {
                        slotDiv.textContent = `${slot.time} - DISPONÍVEL`;
                    } else {
                        // Ocupado: Exibe status e nome do paciente
                        slotDiv.innerHTML = `${slot.time} - ${slot.status}<br><strong>Paciente: ${slot.patient_name}</strong>`;
                    }
                    column.appendChild(slotDiv);
                });
            }

            weeklyScheduleGrid.appendChild(column);
        });

    } catch (error) {
        console.error('Erro ao carregar agenda semanal:', error.message);
        weeklyScheduleLoading.style.display = 'none';
        weeklyScheduleGrid.innerHTML = `<p class="error-msg" style="text-align: center;"><i class="fas fa-exclamation-triangle"></i> Erro ao carregar grade semanal.</p>`;
    }
}


// --- FUNÇÕES DE GESTÃO DE PERFIL (Recurso 3) ---

async function renderUserProfile() {
    if (!profileForm) return;

    try {
        const user = await fetch(`${API_BASE_URL}/user/profile`, { headers: getAuthHeader() }).then(handleResponse);
        
        profileNameInput.value = user.name || '';
        profileEmailInput.value = user.email || '';
        profilePhoneInput.value = user.phone || '';
        profileAddressInput.value = user.address || '';
        
        profileRoleDisplay.textContent = user.role.capitalize();
        
        // Se for médico, exibe as especialidades
        if (user.role === 'admin' && user.specialties && user.specialties.length > 0) {
            document.getElementById('profile-specialties-display').textContent = user.specialties.join(', ');
            document.getElementById('profile-doctor-info').style.display = 'block';
        } else if (document.getElementById('profile-doctor-info')) {
            document.getElementById('profile-doctor-info').style.display = 'none';
        }
        
    } catch (error) {
        console.error("Erro ao carregar perfil:", error.message);
        profileMsg.textContent = 'Erro ao carregar dados do perfil.';
    }
}

function setupProfileFormListeners() {
    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            profileMsg.textContent = '';
            
            const name = profileNameInput.value;
            const phone = profilePhoneInput.value;
            const address = profileAddressInput.value;
            
            try {
                const response = await fetch(`${API_BASE_URL}/user/profile`, {
                    method: 'PUT',
                    headers: getAuthHeader(),
                    body: JSON.stringify({ name, phone, address })
                }).then(handleResponse);

                profileMsg.textContent = response.message;
                profileMsg.style.color = '#4CAF50';
                
                // Atualiza o display do cabeçalho
                const newName = name.split(' ')[0].capitalize() || loggedUserEmail.split('@')[0].capitalize();
                if (userDisplay) userDisplay.textContent = `Olá, ${newName}!`;


            } catch (error) {
                profileMsg.textContent = `Erro ao atualizar perfil: ${error.message}`;
                profileMsg.style.color = '#e74c3c';
            }
        });
    }
}
setupProfileFormListeners(); 


// --- FUNÇÕES AUXILIARES ---
function formatarData(dataISO) {
    if (!dataISO) return '';
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}

// Funções utilitárias para o Status
function getStatusColor(status) {
    switch (status) {
        case 'PENDENTE': return '#f39c12'; // Amarelo
        case 'CONFIRMADA': return '#27ae60'; // Verde
        case 'REALIZADA': return '#3498db'; // Azul
        case 'CANCELADA': return '#e74c3c'; // Vermelho
        default: return '#7f8c8d'; 
    }
}

// Função utilitária para capitalizar a primeira letra
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};


// Inicialização
document.addEventListener('DOMContentLoaded', checkAuthStatus);

// Funções de setup para páginas de autenticação
if (document.URL.includes('registro.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        setupAuthListeners('register');
    });
} else if (document.URL.includes('login.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        setupAuthListeners('login');
    });
}
