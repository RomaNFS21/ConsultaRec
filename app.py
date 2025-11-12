import json
from flask import Flask, request, jsonify, send_from_directory
from functools import wraps
import os
import uuid
from datetime import datetime, date, timedelta
from urllib.parse import urlparse, parse_qs

app = Flask(__name__, static_folder='.')

# --- CONFIGURAÇÃO DE ARQUIVOS DE PERSISTÊNCIA ---
USERS_DB = 'db_users.json'
APPOINTMENTS_DB = 'db_appointments.json'
AVAILABILITIES_DB = 'db_availabilities.json' # Banco de dados para horários dos médicos

# Domínio obrigatório para Médicos (Admin)
DOCTOR_DOMAIN = '@ubs.com'

# Lista estática de especialidades para consistência
SPECIALTIES = [
    "Clínico Geral", "Cardiologista", "Pediatra", "Ginecologista",
    "Dermatologista", "Oftalmologista", "Ortopedista"
]

# NOVO: Status possíveis para uma consulta (Recurso 5)
APPOINTMENT_STATUSES = [
    "PENDENTE", 
    "CONFIRMADA", 
    "REALIZADA", 
    "CANCELADA"
]

def load_db(filename):
    """Carrega dados de um arquivo JSON. Cria um arquivo vazio se não existir."""
    if not os.path.exists(filename):
        with open(filename, 'w') as f:
            json.dump([], f)
        return []
    try:
        with open(filename, 'r') as f:
            return json.load(f)
    except json.JSONDecodeError:
        print(f"Atenção: Arquivo {filename} corrompido ou vazio. Iniciando com [].")
        return []

def save_db(filename, data):
    """Salva dados em um arquivo JSON."""
    with open(filename, 'w') as f:
        json.dump(data, f, indent=4)

def get_user_details(email):
    """Busca os detalhes do usuário, incluindo role e especialidades."""
    users = load_db(USERS_DB)
    return next((u for u in users if u['email'] == email), None)

def role_required(role):
    """Decorator para proteger rotas e verificar a função do usuário (role)."""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({'message': 'Acesso negado. Token de login ausente.'}), 401
            
            logged_email = auth_header.split('Bearer ')[1].strip()
            user = get_user_details(logged_email)

            if not user or user.get('role') != role:
                return jsonify({'message': f'Acesso negado. Necessita de permissão de {role}.'}), 403

            return f(logged_email, user, *args, **kwargs)
        return decorated_function
    return decorator

# --- ROTAS DE SERVIÇO DE ARQUIVOS ---

@app.route('/')
def index():
    """Servir o arquivo principal (index.html)."""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:filename>')
def serve_files(filename):
    """Servir outros arquivos estáticos (CSS, JS, login.html, registro.html, etc)."""
    return send_from_directory(app.static_folder, filename)

# --- ROTA PARA LISTAR ESPECIALIDADES (Útil para o frontend) ---
@app.route('/api/specialties', methods=['GET'])
def get_specialties():
    """Retorna a lista estática de especialidades."""
    return jsonify(SPECIALTIES)

# Rota para obter todos os status de consulta (Recurso 5)
@app.route('/api/appointments/statuses', methods=['GET'])
def get_appointment_statuses():
    """Retorna a lista estática de status de agendamento."""
    return jsonify(APPOINTMENT_STATUSES)

# --- ROTAS DE AUTENTICAÇÃO E PERFIL ---

@app.route('/api/register', methods=['POST'])
def register():
    """Rota para registrar um novo usuário ou médico."""
    data = request.get_json()
    email = data.get('email')
    senha = data.get('senha')
    role = data.get('role')
    specialties = data.get('specialties', [])
    # Campos de perfil (Recurso 3)
    name = data.get('name', email.split('@')[0].capitalize()) 
    phone = data.get('phone', '') 
    address = data.get('address', '') 
    
    users = load_db(USERS_DB)

    if not all([email, senha, role]):
        return jsonify({'success': False, 'message': 'Email, senha e papel (role) são obrigatórios.'}), 400

    if any(u['email'] == email for u in users):
        return jsonify({'success': False, 'message': 'Este email já está registrado!'}), 400
        
    if role == 'admin':
        if not email.endswith(DOCTOR_DOMAIN):
            return jsonify({'success': False, 'message': f'Médicos devem usar o domínio {DOCTOR_DOMAIN}.'}), 400
        if not specialties:
            return jsonify({'success': False, 'message': 'Médicos devem selecionar pelo menos uma especialidade.'}), 400

    new_user = {
        'email': email, 
        'senha': senha,
        'id': str(uuid.uuid4()),
        'role': role,
        'name': name, 
        'phone': phone, 
        'address': address 
    }
    if role == 'admin':
        new_user['specialties'] = specialties

    users.append(new_user)
    save_db(USERS_DB, users)
    
    return jsonify({'success': True, 'message': f'Registro concluído com sucesso como {role}.'})

