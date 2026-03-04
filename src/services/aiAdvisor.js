/**
 * AI Advisor Service
 * Connects to Google Gemini to provide real financial insights.
 */
export const getFinancialInsights = async (data, currentYear, currentMonthIndex, userName) => {
    try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // List of models verified via curl for this specific API Key
        const modelsToTry = [
            "gemini-2.0-flash",
            "gemini-2.5-flash",
            "gemini-flash-latest",
            "gemini-2.0-flash-lite",
            "gemini-pro-latest"
        ];

        // 2. Data Preparation
        const month = data.find(m => m.year === currentYear && m.monthIndex === currentMonthIndex);
        if (!month) return [{ type: 'info', title: 'Sin Datos', message: "No hay datos de gastos registrados para este mes." }];

        const baseRealized = month.incomeStatus?.base ? (month.income.base || 0) : 0;
        const bonusRealized = month.incomeStatus?.bonus ? (month.income.bonus || 0) : 0;
        const extraRealized = (month.additionalIncomes || []).reduce((sum, i) => sum + (i.received ? Number(i.amount) : 0), 0);
        const totalIncomeRealized = baseRealized + bonusRealized + extraRealized;

        const totalFixedPlanned = (month.fixedExpenses || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        const userSavingsPlanned = (Number(month.savings?.depa) || 0) + (Number(month.savings?.boda) || 0);
        const totalVariable = month.variableExpenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
        
        const depaProgress = (month.savingsPayments?.depa?.userPaid || 0) + (month.savingsPayments?.depa?.partnerPaid || 0);
        const bodaProgress = (month.savingsPayments?.boda?.userPaid || 0) + (month.savingsPayments?.boda?.partnerPaid || 0);

        const prompt = `
            Actúa como un consejero financiero experto y motivador para ${userName || 'el usuario'}.
            Analiza estos datos financieros del mes actual:
            
            1. INGRESOS COBRADOS (Disponibles hoy): S/${totalIncomeRealized}
            2. OBLIGACIONES MENSUALES (Lo que debe pagar sí o sí):
               - Pagos Fijos Totales: S/${totalFixedPlanned}
               - Ahorro Planeado (Depa + Boda): S/${userSavingsPlanned}
            3. GASTOS VARIABLES (Antojos, comida extra, etc.):
               - Gastado hasta ahora: S/${totalVariable}
            4. PROGRESO DE METAS:
               - Departamento: Llevan S/${depaProgress} ahorrados.
               - Boda: Llevan S/${bodaProgress} ahorrados.

            Instrucciones de respuesta:
            - Sé breve, directo y usa un tono amigable pero profesional.
            - Da un consejo sobre si el gasto variable actual es saludable balanceado con las obligaciones.
            - Menciona el progreso de las metas de forma motivadora.
            - Si los ingresos cobrados son menores a las obligaciones, da una alerta "danger".
            
            Responde ÚNICAMENTE con un array JSON de 4 consejos (pueden ser menos si es necesario, pero máximo 4):
            [{ "type": "success"|"warning"|"danger"|"info", "title": "...", "message": "..." }]
        `;

        // 4. API Call with Multi-Model Fallback
        let result = null;
        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                console.log(`Intentando con modelo: ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                result = await model.generateContent(prompt);
                if (result) {
                    console.log(`Éxito con modelo: ${modelName}`);
                    break;
                }
            } catch (err) {
                console.error(`Error con ${modelName}:`, err.message);
                lastError = err;
                // Continue to next model
            }
        }

        if (!result) {
            throw new Error(`No se pudo conectar con ningún modelo de Gemini. Último error: ${lastError?.message}`);
        }
        
        const response = await result.response;
        const text = response.text();
        console.log("Respuesta de Gemini:", text);
        
        // 5. JSON Parsing & Cleaning
        let cleanedText = text.trim();
        if (cleanedText.includes("```")) {
            const matches = cleanedText.match(/```(?:json)?([\s\S]*?)```/);
            if (matches && matches[1]) {
                cleanedText = matches[1].trim();
            }
        }
        
        try {
            const insights = JSON.parse(cleanedText);
            return Array.isArray(insights) ? insights : [insights];
        } catch (parseError) {
            console.error("Error parseando JSON de Gemini:", parseError, "Texto recibido:", cleanedText);
            return [{ 
                type: 'warning', 
                title: 'Error de Formato', 
                message: "La IA respondió pero el formato no es válido." 
            }];
        }

    } catch (error) {
        console.error("AI Advisor Global Error:", error);
        return [{ 
            type: 'danger', 
            title: 'Error de Conexión AI', 
            message: "No se pudo contactar con Gemini. Verifica tu API Key o región."
        }];
    }
};

/**
 * Interactive AI Chat Service
 */
