// GenioVSL - Backend Server
// Servidor Node.js para manejar las llamadas a OpenAI API

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname)));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'GenioVSL API is running' });
});

// Endpoint principal para generar copy
app.post('/api/generate', async (req, res) => {
    try {
        const formData = req.body;

        // API Key: Lee desde Variable de Entorno de Vercel
        // Configura OPENAI_API_KEY en: Vercel Dashboard → Settings → Environment Variables
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return res.status(400).json({
                error: 'API key de OpenAI no configurada. Por favor configura OPENAI_API_KEY en las Variables de Entorno de Vercel.'
            });
        }

        console.log('🔑 Usando API key desde Variables de Entorno de Vercel');

        // Crear el prompt
        const prompt = createPrompt(formData);

        console.log('Generando copy con OpenAI...');

        // Hacer la llamada a OpenAI
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: `Eres un copywriter senior con 15+ años de experiencia en funnels de ventas para infoproductos y coaching en español. Eres especialista en el mercado de solopreneurs, coaches y creadores de contenido hispanohablantes.

Tu estilo combina las técnicas de Russell Brunson (ClickFunnels), Alex Hormozi (value stacking, urgencia auténtica) y Frank Kern (storytelling conversacional), pero adaptado culturalmente al mercado en español.

Características de tu copy:
- Directo y conversacional (usas "tú" informal)
- Enfocado en resultados medibles y transformaciones específicas
- Evitas clichés y frases genéricas de marketing
- Usas storytelling emocional pero siempre conectado a beneficios tangibles
- Manejas objeciones de forma natural dentro del copy
- Creas urgencia auténtica (no falsa escasez)
- Español neutral y universal (evitas regionalismos muy específicos)

Tu objetivo: Generar copy de alta conversión que sea persuasivo, ético y listo para implementar inmediatamente.`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 16000,
                temperature: 0.6
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI API Error:', errorData);
            return res.status(response.status).json({
                error: errorData.error?.message || 'Error al llamar a OpenAI API'
            });
        }

        const data = await response.json();
        let content = data.choices[0].message.content;

        // Limpiar el contenido JSON si viene envuelto en ```
        content = content.trim();
        if (content.startsWith('```json')) {
            content = content.replace(/^```json\n/, '').replace(/\n```$/, '');
        } else if (content.startsWith('```')) {
            content = content.replace(/^```\n/, '').replace(/\n```$/, '');
        }

        // Parsear el JSON
        const parsedContent = JSON.parse(content);

        console.log('Copy generado exitosamente');

        // Retornar el contenido generado
        res.json(parsedContent);

    } catch (error) {
        console.error('Error en /api/generate:', error);
        res.status(500).json({
            error: 'Error al generar el copy: ' + error.message
        });
    }
});