@app.route('/api/login', methods=['POST'])
def login():
    """Rota para login de usuário."""
    data = request.get_json()
    email = data.get('email')
    senha = data.get('senha')
    
    user = get_user_details(email)
    
    if user and user['senha'] == senha:
        response_data = {
            'success': True, 
            'email': user['email'], 
            'role': user['role'],
            'name': user.get('name', user['email'].split('@')[0].capitalize())
        }
        if user.get('specialties'):
            response_data['specialties'] = user['specialties']
            
        return jsonify(response_data)
    else:
        return jsonify({'success': False, 'message': 'Email ou senha incorretos.'}), 401
        
@app.route('/api/user/profile', methods=['GET'])
def get_user_profile():
    """Obtém o perfil do usuário logado (Recurso 3)."""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'message': 'Acesso negado.'}), 401
    
    logged_email = auth_header.split('Bearer ')[1].strip()
    user = get_user_details(logged_email)
    
    if user:
        # Remove a senha antes de retornar
        user_data = user.copy()
        user_data.pop('senha', None)
        return jsonify(user_data)
    
    return jsonify({'message': 'Perfil não encontrado.'}), 404

@app.route('/api/user/profile', methods=['PUT'])
def update_user_profile():
    """Atualiza o perfil do usuário logado (Recurso 3)."""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'message': 'Acesso negado.'}), 401
            
    logged_email = auth_header.split('Bearer ')[1].strip()
    data = request.get_json()
    
    users = load_db(USERS_DB)
    user_index = next((i for i, u in enumerate(users) if u['email'] == logged_email), -1)

    if user_index != -1:
        user = users[user_index]
        # Atualiza apenas os campos permitidos
        user['name'] = data.get('name', user.get('name', logged_email.split('@')[0].capitalize()))
        user['phone'] = data.get('phone', user.get('phone', ''))
        user['address'] = data.get('address', user.get('address', ''))
        
        users[user_index] = user
        save_db(USERS_DB, users)
        return jsonify({'success': True, 'message': 'Perfil atualizado com sucesso!'})
    
    return jsonify({'message': 'Usuário não encontrado.'}), 404

# --- ROTAS DE GESTÃO DE DISPONIBILIDADE DO MÉDICO ---

@app.route('/api/availabilities', methods=['POST'])
@role_required('admin')
def set_doctor_availability(logged_email, user):
    """Permite ao médico definir seus horários de trabalho (Recurso 9 - Cadastro Recorrente)."""
    data = request.get_json()
    availabilities_list = data.get('availabilities', [])

    if not availabilities_list:
         return jsonify({'success': False, 'message': 'Lista de disponibilidades vazia.'}), 400

    all_availabilities = load_db(AVAILABILITIES_DB)
    
    # Remove TODAS as disponibilidades antigas do médico logado
    all_availabilities = [a for a in all_availabilities if a['doctor_email'] != logged_email]

    new_availabilities = []
    
    # Validação e adição dos novos slots
    for avail in availabilities_list:
        # Validação básica de campos
        if not all([avail.get('day'), avail.get('start_time'), avail.get('end_time')]):
             return jsonify({'success': False, 'message': 'Dados de disponibilidade incompletos.'}), 400
        
        try:
            datetime.strptime(avail.get('start_time'), '%H:%M')
            datetime.strptime(avail.get('end_time'), '%H:%M')
        except ValueError:
            return jsonify({'success': False, 'message': 'Formato de hora inválido. Use HH:MM.'}), 400

        # Verifica se o dia é um dia válido
        if avail.get('day') not in ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]:
             return jsonify({'success': False, 'message': f"Dia da semana inválido: {avail.get('day')}."}), 400

        new_availabilities.append({
            'doctor_email': logged_email,
            'day': avail.get('day'),
            'start_time': avail.get('start_time'),
            'end_time': avail.get('end_time')
        })

    all_availabilities.extend(new_availabilities)
    save_db(AVAILABILITIES_DB, all_availabilities)

    return jsonify({'success': True, 'message': 'Disponibilidade semanal atualizada com sucesso!'})


