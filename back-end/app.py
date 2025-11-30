from flask import Flask, request, jsonify
from flask_cors import CORS 
import json
import os

app = Flask(__name__)
CORS(app) 

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FILES = {
    "pacientes": os.path.join(BASE_DIR, "pacientes.json"),
    "funcionarios": os.path.join(BASE_DIR, "funcionarios.json"),
    "consultas": os.path.join(BASE_DIR, "consultas.json"),
    "especialidades": os.path.join(BASE_DIR, "especialidades.json")
}

DEFAULTS = {
    "especialidades": [
        { "id": 1, "nome": "Clínica Geral", "icone": "fa-user-doctor", "descricao": "Atendimento primário e check-ups." },
        { "id": 2, "nome": "Cardiologia", "icone": "fa-heart-pulse", "descricao": "Saúde do coração e sistema circulatório." },
        { "id": 3, "nome": "Pediatria", "icone": "fa-baby", "descricao": "Acompanhamento de crianças e adolescentes." },
        { "id": 4, "nome": "Urologia", "icone": "fa-mars", "descricao": "Trato urinário e sistema reprodutor masculino." },
        { "id": 5, "nome": "Ginecologia", "icone": "fa-venus", "descricao": "Saúde da mulher e sistema reprodutor feminino." },
        { "id": 6, "nome": "Dermatologia", "icone": "fa-hand-dots", "descricao": "Cuidados com a pele, cabelos e unhas." },
        { "id": 7, "nome": "Psicologia", "icone": "fa-brain", "descricao": "Terapia, saúde mental e bem-estar emocional." }
    ],
    "funcionarios": [
        { "id": 20252411, "nome": "Dr. César", "cpf": "123.456.891-00", "cargo": "Gerente", "especialidade": "Clínica Geral", "senha": "123" },
        { "id": 20252611, "nome": "Dra. Julia Santos", "cpf": "456.789.101-12", "cargo": "Chefe Cardiologista", "especialidade": "Cardiologia", "senha": "123" },
        { "id": 20252511, "nome": "Dra. Karol Mendes", "cpf": "033.127.450-09", "cargo": "Pediatra", "especialidade": "Pediatria", "senha": "123" },
        { "id": 20252711, "nome": "Dra. Cecília Oliveira", "cpf": "809.562.310-27", "cargo": "Ginecologista", "especialidade": "Ginecologia", "senha": "123" },
        { "id": 20252811, "nome": "Dr. Ruan Carlos", "cpf": "694.218.570-03", "cargo": "Urologista", "especialidade": "Urologia", "senha": "123" },
        { "id": 20252911, "nome": "Dr. Luis Vilas Boas", "cpf": "152.740.980-51", "cargo": "Dermatologista", "especialidade": "Dermatologia", "senha": "123" },
        { "id": 20253011, "nome": "Dr. Rafael Dias", "cpf": "522.896.723-19", "cargo": "Terapeuta", "especialidade": "Psicologia", "senha": "123" }
    ],
    "pacientes": [],
    "consultas": []
}

def inicializar_dados():
    """Cria os arquivos JSON iniciais se eles não existirem."""
    for key, filepath in FILES.items():
        if not os.path.exists(filepath):
            print(f"Criando arquivo padrão: {filepath}")
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(DEFAULTS[key], f, indent=4, ensure_ascii=False)

