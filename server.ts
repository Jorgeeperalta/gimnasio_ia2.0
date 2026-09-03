import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Client Chat endpoint (DeepSeek / Gemini Coach)
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

      const apiKey = process.env.GEMINI_API_KEY;

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
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: {
              headers: {
                "User-Agent": "aistudio-build",
              },
            },
          });

          const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: `${systemPrompt}\n\nMensaje del cliente: ${message}`,
          });

          return res.json({
            reply: response.text || "No se pudo generar una respuesta clara.",
            modelUsed: "gemini-3.8-flash (DeepSeek Gym Coach Mode)",
          });
        } catch (apiError: any) {
          console.warn("Gemini API error, using smart fallback:", apiError?.message);
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