@app.route('/api/availabilities/by_doctor', methods=['GET'])
def get_doctor_availability():
    """Obtém os horários de trabalho de um médico específico (usado para agendamento)."""
    doctor_email = request.args.get('doctor_email')
    
    if not doctor_email:
        return jsonify({'message': 'O email do médico é obrigatório.'}), 400

    all_availabilities = load_db(AVAILABILITIES_DB)
    # Médico logado vê a sua, Usuário Padrão vê a do médico selecionado.
    doctor_availabilities = [a for a in all_availabilities if a['doctor_email'] == doctor_email]
    
    return jsonify(doctor_availabilities)

# --- ROTAS DE BUSCA DE MÉDICOS (Para Usuário Padrão) ---

@app.route('/api/doctors/by_specialty', methods=['GET'])
def get_doctors_by_specialty():
    """Lista médicos que atendem a uma especialidade específica."""
    specialty = request.args.get('specialty')
    if not specialty:
        return jsonify({'success': False, 'message': 'Especialidade é obrigatória.'}), 400

    users = load_db(USERS_DB)
    doctors = []
    
    for user in users:
        # Verifica se é admin E se a especialidade está na lista de especialidades do médico
        if user.get('role') == 'admin' and specialty in user.get('specialties', []):
            doctors.append({
                'name': user.get('name', user['email'].split('@')[0].capitalize()), 
                'email': user['email'],
                'specialties': user['specialties']
            })

    if not doctors:
        return jsonify({'success': False, 'message': 'Não há médicos disponíveis nesta especialidade.'}), 404

    return jsonify(doctors)

# --- ROTAS CRUD DE AGENDAMENTOS ---

@app.route('/api/appointments', methods=['GET'])
def get_appointments_for_user():
    """Obtém todos os agendamentos do usuário logado (padrão ou médico)."""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'message': 'Acesso negado. Token de login ausente.'}), 401
            
    logged_email = auth_header.split('Bearer ')[1].strip()
    user = get_user_details(logged_email)
    
    if not user:
        return jsonify({'message': 'Usuário não encontrado.'}), 401

    all_appointments = load_db(APPOINTMENTS_DB)
    users_db = load_db(USERS_DB) 
    
    if user['role'] == 'user':
        # Usuário Padrão vê apenas suas consultas agendadas
        user_appointments = [a for a in all_appointments if a['user_email'] == logged_email]
    else: # role == 'admin'
        # Médico (Admin) vê apenas consultas agendadas com ele
        user_appointments = [a for a in all_appointments if a['doctor_email'] == logged_email]
    
    # Injetar Nome e Telefone do Paciente para o Médico (Recurso 8)
    if user['role'] == 'admin':
        for appointment in user_appointments:
            patient = next((u for u in users_db if u['email'] == appointment['user_email']), None)
            if patient:
                appointment['patient_name'] = patient.get('name', appointment['user_email'].split('@')[0].capitalize())
                appointment['patient_phone'] = patient.get('phone', 'N/A')
    
    return jsonify(user_appointments)

