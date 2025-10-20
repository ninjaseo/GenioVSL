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

        // Validar que existe la API key
        const apiKey = process.env.OPENAI_API_KEY || formData.openaiApiKey;

        if (!apiKey) {
            return res.status(400).json({
                error: 'API key de OpenAI no proporcionada'
            });
        }

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
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'Eres un experto copywriter especializado en funnels de ventas y VSL (Video Sales Letters). Generas contenido persuasivo y de alta conversión en español para el mercado hispanohablante.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 4000,
                temperature: 0.7
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
Genera copy estructurado y profesional para un funnel de ventas basado en la siguiente información:

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

Genera el copy estructurado en formato JSON con las siguientes claves:

{
  "landing_copy": {
    "headline_principal": "Titular principal ultra-llamativo",
    "subheadline": "Subtítulo que explica el beneficio principal",
    "headline_secundario": "Titular de apoyo para la sección de beneficios",
    "problema_descripcion": "Descripción del problema que resuelves (2-3 frases)",
    "solucion_descripcion": "Tu solución única al problema (2-3 frases)",
    "benefits_principales": ["Beneficio 1 específico", "Beneficio 2 específico", "Beneficio 3 específico"],
    "benefits_secundarios": ["Beneficio 4", "Beneficio 5", "Beneficio 6"],
    "testimonials": [
      {
        "texto": "Testimonio completo y específico 1",
        "autor": "Nombre del cliente",
        "resultado": "Resultado específico obtenido"
      },
      {
        "texto": "Testimonio completo y específico 2",
        "autor": "Nombre del cliente",
        "resultado": "Resultado específico obtenido"
      },
      {
        "texto": "Testimonio completo y específico 3",
        "autor": "Nombre del cliente",
        "resultado": "Resultado específico obtenido"
      }
    ],
    "cta_principal": "Texto del CTA principal",
    "cta_secundario": "Texto del CTA de apoyo",
    "urgency_text": "Texto de urgencia/escasez específico",
    "garantia": "Texto de garantía si aplica",
    "objeciones_respuestas": [
      {
        "objecion": "Objeción común 1",
        "respuesta": "Respuesta convincente"
      },
      {
        "objecion": "Objeción común 2",
        "respuesta": "Respuesta convincente"
      }
    ]
  },
  "vsl_script": {
    "hook_apertura": "Hook de apertura (primeros 30 segundos)",
    "introduccion_personal": "Introducción personal y credibilidad (1-2 minutos)",
    "problema_agitacion": "Descripción y agitación del problema (2-3 minutos)",
    "solucion_revelacion": "Revelación de la solución (2-3 minutos)",
    "beneficios_transformacion": "Beneficios y transformación detallada (3-4 minutos)",
    "prueba_social": "Testimonios y casos de éxito (2-3 minutos)",
    "oferta_presentacion": "Presentación completa de la oferta (2-3 minutos)",
    "urgencia_escasez": "Creación de urgencia y escasez (1-2 minutos)",
    "cierre_cta": "Cierre y llamada a la acción final (1-2 minutos)",
    "script_completo": "Script completo unificado (mínimo 2500 palabras)"
  },
  "email_sequence": [
    {
      "email_numero": 1,
      "tipo": "Bienvenida y entrega",
      "subject": "Asunto del email 1",
      "preview_text": "Texto de preview",
      "contenido": "Contenido completo (mínimo 400 palabras)",
      "cta": "Llamada a la acción específica"
    },
    {
      "email_numero": 2,
      "tipo": "Educación y valor",
      "subject": "Asunto del email 2",
      "preview_text": "Texto de preview",
      "contenido": "Contenido completo (mínimo 400 palabras)",
      "cta": "Llamada a la acción específica"
    },
    {
      "email_numero": 3,
      "tipo": "Historia y conexión",
      "subject": "Asunto del email 3",
      "preview_text": "Texto de preview",
      "contenido": "Contenido completo (mínimo 400 palabras)",
      "cta": "Llamada a la acción específica"
    },
    {
      "email_numero": 4,
      "tipo": "Oferta y urgencia",
      "subject": "Asunto del email 4",
      "preview_text": "Texto de preview",
      "contenido": "Contenido completo (mínimo 400 palabras)",
      "cta": "Llamada a la acción específica"
    }
  ],
  "paginas_adicionales": {
    "confirmacion": {
      "headline": "Titular de confirmación positivo",
      "contenido_principal": "Mensaje de confirmación y próximos pasos",
      "instrucciones": ["Paso 1", "Paso 2", "Paso 3"],
      "mensaje_anticipacion": "Mensaje que genera anticipación"
    },
    "gracias": {
      "headline": "Titular de agradecimiento",
      "mensaje_entrega": "Mensaje de entrega del lead magnet",
      "instrucciones_descarga": "Instrucciones para descargar/acceder",
      "upsell_sutil": "Mención sutil del producto principal"
    }
  },
  "elementos_visuales": {
    "imagenes_sugeridas": [
      "Descripción de imagen para hero section",
      "Descripción de imagen para sección de beneficios",
      "Descripción de imagen para testimonios",
      "Descripción de imagen para llamada a la acción"
    ],
    "videos_sugeridos": [
      "VSL principal - duración sugerida y temas clave",
      "Video testimonio - tipo de cliente ideal"
    ]
  }
}

IMPORTANTE:
- Todo el copy debe ser persuasivo y orientado a la conversión
- Usar técnicas de copywriting probadas (AIDA, PAS, Before/After/Bridge)
- Incluir elementos específicos de urgencia y escasez
- Personalizar completamente según la información proporcionada
- El VSL debe seguir una narrativa que enganche desde el primer segundo
- Los emails deben nutrir y educar antes de vender
- Incluir respuestas a objeciones comunes
- Todo el copy debe sonar natural y conversacional
- Responde ÚNICAMENTE con el JSON, sin texto adicional
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