export const getAiChatResponse = async (userMessage, chatHistory, data, currentYear, currentMonthIndex, userName) => {
    try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            return "Error: No se encontró la API Key de Gemini. Verifica tu configuración.";
        }

        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // 1. Prepare Context
        const month = data.find(m => m.year === currentYear && m.monthIndex === currentMonthIndex);
        
        // Get goal metadata with targets
        const goalMetadata = data[0]?.goalMetadata || {
            depa: { target: 19200 },
            boda: { target: 9600 }
        };
        
        // Calculate total saved across all months
        let totalSavedDepa = 0;
        let totalSavedBoda = 0;
        data.forEach(m => {
            if (m.savingsPayments) {
                totalSavedDepa += (Number(m.savingsPayments.depa?.userPaid || 0) + Number(m.savingsPayments.depa?.partnerPaid || 0));
                totalSavedBoda += (Number(m.savingsPayments.boda?.userPaid || 0) + Number(m.savingsPayments.boda?.partnerPaid || 0));
            }
        });
        
        const contextStr = month ? `
CONTEXTO FINANCIERO DE ${userName || 'EL USUARIO'} (MES ACTUAL):
- Ingresos Realizados: S/${(month.incomeStatus?.base ? month.income.base : 0) + (month.incomeStatus?.bonus ? month.income.bonus : 0)}
- Gastos Fijos (Plan): S/${(month.fixedExpenses || []).reduce((s, e) => s + Number(e.amount), 0)}
- Gasto Variable (Hoy): S/${month.variableExpenses?.reduce((s, e) => s + Number(e.amount), 0) || 0}

PLAN DE AHORRO MENSUAL:
- Departamento: S/${Number(month.savings?.depa) || 0} por mes
- Boda: S/${Number(month.savings?.boda) || 0} por mes
- Total planeado: S/${(Number(month.savings?.depa) || 0) + (Number(month.savings?.boda) || 0)} por mes

METAS DE AHORRO (OBJETIVOS TOTALES):
- Departamento: Meta S/${goalMetadata.depa.target}, Ahorrado S/${totalSavedDepa} (${((totalSavedDepa / goalMetadata.depa.target) * 100).toFixed(1)}%)
- Boda: Meta S/${goalMetadata.boda.target}, Ahorrado S/${totalSavedBoda} (${((totalSavedBoda / goalMetadata.boda.target) * 100).toFixed(1)}%)
        ` : 'No hay datos financieros para el mes actual.';

        const systemInstruction = `Eres "FinanSmart", un asesor financiero personal experto. Ayudas a parejas a ahorrar para su casa y boda.

${contextStr}

Instrucciones:
- YA TIENES TODA LA INFORMACIÓN FINANCIERA DEL USUARIO. No pidas más datos, usa lo que ya tienes arriba.
- Sé breve, empático y motivador (máximo 4-5 líneas).
- Responde consultas sobre cómo ahorrar, si un gasto es prudente, o cómo va su progreso.
- Usa lenguaje sencillo y cercano.
- Basa TODAS tus respuestas en el contexto financiero proporcionado.
- Si te preguntan sobre metas, usa los montos que ya están en el contexto.`;

        // Models to try in order
        const modelsToTry = [
            "gemini-2.0-flash",
            "gemini-2.5-flash",
            "gemini-flash-latest",
            "gemini-pro-latest"
        ];

        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                console.log(`[Chat] Intentando con modelo: ${modelName}...`);
                
                const model = genAI.getGenerativeModel({ 
                    model: modelName,
                    systemInstruction: systemInstruction
                });

                // Filter history: Gemini requires first message to be from 'user'
                // So we exclude the initial assistant greeting
                const validHistory = chatHistory
                    .filter((msg, idx) => !(idx === 0 && msg.role === 'assistant'))
                    .map(msg => ({
                        role: msg.role === 'user' ? 'user' : 'model',
                        parts: [{ text: msg.content }]
                    }));

                const chat = model.startChat({
                    history: validHistory,
                    generationConfig: {
                        maxOutputTokens: 800,
                    },
                });

                const result = await chat.sendMessage(userMessage);
                const response = await result.response;
                console.log(`[Chat] Éxito con modelo: ${modelName}`);
                return response.text();

            } catch (err) {
                console.error(`[Chat] Error con ${modelName}:`, err.message);
                lastError = err;
                // Continue to next model
            }
        }

        // If all models failed
        throw new Error(`No se pudo conectar con ningún modelo de Gemini. Último error: ${lastError?.message}`);

    } catch (error) {
        console.error("AI Chat Error:", error);
        return `Lo siento, tuve un problema: ${error.message}. ¿Puedes revisar la consola para más detalles?`;
    }
};
