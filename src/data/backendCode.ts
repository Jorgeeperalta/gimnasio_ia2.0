export const MYSQL_SCHEMA_SQL = `-- ============================================================
-- BASE DE DATOS: gym_system_multigym
-- SISTEMA MULTI-GIMNASIOS CON CHAT DEEPSEEK & CONTROL SEMANAL
-- ============================================================

CREATE DATABASE IF NOT EXISTS gym_system_multigym 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE gym_system_multigym;

-- 1. TABLA GIMNASIOS (Multi-tenant)
CREATE TABLE IF NOT EXISTS gimnasios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  codigo VARCHAR(30) UNIQUE NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  telefono VARCHAR(50),
  email VARCHAR(100),
  cuota_plataforma DECIMAL(10,2) DEFAULT 150.00,
  estado_cobro ENUM('al_dia', 'pendiente', 'suspendido') DEFAULT 'al_dia',
  plan_suscripcion ENUM('Básico', 'Pro', 'Enterprise') DEFAULT 'Pro',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. TABLA COBROS POR GIMNASIO (Super Admin)
CREATE TABLE IF NOT EXISTS cobros_gimnasio (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gimnasio_id INT NOT NULL,
  mes VARCHAR(50) NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  estado ENUM('pagado', 'pendiente', 'vencido') DEFAULT 'pendiente',
  fecha_pago DATE NULL,
  nro_factura VARCHAR(50) NOT NULL,
  FOREIGN KEY (gimnasio_id) REFERENCES gimnasios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. TABLA USUARIOS / CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gimnasio_id INT NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL,
  telefono VARCHAR(50),
  plan_membresia VARCHAR(100) DEFAULT 'Plan Mensual Estándar',
  cuota_mensual DECIMAL(10,2) DEFAULT 45.00,
  saldo_deuda DECIMAL(10,2) DEFAULT 0.00,
  estado ENUM('activo', 'inactivo', 'moroso') DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (gimnasio_id) REFERENCES gimnasios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. TABLA RUTINAS
CREATE TABLE IF NOT EXISTS rutinas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gimnasio_id INT NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  grupo_muscular ENUM('Pecho', 'Espalda', 'Piernas', 'Hombros', 'Bíceps', 'Tríceps', 'Abdomen / Core', 'Cardio & Full Body') NOT NULL,
  dia_semana ENUM('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo') NOT NULL,
  duracion_min INT DEFAULT 50,
  nivel ENUM('Principiante', 'Intermedio', 'Avanzado') DEFAULT 'Intermedio',
  instrucciones TEXT,
  FOREIGN KEY (gimnasio_id) REFERENCES gimnasios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. TABLA EJERCICIOS DE RUTINA
CREATE TABLE IF NOT EXISTS ejercicios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rutina_id INT NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  grupo_muscular VARCHAR(60) NOT NULL,
  series INT NOT NULL,
  repeticiones VARCHAR(30) NOT NULL,
  descanso VARCHAR(30) DEFAULT '60 seg',
  notas TEXT,
  FOREIGN KEY (rutina_id) REFERENCES rutinas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. TABLA RUTINAS COMPLETADAS (Control Semanal para Cliente)
CREATE TABLE IF NOT EXISTS rutinas_completadas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  rutina_id INT NOT NULL,
  dia_semana VARCHAR(20) NOT NULL,
  semana_ano INT NOT NULL,
  ano INT NOT NULL,
  fecha_completada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  FOREIGN KEY (rutina_id) REFERENCES rutinas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. TABLA PAGOS DE CLIENTES (Control de Cuotas y Deuda)
CREATE TABLE IF NOT EXISTS pagos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gimnasio_id INT NOT NULL,
  cliente_id INT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  concepto VARCHAR(150) NOT NULL,
  metodo_pago ENUM('Efectivo', 'Tarjeta', 'Transferencia') DEFAULT 'Efectivo',
  fecha DATE NOT NULL,
  estado ENUM('completado', 'pendiente') DEFAULT 'completado',
  FOREIGN KEY (gimnasio_id) REFERENCES gimnasios(id) ON DELETE CASCADE,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. TABLA EXTRAS / PRODUCTOS (Tienda, Barra de Proteínas, Suplementos)
CREATE TABLE IF NOT EXISTS extras_catalogo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gimnasio_id INT NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  categoria ENUM('Bebida', 'Suplemento', 'Snack', 'Accesorio', 'Servicio') NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0,
  FOREIGN KEY (gimnasio_id) REFERENCES gimnasios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. TABLA VENTAS EXTRAS A CLIENTE (Suma a deuda si no está pagado)
CREATE TABLE IF NOT EXISTS compras_extras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gimnasio_id INT NOT NULL,
  cliente_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  total DECIMAL(10,2) NOT NULL,
  pagado TINYINT(1) DEFAULT 0,
  fecha DATE NOT NULL,
  FOREIGN KEY (gimnasio_id) REFERENCES gimnasios(id) ON DELETE CASCADE,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES extras_catalogo(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. TABLA TIPS DEL GIMNASIO
CREATE TABLE IF NOT EXISTS tips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gimnasio_id INT NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  categoria ENUM('Nutrición', 'Técnica', 'Motivación', 'Descanso', 'Seguridad') NOT NULL,
  contenido TEXT NOT NULL,
  autor VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (gimnasio_id) REFERENCES gimnasios(id) ON DELETE CASCADE
) ENGINE=InnoDB;
`;