# NOVO: Rota para obter slots ocupados (para que o frontend possa filtrar corretamente)
@app.route('/api/appointments/occupied_slots', methods=['GET'])
# Não precisa de role_required('user') porque a validação de token já está implícita no decorators
# mas mantemos para seguir o padrão de segurança para o user
def get_occupied_slots():
    """Obtém slots ocupados de um médico em uma data específica. (Correção do Bloqueio de Agendamento)"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'message': 'Acesso negado. Token de login ausente.'}), 401
        
    doctor_email = request.args.get('doctor_email')
    data = request.args.get('data')

    if not all([doctor_email, data]):
        return jsonify({'message': 'Email do médico e data são obrigatórios.'}), 400

    all_appointments = load_db(APPOINTMENTS_DB)
    
    # Retorna apenas os horários ocupados (e não cancelados)
    occupied_slots = [
        a['hora'] for a in all_appointments 
        if a['doctor_email'] == doctor_email 
        and a['data'] == data 
        and a['status'] != 'CANCELADA'
    ]
    
    return jsonify(occupied_slots)


@app.route('/api/appointments', methods=['POST'])
@role_required('user') # Apenas usuários padrão podem agendar
def create_appointment(logged_email, user):
    """Cria um novo agendamento. (Bloqueio de agendamento garantido aqui)"""
    data = request.get_json()
    data_consulta = data.get('data')
    hora = data.get('hora')
    especialidade = data.get('especialidade')
    doctor_email = data.get('doctor_email')

    if not all([data_consulta, hora, especialidade, doctor_email]):
        return jsonify({'success': False, 'message': 'Dados de agendamento incompletos (data, hora, especialidade e médico são obrigatórios).'}), 400

    # Validação de Data (Deve ser futura)
    try:
        appt_date = datetime.strptime(data_consulta, '%Y-%m-%d').date()
        today = date.today()
        if appt_date <= today:
            return jsonify({'success': False, 'message': 'Agendamentos só podem ser feitos para datas futuras.'}), 400
    except ValueError:
        return jsonify({'success': False, 'message': 'Formato de data inválido. Use YYYY-MM-DD.'}), 400

    appointments = load_db(APPOINTMENTS_DB)
    
    # 1. Checagem de Conflito de Agendamento (Bloqueio por Horário - Recurso 6)
    conflict = next((a for a in appointments 
                     if a['doctor_email'] == doctor_email 
                     and a['data'] == data_consulta 
                     and a['hora'] == hora 
                     and a['status'] != 'CANCELADA'
                     ), None)
    
    if conflict:
        # O backend impede o POST se houver conflito de horário/médico.
        return jsonify({'success': False, 'message': 'Este horário já foi agendado com este médico por outro paciente.'}), 400
        
    new_appointment = {
        'id': str(uuid.uuid4()), 
        'user_email': logged_email,
        'doctor_email': doctor_email,
        'data': data_consulta,
        'hora': hora,
        'especialidade': especialidade,
        'status': 'PENDENTE' 
    }
    appointments.append(new_appointment)
    save_db(APPOINTMENTS_DB, appointments)
    return jsonify({'success': True, 'message': 'Consulta agendada com sucesso!'}), 201

# Rota para Agenda Semanal do Médico (Recurso 4)
@app.route('/api/appointments/weekly_schedule', methods=['GET'])
@role_required('admin')
def get_weekly_schedule(logged_email, user):
    """Retorna a agenda do médico para os próximos 7 dias, incluindo slots disponíveis e ocupados."""
    
    # Define a semana de Domingo a Sábado
    today = date.today()
    
    # Dicionário para armazenar a grade
    weekly_schedule = {}
    users_db = load_db(USERS_DB)
    all_appointments = load_db(APPOINTMENTS_DB)
    availabilities = load_db(AVAILABILITIES_DB)
    doctor_avail = [a for a in availabilities if a['doctor_email'] == logged_email]

    # Iterar pelos próximos 7 dias
    DIAS_SEMANA_FRONTEND = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]


    for i in range(7):
        current_date = today + timedelta(days=i)
        date_str = current_date.isoformat()
        
        # O weekday() do Python retorna 0 para Segunda, 6 para Domingo.
        # Ajustamos para corresponder ao array DIAS_SEMANA do JS (0 = Domingo)
        day_index = current_date.weekday()
        if day_index == 6:
            day_js = "Domingo"
        else:
            day_js = DIAS_SEMANA_FRONTEND[day_index + 1] # Segunda(1) -> Segunda
        
        day_name = day_js
        
        # 1. Slots de plantão do médico
        day_avail = next((a for a in doctor_avail if a['day'] == day_name), None)

        slots = []
        if day_avail:
            start_hour = int(day_avail['start_time'][:2])
            end_hour = int(day_avail['end_time'][:2])

            for h in range(start_hour, end_hour):
                hour_str = f"{h:02d}:00"
                
                # 2. Verificar consultas agendadas
                appointment = next((a for a in all_appointments 
                                    if a['doctor_email'] == logged_email 
                                    and a['data'] == date_str 
                                    and a['hora'] == hour_str 
                                    and a['status'] != 'CANCELADA'), None)

                if appointment:
                    patient = next((u for u in users_db if u['email'] == appointment['user_email']), None)
                    patient_name = patient.get('name', 'N/A') if patient else 'N/A'
                    
                    slots.append({
                        'time': hour_str,
                        'status': appointment['status'],
                        'patient_name': patient_name,
                        'type': 'OCCUPIED',
                        'id': appointment['id']
                    })
                else:
                    slots.append({
                        'time': hour_str,
                        'status': 'DISPONÍVEL',
                        'type': 'AVAILABLE'
                    })

        weekly_schedule[date_str] = {
            'day': day_name,
            'slots': slots
        }

    return jsonify(weekly_schedule)


# Rota para Mudar Status da Consulta (Recurso 5)
@app.route('/api/appointments/<string:appointment_id>/status', methods=['PUT'])
@role_required('admin')
def update_appointment_status(logged_email, user, appointment_id):
    """Permite ao médico mudar o status de uma consulta."""
    data = request.get_json()
    new_status = data.get('status')
    
    if not new_status or new_status not in APPOINTMENT_STATUSES:
        return jsonify({'success': False, 'message': 'Status inválido ou ausente.'}), 400

    appointments = load_db(APPOINTMENTS_DB)
    appt_index = next((i for i, a in enumerate(appointments) if a['id'] == appointment_id and a['doctor_email'] == logged_email), -1)

    if appt_index == -1:
        return jsonify({'success': False, 'message': 'Consulta não encontrada ou acesso negado (somente o médico agendado pode mudar o status).'}), 404
        
    appointments[appt_index]['status'] = new_status
    save_db(APPOINTMENTS_DB, appointments)
    return jsonify({'success': True, 'message': f'Status da consulta atualizado para {new_status}!'})


@app.route('/api/appointments/<string:appointment_id>', methods=['DELETE'])
def delete_appointment(appointment_id):
    """Deleta (cancela) um agendamento. Usuários padrão marcam como CANCELADA."""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'message': 'Acesso negado. Token de login ausente.'}), 401
            
    logged_email = auth_header.split('Bearer ')[1].strip()
    user = get_user_details(logged_email)
    
    if not user:
        return jsonify({'message': 'Usuário não encontrado.'}), 401
        
    appointments = load_db(APPOINTMENTS_DB)
    
    appt_index = next((i for i, a in enumerate(appointments) if a['id'] == appointment_id), -1)
    
    if appt_index == -1:
        return jsonify({'success': False, 'message': 'Consulta não encontrada.'}), 404
    
    appointment_to_cancel = appointments[appt_index]
    
    # Regra: Apenas o paciente pode cancelar e ele não remove, apenas marca como CANCELADA (Recurso 5)
    if user['role'] == 'user' and appointment_to_cancel['user_email'] == logged_email:
        
        if appointment_to_cancel['status'] == 'REALIZADA':
            return jsonify({'success': False, 'message': 'Consultas já realizadas não podem ser canceladas.'}), 400
            
        appointment_to_cancel['status'] = 'CANCELADA'
        appointments[appt_index] = appointment_to_cancel
        save_db(APPOINTMENTS_DB, appointments)
        return jsonify({'success': True, 'message': 'Consulta cancelada com sucesso (Status: CANCELADA)!'})
    else:
        return jsonify({'success': False, 'message': 'Acesso negado. Apenas o paciente pode cancelar a consulta, e administradores não podem removê-las.'}), 403


if __name__ == '__main__':
    # Cria os arquivos de banco de dados se não existirem
    load_db(USERS_DB)
    load_db(APPOINTMENTS_DB)
    load_db(AVAILABILITIES_DB)
    
    print(f"Flask rodando! Acesse: http://127.0.0.1:5000")
    print(f"Arquivos de persistência: {USERS_DB}, {APPOINTMENTS_DB} e {AVAILABILITIES_DB}")
    app.run(debug=True)