// Función para crear el prompt (igual que en el cliente)
function createPrompt(formData) {
    return `
<task>
Genera copy completo y profesional para un funnel de ventas de alta conversión basado en la siguiente información:
</task>

**INFORMACIÓN DEL NEGOCIO:**
- Tipo: ${formData.businessType}
- Nombre: ${formData.businessName}
- Audiencia: ${formData.targetAudience}

**PRODUCTO/SERVICIO:**
- Nombre: ${formData.productName}
- Precio: €${formData.productPrice}
- Descripción: ${formData.productDescription}
- Beneficio principal: ${formData.mainBenefit}

**LEAD MAGNET:**
- Título: ${formData.leadMagnetTitle}
- Tipo: ${formData.leadMagnetType}
- Descripción: ${formData.leadMagnetDescription}

**HISTORIA PERSONAL:**
- Historia: ${formData.personalStory}
- Credenciales: ${formData.credentials}

**CONTACTO:**
- Email: ${formData.contactEmail}
- Teléfono: ${formData.contactPhone || 'No proporcionado'}
- Web: ${formData.website || 'No proporcionado'}

<analysis>
Antes de generar el copy, analiza:
1. ¿Cuál es el dolor principal específico de esta audiencia?
2. ¿Cuál es la transformación única y medible que ofrece este producto?
3. ¿Qué diferencia a este negocio de la competencia?
4. ¿Qué objeciones comunes tendría esta audiencia específica?
</analysis>

<output_format>
Genera el copy estructurado en formato JSON con las siguientes claves:
</output_format>

{
  "landing_copy": {
    "headline_principal": "Titular principal que capture atención inmediata. Debe incluir resultado específico + marco temporal O hacer una bold claim comprobable. Ejemplo: 'Crea Tu Primer Funnel Rentable en 7 Días (Sin Experiencia Técnica)' vs 'Aprende Marketing Digital' (❌ muy genérico)",
    "subheadline": "Subtítulo que expande el headline y añade credibilidad o especificidad. Incluye quién es el público ideal y qué obstáculo superarán. Ejemplo: 'El mismo sistema que 500+ emprendedores usan para generar leads cualificados sin depender de anuncios pagados'",
    "headline_secundario": "Titular de apoyo para sección de beneficios. Debe plantear la transformación desde ángulo diferente al principal",
    "problema_descripcion": "Descripción específica del problema en 2-3 frases. Debe ser ESPECÍFICO a esta audiencia (no genérico). Agita el dolor actual y consecuencias de no resolverlo",
    "solucion_descripcion": "Tu solución única en 2-3 frases. Explica QUÉ es diferente de otras soluciones y POR QUÉ funciona mejor. Debe sentirse como 'aha moment'",
    "benefits_principales": [
      "Logra [RESULTADO ESPECÍFICO MEDIBLE] en [TIEMPO CONCRETO] sin [OBJECIÓN COMÚN]. Ejemplo: 'Crea secuencias de email que convierten al 15-20% en 3 horas, sin necesidad de contratar copywriter' ✅",
      "Beneficio 2: mismo formato - resultado medible + tiempo + sin objeción",
      "Beneficio 3: mismo formato - resultado medible + tiempo + sin objeción"
    ],
    "benefits_secundarios": [
      "Beneficio 4 con formato similar pero puede ser transformación más amplia",
      "Beneficio 5 con formato similar",
      "Beneficio 6 con formato similar"
    ],
    "testimonial_templates": [
      {
        "template": "Antes [SITUACIÓN NEGATIVA], probé [SOLUCIONES ANTERIORES] sin éxito. Después de [ESTE PRODUCTO/SERVICIO], logré [RESULTADO ESPECÍFICO] en [TIEMPO]. Ahora [SITUACIÓN NUEVA POSITIVA].",
        "ejemplo_aplicado": "Aplica esta plantilla con detalles realistas del nicho específico. El testimonio debe sonar genuino y específico.",
        "tipo_cliente": "Describe perfil del cliente ideal para este testimonio (ej: 'Coach de productividad que pasó de 0 a 15 clientes en 60 días')",
        "resultado_destacado": "El resultado específico y medible que se destaca"
      },
      {
        "template": "Lo que más me impresionó fue [ASPECTO ESPECÍFICO]. En solo [TIEMPO CORTO] pude [LOGRO CONCRETO]. [DATO MEDIBLE] ha cambiado completamente.",
        "ejemplo_aplicado": "Aplica esta plantilla con detalles realistas del nicho",
        "tipo_cliente": "Segundo perfil de cliente ideal",
        "resultado_destacado": "Resultado específico diferente al primero"
      },
      {
        "template": "Estaba escéptico/a porque [OBJECIÓN COMÚN], pero [ESTE PRODUCTO] me demostró que [INSIGHT QUE CAMBIÓ SU PERSPECTIVA]. Resultado: [MÉTRICA ESPECÍFICA].",
        "ejemplo_aplicado": "Aplica esta plantilla con detalles realistas del nicho",
        "tipo_cliente": "Tercer perfil de cliente ideal",
        "resultado_destacado": "Resultado específico que maneja objeción común"
      }
    ],
    "cta_principal": "Texto del CTA principal que sea acción específica + beneficio. Ejemplo: 'Sí, Quiero Crear Mi Funnel Hoy' vs 'Comprar Ahora' (❌ débil)",
    "cta_secundario": "CTA secundario de menor compromiso. Ejemplo: 'Ver Cómo Funciona (Video 2 min)' o 'Descargar Plan de Implementación Gratis'",
    "urgency_text": "Texto de urgencia AUTÉNTICA (no falsa escasez). Opciones: bonos limitados por tiempo, precio early-bird con fecha específica, cupos limitados si es real. Debe incluir razón creíble de por qué es limitado",
    "garantia": "Texto de garantía que reduzca riesgo percibido. Si ofreces garantía de devolución, especifica términos claros. Si no, ofrece otro tipo de garantía (resultados, acompañamiento, etc.)",
    "objeciones_respuestas": [
      {
        "objecion": "No tengo tiempo / Estoy muy ocupado",
        "respuesta": "Respuesta que muestre cuánto tiempo REALMENTE toma + costo de oportunidad de NO hacerlo ahora"
      },
      {
        "objecion": "Es muy caro / No tengo el dinero ahora",
        "respuesta": "Respuesta que reframe precio como inversión + muestre ROI + compare con costo de NO resolver problema"
      },
      {
        "objecion": "No funcionará para mí / Mi caso es diferente",
        "respuesta": "Respuesta con ejemplos de casos diversos que han funcionado + qué hace que funcione en diferentes situaciones"
      },
      {
        "objecion": "Ya probé algo similar y no funcionó",
        "respuesta": "Respuesta que reconozca frustración + explique QUÉ es diferente en este método/sistema + por qué fallaron otros"
      },
      {
        "objecion": "No sé si podré implementarlo / No soy técnico/experto",
        "respuesta": "Respuesta que explique nivel de dificultad real + apoyo disponible + ejemplo de alguien sin experiencia que lo logró"
      },
      {
        "objecion": "[Objeción específica del nicho basada en la información del negocio]",
        "respuesta": "Respuesta convincente y específica a esta objeción del nicho"
      }
    ],
    "faq": [
      {
        "pregunta": "¿Qué incluye exactamente?",
        "respuesta": "Lista detallada de qué recibirán (módulos, sesiones, materiales, accesos, etc.)"
      },
      {
        "pregunta": "¿Cuánto tiempo tengo acceso?",
        "respuesta": "Especifica duración de acceso claramente"
      },
      {
        "pregunta": "¿Hay garantía de devolución?",
        "respuesta": "Explica política de garantía en detalle"
      },
      {
        "pregunta": "¿Necesito conocimientos previos / herramientas específicas?",
        "respuesta": "Aclara requisitos previos y herramientas necesarias"
      },
      {
        "pregunta": "¿Cuándo empieza y cómo accedo?",
        "respuesta": "Proceso claro de onboarding post-compra"
      },
      {
        "pregunta": "¿Hay soporte / puedo hacer preguntas?",
        "respuesta": "Explica nivel y tipo de soporte incluido"
      },
      {
        "pregunta": "[Pregunta específica del nicho/producto]",
        "respuesta": "Respuesta específica"
      },
      {
        "pregunta": "[Otra pregunta específica del nicho]",
        "respuesta": "Respuesta específica"
      }
    ]
  },
  "vsl_script": {
    "hook_apertura": "Hook de apertura (30-45 segundos de lectura). DEBE usar una de estas técnicas: 1) Pattern interrupt con bold claim + prueba inmediata, 2) Resultado específico sorprendente + 'y te mostraré cómo', 3) Pregunta provocadora que active dolor + promesa de solución. Ejemplo: '¿Qué pasaría si te dijera que puedes duplicar tus leads en 30 días sin gastar un euro más en publicidad? Suena imposible, ¿verdad? Eso pensaba yo hasta que [momento revelación]...' Debe generar CURIOSIDAD inmediata + plantear problema + prometer solución",
    "introduccion_personal": "Introducción personal y credibilidad (1-2 minutos). Establece autoridad SIN sonar presumido. Formato: Quién eres brevemente → Por qué tienes derecho a enseñar esto (credenciales/resultados) → Conexión emocional (eras como ellos antes). IMPORTANTE: Humanízate, no vendas todavía",
    "problema_agitacion": "Descripción y agitación del problema (2-3 minutos). NO solo describas el problema - AGÍTALO. Usa estas capas: 1) Síntoma visible (lo que notan), 2) Causa raíz (por qué pasa realmente), 3) Consecuencias emocionales (cómo se sienten), 4) Consecuencias futuras (qué pasará si no se resuelve), 5) 'Enemigo común' (culpable externo - métodos antiguos, malos consejos, sistema roto). Haz que SIENTAN el dolor",
    "solucion_revelacion": "Revelación de la solución (2-3 minutos). El 'aha moment' - presenta tu método/sistema/framework. Debe tener NOMBRE específico (ej: 'El Sistema de 3 Pilares', 'El Método Anti-Agotamiento'). Explica: 1) QUÉ es (overview simple), 2) POR QUÉ es diferente (contrasta con métodos fallidos que mencionaste antes), 3) POR QUÉ funciona (lógica/ciencia/experiencia detrás), 4) Para QUIÉN es perfecto. Debe sentirse como descubrimiento, no como pitch de venta",
    "beneficios_transformacion": "Beneficios y transformación detallada (3-4 minutos). NO listes características - PINTA LA TRANSFORMACIÓN. Usa formato 'Antes → Después'. Incluye: 1) Transformación principal (el gran cambio), 2) Beneficios específicos con números/tiempos cuando posible, 3) Beneficios emocionales (cómo se sentirán), 4) Beneficios de estilo de vida (qué podrán hacer/dejar de hacer). Hazlo VISUAL y ESPECÍFICO - deben verse a sí mismos en esa nueva realidad",
    "prueba_social": "Testimonios y casos de éxito (2-3 minutos). Presenta 2-3 casos de éxito DIVERSOS (diferentes puntos de partida, diferentes resultados específicos). Para cada caso: nombre + situación antes + objeción que tenían + qué lograron (números específicos) + cita textual corta. IMPORTANTE: Deben sonar reales y específicos, conectar con objeciones comunes que tu audiencia tiene",
    "oferta_presentacion": "Presentación completa de la oferta (2-3 minutos). Aquí SÍ vendes. Estructura: 1) Qué incluye exactamente (con valor percibido de cada elemento), 2) Value stacking (suma valores individuales), 3) Precio con contraste ('Podría cobrar X [justifica]... pero solo X'), 4) Bonos con deadline ('Si actúas hoy recibes [bonos]'), 5) Garantía que elimine riesgo. Usa técnica de Alex Hormozi: hace que la oferta parezca absurdamente valiosa",
    "urgencia_escasez": "Creación de urgencia y escasez (1-2 minutos). Urgencia AUTÉNTICA (no falsa). Opciones: 1) Bonos limitados por tiempo con razón real ('Los bonos X desaparecen el [fecha] porque [razón válida]'), 2) Precio early-bird ('El precio sube a X el [fecha] para [razón]'), 3) Cupos limitados SI ES REAL ('Solo 20 plazas para dar atención personalizada'). NUNCA: 'solo quedan 3 cupos' sin razón real. La urgencia debe sentirse ética",
    "cierre_cta": "Cierre y llamada a la acción final (1-2 minutos). Recapitula rápidamente: El problema que tienen → La transformación que ofreces → Lo que incluye la oferta → La urgencia → CTA directo y claro (qué hacer exactamente AHORA). Termina con: 1) Motivación final (lo que pueden lograr), 2) Consecuencia de NO actuar (dolor de quedarse igual), 3) CTA específico ('Haz clic en el botón ahora, completa el formulario, y nos vemos dentro'). Cierre fuerte y decisivo",
    "script_completo": "SCRIPT COMPLETO UNIFICADO (mínimo 3000 palabras): Integra TODAS las secciones anteriores en un script fluido para LEER en cámara. Debe sentirse como UNA historia continua, no secciones separadas. Tono: conversacional pero persuasivo, como hablar con un amigo pero con estructura estratégica. Usa transiciones naturales entre secciones. Incluye indicaciones de énfasis [pausa], [enfático], [suave] donde sea útil para el lector. El script debe estar listo para grabar inmediatamente"
  },
  "email_sequence": [
    {
      "email_numero": 1,
      "tipo": "Bienvenida y entrega",
      "subject": "Asunto del email 1 - Atractivo y que genere apertura",
      "preview_text": "Texto de preview que complementa el asunto",
      "contenido": "CONTENIDO COMPLETO DEL EMAIL (mínimo 400 palabras):\n\nIncluye:\n- Saludo personalizado cálido\n- Bienvenida entusiasta (hazlos sentir que tomaron buena decisión)\n- Agradecimiento genuino por suscribirse\n- Explicación clara de qué recibirán (entrega del lead magnet con entusiasmo)\n- Instrucciones PASO A PASO de cómo acceder/descargar (asume cero conocimiento técnico)\n- Qué pueden esperar en los próximos días (anticipa valor)\n- Quick win: Un tip rápido que puedan implementar HOY\n- Invitación a responder o conectar (humaniza la relación)\n- Despedida cálida con tu nombre\n- P.S. potente que refuerce el valor del lead magnet o genere curiosidad por el próximo email\n\nTono: Como mensaje de un amigo emocionado de ayudar. Evita lenguaje corporativo. Usa párrafos cortos. Escribe TODO el email completo palabra por palabra.",
      "cta": "Texto específico del botón/enlace de CTA (ej: 'Descargar Mi Guía Ahora', 'Acceder al Material')",
      "ps": "P.S. que refuerce valor o genere anticipación. Ejemplo: 'P.S. Revisa especialmente la página 7 de la guía - ese solo tip me ayudó a duplicar mi tasa de conversión' o 'P.S. Mañana te envío el secreto #1 que el 90% ignora...'"
    },
    {
      "email_numero": 2,
      "tipo": "Educación y valor",
      "subject": "Asunto del email 2 - Que prometa valor educativo",
      "preview_text": "Texto de preview complementario",
      "contenido": "CONTENIDO COMPLETO DEL EMAIL (mínimo 400 palabras):\n\nIncluye:\n- Saludo personalizado\n- Pregunta hook que conecte con su dolor (algo que probablemente se preguntan)\n- Mini-historia o caso de estudio que ilustre el problema (específico, no genérico)\n- Enseñanza valiosa: un tip, estrategia o insight ACCIONABLE\n- Explicación detallada PASO A PASO de cómo aplicar esto\n- Ejemplo concreto con números/resultados (puede ser tuyo o de cliente)\n- Beneficio tangible de implementar esto HOY\n- Transición natural: menciona que mañana verán X\n- Invitación a tomar acción pequeña (responder email, implementar tip, etc.)\n- Despedida\n- P.S. educativo que refuerce el aprendizaje o genere curiosidad\n\nTono: Profesor experto pero accesible. Genera 'aha moments'. Construye autoridad sin presumir. Escribe TODO el email palabra por palabra.",
      "cta": "Texto específico del CTA (ej: 'Lee el Artículo Completo', 'Implementa Este Paso Hoy')",
      "ps": "P.S. educativo. Ejemplo: 'P.S. Muchos preguntan [pregunta común] - la respuesta corta es [insight valioso]' o 'P.S. Este método funcionó para [nombre] que logró [resultado específico] en [tiempo]'"
    },
    {
      "email_numero": 3,
      "tipo": "Historia y conexión",
      "subject": "Asunto del email 3 - Que genere curiosidad personal",
      "preview_text": "Texto de preview que enganche emocionalmente",
      "contenido": "CONTENIDO COMPLETO DEL EMAIL (mínimo 400 palabras):\n\nIncluye:\n- Saludo personal y cálido\n- Hook emocional: 'Quiero contarte algo que nunca cuento públicamente...'\n- Tu historia personal COMPLETA (usa info de formData.personalStory):\n  * Dónde estabas antes (específico - situación, emociones, frustraciones)\n  * El punto de quiebre / fracaso que te llevó al cambio\n  * El momento 'aha' o descubrimiento que todo cambió\n  * Los pasos que tomaste (incluso los que no funcionaron)\n  * Las dudas y miedos que tuviste (vulnerabilidad real)\n  * El resultado / transformación lograda (con detalles específicos)\n- Conexión directa: 'Te cuento esto porque sé que tú estás donde yo estaba...'\n- Paralelismo: Sus problemas = tus problemas de antes\n- Introducción natural de cómo tu solución nació de esta experiencia\n- Mensaje de esperanza: 'Si yo pude desde [situación difícil], tú también puedes'\n- Invitación a tomar acción (sutil, no agresiva todavía)\n- Cierre emotivo\n- P.S. personal que refuerce la conexión\n\nTono: Vulnerable, auténtico, inspirador. Como conversar con café. Genera empatía profunda. Escribe TODO el email completo.",
      "cta": "Texto específico del CTA (ej: 'Descubre Cómo Puedo Ayudarte', 'Conoce la Solución Completa')",
      "ps": "P.S. personal y emotivo. Ejemplo: 'P.S. Si hay algo de mi historia que resuena contigo, respóndeme este email. Leo cada respuesta personalmente' o 'P.S. Recuerda: el [situación difícil] no define tu futuro. Yo soy prueba de eso'"
    },
    {
      "email_numero": 4,
      "tipo": "Oferta y urgencia",
      "subject": "Asunto del email 4 - Que genere urgencia pero sin ser spam",
      "preview_text": "Texto de preview que refuerce la urgencia",
      "contenido": "CONTENIDO COMPLETO DEL EMAIL (mínimo 500 palabras - este es el email de venta):\n\nIncluye:\n- Saludo personalizado\n- Recap del valor entregado: 'En los últimos días has recibido [recap brevísimo]'\n- Transición persuasiva: 'Si has encontrado valor en esto, te va a encantar lo que preparé...'\n- Presentación de la oferta con nombre específico\n- El problema que resuelve (recap dolor principal)\n- La transformación completa que ofrece (antes → después)\n- Qué incluye EXACTAMENTE (lista detallada con valor de cada componente):\n  * Módulo 1: [nombre] - [valor específico]\n  * Módulo 2: [nombre] - [valor específico]\n  * (etc.)\n- Value stacking: 'Valor total: €X'\n- Precio con contraste: 'Podría cobrarte €X [justifica por qué]... pero hoy solo €Y'\n- Bonos exclusivos si actúa HOY (enumera con valores):\n  * Bono 1: [nombre] (valor €X) - [qué es y por qué es valioso]\n  * Bono 2: [nombre] (valor €X) - [qué es y por qué es valioso]\n- Deadline claro: 'Estos bonos desaparecen el [fecha específica] a las [hora]'\n- Prueba social condensada: 'Ya han logrado [resultado] personas como [nombre ejemplo]'\n- Manejo de objeciones principales:\n  * 'Si piensas [objeción], la realidad es [respuesta]'\n  * 'Si te preocupa [objeción], déjame decirte [respuesta]'\n- Garantía específica: '[X días] de garantía total - si no [condición], devuelvo el 100%'\n- CTA directo: 'Haz clic en el botón ahora, asegura tu plaza, y nos vemos dentro'\n- Urgencia final: 'Recuerda: los bonos desaparecen en [X horas/días]'\n- Cierre motivador con visión: 'Imagina dónde estarás en [tiempo] si actúas hoy'\n- P.S. de urgencia o garantía\n\nTono: Directo y persuasivo pero servicial. Vende con convicción pero sin presión excesiva. Escribe TODO el email completo palabra por palabra.",
      "cta": "Texto específico del CTA principal (ej: 'Sí, Quiero Empezar Ahora', 'Asegurar Mi Plaza Hoy', 'Obtener Acceso Inmediato')",
      "ps": "P.S. de urgencia o garantía. Ejemplo: 'P.S. Recuerda: garantía total de [X días]. Literalmente no tienes nada que perder' o 'P.S. Los bonos valorados en €X desaparecen en [tiempo específico]. No pierdas esta oportunidad'"
    }
  ],
  "paginas_adicionales": {
    "confirmacion": {
      "headline": "Titular de confirmación POSITIVO y tranquilizador. Debe confirmar que acción fue exitosa + generar anticipación. Ejemplo: '¡Confirmado! Tu [Lead Magnet] Está en Camino' o '¡Genial! Revisa Tu Email en Los Próximos 2 Minutos'",
      "contenido_principal": "Mensaje completo de confirmación (200-300 palabras). Incluye: 1) Confirmación clara de qué acaba de pasar ('Tu suscripción ha sido confirmada'), 2) Qué esperar a continuación ('En menos de 2 minutos recibirás...'), 3) Instrucción de revisar spam/promociones, 4) Anticipación del valor que recibirán ('En los próximos días descubrirás...'), 5) Invitación a seguir en redes si aplica",
      "instrucciones": [
        "Paso 1: Revisa tu bandeja de entrada en los próximos 2 minutos - busca email de [nombre]",
        "Paso 2: Si no lo ves, revisa carpeta de Spam/Promociones (Gmail) o Otros (Outlook)",
        "Paso 3: Añade [email] a tus contactos para no perderte ningún email",
        "Paso 4: Abre el email y descarga/accede a tu [Lead Magnet]",
        "Paso 5: [Acción específica sugerida - ej: 'Implementa el tip de la página 3 hoy mismo']"
      ],
      "mensaje_anticipacion": "Mensaje que genera entusiasmo por lo que viene. Ejemplo: 'En los próximos días te enviaré [X cosas específicas] que te ayudarán a [resultado]. Estoy emocionado/a de acompañarte en este proceso' - Debe sentirse personal y genuino",
      "cta_opcional": "CTA opcional para acción inmediata (ej: 'Únete al Grupo de Facebook', 'Sígueme en Instagram', 'Mira Este Video Mientras Esperas')"
    },
    "gracias": {
      "headline": "Titular de agradecimiento genuino + entrega. Ejemplo: 'Gracias [Nombre] - Tu [Lead Magnet] Ya Está Disponible' o '¡Descárgalo Ahora! + Un Regalo Especial'",
      "mensaje_entrega": "Mensaje de entrega cálido (150-200 palabras). Incluye: 1) Agradecimiento sincero, 2) Confirmación de qué han recibido, 3) Qué hacer con el material ('Te recomiendo empezar por...'), 4) Recordatorio de revisar emails futuros ('En los próximos días recibirás...')",
      "instrucciones_descarga": "Instrucciones CLARAS paso a paso para acceder al material. Asume cero conocimiento técnico. Ejemplo: 'Opción 1: Haz clic en el botón grande debajo para descarga inmediata. Opción 2: Revisa tu email - ahí está el enlace de acceso. Nota: El archivo es PDF - necesitas Adobe Reader (gratis) para abrirlo'",
      "upsell_sutil": "Mención NO AGRESIVA del producto principal. Debe sentirse como consejo útil, no pitch de venta. Ejemplo: 'Si quieres profundizar más allá de esta guía, tengo un [programa/curso] donde enseño [resultado específico] paso a paso. Pero por ahora, enfócate en implementar lo que acabas de recibir. Ya hablaremos de eso después' - Debe plantar semilla sin presionar",
      "valor_entregado": "Recapitulación del valor del lead magnet: '✓ [Beneficio 1 que recibirán], ✓ [Beneficio 2], ✓ [Beneficio 3]' - Lista de 3-5 beneficios concretos que están en el material"
    }
  },
  "elementos_visuales": {
    "imagenes_sugeridas": [
      "HERO SECTION: Descripción detallada para diseñador o IA de imágenes. Incluye: tipo de imagen (foto/ilustración), sujeto principal, acción/emoción, setting/fondo, estilo visual, paleta de colores sugerida, mood. Ejemplo: 'Foto profesional de [tipo de persona - coach/emprendedor] trabajando enfocado en laptop en espacio luminoso moderno, expresión de concentración satisfecha, fondo minimalista con plantas, estilo fotográfico limpio y aspiracional, colores: azules suaves y blancos, luz natural, sensación de productividad y éxito' - Debe conectar con la audiencia target",
      "SECCIÓN DE BENEFICIOS: Descripción para imágenes de apoyo (3-4 imágenes). Cada una debe ilustrar un beneficio diferente. Formato: 'Imagen [1/2/3]: [Beneficio que ilustra] - [Descripción visual específica con estilo, colores, elementos clave]'. Debe ser consistent en estilo con hero pero mostrar diferentes aspectos de la transformación",
      "SECCIÓN DE TESTIMONIOS: Sugerencia visual para acompañar testimonios. Puede ser: fotos de clientes reales (placeholder genérico si no las tienen), badges/sellos de confianza, logos de medios si aplica. Descripción: '[Tipo de elemento visual] - [Detalles de estilo y composición]' - Debe generar confianza y credibilidad",
      "LLAMADA A LA ACCIÓN: Imagen de cierre persuasiva. Descripción: 'Imagen que visualice el resultado/transformación final o persona tomando acción. [Detalles específicos de composición, estilo, colores, mood]'. Debe inspirar acción inmediata",
      "EMAIL HEADER: Sugerencia para header visual de emails (si quieren usar). '[Descripción de estilo minimalista y on-brand]'",
      "SOCIAL PROOF: Sugerencias visuales para elementos de prueba social (números, estadísticas, logos). '[Descripción de cómo presentarlo visualmente]'"
    ],
    "videos_sugeridos": [
      "VSL PRINCIPAL: Duración recomendada: [15-25 minutos basado en complejidad]. Setting visual: [descripción del espacio - oficina/estudio/casual]. Tipo de video: [talking head / presentación con slides / screencast / combinado]. Estilo: [profesional pero accesible / casual y cercano / corporate]. Tomas sugeridas: [primeros 30seg: close-up para conexión / luego: plano medio / usar B-roll para ilustrar puntos si es posible]. Iluminación: [natural y suave / ring light profesional]. Fondo: [minimalista / branded / espacio real]. Ropa sugerida: [profesional casual / según marca personal]. Debe sentirse [auténtico/profesional/cercano según audiencia]",
      "VIDEO TESTIMONIAL (opcional): Tipo de cliente ideal para testimonial: [descripción demográfica y psicográfica]. Formato sugerido: [60-90 segundos por testimonio]. Estructura: 'Antes estaba [X] / [Producto] me ayudó a [Y] / Ahora tengo [resultado Z]'. Setting: casual y auténtico (no sobreproducido). Puede ser grabado por cliente con smartphone. Debe sentirse REAL y genuino",
      "VIDEO TUTORIAL/DEMO (bonus content opcional): [Descripción de un video corto de valor - ej: '3-5 minutos mostrando cómo implementar [tip específico del lead magnet]']. Formato: screencast o talking head. Debe entregar valor rápido"
    ],
    "paleta_colores_sugerida": {
      "principal": "Color basado en formData.primaryColor - [analiza qué emociones transmite y cómo usarlo estratégicamente]",
      "secundario": "Color basado en formData.secondaryColor - [cómo complementa al principal]",
      "acentos": "[Sugiere 1-2 colores adicionales para CTAs y highlights basados en psicología del color y mejor práctica de conversión]",
      "neutros": "[Sugiere grises/blancos para backgrounds y texto que trabajen bien con la paleta]"
    }
  }
}

<critical_instructions>

**CALIDAD DEL COPY:**
- Todo el copy debe ser persuasivo y orientado a la conversión
- Usa técnicas probadas: AIDA, PAS, Before/After/Bridge, Value Stacking
- EVITA CLICHÉS comunes: "cambiar vidas", "secreto revelado", "último día", frases gastadas
- Cada claim debe ser ESPECÍFICO, no genérico ("aumenta conversiones" ❌ vs "aumenta conversión del 2% al 8% en promedio" ✅)
- Urgencia y escasez deben ser AUTÉNTICAS, nunca falsas
- Números y resultados siempre que sea posible
- Tono conversacional en español neutro (tú informal, evita regionalismos extremos)

**PERSONALIZACIÓN:**
- Usa TODA la información proporcionada en formData
- Conecta historia personal (personalStory) con emails y VSL
- Credenciales (credentials) deben usarse sutilmente para autoridad
- Beneficio principal (mainBenefit) debe estar en headlines y CTAs
- Lead magnet debe mencionarse coherentemente en emails y páginas

**CONTENIDO COMPLETO - NO PLANTILLAS:**
- Emails: Cada "contenido" debe ser el email COMPLETO (400-500 palabras de copy real)
- VSL script_completo: Mínimo 3000 palabras de script fluido listo para leer
- NO escribas "[inserta aquí]" o "personaliza esto" - genera el contenido final
- Párrafos completos, conversacionales, listos para usar

**TESTIMONIALES:**
- testimonial_templates son PLANTILLAS éticas para que el usuario llene
- Incluye "template" (estructura), "ejemplo_aplicado" (aplicación realista al nicho), "tipo_cliente", "resultado_destacado"
- NO inventes testimonios falsos - da estructura para reales

**COHESIÓN DEL FUNNEL:**
- Landing page menciona que recibirán emails valiosos
- Email 1 entrega lead magnet prometido en landing
- Email 2-3 nutren con valor relacionado al tema
- Email 4 presenta oferta (producto principal) de forma natural
- VSL puede referenciar conceptos del lead magnet
- Páginas confirmación/gracias conectan con promesas de landing
- Todo debe sentirse como ECOSISTEMA cohesivo, no piezas sueltas

**AUTO-REVISIÓN ANTES DE RESPONDER:**
Antes de generar el JSON final, verifica:
1. ¿Evité clichés y frases genéricas de marketing?
2. ¿Todos los claims son específicos y creíbles?
3. ¿El VSL cuenta una historia fluida o son secciones desconectadas?
4. ¿Los emails suenan como persona real o como bot marketero?
5. ¿Los CTAs son claros y accionables?
6. ¿La urgencia tiene razón creíble?
7. ¿Usé la información personal del usuario (historia, credenciales)?
8. ¿Todo está en español conversacional y neutro?

</critical_instructions>

<output_requirements>
- Responde ÚNICAMENTE con el JSON válido
- NO añadas texto explicativo antes o después del JSON
- NO uses bloques de código markdown - solo el JSON puro
- Asegura que el JSON sea válido (comillas, comas, llaves correctas)
- Si un campo requiere mucho texto (emails, VSL script), inclúyelo completo en el JSON
</output_requirements>
`;
}

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║   GenioVSL Backend Server               ║
║   🚀 Servidor iniciado correctamente    ║
╚══════════════════════════════════════════╝

🌐 Servidor corriendo en: http://localhost:${PORT}
📡 API endpoint: http://localhost:${PORT}/api/generate
💚 Health check: http://localhost:${PORT}/api/health

⚠️  Asegúrate de tener configurada tu OPENAI_API_KEY en el archivo .env

Presiona Ctrl+C para detener el servidor
    `);
});

// Manejo de errores global
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Promise Rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