export const PHP_BACKEND_CODE = `<?php
/**
 * API REST PHP Multi-Gimnasio & DeepSeek Coach
 * Conexión PDO MySQL y endpoints para Super Admin, Admin y Clientes
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuración de Base de Datos MySQL
$dbHost = getenv('DB_HOST') ?: '127.0.0.1';
$dbName = getenv('DB_NAME') ?: 'gym_system_multigym';
$dbUser = getenv('DB_USER') ?: 'root';
$dbPass = getenv('DB_PASS') ?: '';

try {
    $pdo = new PDO("mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4", $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    echo json_encode(["error" => "Conexión fallida: " . $e->getMessage()]);
    exit();
}

// Enrutador sencillo por parámetro ?action=...
$action = $_GET['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true);

switch ($action) {
    // ----------------- SUPER ADMIN -----------------
    case 'get_gimnasios':
        $stmt = $pdo->query("SELECT g.*, (SELECT COUNT(*) FROM clientes c WHERE c.gimnasio_id = g.id) as total_clientes FROM gimnasios g");
        echo json_encode($stmt->fetchAll());
        break;

    case 'get_cobros_gimnasios':
        $stmt = $pdo->query("SELECT c.*, g.nombre as gimnasio_nombre FROM cobros_gimnasio c JOIN gimnasios g ON c.gimnasio_id = g.id ORDER BY c.fecha_vencimiento DESC");
        echo json_encode($stmt->fetchAll());
        break;

    // ----------------- ADMIN GIMNASIO -----------------
    case 'get_clientes_gimnasio':
        $gymId = (int)($_GET['gym_id'] ?? 1);
        $stmt = $pdo->prepare("SELECT * FROM clientes WHERE gimnasio_id = ? ORDER BY id DESC");
        $stmt->execute([$gymId]);
        echo json_encode($stmt->fetchAll());
        break;

    case 'get_rutinas':
        $gymId = (int)($_GET['gym_id'] ?? 1);
        $stmt = $pdo->prepare("SELECT * FROM rutinas WHERE gimnasio_id = ?");
        $stmt->execute([$gymId]);
        $rutinas = $stmt->fetchAll();

        foreach ($rutinas as &$r) {
            $eStmt = $pdo->prepare("SELECT * FROM ejercicios WHERE rutina_id = ?");
            $eStmt->execute([$r['id']]);
            $r['ejercicios'] = $eStmt->fetchAll();
        }
        echo json_encode($rutinas);
        break;

    case 'registrar_pago':
        $gymId = (int)$input['gym_id'];
        $clienteId = (int)$input['cliente_id'];
        $monto = (float)$input['monto'];
        $concepto = $input['concepto'];
        $metodo = $input['metodo_pago'] ?? 'Efectivo';

        $pdo->beginTransaction();
        $stmt = $pdo->prepare("INSERT INTO pagos (gimnasio_id, cliente_id, monto, concepto, metodo_pago, fecha) VALUES (?, ?, ?, ?, ?, CURDATE())");
        $stmt->execute([$gymId, $clienteId, $monto, $concepto, $metodo]);

        // Restar saldo deudor del cliente
        $upd = $pdo->prepare("UPDATE clientes SET saldo_deuda = GREATEST(0, saldo_deuda - ?) WHERE id = ?");
        $upd->execute([$monto, $clienteId]);
        $pdo->commit();

        echo json_encode(["status" => "success", "message" => "Pago registrado y deuda actualizada"]);
        break;

    // ----------------- CLIENTE & CONTROL SEMANAL -----------------
    case 'completar_rutina_semanal':
        $clienteId = (int)$input['cliente_id'];
        $rutinaId = (int)$input['rutina_id'];
        $diaSemana = $input['dia_semana'];
        $semana = (int)date('W');
        $ano = (int)date('Y');

        $stmt = $pdo->prepare("INSERT INTO rutinas_completadas (cliente_id, rutina_id, dia_semana, semana_ano, ano) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$clienteId, $rutinaId, $diaSemana, $semana, $ano]);
        echo json_encode(["status" => "success", "message" => "Rutina completada registrada para esta semana"]);
        break;

    case 'get_control_semanal':
        $clienteId = (int)($_GET['cliente_id'] ?? 1);
        $semana = (int)date('W');
        $ano = (int)date('Y');

        $stmt = $pdo->prepare("SELECT rc.*, r.nombre, r.grupo_muscular FROM rutinas_completadas rc JOIN rutinas r ON rc.rutina_id = r.id WHERE rc.cliente_id = ? AND rc.semana_ano = ? AND rc.ano = ?");
        $stmt->execute([$clienteId, $semana, $ano]);
        echo json_encode($stmt->fetchAll());
        break;

    // ----------------- CHATBOT ASISTENTE DEEPSEEK -----------------
    case 'chat_deepseek':
        $mensaje = $input['message'] ?? '';
        $clienteNombre = $input['client_name'] ?? 'Atleta';
        $gymNombre = $input['gym_name'] ?? 'Titan Gym';
        $diaHoy = $input['today_day'] ?? 'Lunes';
        $deuda = $input['debt'] ?? 0;
        $completadas = json_encode($input['completed_this_week'] ?? []);

        // Prompt de contexto para DeepSeek / Gemini
        $system = "Eres DeepSeek Coach del gimnasio $gymNombre. Cliente: $clienteNombre. Hoy es: $diaHoy. Deuda: \$$deuda. Rutinas hechas esta semana: $completadas. Responde enérgico, claro y recomienda rutinas por grupo muscular o control semanal.";

        $deepseekApiKey = getenv('DEEPSEEK_API_KEY');
        if ($deepseekApiKey) {
            $ch = curl_init("https://api.deepseek.com/v1/chat/completions");
            $payload = [
                "model" => "deepseek-chat",
                "messages" => [
                    ["role" => "system", "content" => $system],
                    ["role" => "user", "content" => $mensaje]
                ]
            ];
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                "Content-Type: application/json",
                "Authorization: Bearer " . $deepseekApiKey
            ]);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            $res = curl_exec($ch);
            curl_close($ch);
            echo $res;
        } else {
            // Respuesta de contingencia estructurada
            echo json_encode([
                "reply" => "¡Hola $clienteNombre! Hoy es $diaHoy. Según tu plan de $gymNombre, puedes consultar tu rutina de hoy, elegir por grupo muscular o revisar tu control semanal.",
                "thought" => "Analizando datos locales del cliente en PHP."
            ]);
        }
        break;

    default:
        echo json_encode(["status" => "ok", "version" => "1.0.0", "endpoints" => ["get_gimnasios", "get_clientes_gimnasio", "get_rutinas", "completar_rutina_semanal", "chat_deepseek"]]);
        break;
}
?>
`;