def carregar_dados(key):
    try:
        with open(FILES[key], "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def salvar_dados(key, dados):
    try:
        with open(FILES[key], "w", encoding="utf-8") as f:
            json.dump(dados, f, indent=4, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Erro ao salvar: {e}")
        return False

@app.route('/', methods=['GET'])
def index():
    return jsonify({"message": "API ConsultaRec rodando. Pronto para integração."}), 200

@app.route('/api/data/<key>', methods=['GET'])
def get_data(key):
    if key not in FILES:
        return jsonify({"message": "Tipo de dado inválido."}), 400
    return jsonify(carregar_dados(key)), 200

@app.route('/api/login', methods=['POST'])
def login_api():
    data = request.json
    val = data.get('valor')
    tipo = data.get('tipo')
    senha_recebida = data.get('senha')

    user = None
    user_type = ''

    if tipo == 'medico':
        user = next((f for f in carregar_dados('funcionarios') if str(f.get('id')) == str(val) or f.get('cpf') == val), None)
        user_type = 'medico'
    elif tipo == 'paciente':
        user = next((p for p in carregar_dados('pacientes') if p.get('cpf') == val), None)
        user_type = 'paciente'
    else:
        return jsonify({"message": "Tipo de login inválido."}), 400

    if user and str(user.get('senha')) == str(senha_recebida):
        return jsonify({"message": "Login realizado com sucesso!", "user": user, "type": user_type}), 200
    else:
        return jsonify({"message": "Login ou Senha incorretos."}), 401

@app.route('/api/pacientes', methods=['POST'])
def cadastrar_paciente_api():
    data = request.json
    pacientes = carregar_dados('pacientes')

    if any(p.get('cpf') == data.get('cpf') for p in pacientes):
        return jsonify({"message": "CPF já cadastrado!"}), 400

    novo_id = max([p.get('id', 0) for p in pacientes]) + 1 if pacientes else 1
    
    novo_paciente = {
        "id": novo_id,
        "nome": data.get('nome'),
        "cpf": data.get('cpf'),
        "telefone": data.get('telefone'),
        "email": data.get('email'),
        "senha": data.get('senha')
    }
    
    pacientes.append(novo_paciente)
    if salvar_dados('pacientes', pacientes):
        return jsonify({"message": "Paciente cadastrado!", "id": novo_id}), 201
    return jsonify({"message": "Erro ao salvar."}), 500

@app.route('/api/pacientes/<int:id>', methods=['DELETE'])
def deletar_paciente(id):
    pacientes = carregar_dados('pacientes')
    lista_atualizada = [p for p in pacientes if p.get('id') != id]

    if len(pacientes) == len(lista_atualizada):
        return jsonify({"message": "Paciente não encontrado."}), 404
        
    if salvar_dados('pacientes', lista_atualizada):
        return jsonify({"message": "Paciente removido!"}), 200
    return jsonify({"message": "Erro ao remover."}), 500

@app.route('/api/funcionarios', methods=['POST'])
def cadastrar_funcionario():
    data = request.json
    funcionarios = carregar_dados('funcionarios')

    novo_id = max([f.get('id', 20250000) for f in funcionarios]) + 1
    
    novo_func = {
        "id": novo_id,
        "nome": data.get('nome'),
        "cpf": data.get('cpf'),
        "cargo": data.get('cargo'),
        "especialidade": data.get('especialidade'),
        "senha": data.get('senha')
    }
    
    funcionarios.append(novo_func)
    if salvar_dados('funcionarios', funcionarios):
        return jsonify({"message": "Funcionário cadastrado!", "id": novo_id}), 201
    return jsonify({"message": "Erro ao salvar."}), 500

@app.route('/api/consultas', methods=['POST'])
def agendar_consulta():
    data = request.json
    consultas = carregar_dados('consultas')
    
    conflito = next((c for c in consultas if 
        c.get('id_profissional') == data.get('id_profissional') and 
        c.get('data') == data.get('data') and 
        c.get('horario') == data.get('horario') and 
        c.get('status') != 'Cancelada'), None)
    
    if conflito:
        return jsonify({"message": "Horário já ocupado!"}), 409

    novo_id = max([c.get('id', 0) for c in consultas]) + 1 if consultas else 1
    nova_consulta = {
        "id": novo_id,
        "cpf_paciente": data.get('cpf_paciente'),
        "nome_paciente": data.get('nome_paciente'),
        "id_profissional": data.get('id_profissional'),
        "data": data.get('data'),
        "horario": data.get('horario'),
        "status": 'Agendada'
    }

    consultas.append(nova_consulta)
    if salvar_dados('consultas', consultas):
        return jsonify({"message": "Agendado com sucesso!"}), 201
    return jsonify({"message": "Erro ao agendar."}), 500

# ROTA NOVA ADICIONADA PARA REMARCAR CONSULTA
@app.route('/api/consultas/<int:id>', methods=['PUT'])
def atualizar_consulta(id):
    data_req = request.json
    consultas = carregar_dados('consultas')
    consulta = next((c for c in consultas if c.get('id') == id), None)

    if not consulta:
        return jsonify({"message": "Consulta não encontrada."}), 404

    # Verifica se o novo horário já está ocupado (excluindo a própria consulta atual)
    conflito = next((c for c in consultas if 
        c.get('id') != id and 
        c.get('id_profissional') == consulta.get('id_profissional') and 
        c.get('data') == data_req.get('data') and 
        c.get('horario') == data_req.get('horario') and 
        c.get('status') != 'Cancelada'), None)

    if conflito:
        return jsonify({"message": "Este horário já está ocupado!"}), 409

    consulta['data'] = data_req.get('data')
    consulta['horario'] = data_req.get('horario')

    if salvar_dados('consultas', consultas):
        return jsonify({"message": "Consulta reagendada com sucesso!"}), 200
    return jsonify({"message": "Erro ao atualizar."}), 500

@app.route('/api/consultas/<int:id>/cancelar', methods=['POST'])
def cancelar_consulta(id):
    consultas = carregar_dados('consultas')
    consulta = next((c for c in consultas if c.get('id') == id), None)

    if not consulta:
        return jsonify({"message": "Consulta não encontrada."}), 404

    consulta['status'] = 'Cancelada'
    if salvar_dados('consultas', consultas):
        return jsonify({"message": "Consulta cancelada!"}), 200
    return jsonify({"message": "Erro ao cancelar."}), 500

@app.route('/api/consultas/<int:id>/concluir', methods=['POST'])
def concluir_consulta(id):
    consultas = carregar_dados('consultas')
    consulta = next((c for c in consultas if c.get('id') == id), None)
    if not consulta:
        return jsonify({"message": "Consulta não encontrada."}), 404

    consulta['status'] = 'Concluída'
    if salvar_dados('consultas', consultas):
        return jsonify({"message": "Consulta concluída!"}), 200
    return jsonify({"message": "Erro ao concluir."}), 500

@app.route('/api/consultas/limpar', methods=['DELETE'])
def limpar_historico_consultas():
    if salvar_dados('consultas', []):
        return jsonify({"message": "Histórico de agendamentos apagado com sucesso!"}), 200
    return jsonify({"message": "Erro ao limpar histórico."}), 500

@app.route('/api/funcionarios/<int:id>', methods=['DELETE'])
def deletar_funcionario_api(id):
    funcionarios = carregar_dados('funcionarios')
    lista_atualizada = [f for f in funcionarios if f.get('id') != id]

    if len(funcionarios) == len(lista_atualizada):
        return jsonify({"message": "Funcionário não encontrado."}), 404
        
    if salvar_dados('funcionarios', lista_atualizada):
        return jsonify({"message": "Funcionário removido com sucesso!"}), 200
    return jsonify({"message": "Erro ao remover funcionário."}), 500

if __name__ == '__main__':
    inicializar_dados()
    app.run(debug=True)