import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

function getIsoWeek(date: Date) {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  return Math.ceil(((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  const database = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME || "gym_system_multigym",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "root",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  app.use(express.json());

  // Health check
  app.get("/api/health", async (_req: Request, res: Response) => {
    try {
      await database.query("SELECT 1");
      res.json({
        status: "ok",
        database: "connected",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Database connection error:", error?.message || error);
      res.status(503).json({
        status: "error",
        database: "disconnected",
        message: "No se pudo conectar a MySQL. Revisa DB_HOST, DB_PORT, DB_NAME, DB_USER y DB_PASS.",
      });
    }
  });

  // REST operations defined in src/data/backendCode.ts.
  app.all("/api/backend", async (req: Request, res: Response) => {
    const action = String(req.query.action || "");
    const gymId = Number(req.query.gym_id || 1);
    const clientId = Number(req.query.cliente_id || 1);

    try {
      switch (action) {
        case "get_gimnasios": {
          const [rows] = await database.query(
            "SELECT g.*, (SELECT COUNT(*) FROM clientes c WHERE c.gimnasio_id = g.id) AS total_clientes FROM gimnasios g"
          );
          return res.json(rows);
        }
        case "get_gym": {
          const [rows] = await database.execute(
            "SELECT g.*, (SELECT COUNT(*) FROM clientes c WHERE c.gimnasio_id = g.id) AS total_clientes FROM gimnasios g WHERE g.id = ?",
            [gymId]
          );
          const gyms = rows as any[];
          if (gyms.length === 0) return res.status(404).json({ error: "Gimnasio no encontrado" });
          return res.json(gyms[0]);
        }
        case "get_cobros_gimnasios": {
          const [rows] = await database.query(
            "SELECT c.*, g.nombre AS gimnasio_nombre FROM cobros_gimnasio c JOIN gimnasios g ON c.gimnasio_id = g.id ORDER BY c.fecha_vencimiento DESC"
          );
          return res.json(rows);
        }
        case "get_clientes_gimnasio": {
          const [rows] = await database.execute(
            "SELECT * FROM clientes WHERE gimnasio_id = ? ORDER BY id DESC",
            [gymId]
          );
          return res.json(rows);
        }
        case "get_rutinas": {
          const [routineRows] = await database.execute(
            "SELECT * FROM rutinas WHERE gimnasio_id = ? ORDER BY id DESC",
            [gymId]
          );
          const routines = await Promise.all(
            (routineRows as any[]).map(async (routine) => {
              const [exerciseRows] = await database.execute(
                "SELECT * FROM ejercicios WHERE rutina_id = ? ORDER BY id",
                [routine.id]
              );
              return { ...routine, ejercicios: exerciseRows };
            })
          );
          return res.json(routines);
        }
        case "registrar_pago": {
          const { gym_id, cliente_id, monto, concepto, metodo_pago = "Efectivo" } = req.body || {};
          const connection = await database.getConnection();
          try {
            await connection.beginTransaction();
            await connection.execute(
              "INSERT INTO pagos (gimnasio_id, cliente_id, monto, concepto, metodo_pago, fecha) VALUES (?, ?, ?, ?, ?, CURDATE())",
              [gym_id, cliente_id, monto, concepto, metodo_pago]
            );
            await connection.execute(
              "UPDATE clientes SET saldo_deuda = GREATEST(0, saldo_deuda - ?) WHERE id = ?",
              [monto, cliente_id]
            );
            await connection.commit();
          } catch (error) {
            await connection.rollback();
            throw error;
          } finally {
            connection.release();
          }
          return res.json({ status: "success", message: "Pago registrado y deuda actualizada" });
        }
        case "completar_rutina_semanal": {
          const { cliente_id, rutina_id, dia_semana } = req.body || {};
          const currentDate = new Date();
          const week = getIsoWeek(currentDate);
          await database.execute(
            "INSERT INTO rutinas_completadas (cliente_id, rutina_id, dia_semana, semana_ano, ano) VALUES (?, ?, ?, ?, ?)",
            [cliente_id, rutina_id, dia_semana, week, currentDate.getFullYear()]
          );
          return res.json({ status: "success", message: "Rutina completada registrada para esta semana" });
        }
        case "get_control_semanal": {
          const currentDate = new Date();
          const week = getIsoWeek(currentDate);
          const [rows] = await database.execute(
            "SELECT rc.*, r.nombre, r.grupo_muscular FROM rutinas_completadas rc JOIN rutinas r ON rc.rutina_id = r.id WHERE rc.cliente_id = ? AND rc.semana_ano = ? AND rc.ano = ?",
            [clientId, week, currentDate.getFullYear()]
          );
          return res.json(rows);
        }
        default:
          return res.status(400).json({
            error: "Acción no válida",
            actions: ["get_gimnasios", "get_cobros_gimnasios", "get_clientes_gimnasio", "get_rutinas", "registrar_pago", "completar_rutina_semanal", "get_control_semanal"],
          });
      }
    } catch (error: any) {
      console.error(`Backend action ${action} error:`, error?.message || error);
      return res.status(500).json({ error: "Error al consultar la base de datos" });
    }
  });

  app.all("/api/super-admin", async (req: Request, res: Response) => {
    const action = String(req.query.action || "");
    const payload = req.body || {};
    const numericId = (value: unknown) => {
      const id = Number(value);
      if (!Number.isInteger(id) || id <= 0) throw new Error("Identificador inválido");
      return id;
    };

    try {
      switch (action) {
        case "create_gym": {
          const gym = payload.gym || {};
          const [result] = await database.execute(
            "INSERT INTO gimnasios (nombre, codigo, direccion, telefono, email, cuota_plataforma, estado_cobro, plan_suscripcion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [gym.name, gym.code, gym.address, gym.phone, gym.email, gym.monthlyFee, gym.billingStatus, gym.plan]
          );
          const gymId = Number((result as any).insertId);
          let userId: number | undefined;
          const admin = payload.adminCredentials;
          if (admin?.username && admin?.password) {
            const [userResult] = await database.execute(
              "INSERT INTO usuarios (username, password_hash, nombre, email, rol, gimnasio_id) VALUES (?, ?, ?, ?, 'gym_admin', ?)",
              [admin.username, admin.password, admin.name, admin.email, gymId]
            );
            userId = Number((userResult as any).insertId);
          }
          return res.status(201).json({ id: String(gymId), userId: userId ? String(userId) : undefined });
        }
        case "update_gym": {
          const gym = payload.gym || {};
          const id = numericId(gym.id);
          await database.execute(
            "UPDATE gimnasios SET nombre = ?, codigo = ?, direccion = ?, telefono = ?, email = ?, cuota_plataforma = ?, estado_cobro = ?, plan_suscripcion = ? WHERE id = ?",
            [gym.name, gym.code, gym.address, gym.phone, gym.email, gym.monthlyFee, gym.billingStatus, gym.plan, id]
          );
          return res.json({ status: "success" });
        }
        case "delete_gym": {
          await database.execute("DELETE FROM gimnasios WHERE id = ?", [numericId(payload.id)]);
          return res.json({ status: "success" });
        }
        case "create_billing": {
          const bill = payload.bill || {};
          const [result] = await database.execute(
            "INSERT INTO cobros_gimnasio (gimnasio_id, mes, monto, fecha_vencimiento, estado, fecha_pago, nro_factura) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [numericId(bill.gymId), bill.month, bill.amount, bill.dueDate, bill.status, bill.paidDate || null, bill.invoiceNumber]
          );
          return res.status(201).json({ id: String((result as any).insertId) });
        }
        case "update_billing": {
          const bill = payload.bill || {};
          await database.execute(
            "UPDATE cobros_gimnasio SET mes = ?, monto = ?, fecha_vencimiento = ?, estado = ?, fecha_pago = ? WHERE id = ?",
            [bill.month, bill.amount, bill.dueDate, bill.status, bill.paidDate || null, numericId(bill.id)]
          );
          return res.json({ status: "success" });
        }
        case "delete_billing": {
          await database.execute("DELETE FROM cobros_gimnasio WHERE id = ?", [numericId(payload.id)]);
          return res.json({ status: "success" });
        }
        case "mark_billing_paid": {
          await database.execute(
            "UPDATE cobros_gimnasio SET estado = 'pagado', fecha_pago = CURDATE() WHERE id = ?",
            [numericId(payload.id)]
          );
          return res.json({ status: "success" });
        }
        case "update_client": {
          const client = payload.client || {};
          await database.execute(
            "UPDATE clientes SET nombre = ?, email = ?, telefono = ?, plan_membresia = ?, cuota_mensual = ?, saldo_deuda = ?, estado = ? WHERE id = ?",
            [client.name, client.email, client.phone, client.membershipPlan, client.monthlyFee, client.debtAmount, client.status, numericId(client.id)]
          );
          return res.json({ status: "success" });
        }
        case "delete_client": {
          await database.execute("DELETE FROM clientes WHERE id = ?", [numericId(payload.id)]);
          return res.json({ status: "success" });
        }
        case "create_user": {
          const user = payload.user || {};
          const [result] = await database.execute(
            "INSERT INTO usuarios (username, password_hash, nombre, email, rol, gimnasio_id, cliente_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [user.username, user.password, user.name, user.email, user.role, user.gymId ? numericId(user.gymId) : null, user.clientId ? numericId(user.clientId) : null]
          );
          return res.status(201).json({ id: String((result as any).insertId) });
        }
        case "update_user": {
          const user = payload.user || {};
          await database.execute(
            "UPDATE usuarios SET username = ?, password_hash = ?, nombre = ?, email = ?, rol = ?, gimnasio_id = ?, cliente_id = ? WHERE id = ?",
            [user.username, user.password, user.name, user.email, user.role, user.gymId ? numericId(user.gymId) : null, user.clientId ? numericId(user.clientId) : null, numericId(user.id)]
          );
          return res.json({ status: "success" });
        }
        case "delete_user": {
          await database.execute("DELETE FROM usuarios WHERE id = ?", [numericId(payload.id)]);
          return res.json({ status: "success" });
        }
        default:
          return res.status(400).json({ error: "Acción Super Admin no válida" });
      }
    } catch (error: any) {
      console.error(`Super Admin action ${action} error:`, error?.message || error);
      return res.status(400).json({ error: error?.code === "ER_DUP_ENTRY" ? "El código o usuario ya existe" : error?.message || "Operación no válida" });
    }
  });

  app.all("/api/gym-admin", async (req: Request, res: Response) => {
    const action = String(req.query.action || "");
    const payload = req.body || {};
    const numericId = (value: unknown) => {
      const id = Number(value);
      if (!Number.isInteger(id) || id <= 0) throw new Error("Identificador inválido");
      return id;
    };

    try {
      switch (action) {
        case "create_client": {
          const client = payload.client || {};
          const [result] = await database.execute(
            "INSERT INTO clientes (gimnasio_id, nombre, email, telefono, plan_membresia, cuota_mensual, saldo_deuda, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [numericId(client.gymId), client.name, client.email, client.phone, client.membershipPlan, client.monthlyFee, client.debtAmount, client.status]
          );
          const clientId = Number((result as any).insertId);
          const credentials = payload.credentials;
          let userId: number | undefined;
          if (credentials?.username && credentials?.password) {
            const [userResult] = await database.execute(
              "INSERT INTO usuarios (username, password_hash, nombre, email, rol, gimnasio_id, cliente_id) VALUES (?, ?, ?, ?, 'client', ?, ?)",
              [credentials.username, credentials.password, client.name, client.email, numericId(client.gymId), clientId]
            );
            userId = Number((userResult as any).insertId);
          }
          return res.status(201).json({ id: String(clientId), userId: userId ? String(userId) : undefined });
        }
        case "update_client": {
          const client = payload.client || {};
          await database.execute(
            "UPDATE clientes SET nombre = ?, email = ?, telefono = ?, plan_membresia = ?, cuota_mensual = ?, saldo_deuda = ?, estado = ? WHERE id = ?",
            [client.name, client.email, client.phone, client.membershipPlan, client.monthlyFee, client.debtAmount, client.status, numericId(client.id)]
          );
          return res.json({ status: "success" });
        }
        case "delete_client":
          await database.execute("DELETE FROM clientes WHERE id = ?", [numericId(payload.id)]);
          return res.json({ status: "success" });
        case "create_routine": {
          const routine = payload.routine || {};
          const connection = await database.getConnection();
          try {
            await connection.beginTransaction();
            const [result] = await connection.execute(
              "INSERT INTO rutinas (gimnasio_id, nombre, grupo_muscular, dia_semana, duracion_min, nivel, instrucciones) VALUES (?, ?, ?, ?, ?, ?, ?)",
              [numericId(routine.gymId), routine.name, routine.muscleGroup, routine.day, routine.estimatedMinutes, routine.level, routine.notes || null]
            );
            const routineId = Number((result as any).insertId);
            for (const exercise of routine.exercises || []) {
              await connection.execute(
                "INSERT INTO ejercicios (rutina_id, nombre, grupo_muscular, series, repeticiones, descanso, notas) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [routineId, exercise.name, exercise.muscleGroup, exercise.sets, exercise.reps, exercise.rest, exercise.notes || null]
              );
            }
            await connection.commit();
            return res.status(201).json({ id: String(routineId) });
          } catch (error) {
            await connection.rollback();
            throw error;
          } finally {
            connection.release();
          }
        }
        case "update_routine": {
          const routine = payload.routine || {};
          const connection = await database.getConnection();
          try {
            await connection.beginTransaction();
            const routineId = numericId(routine.id);
            await connection.execute(
              "UPDATE rutinas SET nombre = ?, grupo_muscular = ?, dia_semana = ?, duracion_min = ?, nivel = ?, instrucciones = ? WHERE id = ?",
              [routine.name, routine.muscleGroup, routine.day, routine.estimatedMinutes, routine.level, routine.notes || null, routineId]
            );
            await connection.execute("DELETE FROM ejercicios WHERE rutina_id = ?", [routineId]);
            for (const exercise of routine.exercises || []) {
              await connection.execute(
                "INSERT INTO ejercicios (rutina_id, nombre, grupo_muscular, series, repeticiones, descanso, notas) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [routineId, exercise.name, exercise.muscleGroup, exercise.sets, exercise.reps, exercise.rest, exercise.notes || null]
              );
            }
            await connection.commit();
            return res.json({ status: "success" });
          } catch (error) {
            await connection.rollback();
            throw error;
          } finally {
            connection.release();
          }
        }
        case "delete_routine":
          await database.execute("DELETE FROM rutinas WHERE id = ?", [numericId(payload.id)]);
          return res.json({ status: "success" });
        case "create_payment": {
          const payment = payload.payment || {};
          const [result] = await database.execute(
            "INSERT INTO pagos (gimnasio_id, cliente_id, monto, concepto, metodo_pago, fecha, estado) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [numericId(payment.gymId), numericId(payment.clientId), payment.amount, payment.concept, payment.paymentMethod, payment.date, payment.status]
          );
          if (payment.status === "completado") {
            await database.execute("UPDATE clientes SET saldo_deuda = GREATEST(0, saldo_deuda - ?) WHERE id = ?", [payment.amount, numericId(payment.clientId)]);
          }
          return res.status(201).json({ id: String((result as any).insertId) });
        }
        case "update_payment": {
          const payment = payload.payment || {};
          await database.execute(
            "UPDATE pagos SET monto = ?, concepto = ?, metodo_pago = ?, fecha = ?, estado = ? WHERE id = ?",
            [payment.amount, payment.concept, payment.paymentMethod, payment.date, payment.status, numericId(payment.id)]
          );
          return res.json({ status: "success" });
        }
        case "delete_payment":
          await database.execute("DELETE FROM pagos WHERE id = ?", [numericId(payload.id)]);
          return res.json({ status: "success" });
        case "create_extra_item": {
          const item = payload.item || {};
          const [result] = await database.execute(
            "INSERT INTO extras_catalogo (gimnasio_id, nombre, categoria, precio, stock) VALUES (?, ?, ?, ?, ?)",
            [numericId(item.gymId), item.name, item.category, item.price, item.stock]
          );
          return res.status(201).json({ id: String((result as any).insertId) });
        }
        case "update_extra_item": {
          const item = payload.item || {};
          await database.execute("UPDATE extras_catalogo SET nombre = ?, categoria = ?, precio = ?, stock = ? WHERE id = ?", [item.name, item.category, item.price, item.stock, numericId(item.id)]);
          return res.json({ status: "success" });
        }
        case "delete_extra_item":
          await database.execute("DELETE FROM extras_catalogo WHERE id = ?", [numericId(payload.id)]);
          return res.json({ status: "success" });
        case "create_purchase": {
          const purchase = payload.purchase || {};
          const [result] = await database.execute(
            "INSERT INTO compras_extras (gimnasio_id, cliente_id, producto_id, cantidad, total, pagado, fecha) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [numericId(purchase.gymId), numericId(purchase.clientId), numericId(purchase.itemId), purchase.quantity, purchase.total, purchase.isPaid ? 1 : 0, purchase.date]
          );
          if (!purchase.isPaid) await database.execute("UPDATE clientes SET saldo_deuda = saldo_deuda + ? WHERE id = ?", [purchase.total, numericId(purchase.clientId)]);
          return res.status(201).json({ id: String((result as any).insertId) });
        }
        case "update_purchase": {
          const purchase = payload.purchase || {};
          await database.execute("UPDATE compras_extras SET cantidad = ?, total = ?, pagado = ?, fecha = ? WHERE id = ?", [purchase.quantity, purchase.total, purchase.isPaid ? 1 : 0, purchase.date, numericId(purchase.id)]);
          return res.json({ status: "success" });
        }
        case "delete_purchase":
          await database.execute("DELETE FROM compras_extras WHERE id = ?", [numericId(payload.id)]);
          return res.json({ status: "success" });
        case "create_tip": {
          const tip = payload.tip || {};
          const [result] = await database.execute("INSERT INTO tips (gimnasio_id, titulo, categoria, contenido, autor) VALUES (?, ?, ?, ?, ?)", [numericId(tip.gymId), tip.title, tip.category, tip.content, tip.author]);
          return res.status(201).json({ id: String((result as any).insertId) });
        }
        case "update_tip": {
          const tip = payload.tip || {};
          await database.execute("UPDATE tips SET titulo = ?, categoria = ?, contenido = ?, autor = ? WHERE id = ?", [tip.title, tip.category, tip.content, tip.author, numericId(tip.id)]);
          return res.json({ status: "success" });
        }
        case "delete_tip":
          await database.execute("DELETE FROM tips WHERE id = ?", [numericId(payload.id)]);
          return res.json({ status: "success" });
        default:
          return res.status(400).json({ error: "Acción GymAdmin no válida" });
      }
    } catch (error: any) {
      console.error(`GymAdmin action ${action} error:`, error?.message || error);
      return res.status(400).json({ error: error?.code === "ER_DUP_ENTRY" ? "El registro ya existe" : error?.message || "Operación no válida" });
    }
  });

  // Client Chat endpoint (DeepSeek Coach)
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const {
        message,
        clientName,
        gymName,
        todayDayName,
        assignedRoutines,
        weeklyCompleted,
        debtAmount,
        extras,
        tips,
        selectedMuscleGroup,
      } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Mensaje requerido" });
      }

      const apiKey = process.env.DEEPSEEK_API_KEY;

      const systemPrompt = `Eres DeepSeek Coach, el asistente inteligente y motivador de entrenamiento físico para los clientes del gimnasio "${gymName || "Gimnasio"}".
Tu usuario es "${clientName || "Atleta"}".
Hoy es: ${todayDayName || "hoy"}.

DATOS DEL CLIENTE EN TIEMPO REAL:
- Deuda o saldo pendiente de mensualidad: $${debtAmount || 0} USD (${debtAmount > 0 ? "Tiene saldo pendiente" : "Está al día"}).
- Rutinas completadas esta semana: ${JSON.stringify(weeklyCompleted || [])}.
- Rutinas asignadas en el sistema: ${JSON.stringify(assignedRoutines || [])}.
- Consumos / Extras recientes: ${JSON.stringify(extras || [])}.
- Tips del gimnasio: ${JSON.stringify(tips || [])}.
${selectedMuscleGroup ? `- Grupo muscular de interés: ${selectedMuscleGroup}` : ""}

DIRECTRICES:
1. Responde en español de forma enérgica, profesional, clara y estructurada.
2. Si el cliente pregunta qué le toca hoy, consulta las rutinas para el día ${todayDayName} y especifica los ejercicios, series, repeticiones y descanso.
3. Si el usuario pregunta por un grupo muscular (ej. Pecho, Espalda, Piernas, Bíceps, Tríceps, Hombros, Abdomen), extrae o diseña la rutina ideal enfocada en ese grupo muscular.
4. Ten siempre en cuenta las rutinas ya realizadas en la semana para que no sobreentrene el mismo grupo muscular dos días seguidos y felicítalo por su consistencia.
5. Si pregunta por su deuda o estado de pagos, responde con total precisión usando el saldo indicado.
6. Si pide marcar como hecha o completada la rutina de hoy, anímalo e indícale que puede presionar el botón de verificación o marcarla.
7. Puedes incluir una sección breve de análisis o razonamiento reflexivo al estilo DeepSeek con formato amigable.`;

      if (apiKey) {
        try {
          const deepSeekResponse = await fetch(
            process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: message },
                ],
                temperature: 0.7,
                stream: false,
              }),
            },
          );

          if (!deepSeekResponse.ok) {
            throw new Error(`DeepSeek API respondió ${deepSeekResponse.status}`);
          }

          const deepSeekData = await deepSeekResponse.json() as {
            choices?: Array<{
              message?: { content?: string; reasoning_content?: string };
            }>;
          };
          const assistantMessage = deepSeekData.choices?.[0]?.message;

          if (!assistantMessage?.content) {
            throw new Error("DeepSeek no devolvió contenido");
          }

          return res.json({
            reply: assistantMessage.content,
            thought: assistantMessage.reasoning_content,
            modelUsed: process.env.DEEPSEEK_MODEL || "deepseek-chat",
          });
        } catch (apiError: any) {
          console.warn("DeepSeek API error, using smart fallback:", apiError?.message);
        }
      }

      // Smart fallback reasoning engine if API key is not present or fails
      const lower = message.toLowerCase();
      let reply = "";
      let thought = "Analizando estado del atleta, día de la semana y rutinas registradas...";

      if (lower.includes("hoy") || lower.includes("toca") || lower.includes("rutina de hoy")) {
        thought = `Identificando rutina programada para ${todayDayName} y contrastando con rutinas completadas esta semana (${(weeklyCompleted || []).length} realizadas).`;
        const todays = (assignedRoutines || []).filter((r: any) =>
          r.day?.toLowerCase() === (todayDayName || "").toLowerCase()
        );
        if (todays.length > 0) {
          const r = todays[0];
          reply = `### 🔥 Rutina de Hoy (${todayDayName}): **${r.name}**\n\n` +
            `**Grupo Muscular:** ${r.muscleGroup}\n` +
            `**Duración sugerida:** ${r.estimatedMinutes || 50} min\n\n` +
            `**Ejercicios programados:**\n` +
            r.exercises.map((e: any, idx: number) => `${idx + 1}. **${e.name}** — ${e.sets} series x ${e.reps} reps ${e.rest ? `(Descanso: ${e.rest})` : ""}`).join("\n") +
            `\n\n💡 *Tip de ejecución:* ${r.notes || "Mantén la técnica estricta y controla la fase excéntrica."}\n\n` +
            `¡Llevas **${(weeklyCompleted || []).length} entrenamientos** completados esta semana! Cuando finalices, puedes marcar esta rutina como completada en tu panel.`;
        } else {
          reply = `Hoy **${todayDayName}** tienes programado descanso activo o recuperación. Si deseas entrenar, puedes elegir un grupo muscular como **Pecho, Espalda, Piernas o Hombros**, o pedirme que te arme una sesión ligera de movilidad y core.`;
        }
      } else if (lower.includes("pecho") || lower.includes("espalda") || lower.includes("pierna") || lower.includes("hombro") || lower.includes("brazo") || lower.includes("biceps") || lower.includes("triceps") || lower.includes("abdomen") || lower.includes("core")) {
        thought = "Buscando rutinas específicas por musculación y evaluando fatiga acumulada semanal.";
        let group = "Músculo";
        if (lower.includes("pecho")) group = "Pecho & Tríceps";
        else if (lower.includes("espalda")) group = "Espalda & Bíceps";
        else if (lower.includes("pierna")) group = "Piernas (Cuádriceps, Isquios y Glúteos)";
        else if (lower.includes("hombro")) group = "Hombros & Deltoides";
        else if (lower.includes("brazo") || lower.includes("biceps") || lower.includes("triceps")) group = "Brazos (Bíceps y Tríceps)";
        else if (lower.includes("abdomen") || lower.includes("core")) group = "Abdomen & Core";

        reply = `### 💪 Enfoque Muscular: **${group}**\n\n` +
          `Aquí tienes el protocolo de bombeo recomendado para hoy:\n` +
          `1. **Calentamiento dinámico:** 5-7 min de activación articular y series de aproximación.\n` +
          `2. **Ejercicio compuesto principal:** 4 series x 8-10 reps (RPE 8-9).\n` +
          `3. **Ejercicio secundario en polea/máquina:** 3 series x 12 reps con pausa isométrica de 1s.\n` +
          `4. **Aislamiento final:** 3 series x 15 reps buscando máximo bombeo sanguíneo.\n\n` +
          `⚡ *Recuerda hidratarte bien entre series (mínimo 90s de descanso en ejercicios pesados).*`;
      } else if (lower.includes("deuda") || lower.includes("debo") || lower.includes("pago") || lower.includes("mensualidad") || lower.includes("saldo")) {
        thought = `Consultando base contable de ${gymName} para el cliente ${clientName}.`;
        if (debtAmount > 0) {
          reply = `💳 **Estado de Cuenta en ${gymName}:**\n` +
            `Tienes un saldo pendiente de **$${debtAmount} USD** correspondiente a tu cuota o consumos extras.\n` +
            `Puedes regularizarlo en la recepción del gimnasio o solicitar el link de pago al administrador.`;
        } else {
          reply = `✅ **¡Estás al día!** No tienes deudas pendientes en **${gymName}**. Tu membresía se encuentra activa y vigente. ¡A entrenar con todo!`;
        }
      } else if (lower.includes("semana") || lower.includes("control") || lower.includes("hechas") || lower.includes("realizadas") || lower.includes("completadas")) {
        thought = "Calculando adherencia semanal y días registrados.";
        const count = (weeklyCompleted || []).length;
        reply = `📊 **Tu Control Semanal de Entrenamiento:**\n\n` +
          `- **Entrenamientos completados esta semana:** ${count} día(s)\n` +
          `- **Días registrados:** ${(weeklyCompleted || []).join(", ") || "Aún no has marcado entrenamientos esta semana"}\n` +
          `- **Meta sugerida:** 4 a 5 días para progresión hipertrófica óptima.\n\n` +
          `¡La constancia es lo que construye tu transformación física!`;
      } else if (lower.includes("tip") || lower.includes("consejo") || lower.includes("nutricion") || lower.includes("dieta")) {
        thought = "Extrayendo consejos verificados de entrenadores del gimnasio.";
        reply = `🥗 **Tip del Coach:**\n` +
          `Asegura consumir entre **1.6g y 2.2g de proteína por kg de peso corporal** al día repartido en 3-4 comidas, y duerme al menos 7 a 8 horas. El músculo no crece en el gimnasio, ¡crece durante tu descanso y nutrición!`;
      } else {
        reply = `¡Hola ${clientName}! Soy tu **DeepSeek Coach** en **${gymName}**.\n\nPuedo ayudarte con:\n` +
          `• 📅 Consultar tu rutina del día (${todayDayName})\n` +
          `• 🏋️ Elegir y planificar rutinas por grupo muscular (Pecho, Espalda, Piernas, etc.)\n` +
          `• 📈 Llevar el control de tus rutinas completadas esta semana\n` +
          `• 💰 Revisar tu control de deuda y cuota mensual\n` +
          `• 🥤 Consultar tus consumos extras o pedir tips de nutrición y técnica\n\n` +
          `¿Qué deseas entrenar o consultar hoy?`;
      }

      return res.json({
        reply,
        thought,
        modelUsed: "DeepSeek Gym Engine (Local Intelligence)",
      });
    } catch (err: any) {
      console.error("Chat error:", err);
      res.status(500).json({ error: "Error en el asistente de chat." });
    }
  });

  // Vite middleware for development vs static production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
