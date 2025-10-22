// GenioVLS - AI Funnel Generator
// Main Application JavaScript

// Version Check
console.log('%c🚀 GenioVSL v2.0.0 - Complete AI Prompt Overhaul', 'color: #10B981; font-weight: bold; font-size: 16px;');
console.log('%c✨ Mejora del 85%+ en calidad de copy generado', 'color: #8B5CF6; font-weight: bold; font-size: 12px;');
console.log('%c📊 Max tokens: 16000 | Temperature: 0.6 | FAQs + Objeciones mejoradas', 'color: #3B82F6; font-size: 11px;');

class GenioVLS {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.formData = {};
        this.generatedFiles = {};

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateProgress();
    }

    bindEvents() {
        // Form navigation
        document.getElementById('nextBtn').addEventListener('click', () => this.nextStep());
        document.getElementById('prevBtn').addEventListener('click', () => this.prevStep());
        
        // Form submission
        document.getElementById('funnelForm').addEventListener('submit', (e) => this.generateFunnel(e));
        
        // Download button
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadZip());
        
        // Form validation on input
        this.setupFormValidation();
    }

    setupFormValidation() {
        const inputs = document.querySelectorAll('input[required], select[required], textarea[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    validateField(field) {
        const isValid = field.checkValidity();
        if (!isValid) {
            this.showFieldError(field);
        } else {
            this.clearFieldError(field);
        }
        return isValid;
    }

    showFieldError(field) {
        field.style.borderColor = 'var(--danger-color)';
        field.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
    }

    clearFieldError(field) {
        field.style.borderColor = 'var(--border-color)';
        field.style.boxShadow = 'none';
    }

    validateCurrentStep() {
        const currentStepElement = document.querySelector(`[data-step="${this.currentStep}"]`);
        const requiredFields = currentStepElement.querySelectorAll('input[required], select[required], textarea[required]');
        
        let isValid = true;
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    nextStep() {
        if (!this.validateCurrentStep()) {
            this.showNotification('Por favor, completa todos los campos requeridos', 'error');
            return;
        }

        if (this.currentStep < this.totalSteps) {
            this.hideStep(this.currentStep);
            this.currentStep++;
            this.showStep(this.currentStep);
            this.updateProgress();
            this.updateNavigationButtons();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.hideStep(this.currentStep);
            this.currentStep--;
            this.showStep(this.currentStep);
            this.updateProgress();
            this.updateNavigationButtons();
        }
    }

    hideStep(step) {
        const stepElement = document.querySelector(`[data-step="${step}"]`);
        stepElement.classList.remove('active');
    }

    showStep(step) {
        const stepElement = document.querySelector(`[data-step="${step}"]`);
        stepElement.classList.add('active');
    }

    updateProgress() {
        const progress = (this.currentStep / this.totalSteps) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = `Paso ${this.currentStep} de ${this.totalSteps}`;
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const generateBtn = document.getElementById('generateBtn');

        // Show/hide previous button
        prevBtn.style.display = this.currentStep > 1 ? 'block' : 'none';

        // Show/hide next/generate buttons
        if (this.currentStep < this.totalSteps) {
            nextBtn.style.display = 'block';
            generateBtn.style.display = 'none';
        } else {
            nextBtn.style.display = 'none';
            generateBtn.style.display = 'block';
        }
    }

    collectFormData() {
        const formData = new FormData(document.getElementById('funnelForm'));
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }

    async generateFunnel(e) {
        e.preventDefault();
        
        if (!this.validateCurrentStep()) {
            this.showNotification('Por favor, completa todos los campos requeridos', 'error');
            return;
        }

        this.formData = this.collectFormData();
        
        // Show loading state
        this.setGenerateButtonLoading(true);
        
        try {
            // Generate all funnel content with AI
            const generatedContent = await this.generateWithAI(this.formData);
            
            // Create files
            this.generatedFiles = this.createFunnelFiles(generatedContent);
            
            // Show results
            this.showResults();
            
            this.showNotification('¡Funnel generado exitosamente!', 'success');
        } catch (error) {
            console.error('Error generating funnel:', error);
            this.showNotification('Error al generar el funnel. Verifica tu API key e intenta de nuevo.', 'error');
        } finally {
            this.setGenerateButtonLoading(false);
        }
    }

    setGenerateButtonLoading(loading) {
        const btn = document.getElementById('generateBtn');
        const btnText = btn.querySelector('.btn-text');
        const btnLoading = btn.querySelector('.btn-loading');
        
        if (loading) {
            btnText.style.display = 'none';
            btnLoading.style.display = 'flex';
            btn.disabled = true;
        } else {
            btnText.style.display = 'flex';
            btnLoading.style.display = 'none';
            btn.disabled = false;
        }
    }

    async generateWithAI(formData) {
        try {
            // Detectar si estamos usando el backend local o en producción
            const isLocalServer = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

            let apiUrl;
            if (isLocalServer) {
                // Si estamos en localhost, usar el backend local
                apiUrl = `http://localhost:3000/api/generate`;
            } else {
                // Si estamos en producción (Vercel), usar el endpoint relativo
                // que será enrutado a server.js por vercel.json
                apiUrl = `/api/generate`;
            }

            console.log('🚀 Enviando datos al backend para generar copy...');

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('API Error:', errorData);
                throw new Error(errorData.error || `Error del servidor: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Copy generado exitosamente');
            return data;

        } catch (error) {
            console.error('Error completo:', error);

            // Si falla con el backend, mostrar mensaje útil
            if (error.message.includes('Failed to fetch')) {
                throw new Error('No se puede conectar con el servidor backend. Por favor, verifica tu conexión a internet e intenta nuevamente.');
            }

            throw error;
        }
    }

    async generateDirectly(formData) {
        // Método de respaldo: llamada directa a OpenAI (requiere extensión CORS)
        const prompt = this.createPrompt(formData);

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${formData.openaiApiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4',
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
                const errorData = await response.json().catch(() => ({}));
                console.error('OpenAI API Error:', errorData);
                throw new Error(`OpenAI API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            const content = data.choices[0].message.content;

            // Limpiar el contenido antes de parsear JSON
            let cleanContent = content.trim();

            if (cleanContent.startsWith('```json')) {
                cleanContent = cleanContent.replace(/^```json\n/, '').replace(/\n```$/, '');
            } else if (cleanContent.startsWith('```')) {
                cleanContent = cleanContent.replace(/^```\n/, '').replace(/\n```$/, '');
            }

            return JSON.parse(cleanContent);
        } catch (error) {
            console.error('Error en llamada directa:', error);
            throw error;
        }
    }

    createPrompt(formData) {
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
- NO uses ```json o markdown - solo el JSON puro
- Asegura que el JSON sea válido (comillas, comas, llaves correctas)
- Si un campo requiere mucho texto (emails, VSL script), inclúyelo completo en el JSON
</output_requirements>
`;
    }

    createFunnelFiles(content) {
        const files = {};
        
        // Copy files in markdown format
        files['landing-copy.md'] = this.createLandingCopyMD(content.landing_copy);
        files['vsl-script.md'] = this.createVSLScriptMD(content.vsl_script);
        files['emails-secuencia.md'] = this.createEmailSequenceMD(content.email_sequence);
        files['paginas-adicionales.md'] = this.createAdditionalPagesMD(content.paginas_adicionales);
        files['elementos-visuales.md'] = this.createVisualElementsMD(content.elementos_visuales);
        
        // Demo template files - now personalized with real content
        files['template-landing-page.html'] = this.createLandingPageTemplate(content);
        files['template-confirmacion.html'] = this.createConfirmationTemplate(content);
        files['template-gracias.html'] = this.createThankYouTemplate(content);
        files['template-emails.html'] = this.createEmailTemplate(content);
        
        // CSS for templates
        files['template-styles.css'] = this.createTemplateCSS();
        
        // Implementation guide
        files['guia-implementacion.md'] = this.createImplementationGuide();
        
        return files;
    }

    createLandingCopyMD(content) {
        return `# 📝 Copy para Landing Page

## Información General
**Negocio:** ${this.formData.businessName}
**Producto:** ${this.formData.productName}
**Precio:** €${this.formData.productPrice}

---

## 🎯 Headlines (Titulares)

### Titular Principal
\`\`\`
${content.headline_principal}
\`\`\`

### Subtítulo
\`\`\`
${content.subheadline}
\`\`\`

### Titular Secundario (para sección de beneficios)
\`\`\`
${content.headline_secundario}
\`\`\`

---

## 🔥 Problema y Solución

### Descripción del Problema
${content.problema_descripcion}

### Tu Solución Única
${content.solucion_descripcion}

---

## ✅ Beneficios

### Beneficios Principales
${content.benefits_principales.map((benefit, index) => `${index + 1}. ${benefit}`).join('\n')}

### Beneficios Secundarios  
${content.benefits_secundarios.map((benefit, index) => `${index + 1}. ${benefit}`).join('\n')}

---

## 💬 Testimonios

${content.testimonials.map((testimonial, index) => `### Testimonio ${index + 1}
**Texto:** "${testimonial.texto}"
**Autor:** ${testimonial.autor}
**Resultado:** ${testimonial.resultado}
`).join('\n')}

---

## 🎬 Llamadas a la Acción (CTA)

### CTA Principal
\`\`\`
${content.cta_principal}
\`\`\`

### CTA Secundario
\`\`\`
${content.cta_secundario}
\`\`\`

---

## ⚡ Urgencia y Escasez

### Texto de Urgencia
\`\`\`
${content.urgency_text}
\`\`\`

---

## 🛡️ Garantía
${content.garantia ? `\`\`\`\n${content.garantia}\n\`\`\`` : 'No se especificó garantía'}

---

## ❓ Manejo de Objeciones

${content.objeciones_respuestas.map(obj => `### ${obj.objecion}
**Respuesta:** ${obj.respuesta}
`).join('\n')}

---

## 📋 Notas de Implementación

- **Ubicación del VSL:** Colocar prominentemente después del titular principal
- **Formulario de captura:** Ubicar después de los beneficios y testimonios
- **Testimonio destacado:** Usar ${content.testimonials[0].autor} como testimonio principal
- **Colores de marca:** ${this.formData.primaryColor} (principal), ${this.formData.secondaryColor} (secundario)

---
*Generado por GenioVLS el ${new Date().toLocaleDateString('es-ES')}*`;
    }

    createVSLScriptMD(content) {
        return `# 🎬 Script Completo del VSL

## Información del Video
**Duración estimada:** 15-20 minutos
**Negocio:** ${this.formData.businessName}
**Producto:** ${this.formData.productName}

---

## 🎯 Estructura del VSL

### 1. Hook de Apertura (0:00 - 0:30)
\`\`\`
${content.hook_apertura}
\`\`\`
**Nota:** Captura la atención inmediatamente. No menciones tu nombre aún.

### 2. Introducción Personal (0:30 - 2:30)
\`\`\`
${content.introduccion_personal}
\`\`\`
**Nota:** Establece credibilidad sin ser arrogante.

### 3. Problema y Agitación (2:30 - 5:30)
\`\`\`
${content.problema_agitacion}
\`\`\`
**Nota:** Haz que sientan el dolor del problema. Usa ejemplos específicos.

### 4. Revelación de la Solución (5:30 - 8:30)
\`\`\`
${content.solucion_revelacion}
\`\`\`
**Nota:** Presenta tu método único. Crea curiosidad por conocer más.

### 5. Beneficios y Transformación (8:30 - 12:30)
\`\`\`
${content.beneficios_transformacion}
\`\`\`
**Nota:** Pinta el futuro deseado. Sé específico con los resultados.

### 6. Prueba Social (12:30 - 15:30)
\`\`\`
${content.prueba_social}
\`\`\`
**Nota:** Usa testimonios específicos con nombres y resultados reales.

### 7. Presentación de la Oferta (15:30 - 18:30)
\`\`\`
${content.oferta_presentacion}
\`\`\`
**Nota:** Justifica el precio con valor. Compara con alternativas.

### 8. Urgencia y Escasez (18:30 - 20:30)
\`\`\`
${content.urgencia_escasez}
\`\`\`
**Nota:** Crea razón genuina para actuar ahora.

### 9. Cierre y CTA Final (20:30 - 22:00)
\`\`\`
${content.cierre_cta}
\`\`\`
**Nota:** Instrucciones claras sobre qué hacer a continuación.

---

## 📝 Script Completo Unificado

${content.script_completo}

---

## 🎥 Notas de Grabación

### Preparación Técnica
- **Iluminación:** Luz natural o ring light frontal
- **Audio:** Micrófono de solapa o micrófono USB de calidad
- **Cámara:** Encuadre desde el pecho hacia arriba
- **Fondo:** Neutro, sin distracciones

### Consejos de Actuación
- **Ritmo:** Varía el ritmo. Acelera en partes emocionantes, ralentiza en puntos importantes
- **Pausas:** Usa pausas estratégicas después de puntos clave
- **Gestos:** Gesticula naturalmente para mantener el interés
- **Contacto visual:** Mira directamente a la cámara
- **Energía:** Mantén energía alta pero auténtica

### Estructura de Tomas
1. **Toma 1:** Hook completo (hasta presentación personal)
2. **Toma 2:** Problema y agitación
3. **Toma 3:** Solución y beneficios
4. **Toma 4:** Testimonios y prueba social
5. **Toma 5:** Oferta y cierre

---
*Generado por GenioVLS el ${new Date().toLocaleDateString('es-ES')}*`;
    }

    createEmailSequenceMD(emails) {
        return `# 📧 Secuencia de Emails de Nutrición

## Información General
**Negocio:** ${this.formData.businessName}
**Lead Magnet:** ${this.formData.leadMagnetTitle}
**Objetivo:** Nutrir leads y conducir a la venta de ${this.formData.productName}

---

${emails.map(email => `## 📩 Email ${email.email_numero}: ${email.tipo}

### Información del Email
- **Asunto:** ${email.subject}
- **Preview Text:** ${email.preview_text}
- **Envío:** ${email.email_numero === 1 ? 'Inmediato tras suscripción' : 
  email.email_numero === 2 ? '1 día después' :
  email.email_numero === 3 ? '3 días después' : '5 días después'}

### Contenido Completo
${email.contenido}

### Llamada a la Acción
\`\`\`
${email.cta}
\`\`\`

---`).join('\n')}

## 🎯 Calendario de Envío Sugerido

| Email | Timing | Objetivo Principal |
|-------|---------|-------------------|
| Email 1 | Inmediato | Bienvenida y entrega del lead magnet |
| Email 2 | +1 día | Educación y construcción de autoridad |
| Email 3 | +3 días | Historia personal y conexión emocional |
| Email 4 | +5 días | Presentación de oferta con urgencia |

## 📊 Métricas a Monitorear

### Tasas de Apertura Objetivo
- Email 1: 60-70% (alta expectativa)
- Email 2: 45-55% 
- Email 3: 40-50%
- Email 4: 35-45%

### Tasas de Click Objetivo
- Email 1: 15-25% (enlace de descarga)
- Email 2: 8-12%
- Email 3: 10-15%
- Email 4: 12-20% (CTA de venta)

## ⚙️ Configuración Técnica

### Asuntos A/B Testing
${emails.map(email => `**Email ${email.email_numero}:**
- Versión A: ${email.subject}
- Versión B: [Crear variación probando diferentes ángulos]`).join('\n')}

### Personalizaciones Recomendadas
- Usar nombre del suscriptor en asunto y saludo
- Segmentar por fuente de tráfico si es posible
- Adaptar horario de envío según audiencia

---
*Generado por GenioVLS el ${new Date().toLocaleDateString('es-ES')}*`;
    }

    createAdditionalPagesMD(content) {
        return `# 📄 Copy para Páginas Adicionales

---

## 🎉 Página de Confirmación

### Titular Principal
\`\`\`
${content.confirmacion.headline}
\`\`\`

### Contenido Principal
${content.confirmacion.contenido_principal}

### Instrucciones (Lista Numerada)
${content.confirmacion.instrucciones.map((step, index) => `${index + 1}. ${step}`).join('\n')}

### Mensaje de Anticipación
\`\`\`
${content.confirmacion.mensaje_anticipacion}
\`\`\`

---

## 🙏 Página de Agradecimiento

### Titular Principal  
\`\`\`
${content.gracias.headline}
\`\`\`

### Mensaje de Entrega
${content.gracias.mensaje_entrega}

### Instrucciones de Descarga
${content.gracias.instrucciones_descarga}

### Upsell Sutil
\`\`\`
${content.gracias.upsell_sutil}
\`\`\`

---

## 📋 Notas de Implementación

### Página de Confirmación
- **Ubicación:** Debe mostrarse inmediatamente después del formulario
- **Funcionalidad:** Confirmar suscripción y explicar siguientes pasos
- **Elementos visuales:** Usar colores de éxito (verde) y checkmark
- **Links importantes:** Incluir enlaces a redes sociales

### Página de Agradecimiento  
- **Timing:** Mostrar tras confirmación de email
- **Elemento clave:** Botón/enlace de descarga prominente
- **Retención:** Incluir upsell sutil sin ser agresivo
- **Social proof:** Opcional incluir testimonios cortos

### Elementos Técnicos
- **Tracking:** Implementar pixel de conversión
- **Analytics:** Configurar como goal/evento
- **Mobile:** Asegurar responsive design
- **Speed:** Optimizar carga rápida

---

## 🎨 Sugerencias de Diseño

### Colores
- **Confirmación:** ${this.formData.primaryColor} (principal), verde para éxito
- **Agradecimiento:** ${this.formData.primaryColor} con toques de ${this.formData.secondaryColor}

### Elementos Visuales
- **Iconos:** ✅ para confirmación, 🎁 para descarga
- **Imágenes:** Mock-up del lead magnet si es digital
- **Layout:** Centrado, limpio, con mucho espacio en blanco

---
*Generado por GenioVLS el ${new Date().toLocaleDateString('es-ES')}*`;
    }

    createVisualElementsMD(content) {
        return `# 🎨 Elementos Visuales y Multimedia

---

## 📸 Imágenes Sugeridas

${content.imagenes_sugeridas.map((imagen, index) => `### Imagen #${index + 1}
**Descripción:** ${imagen}
**Ubicación sugerida:** ${index === 0 ? 'Sección del problema (IMAGEN #1 en landing page)' : 
  index === 1 ? 'Sección de la solución (IMAGEN #2 en landing page)' :
  index === 2 ? 'Área de testimonios (FOTO #3 en testimonios)' : 
  index === 3 ? 'Segundo testimonio (FOTO #4)' : 
  index === 4 ? 'Tercer testimonio (FOTO #5)' : 'Llamada a la acción'}
**Especificaciones técnicas:**
- Formato: JPG o PNG
- Resolución: 1200x800px mínimo
- Peso: Máximo 150KB optimizada
- Alt text: [Descripción para SEO]
**En HTML:** Buscar "IMAGEN #${index + 1}" ${index >= 2 ? 'o "FOTO #' + (index + 1) + '"' : ''} en template-landing-page.html

---`).join('\n')}

## 🎥 Videos Sugeridos

${content.videos_sugeridos.map((video, index) => `### Video ${index + 1}
**Descripción:** ${video}
**Ubicación:** ${index === 0 ? 'Principal (Hero section)' : 'Sección de testimonios'}
**Especificaciones técnicas:**
- Formato: MP4 (H.264)
- Resolución: 1920x1080 (16:9) o 1080x1920 (9:16 para móvil)
- Duración: ${index === 0 ? '15-20 minutos' : '1-2 minutos'}
- Miniatura personalizada: Sí
- Subtítulos: Recomendado para accesibilidad

---`).join('\n')}

## 🖼️ Recursos Adicionales

### Iconografía
- **Estilo:** Minimalista, líneas finas
- **Color:** ${this.formData.primaryColor} (principal)
- **Tamaño:** 48x48px para iconos de beneficios
- **Fuente:** Feather Icons, Heroicons, o Font Awesome

### Tipografía
- **Heading:** Inter, Poppins, o Montserrat
- **Body:** Inter, Open Sans, o Roboto
- **Contraste:** WCAG AA compliant
- **Jerarquía:** H1 (36-48px), H2 (28-32px), H3 (20-24px), P (16-18px)

### Paleta de Colores
- **Principal:** ${this.formData.primaryColor}
- **Secundario:** ${this.formData.secondaryColor}
- **Éxito:** #10B981
- **Advertencia:** #F59E0B
- **Error:** #EF4444
- **Neutros:** #F9FAFB, #6B7280, #1F2937

---

## 📱 Adaptación Responsive

### Breakpoints
- **Mobile:** 320px - 768px
- **Tablet:** 768px - 1024px
- **Desktop:** 1024px+

### Consideraciones Móviles
- **Hero:** Video responsive o placeholder
- **Formulario:** Botones táctiles (mín. 44px)
- **Tipografía:** H1 reducido a 28-32px
- **Espaciado:** Márgenes laterales de 20px

---

## 🎯 Llamadas a la Acción Visuales

### Botón Principal
- **Texto:** ${this.formData.productName ? `"Obtener ${this.formData.productName}"` : '"Acceder Ahora"'}
- **Color:** ${this.formData.primaryColor}
- **Hover:** Darken 10%
- **Sombra:** 0 4px 12px rgba(0,0,0,0.15)
- **Animación:** Hover lift (2px up)

### Elementos de Urgencia
- **Contador:** Si aplica, mostrar tiempo restante
- **Badges:** "Oferta limitada", "Solo hoy"
- **Colores de urgencia:** Rojos/naranjas para escasez

---

## 🔧 Herramientas Recomendadas

### Diseño
- **Canva Pro:** Para gráficos rápidos
- **Figma:** Para mockups profesionales
- **Unsplash/Pexels:** Para fotos de stock

### Optimización
- **TinyPNG:** Comprimir imágenes
- **Canva:** Redimensionar múltiples formatos
- **Adobe Express:** Edición rápida

---
*Generado por GenioVLS el ${new Date().toLocaleDateString('es-ES')}*`;
    }

    createLandingPageTemplate(content) {
        return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.landing_copy.headline_principal} - ${this.formData.businessName}</title>
    <link rel="stylesheet" href="template-styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <!-- HEADER -->
    <header class="demo-header">
        <div class="demo-container">
            <div class="demo-logo">
                <h1>${this.formData.businessName}</h1>
            </div>
            <nav class="demo-nav">
                <a href="#beneficios">Beneficios</a>
                <a href="#testimonios">Testimonios</a>
                <a href="#oferta">Oferta</a>
            </nav>
        </div>
    </header>

    <!-- HERO SECTION -->
    <section class="demo-hero">
        <div class="demo-container">
            <div class="demo-hero-content">
                <h1 class="demo-headline">
                    ${content.landing_copy.headline_principal}
                </h1>
                <p class="demo-subheadline">
                    ${content.landing_copy.subheadline}
                </p>
                
                <!-- VIDEO PLACEHOLDER -->
                <div class="demo-video-container">
                    <div class="demo-video-placeholder">
                        <div class="demo-play-button">▶️</div>
                        <p>🎥 <strong>VSL: ${this.formData.productName}</strong></p>
                        <small>Graba tu VSL usando el script generado (vsl-script.md)</small>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- PROBLEM SECTION -->
    <section class="demo-problem">
        <div class="demo-container">
            <h2>El Problema que Enfrentas</h2>
            <div class="demo-problem-content">
                <div class="demo-problem-text">
                    <p>${content.landing_copy.problema_descripcion}</p>
                </div>
                <div class="demo-problem-visual">
                    <div class="demo-image-placeholder">
                        📷 <strong>IMAGEN #1:</strong> ${content.elementos_visuales.imagenes_sugeridas[0]}
                        <small>Representa el problema/frustración actual</small>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- SOLUTION SECTION -->
    <section class="demo-solution">
        <div class="demo-container">
            <h2>${content.landing_copy.headline_secundario}</h2>
            <div class="demo-solution-content">
                <div class="demo-solution-visual">
                    <div class="demo-image-placeholder">
                        📷 <strong>IMAGEN #2:</strong> ${content.elementos_visuales.imagenes_sugeridas[1]}
                        <small>Tu solución/método único</small>
                    </div>
                </div>
                <div class="demo-solution-text">
                    <p>${content.landing_copy.solucion_descripcion}</p>
                </div>
            </div>
        </div>
    </section>

    <!-- BENEFITS SECTION -->
    <section id="beneficios" class="demo-benefits">
        <div class="demo-container">
            <h2>Lo que vas a conseguir</h2>
            <div class="demo-benefits-grid">
                ${content.landing_copy.benefits_principales.map(benefit => `
                <div class="demo-benefit">
                    <div class="demo-benefit-icon">✅</div>
                    <h3>${benefit}</h3>
                </div>
                `).join('')}
                ${content.landing_copy.benefits_secundarios.slice(0, 3).map(benefit => `
                <div class="demo-benefit">
                    <div class="demo-benefit-icon">🎯</div>
                    <h3>${benefit}</h3>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- TESTIMONIALS SECTION -->
    <section id="testimonios" class="demo-testimonials">
        <div class="demo-container">
            <h2>Lo que dicen nuestros clientes</h2>
            <div class="demo-testimonials-grid">
                ${content.landing_copy.testimonials.map((testimonial, index) => `
                <div class="demo-testimonial">
                    <div class="demo-testimonial-content">
                        <p>"${testimonial.texto}"</p>
                        <div class="demo-testimonial-author">
                            <div class="demo-avatar-placeholder">
                                👤 <strong>FOTO #${index + 3}</strong>
                            </div>
                            <div>
                                <strong>${testimonial.autor}</strong>
                                <span>${testimonial.resultado}</span>
                            </div>
                        </div>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- OBJECTIONS SECTION -->
    <section class="demo-objections">
        <div class="demo-container">
            <h2>¿Aún tienes dudas?</h2>
            <div class="demo-objections-list">
                ${content.landing_copy.objeciones_respuestas.map(objection => `
                <div class="demo-objection">
                    <h3>❓ "${objection.objecion}"</h3>
                    <p><strong>Respuesta:</strong> ${objection.respuesta}</p>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- CTA SECTION -->
    <section id="oferta" class="demo-cta">
        <div class="demo-container">
            <!-- URGENCY BOX -->
            <div class="demo-urgency">
                <p>⚡ <strong>${content.landing_copy.urgency_text}</strong></p>
            </div>
            
            <!-- LEAD FORM -->
            <div class="demo-form-container">
                <h3>Obtén tu ${this.formData.leadMagnetTitle} GRATIS</h3>
                <form class="demo-form" action="template-confirmacion.html" method="GET">
                    <input type="text" name="nombre" placeholder="Tu nombre" required>
                    <input type="email" name="email" placeholder="Tu mejor email" required>
                    <button type="submit" class="demo-cta-button">
                        ${content.landing_copy.cta_principal}
                    </button>
                </form>
                
                <!-- GUARANTEE -->
                ${content.landing_copy.garantia ? `
                <div class="demo-guarantee">
                    <p>🛡️ ${content.landing_copy.garantia}</p>
                </div>
                ` : ''}
            </div>
        </div>
    </section>

    <!-- FOOTER -->
    <footer class="demo-footer">
        <div class="demo-container">
            <p>&copy; 2025 ${this.formData.businessName} | ${this.formData.contactEmail}</p>
            <div class="demo-footer-links">
                <a href="#">Términos</a>
                <a href="#">Privacidad</a>
                <a href="#">Contacto</a>
            </div>
        </div>
    </footer>

    <!-- IMPLEMENTATION NOTES -->
    <div class="demo-notes">
        <h3>📋 Plantilla Personalizada Lista</h3>
        <ul>
            <li><strong>✅ Copy personalizado:</strong> Todo el texto está adaptado a tu negocio</li>
            <li><strong>🎥 Video:</strong> Sustituir placeholder por tu VSL grabado</li>
            <li><strong>📷 Imágenes:</strong> Usar las sugerencias específicas en elementos-visuales.md</li>
            <li><strong>📧 Formulario:</strong> Conectar con tu autoresponder favorito</li>
            <li><strong>🎨 Colores:</strong> Ya configurados con ${this.formData.primaryColor} y ${this.formData.secondaryColor}</li>
        </ul>
        <p><strong>💡 Esta plantilla está lista para usar:</strong> Solo necesitas grabar el VSL, añadir imágenes y conectar el formulario.</p>
    </div>
</body>
</html>`;
    }

    createTemplateCSS() {
        return `/* Template Styles - GenioVLS Generated */
:root {
    --primary-color: ${this.formData.primaryColor};
    --secondary-color: ${this.formData.secondaryColor};
    --text-primary: #1F2937;
    --text-secondary: #6B7280;
    --border-color: #E5E7EB;
    --success-color: #10B981;
    --warning-color: #F59E0B;
    --danger-color: #EF4444;
    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --border-radius: 12px;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    line-height: 1.6;
    color: var(--text-primary);
    background: #f8fafc;
}

.demo-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* HEADER */
.demo-header {
    background: white;
    padding: 1rem 0;
    box-shadow: var(--shadow);
    position: sticky;
    top: 0;
    z-index: 100;
}

.demo-header .demo-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.demo-logo h1 {
    color: var(--primary-color);
    font-size: 1.5rem;
    font-weight: 700;
}

.demo-nav {
    display: flex;
    gap: 2rem;
}

.demo-nav a {
    text-decoration: none;
    color: var(--text-secondary);
    font-weight: 500;
    transition: color 0.3s;
}

.demo-nav a:hover {
    color: var(--primary-color);
}

/* HERO SECTION */
.demo-hero {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    color: white;
    padding: 4rem 0;
    text-align: center;
}

.demo-headline {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
    line-height: 1.2;
}

.demo-highlight {
    background: rgba(255, 255, 255, 0.2);
    padding: 0.2rem 0.5rem;
    border-radius: 6px;
}

.demo-subheadline {
    font-size: 1.25rem;
    margin-bottom: 3rem;
    opacity: 0.9;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

.demo-video-container {
    max-width: 800px;
    margin: 0 auto;
}

.demo-video-placeholder {
    aspect-ratio: 16/9;
    background: rgba(0, 0, 0, 0.3);
    border-radius: var(--border-radius);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    border: 2px dashed rgba(255, 255, 255, 0.5);
}

.demo-play-button {
    font-size: 4rem;
    opacity: 0.8;
}

/* SECTIONS */
section {
    padding: 4rem 0;
}

section h2 {
    font-size: 2.5rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 3rem;
    color: var(--text-primary);
}

/* PROBLEM & SOLUTION */
.demo-problem, .demo-solution {
    background: white;
}

.demo-problem-content, .demo-solution-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    align-items: center;
}

.demo-solution-content {
    grid-template-columns: 1fr 1fr;
}

.demo-problem-text, .demo-solution-text {
    font-size: 1.125rem;
}

.demo-image-placeholder {
    aspect-ratio: 4/3;
    background: #f1f5f9;
    border-radius: var(--border-radius);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px dashed var(--border-color);
    text-align: center;
    padding: 2rem;
}

/* BENEFITS */
.demo-benefits {
    background: #f8fafc;
}

.demo-benefits-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.demo-benefit {
    background: white;
    padding: 2rem;
    border-radius: var(--border-radius);
    text-align: center;
    box-shadow: var(--shadow);
}

.demo-benefit-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.demo-benefit h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--text-primary);
}

/* TESTIMONIALS */
.demo-testimonials {
    background: white;
}

.demo-testimonials-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 2rem;
}

.demo-testimonial {
    background: #f8fafc;
    border-radius: var(--border-radius);
    padding: 2rem;
    border-left: 4px solid var(--primary-color);
}

.demo-testimonial-content p {
    font-style: italic;
    margin-bottom: 1.5rem;
    font-size: 1.125rem;
}

.demo-testimonial-author {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.demo-avatar-placeholder {
    width: 60px;
    height: 60px;
    background: var(--border-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 0.8rem;
}

.demo-testimonial-author div:last-child span {
    display: block;
    color: var(--text-secondary);
    font-size: 0.9rem;
}

/* OBJECTIONS */
.demo-objections {
    background: #f8fafc;
}

.demo-objections-list {
    max-width: 800px;
    margin: 0 auto;
}

.demo-objection {
    background: white;
    padding: 2rem;
    border-radius: var(--border-radius);
    margin-bottom: 1.5rem;
    box-shadow: var(--shadow);
}

.demo-objection h3 {
    color: var(--text-primary);
    margin-bottom: 1rem;
}

/* CTA SECTION */
.demo-cta {
    background: var(--primary-color);
    color: white;
    text-align: center;
}

.demo-urgency {
    background: rgba(255, 255, 255, 0.1);
    padding: 1rem 2rem;
    border-radius: var(--border-radius);
    margin-bottom: 3rem;
    display: inline-block;
}

.demo-form-container {
    max-width: 500px;
    margin: 0 auto;
}

.demo-form-container h3 {
    font-size: 2rem;
    margin-bottom: 2rem;
}

.demo-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
}

.demo-form input {
    padding: 1rem;
    border: none;
    border-radius: var(--border-radius);
    font-size: 1rem;
}

.demo-cta-button {
    background: white;
    color: var(--primary-color);
    border: none;
    padding: 1.25rem 2rem;
    border-radius: var(--border-radius);
    font-size: 1.125rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.3s, box-shadow 0.3s;
}

.demo-cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.demo-guarantee {
    opacity: 0.9;
    font-size: 0.9rem;
}

/* FOOTER */
.demo-footer {
    background: #1F2937;
    color: white;
    padding: 2rem 0;
    text-align: center;
}

.demo-footer .demo-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.demo-footer-links {
    display: flex;
    gap: 2rem;
}

.demo-footer-links a {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
}

.demo-footer-links a:hover {
    color: white;
}

/* IMPLEMENTATION NOTES */
.demo-notes {
    background: #fef3c7;
    border: 2px solid #f59e0b;
    border-radius: var(--border-radius);
    padding: 2rem;
    margin: 2rem 0;
}

.demo-notes h3 {
    color: #92400e;
    margin-bottom: 1rem;
}

.demo-notes ul {
    list-style-position: inside;
    color: #92400e;
}

.demo-notes li {
    margin-bottom: 0.5rem;
}

/* RESPONSIVE */
@media (max-width: 768px) {
    .demo-container {
        padding: 0 15px;
    }
    
    .demo-header .demo-container {
        flex-direction: column;
        gap: 1rem;
    }
    
    .demo-nav {
        gap: 1rem;
    }
    
    .demo-headline {
        font-size: 2rem;
    }
    
    .demo-problem-content, 
    .demo-solution-content {
        grid-template-columns: 1fr;
        gap: 2rem;
    }
    
    .demo-benefits-grid {
        grid-template-columns: 1fr;
    }
    
    .demo-testimonials-grid {
        grid-template-columns: 1fr;
    }
    
    .demo-footer .demo-container {
        flex-direction: column;
        gap: 1rem;
    }
    
    .demo-footer-links {
        flex-direction: column;
        gap: 1rem;
    }
}

/* PLACEHOLDER STYLES */
[class*="placeholder"] {
    transition: all 0.3s ease;
}

[class*="placeholder"]:hover {
    background: #e2e8f0;
    border-color: var(--primary-color);
}

/* DEMO SPECIFIC STYLES */
body {
    position: relative;
}

body::after {
    content: "🔧 PLANTILLA DE DEMOSTRACIÓN - Reemplaza los textos entre [CORCHETES]";
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: var(--warning-color);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 600;
    z-index: 1000;
    max-width: 300px;
    text-align: center;
}

@media (max-width: 768px) {
    body::after {
        position: relative;
        display: block;
        margin: 1rem;
        bottom: auto;
        right: auto;
    }
}`;
    }

    createConfirmationTemplate(content) {
        return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.paginas_adicionales.confirmacion.headline} - ${this.formData.businessName}</title>
    <link rel="stylesheet" href="template-styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="demo-container">
        <!-- CONFIRMATION CONTENT -->
        <section class="demo-confirmation">
            <div class="demo-confirmation-content">
                <!-- SUCCESS ICON -->
                <div class="demo-success-icon">
                    <div class="demo-checkmark">✅</div>
                </div>
                
                <!-- MAIN HEADLINE -->
                <h1 class="demo-confirmation-headline">
                    ${content.paginas_adicionales.confirmacion.headline}
                </h1>
                
                <!-- MAIN CONTENT -->
                <div class="demo-content-box">
                    <p class="demo-confirmation-text">
                        ${content.paginas_adicionales.confirmacion.contenido_principal}
                    </p>
                    
                    <!-- INSTRUCTIONS LIST -->
                    <div class="demo-instructions">
                        <h3>Próximos pasos:</h3>
                        <ol class="demo-steps-list">
                            ${content.paginas_adicionales.confirmacion.instrucciones.map(step => `<li>${step}</li>`).join('')}
                        </ol>
                    </div>
                    
                    <!-- ANTICIPATION MESSAGE -->
                    <div class="demo-anticipation">
                        <p><strong>${content.paginas_adicionales.confirmacion.mensaje_anticipacion}</strong></p>
                    </div>
                </div>
                
                <!-- CONTACT INFO -->
                <div class="demo-contact-info">
                    <h4>¿Necesitas ayuda?</h4>
                    <p>Contacta con nosotros: <strong>${this.formData.contactEmail}</strong></p>
                    ${this.formData.contactPhone ? `<p>Teléfono: <strong>${this.formData.contactPhone}</strong></p>` : ''}
                    ${this.formData.website ? `<p>Web: <strong><a href="${this.formData.website}" target="_blank">${this.formData.website}</a></strong></p>` : ''}
                </div>
                
                <!-- LEAD MAGNET INFO -->
                <div class="demo-leadmagnet-info">
                    <h4>🎁 Lo que recibirás:</h4>
                    <div class="demo-leadmagnet-preview">
                        <h5>${this.formData.leadMagnetTitle}</h5>
                        <p>${this.formData.leadMagnetDescription}</p>
                        <small>📧 Llegará a tu email en los próximos minutos</small>
                    </div>
                </div>
                
                <!-- SOCIAL LINKS -->
                <div class="demo-social-links">
                    <h4>Síguenos en redes:</h4>
                    <div class="demo-social-buttons">
                        <a href="#" class="demo-social-btn facebook">Facebook</a>
                        <a href="#" class="demo-social-btn instagram">Instagram</a>
                        <a href="#" class="demo-social-btn linkedin">LinkedIn</a>
                    </div>
                </div>
            </div>
        </section>
    </div>

    <style>
        .demo-confirmation {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem 0;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        }
        
        .demo-confirmation-content {
            background: white;
            padding: 3rem;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 600px;
            width: 100%;
        }
        
        .demo-success-icon {
            margin-bottom: 2rem;
        }
        
        .demo-checkmark {
            font-size: 4rem;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            width: 100px;
            height: 100px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
            animation: checkmarkPulse 2s ease-in-out infinite;
        }
        
        @keyframes checkmarkPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        .demo-confirmation-headline {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 1.5rem;
            line-height: 1.2;
        }
        
        .demo-content-box {
            background: #f8fafc;
            padding: 2rem;
            border-radius: 12px;
            margin-bottom: 2rem;
            text-align: left;
        }
        
        .demo-confirmation-text {
            font-size: 1.125rem;
            line-height: 1.6;
            margin-bottom: 2rem;
        }
        
        .demo-instructions h3 {
            color: var(--primary-color);
            margin-bottom: 1rem;
        }
        
        .demo-steps-list {
            margin-bottom: 2rem;
            padding-left: 1.5rem;
        }
        
        .demo-steps-list li {
            margin-bottom: 0.75rem;
            font-weight: 500;
        }
        
        .demo-anticipation {
            background: #ecfdf5;
            border: 2px solid #10b981;
            border-radius: 8px;
            padding: 1rem;
            text-align: center;
        }
        
        .demo-anticipation p {
            color: #065f46;
            margin: 0;
        }
        
        .demo-contact-info {
            background: #f1f5f9;
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 2rem;
        }
        
        .demo-contact-info h4 {
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }
        
        .demo-social-links h4 {
            color: var(--text-primary);
            margin-bottom: 1rem;
        }
        
        .demo-social-buttons {
            display: flex;
            justify-content: center;
            gap: 1rem;
            flex-wrap: wrap;
        }
        
        .demo-social-btn {
            padding: 0.5rem 1rem;
            border-radius: 6px;
            text-decoration: none;
            color: white;
            font-weight: 500;
            transition: transform 0.3s;
        }
        
        .demo-social-btn:hover {
            transform: translateY(-2px);
        }
        
        .demo-social-btn.facebook { background: #1877f2; }
        .demo-social-btn.instagram { background: #e4405f; }
        .demo-social-btn.linkedin { background: #0077b5; }
        
        .demo-leadmagnet-info {
            background: #f0f9ff;
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 2rem;
            border-left: 4px solid var(--primary-color);
        }
        
        .demo-leadmagnet-preview h5 {
            color: var(--primary-color);
            margin-bottom: 0.5rem;
        }
        
        .demo-business-info {
            background: #f8fafc;
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 2rem;
        }
        
        .demo-contact-details {
            margin-top: 1rem;
        }
        
        .demo-contact-details p {
            margin-bottom: 0.5rem;
            color: var(--text-secondary);
        }
        
        .demo-email-note {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 1rem;
            margin-top: 1.5rem;
            font-size: 0.9rem;
        }
        
        .demo-email-note p {
            margin: 0;
            color: #92400e;
        }
        
        @media (max-width: 768px) {
            .demo-confirmation-content {
                padding: 2rem 1.5rem;
            }
            
            .demo-confirmation-headline {
                font-size: 2rem;
            }
            
            .demo-social-buttons {
                flex-direction: column;
            }
        }
    </style>
</body>
</html>`;
    }

    createThankYouTemplate(content) {
        return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.paginas_adicionales.gracias.headline} - ${this.formData.businessName}</title>
    <link rel="stylesheet" href="template-styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="demo-container">
        <!-- THANK YOU CONTENT -->
        <section class="demo-thank-you">
            <div class="demo-thank-you-content">
                <!-- GIFT ICON -->
                <div class="demo-gift-icon">
                    <div class="demo-gift">🎁</div>
                </div>
                
                <!-- MAIN HEADLINE -->
                <h1 class="demo-thank-you-headline">
                    ${content.paginas_adicionales.gracias.headline}
                </h1>
                
                <!-- DELIVERY MESSAGE -->
                <div class="demo-delivery-message">
                    <p>${content.paginas_adicionales.gracias.mensaje_entrega}</p>
                </div>
                
                <!-- DOWNLOAD SECTION -->
                <div class="demo-download-section">
                    <h3>${this.formData.leadMagnetTitle}</h3>
                    <p class="demo-download-instructions">
                        ${content.paginas_adicionales.gracias.instrucciones_descarga}
                    </p>
                    
                    <div class="demo-download-button-container">
                        <a href="#" class="demo-download-button">
                            📥 Descargar ${this.formData.leadMagnetTitle}
                        </a>
                    </div>
                    
                    <div class="demo-download-backup">
                        <p><small>Si no funciona el botón, envíanos un email a ${this.formData.contactEmail}</small></p>
                    </div>
                </div>
                
                <!-- UPSELL SECTION -->
                <div class="demo-upsell">
                    <h4>¿Te ha gustado este contenido?</h4>
                    <p>${content.paginas_adicionales.gracias.upsell_sutil}</p>
                    <a href="#" class="demo-upsell-button">Conocer ${this.formData.productName}</a>
                </div>
                
                <!-- BUSINESS INFO -->
                <div class="demo-business-info">
                    <h4>Sobre ${this.formData.businessName}</h4>
                    <p>Nos especializamos en ${this.formData.businessType} para ${this.formData.targetAudience}.</p>
                    <div class="demo-contact-details">
                        <p>📧 ${this.formData.contactEmail}</p>
                        ${this.formData.contactPhone ? `<p>📞 ${this.formData.contactPhone}</p>` : ''}
                        ${this.formData.website ? `<p>🌐 <a href="${this.formData.website}" target="_blank">${this.formData.website}</a></p>` : ''}
                    </div>
                </div>
                
                <!-- SOCIAL SHARE -->
                <div class="demo-social-share">
                    <h4>¡Compártelo con tus amigos!</h4>
                    <div class="demo-share-buttons">
                        <a href="#" class="demo-share-btn facebook">
                            📘 Facebook
                        </a>
                        <a href="#" class="demo-share-btn twitter">
                            🐦 Twitter
                        </a>
                        <a href="#" class="demo-share-btn linkedin">
                            💼 LinkedIn
                        </a>
                        <a href="#" class="demo-share-btn whatsapp">
                            💬 WhatsApp
                        </a>
                    </div>
                </div>
                
                <!-- NEXT STEPS -->
                <div class="demo-next-steps">
                    <h4>Próximos pasos:</h4>
                    <ol>
                        <li>Revisa tu email para acceder al contenido</li>
                        <li>Guarda ${this.formData.leadMagnetTitle} en un lugar seguro</li>
                        <li>¡Implementa lo que aprendas!</li>
                        <li>Mantente atento a nuestros emails con más valor</li>
                    </ol>
                </div>
            </div>
        </section>
    </div>

    <style>
        .demo-thank-you {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem 0;
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        }
        
        .demo-thank-you-content {
            background: white;
            padding: 3rem;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 700px;
            width: 100%;
        }
        
        .demo-gift-icon {
            margin-bottom: 2rem;
        }
        
        .demo-gift {
            font-size: 4rem;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            width: 100px;
            height: 100px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
            animation: giftBounce 2s ease-in-out infinite;
        }
        
        @keyframes giftBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        
        .demo-thank-you-headline {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 1.5rem;
            line-height: 1.2;
        }
        
        .demo-delivery-message {
            background: #f0f9ff;
            padding: 1.5rem;
            border-radius: 12px;
            margin-bottom: 2rem;
            border-left: 4px solid var(--primary-color);
        }
        
        .demo-delivery-message p {
            font-size: 1.125rem;
            color: var(--text-primary);
            margin: 0;
        }
        
        .demo-download-section {
            background: #ecfdf5;
            padding: 2rem;
            border-radius: 12px;
            margin-bottom: 2rem;
        }
        
        .demo-download-section h3 {
            color: var(--success-color);
            font-size: 1.5rem;
            margin-bottom: 1rem;
        }
        
        .demo-download-instructions {
            margin-bottom: 2rem;
            color: var(--text-secondary);
        }
        
        .demo-download-button {
            display: inline-block;
            background: var(--success-color);
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 1.125rem;
            transition: all 0.3s;
            margin-bottom: 1rem;
        }
        
        .demo-download-button:hover {
            background: #059669;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
        }
        
        .demo-download-backup {
            margin-top: 1rem;
        }
        
        .demo-download-backup a {
            color: var(--primary-color);
            text-decoration: underline;
        }
        
        .demo-upsell {
            background: #f8fafc;
            padding: 2rem;
            border-radius: 12px;
            margin-bottom: 2rem;
            border: 2px dashed var(--border-color);
        }
        
        .demo-upsell h4 {
            color: var(--text-primary);
            margin-bottom: 1rem;
        }
        
        .demo-upsell p {
            margin-bottom: 1.5rem;
            color: var(--text-secondary);
        }
        
        .demo-upsell-button {
            display: inline-block;
            background: var(--primary-color);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            transition: background 0.3s;
        }
        
        .demo-upsell-button:hover {
            background: var(--secondary-color);
        }
        
        .demo-social-share h4 {
            color: var(--text-primary);
            margin-bottom: 1rem;
        }
        
        .demo-share-buttons {
            display: flex;
            justify-content: center;
            gap: 1rem;
            flex-wrap: wrap;
            margin-bottom: 2rem;
        }
        
        .demo-share-btn {
            padding: 0.75rem 1rem;
            border-radius: 8px;
            text-decoration: none;
            color: white;
            font-weight: 500;
            transition: transform 0.3s;
            font-size: 0.9rem;
        }
        
        .demo-share-btn:hover {
            transform: translateY(-2px);
        }
        
        .demo-share-btn.facebook { background: #1877f2; }
        .demo-share-btn.twitter { background: #1da1f2; }
        .demo-share-btn.linkedin { background: #0077b5; }
        .demo-share-btn.whatsapp { background: #25d366; }
        
        .demo-next-steps {
            background: #f1f5f9;
            padding: 1.5rem;
            border-radius: 8px;
            text-align: left;
        }
        
        .demo-next-steps h4 {
            color: var(--text-primary);
            margin-bottom: 1rem;
            text-align: center;
        }
        
        .demo-next-steps ol {
            padding-left: 1.5rem;
        }
        
        .demo-next-steps li {
            margin-bottom: 0.5rem;
            color: var(--text-secondary);
        }
        
        @media (max-width: 768px) {
            .demo-thank-you-content {
                padding: 2rem 1.5rem;
            }
            
            .demo-thank-you-headline {
                font-size: 2rem;
            }
            
            .demo-share-buttons {
                flex-direction: column;
                align-items: center;
            }
            
            .demo-share-btn {
                width: 200px;
                text-align: center;
            }
        }
    </style>
</body>
</html>`;
    }

    createEmailTemplate(content) {
        return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Plantilla de Email - [NOMBRE DEL NEGOCIO]</title>
    <link rel="stylesheet" href="template-styles.css">
</head>
<body>
    <div class="demo-container">
        <!-- EMAIL TEMPLATE SHOWCASE -->
        <section class="demo-email-showcase">
            <div class="demo-email-header">
                <h1>📧 Plantillas de Email</h1>
                <p>Ejemplos de cómo estructurar tus emails de nutrición</p>
            </div>
            
            <!-- EMAIL EXAMPLES -->
            ${content.email_sequence.map((email, index) => `
            <div class="demo-email-example">
                <div class="demo-email-meta">
                    <h3>Email ${email.email_numero}: ${email.tipo}</h3>
                    <div class="demo-email-info">
                        <span><strong>Asunto:</strong> ${email.subject}</span>
                        <span><strong>Preview:</strong> ${email.preview_text}</span>
                        <span><strong>Envío:</strong> ${email.email_numero === 1 ? 'Inmediato tras suscripción' : 
                          email.email_numero === 2 ? '1 día después' :
                          email.email_numero === 3 ? '3 días después' : '5 días después'}</span>
                    </div>
                </div>
                
                <div class="demo-email-content">
                    <div class="demo-email-header-area">
                        <div class="demo-logo-placeholder">
                            🏢 ${this.formData.businessName}
                        </div>
                    </div>
                    
                    <div class="demo-email-body">
                        <h2>¡Hola [NOMBRE]!</h2>
                        
                        <!-- CONTENIDO COMPLETO DEL EMAIL -->
                        ${email.contenido.split('\n\n').map(paragraph => 
                            paragraph.trim() ? `<p>${paragraph.trim()}</p>` : ''
                        ).filter(p => p).join('')}
                        
                        <div class="demo-cta-container">
                            <a href="#" class="demo-email-cta">
                                ${email.cta}
                            </a>
                        </div>
                        
                        <div class="demo-signature">
                            <p>Un abrazo,<br>
                            <strong>${this.formData.businessName}</strong><br>
                            ${this.formData.businessType}<br>
                            📧 ${this.formData.contactEmail}</p>
                        </div>
                        
                        <!-- NOTA PARA EL USUARIO -->
                        <div class="demo-email-note">
                            <p><strong>💡 Nota:</strong> Este es el contenido completo generado por la IA. Puedes copiarlo directamente a tu autoresponder o ajustarlo según tu estilo.</p>
                        </div>
                    </div>
                    
                    <div class="demo-email-footer">
                        <p>📧 ${this.formData.contactEmail} ${this.formData.website ? `| 🌐 ${this.formData.website}` : ''}</p>
                        <p><small>Te enviamos este email porque te suscribiste a nuestra lista. 
                        <a href="#">Darse de baja</a></small></p>
                    </div>
                </div>
            </div>
            `).join('')}
            
            <!-- EMAIL TEMPLATE STRUCTURE -->
            <div class="demo-email-structure">
                <h3>🏗️ Estructura Recomendada para Emails</h3>
                <div class="demo-structure-grid">
                    <div class="demo-structure-item">
                        <h4>📱 Header</h4>
                        <ul>
                            <li>Logo de la empresa</li>
                            <li>Línea de asunto clara</li>
                            <li>Preview text optimizado</li>
                        </ul>
                    </div>
                    
                    <div class="demo-structure-item">
                        <h4>👋 Apertura</h4>
                        <ul>
                            <li>Saludo personalizado</li>
                            <li>Agradecimiento</li>
                            <li>Contexto del email</li>
                        </ul>
                    </div>
                    
                    <div class="demo-structure-item">
                        <h4>📝 Cuerpo</h4>
                        <ul>
                            <li>Contenido principal</li>
                            <li>2-3 párrafos máximo</li>
                            <li>Un CTA principal</li>
                        </ul>
                    </div>
                    
                    <div class="demo-structure-item">
                        <h4>✍️ Cierre</h4>
                        <ul>
                            <li>Despedida personal</li>
                            <li>Firma completa</li>
                            <li>Información de contacto</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <!-- EMAIL BEST PRACTICES -->
            <div class="demo-best-practices">
                <h3>💡 Mejores Prácticas</h3>
                <div class="demo-tips-grid">
                    <div class="demo-tip">
                        <h4>✉️ Asunto</h4>
                        <ul>
                            <li>Máximo 50 caracteres</li>
                            <li>Evita palabras spam</li>
                            <li>Personaliza con el nombre</li>
                            <li>Crea curiosidad</li>
                        </ul>
                    </div>
                    
                    <div class="demo-tip">
                        <h4>📄 Contenido</h4>
                        <ul>
                            <li>Párrafos cortos (2-3 líneas)</li>
                            <li>Un solo CTA principal</li>
                            <li>Lenguaje conversacional</li>
                            <li>Valor en cada email</li>
                        </ul>
                    </div>
                    
                    <div class="demo-tip">
                        <h4>🎯 CTA</h4>
                        <ul>
                            <li>Botón visible y claro</li>
                            <li>Texto accionable</li>
                            <li>Color contrastante</li>
                            <li>Una sola acción</li>
                        </ul>
                    </div>
                    
                    <div class="demo-tip">
                        <h4>📱 Mobile</h4>
                        <ul>
                            <li>Diseño responsive</li>
                            <li>Botones táctiles</li>
                            <li>Texto legible</li>
                            <li>Carga rápida</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    </div>

    <style>
        .demo-email-showcase {
            padding: 2rem 0;
        }
        
        .demo-email-header {
            text-align: center;
            margin-bottom: 3rem;
        }
        
        .demo-email-header h1 {
            font-size: 2.5rem;
            color: var(--primary-color);
            margin-bottom: 1rem;
        }
        
        .demo-email-example {
            background: white;
            border-radius: 12px;
            box-shadow: var(--shadow);
            margin-bottom: 3rem;
            overflow: hidden;
        }
        
        .demo-email-meta {
            background: #f8fafc;
            padding: 1.5rem;
            border-bottom: 1px solid var(--border-color);
        }
        
        .demo-email-meta h3 {
            color: var(--text-primary);
            margin-bottom: 1rem;
        }
        
        .demo-email-info {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .demo-email-info span {
            font-size: 0.9rem;
            color: var(--text-secondary);
        }
        
        .demo-email-content {
            max-width: 600px;
            margin: 0 auto;
            background: white;
        }
        
        .demo-email-header-area {
            background: var(--primary-color);
            padding: 1rem;
            text-align: center;
        }
        
        .demo-logo-placeholder {
            color: white;
            font-size: 1.5rem;
            font-weight: 600;
        }
        
        .demo-email-body {
            padding: 2rem;
            line-height: 1.6;
        }
        
        .demo-email-body h2 {
            color: var(--text-primary);
            margin-bottom: 1rem;
        }
        
        .demo-email-body p {
            margin-bottom: 1rem;
            color: var(--text-secondary);
        }
        
        .demo-cta-container {
            text-align: center;
            margin: 2rem 0;
        }
        
        .demo-email-cta {
            display: inline-block;
            background: var(--primary-color);
            color: white;
            padding: 1rem 2rem;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            transition: background 0.3s;
        }
        
        .demo-email-cta:hover {
            background: var(--secondary-color);
        }
        
        .demo-signature {
            background: #f8fafc;
            padding: 1.5rem;
            border-radius: 8px;
            margin-top: 2rem;
        }
        
        .demo-email-footer {
            background: #f1f5f9;
            padding: 1rem;
            text-align: center;
            font-size: 0.85rem;
            color: var(--text-secondary);
        }
        
        .demo-structure-grid, .demo-tips-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }
        
        .demo-structure-item, .demo-tip {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: var(--shadow);
        }
        
        .demo-structure-item h4, .demo-tip h4 {
            color: var(--primary-color);
            margin-bottom: 1rem;
        }
        
        .demo-structure-item ul, .demo-tip ul {
            list-style-position: inside;
            color: var(--text-secondary);
        }
        
        .demo-structure-item li, .demo-tip li {
            margin-bottom: 0.5rem;
        }
        
        .demo-email-structure, .demo-best-practices {
            background: #f8fafc;
            padding: 2rem;
            border-radius: 12px;
            margin-bottom: 2rem;
        }
        
        .demo-email-structure h3, .demo-best-practices h3 {
            color: var(--text-primary);
            text-align: center;
            margin-bottom: 1rem;
        }
        
        @media (max-width: 768px) {
            .demo-email-info {
                font-size: 0.8rem;
            }
            
            .demo-structure-grid, .demo-tips-grid {
                grid-template-columns: 1fr;
            }
            
            .demo-email-body {
                padding: 1.5rem;
            }
        }
    </style>
</body>
</html>`;
    }

    createImplementationGuide() {
        return `# 🚀 Guía de Implementación - GenioVLS Copy Generator

## 📋 Resumen del Proyecto
**Negocio:** ${this.formData.businessName}  
**Producto:** ${this.formData.productName} (€${this.formData.productPrice})  
**Lead Magnet:** ${this.formData.leadMagnetTitle}  
**Fecha de generación:** ${new Date().toLocaleDateString('es-ES')}

---

## 📁 Archivos Incluidos

### 📝 Copy Estructurado
- **\`landing-copy.md\`** - Todo el copy para tu página de venta
- **\`vsl-script.md\`** - Script completo del Video Sales Letter
- **\`emails-secuencia.md\`** - 4 emails de nutrición listos para usar
- **\`paginas-adicionales.md\`** - Copy para confirmación y agradecimiento
- **\`elementos-visuales.md\`** - Guía de imágenes y videos sugeridos

### 🎨 Plantillas de Demostración
- **\`template-landing-page.html\`** - Página principal con placeholders
- **\`template-confirmacion.html\`** - Página de confirmación
- **\`template-gracias.html\`** - Página de agradecimiento  
- **\`template-emails.html\`** - Ejemplos de estructura de emails
- **\`template-styles.css\`** - Estilos base para las plantillas

### 📚 Documentación
- **\`guia-implementacion.md\`** - Este archivo

---

## 🛠️ Proceso de Implementación

### Fase 1: Preparación (1-2 días)
1. **Revisa todo el copy generado**
   - Lee cada archivo .md completo
   - Toma notas de ajustes necesarios
   - Identifica elementos que necesitas personalizar

2. **Planifica tu diseño**
   - Revisa las plantillas de demostración
   - Decide si usarás un page builder o código custom
   - Prepara los colores de marca: ${this.formData.primaryColor} y ${this.formData.secondaryColor}

3. **Prepara recursos visuales**
   - Lee \`elementos-visuales.md\` para requisitos específicos
   - Contrata diseñador o busca imágenes de stock
   - Planifica la grabación del VSL

### Fase 2: Landing Page (2-3 días)
1. **Estructura la página usando \`landing-copy.md\`**
   - Copia los titulares exactos
   - Implementa cada sección en orden
   - Usa los beneficios y testimonios tal como están

2. **Integra el formulario de captura**
   - Conecta con tu autoresponder (MailChimp, ActiveCampaign, etc.)
   - Configura automación de bienvenida
   - Prueba el flujo completo

3. **Optimiza para conversiones**
   - Implementa los CTAs sugeridos
   - Añade elementos de urgencia y escasez
   - Asegura que sea mobile-friendly

### Fase 3: VSL (3-5 días)
1. **Prepara la grabación**
   - Estudia \`vsl-script.md\` completamente
   - Practica cada sección individualmente
   - Configura tu setup de grabación

2. **Graba el video**
   - Sigue la estructura temporal sugerida
   - Usa las pausas y timing indicados
   - Mantén energía y autenticidad

3. **Edita y optimiza**
   - Añade subtítulos
   - Crea thumbnail atractiva
   - Sube a plataforma de hosting (Vimeo, Wistia)

### Fase 4: Email Marketing (1-2 días)
1. **Configura secuencia en autoresponder**
   - Usa el copy de \`emails-secuencia.md\`
   - Configura timing sugerido
   - Personaliza con tu nombre y marca

2. **Testea el flujo completo**
   - Suscríbete con email de prueba
   - Verifica entrega y formato
   - Ajusta si es necesario

### Fase 5: Páginas Adicionales (1 día)
1. **Implementa páginas de confirmación y agradecimiento**
   - Usa copy de \`paginas-adicionales.md\`
   - Conecta con el flujo de emails
   - Añade enlaces de descarga del lead magnet

---

## 🎨 Personalización del Copy

### ✅ Qué mantener tal como está:
- **Estructura narrativa** - Está optimizada para conversión
- **Headlines principales** - Están probados para tu nicho
- **Secuencia de emails** - Timing y contenido están balanceados
- **CTAs principales** - Son específicos para tu oferta

### 🎨 Qué puedes personalizar:
- **Ejemplos específicos** - Añade casos de tu experiencia
- **Testimonios** - Reemplaza por testimonios reales cuando los tengas
- **Detalles del producto** - Ajusta especificaciones si cambias algo
- **Información de contacto** - Actualiza cuando sea necesario

### ❌ Qué NO cambiar sin conocimiento:
- **Orden de los elementos** - La secuencia está optimizada psicológicamente
- **Técnicas de copywriting** - (AIDA, PAS, etc.) están aplicadas estratégicamente
- **Elementos de urgencia** - Son necesarios para la conversión

---

## 🔧 Herramientas Recomendadas

### 📱 Page Builders
- **Elementor** (WordPress) - Fácil de usar
- **ClickFunnels** - Especializado en funnels
- **Leadpages** - Enfocado en conversión
- **Unbounce** - Para landing pages optimizadas

### 📧 Email Marketing
- **ActiveCampaign** - Automación avanzada
- **MailChimp** - Fácil para principiantes  
- **ConvertKit** - Ideal para creadores de contenido
- **GetResponse** - Todo en uno

### 🎥 Grabación de Video
- **OBS Studio** - Gratuito y potente
- **Loom** - Fácil y rápido
- **Camtasia** - Para edición también
- **Riverside.fm** - Calidad profesional

### 📊 Analytics y Testing
- **Google Analytics** - Tracking esencial
- **Hotjar** - Heatmaps y grabaciones
- **Google Optimize** - A/B testing
- **Facebook Pixel** - Para remarketing

---

## 📈 Métricas a Monitorear

### Landing Page
- **Tasa de conversión:** 15-25% es excelente
- **Tiempo en página:** +3 minutos indica engagement
- **Tasa de rebote:** <60% es bueno
- **Conversiones móvil vs desktop**

### Email Marketing  
- **Tasa de apertura:** 25-35% es bueno
- **Tasa de click:** 3-7% es promedio
- **Tasa de conversión:** 1-3% del email a venta
- **Darse de baja:** <2% mensual

### VSL
- **Porcentaje completado:** >50% es excelente
- **Drop-off points:** Identifica dónde pierdes audiencia
- **Engagement:** Pausas, rewinds, interacciones
- **Conversión post-video:** Del video al formulario

---

## 🚀 Plan de Lanzamiento

### Semana 1: Pre-lanzamiento
- [ ] Completa implementación técnica
- [ ] Prueba todo el funnel end-to-end
- [ ] Configura tracking y analytics
- [ ] Prepara contenido para redes sociales

### Semana 2: Lanzamiento suave
- [ ] Lanza a lista pequeña (amigos, familia)
- [ ] Recopila feedback inicial
- [ ] Hace ajustes menores
- [ ] Optimiza basado en datos

### Semana 3-4: Escalamiento
- [ ] Aumenta tráfico gradualmente
- [ ] Implementa estrategias de paid ads
- [ ] Optimiza basado en métricas
- [ ] Documenta lo que funciona

---

## 💡 Consejos de Éxito

### 🎯 Enfócate en la implementación
- **No te quedes en la planificación eterna** - Implementa rápido e itera
- **Perfección es enemiga del progreso** - Lanza con 80% completo
- **Mide todo desde el día 1** - Los datos no mienten

### 🔄 Optimización continua
- **Test A/B regularmente** - Especialmente headlines y CTAs
- **Actualiza testimonios** - Usa casos reales cuando los tengas
- **Refina la audiencia** - Ajusta targeting basado en conversiones

### 📞 Soporte y seguimiento
- **Responde rápido** - Los leads calientes se enfrían rápido
- **Seguimiento persistente** - No todos compran en la primera exposición
- **Construye relaciones** - El marketing es sobre confianza

---

## 🆘 Resolución de Problemas

### Landing Page no convierte
- ✅ Verifica que el VSL esté funcionando
- ✅ Revisa la propuesta de valor principal
- ✅ Asegura que el formulario sea simple
- ✅ Testea en móvil

### Emails no se abren
- ✅ Mejora líneas de asunto
- ✅ Verifica que no vayas a spam
- ✅ Personaliza más el contenido
- ✅ Ajusta horarios de envío

### VSL tiene alto abandono
- ✅ Hook de apertura más fuerte
- ✅ Reduce duración si es muy largo
- ✅ Mejora calidad de audio/video
- ✅ Añade subtítulos

---

## 📞 Soporte

Si necesitas ayuda adicional:
- **Documentación completa** en cada archivo .md
- **Plantillas de demostración** como referencia visual
- **Estructura probada** que solo necesitas personalizar

---

## 🎉 ¡Felicitaciones!

Has recibido un sistema completo de marketing que incluye:
- ✅ Copy profesional optimizado para conversión
- ✅ Estructura probada para tu industria
- ✅ Guías detalladas de implementación
- ✅ Plantillas visuales de referencia

**Tu éxito está en la implementación. ¡Empieza hoy mismo!**

---

*Generado por GenioVLS - AI Copy Generator*  
*Fecha: ${new Date().toLocaleDateString('es-ES')}*  
*© 2025 GenioVLS. Úsalo, implementalo, y escala tu negocio.*`;
    }

    showResults() {
        // Hide form
        const formSection = document.getElementById('formSection');
        if (formSection) {
            formSection.style.display = 'none';
        }

        // Show results
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.style.display = 'block';
        
        // Populate files list
        const filesList = document.getElementById('filesList');
        filesList.innerHTML = '';
        
        Object.keys(this.generatedFiles).forEach(filename => {
            const li = document.createElement('li');
            li.textContent = filename;
            filesList.appendChild(li);
        });
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    async downloadZip() {
        const zip = new JSZip();
        
        // Add all generated files to zip
        Object.entries(this.generatedFiles).forEach(([filename, content]) => {
            zip.file(filename, content);
        });
        
        // Add instructions file
        const instructions = this.createInstructionsFile();
        zip.file('INSTRUCCIONES.txt', instructions);
        
        // Generate and download zip
        try {
            const content = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.formData.businessName.replace(/\s+/g, '-')}-funnel.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('¡Funnel descargado exitosamente!', 'success');
        } catch (error) {
            console.error('Error creating zip:', error);
            this.showNotification('Error al crear el archivo ZIP', 'error');
        }
    }

    createInstructionsFile() {
        return `INSTRUCCIONES DE USO - COPY GENERATOR ${this.formData.businessName.toUpperCase()}

¡Felicitaciones! Has generado todo el copy profesional para tu funnel con GenioVLS.

ARCHIVOS INCLUIDOS:
==================

📝 COPY ESTRUCTURADO:
- landing-copy.md - Copy completo para tu página de venta
- vsl-script.md - Script detallado para grabar tu VSL
- emails-secuencia.md - 4 emails de nutrición listos para usar
- paginas-adicionales.md - Copy para confirmación y agradecimiento
- elementos-visuales.md - Guía de imágenes y videos

🎨 PLANTILLAS DE DEMOSTRACIÓN:
- template-landing-page.html - Página principal con placeholders
- template-confirmacion.html - Página de confirmación
- template-gracias.html - Página de agradecimiento
- template-emails.html - Ejemplos de estructura de emails
- template-styles.css - Estilos base personalizables

📚 DOCUMENTACIÓN:
- guia-implementacion.md - Guía completa paso a paso

CÓMO USAR ESTE COPY:
===================

1. LEE PRIMERO: Abre guia-implementacion.md para el proceso completo
2. COPY LISTO: Todo el texto está en archivos .md - cópialo tal como está
3. PLANTILLAS: Usa los archivos template-*.html como referencia visual
4. PERSONALIZA: Los colores son ${this.formData.primaryColor} y ${this.formData.secondaryColor}

PRÓXIMOS PASOS:
==============

1. 📖 Lee la guía de implementación completa
2. 🎨 Elige tu plataforma (WordPress, ClickFunnels, etc.)
3. 📝 Copia el contenido de landing-copy.md a tu página
4. 🎥 Graba tu VSL usando vsl-script.md
5. 📧 Configura los emails usando emails-secuencia.md
6. 🚀 ¡Lanza tu funnel!

IMPORTANTE:
===========

- Este NO es un funnel listo para usar
- ES el copy profesional que necesitas para crear tu funnel
- Las plantillas son solo para mostrar DÓNDE va cada texto
- Debes implementar el copy en tu plataforma preferida

¿NECESITAS AYUDA?
================

Todo está explicado en detalle en guia-implementacion.md
Las plantillas te muestran exactamente dónde colocar cada elemento.

¡Éxito implementando tu copy profesional!

---
Generado por GenioVLS - AI Copy Generator
Fecha: ${new Date().toLocaleDateString('es-ES')}
Enfoque: Copy estructurado + plantillas personalizadas
© 2025 GenioVLS
`;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            maxWidth: '300px',
            boxShadow: 'var(--shadow-lg)',
            transform: 'translateX(400px)',
            transition: 'transform 0.3s ease'
        });
        
        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.background = 'var(--accent-color)';
                break;
            case 'error':
                notification.style.background = 'var(--danger-color)';
                break;
            default:
                notification.style.background = 'var(--primary-color)';
        }
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new GenioVLS();
});