export const VUE3_VUETIFY_CODE = `<template>
  <v-app>
    <!-- V-NAVIGATION-DRAWER -->
    <v-navigation-drawer v-model="drawer" color="surface" elevation="2" permanent app>
      <v-list-item
        prepend-icon="mdi-dumbbell"
        title="GymCore"
        subtitle="Multi-Gimnasio SaaS"
        class="py-4 font-weight-bold"
      ></v-list-item>
      <v-divider></v-divider>

      <!-- Selector de Rol (Vuetify Button Toggle) -->
      <div class="pa-3">
        <v-btn-toggle v-model="role" mandatory color="primary" density="compact" class="w-100">
          <v-btn value="super_admin" size="small">Super Admin</v-btn>
          <v-btn value="gym_admin" size="small">Admin Gym</v-btn>
          <v-btn value="client" size="small">Cliente</v-btn>
        </v-btn-toggle>
      </div>
      <v-divider></v-divider>

      <!-- Menú según el Rol -->
      <v-list density="compact" nav>
        <template v-if="role === 'client'">
          <v-list-item prepend-icon="mdi-robot" title="Chat DeepSeek AI" value="chat" @click="tab = 'chat'"></v-list-item>
          <v-list-item prepend-icon="mdi-calendar-check" title="Mis Rutinas & Semana" value="rutinas" @click="tab = 'rutinas'"></v-list-item>
          <v-list-item prepend-icon="mdi-currency-usd" title="Control de Deuda" value="deuda" @click="tab = 'deuda'"></v-list-item>
          <v-list-item prepend-icon="mdi-cart" title="Extras & Cafetería" value="extras" @click="tab = 'extras'"></v-list-item>
          <v-list-item prepend-icon="mdi-lightbulb-on" title="Tips del Coach" value="tips" @click="tab = 'tips'"></v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <!-- V-APP-BAR -->
    <v-app-bar elevation="1" color="primary" class="text-white">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title class="font-weight-medium">
        {{ currentGym.nombre }} · Panel {{ roleTitle }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-chip color="amber-lighten-4" class="text-black font-weight-bold mr-3">
        Rutinas completadas esta semana: {{ completedCount }} / 5
      </v-chip>
    </v-app-bar>

    <!-- V-MAIN -->
    <v-main class="bg-grey-lighten-4">
      <v-container fluid class="pa-6">
        <!-- VISTA CLIENTE: CHATBOT DEEPSEEK -->
        <v-card v-if="tab === 'chat'" elevation="3" class="rounded-xl overflow-hidden">
          <v-card-title class="d-flex align-center bg-grey-darken-4 text-white pa-4">
            <v-icon icon="mdi-robot-outline" class="mr-3 text-cyan"></v-icon>
            <div>
              <div class="text-h6">DeepSeek Gym Coach</div>
              <div class="text-caption text-grey-lighten-1">IA de musculación, rutinas del día y control semanal</div>
            </div>
          </v-card-title>

          <!-- Mensajes del chat -->
          <v-card-text style="max-height: 520px; overflow-y: auto;" class="pa-4">
            <div v-for="m in messages" :key="m.id" :class="['d-flex mb-4', m.sender === 'user' ? 'justify-end' : 'justify-start']">
              <v-sheet
                :color="m.sender === 'user' ? 'primary' : 'grey-lighten-3'"
                :class="['pa-4 rounded-lg elevation-1', m.sender === 'user' ? 'text-white' : 'text-grey-darken-4']"
                max-width="75%"
              >
                <div v-if="m.thought" class="text-caption text-grey-darken-1 font-italic mb-2 border-b pb-1">
                  🧠 Pensamiento: {{ m.thought }}
                </div>
                <div style="white-space: pre-line;">{{ m.text }}</div>
              </v-sheet>
            </div>
          </v-card-text>

          <!-- Input bar con botones de atajo rápidos -->
          <v-card-actions class="pa-4 bg-white border-t d-block">
            <div class="d-flex ga-2 mb-2 flex-wrap">
              <v-chip size="small" variant="outlined" color="primary" @click="sendQuery('¿Qué rutina me toca hoy?')">
                Rutina de Hoy
              </v-chip>
              <v-chip size="small" variant="outlined" color="secondary" @click="sendQuery('Ver ejercicios de Pecho')">
                Pecho
              </v-chip>
              <v-chip size="small" variant="outlined" color="secondary" @click="sendQuery('Ver ejercicios de Piernas')">
                Piernas
              </v-chip>
              <v-chip size="small" variant="outlined" color="success" @click="sendQuery('¿Cuántos días llevo esta semana?')">
                Control Semanal
              </v-chip>
              <v-chip size="small" variant="outlined" color="error" @click="sendQuery('¿Cuánto debo de mensualidad?')">
                Mi Deuda
              </v-chip>
            </div>
            <div class="d-flex">
              <v-text-field
                v-model="inputMsg"
                placeholder="Pregúntale a DeepSeek sobre tu entrenamiento..."
                density="compact"
                variant="outlined"
                hide-details
                @keyup.enter="sendMessage"
              ></v-text-field>
              <v-btn color="primary" class="ml-2" icon="mdi-send" @click="sendMessage"></v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue';

const drawer = ref(true);
const role = ref('client');
const tab = ref('chat');
const inputMsg = ref('');
const completedCount = ref(2);

const currentGym = ref({
  nombre: 'Titan Fitness Center',
  plan: 'Pro'
});

const messages = ref([
  {
    id: 1,
    sender: 'deepseek',
    text: '¡Hola! Soy tu DeepSeek Coach. Hoy es Lunes y tienes programado Pecho & Tríceps. ¿Deseas ver tus series o consultar otro grupo muscular?',
    thought: 'Consultando base de datos MySQL de rutinas y ejercicios para el cliente.'
  }
]);

const sendMessage = async () => {
  if (!inputMsg.value.trim()) return;
  const userText = inputMsg.value;
  messages.value.push({ id: Date.now(), sender: 'user', text: userText });
  inputMsg.value = '';

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: userText, gymName: currentGym.value.nombre })
  });
  const data = await res.json();
  messages.value.push({
    id: Date.now() + 1,
    sender: 'deepseek',
    text: data.reply,
    thought: data.thought
  });
};

const sendQuery = (text) => {
  inputMsg.value = text;
  sendMessage();
};

const roleTitle = computed(() => {
  if (role.value === 'super_admin') return 'Super Administrador (Plataforma)';
  if (role.value === 'gym_admin') return 'Administrador de Gimnasio';
  return 'Portal Atleta / Cliente';
});
</script>
`;
