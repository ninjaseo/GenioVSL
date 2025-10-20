# GenioVSL - Generador de Copy para Funnels con IA

## ⚠️ PROBLEMA IDENTIFICADO Y SOLUCIONES

### El Problema

La aplicación actual **NO FUNCIONA** cuando se ejecuta directamente desde el navegador debido a **errores de CORS (Cross-Origin Resource Sharing)**.

OpenAI no permite llamadas directas a su API desde navegadores web por razones de seguridad. Cuando intentas generar el copy, recibes un error de CORS en la consola del navegador.

### Soluciones Disponibles

#### Opción 1: Backend Simple con Node.js (RECOMENDADO)

Esta es la solución más segura y profesional.

**Paso 1:** Instalar dependencias
```bash
npm install
```

**Paso 2:** Crear archivo `.env` con tu API key:
```
OPENAI_API_KEY=tu-api-key-aqui
```

**Paso 3:** Iniciar el servidor
```bash
npm start
```

**Paso 4:** Abrir en el navegador
```
http://localhost:3000
```

#### Opción 2: Usar Extensión CORS para Desarrollo Local (SOLO PARA PRUEBAS)

⚠️ **NO USAR EN PRODUCCIÓN - SOLO PARA PRUEBAS LOCALES**

1. Instalar extensión CORS:
   - Chrome: [Allow CORS: Access-Control-Allow-Origin](https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf)
   - Firefox: [CORS Everywhere](https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/)

2. Activar la extensión

3. Abrir `index.html` en el navegador

4. Ingresar tu API key de OpenAI en el formulario

**⚠️ IMPORTANTE:** Esta opción expone tu API key en el código del cliente. Solo úsala para pruebas locales.

#### Opción 3: Desplegar en Vercel/Netlify con Edge Functions

Esta opción es ideal para producción sin necesidad de mantener un servidor.

Ver `netlify-function.js` o `vercel-function.js` para ejemplos.

---

## 🚀 Estructura del Proyecto

```
GenioVSL/
├── index.html              # Interfaz principal
├── app.js                  # Lógica de la aplicación (cliente)
├── styles.css              # Estilos CSS
├── server.js               # Servidor backend (Opción 1)
├── package.json            # Dependencias Node.js
├── .env.example            # Ejemplo de variables de entorno
└── README.md               # Este archivo
```

---

## 📋 Requisitos

- Node.js v14 o superior (para Opción 1)
- API Key de OpenAI con acceso a GPT-4
- Navegador web moderno

---

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
OPENAI_API_KEY=sk-...
PORT=3000
```

---

## 🎯 Características

- ✅ Generación de copy completo para funnels de venta
- ✅ Scripts de VSL (Video Sales Letters)
- ✅ Secuencia de emails automatizada
- ✅ Plantillas HTML personalizadas
- ✅ Descarga en formato ZIP
- ✅ Interfaz responsive y profesional

---

## 📚 Documentación Técnica

### API Endpoints (Opción 1)

#### POST /api/generate

Genera el copy del funnel usando OpenAI GPT-4.

**Request Body:**
```json
{
  "businessType": "coaching",
  "businessName": "Mi Negocio",
  "targetAudience": "Emprendedores...",
  ...
}
```

**Response:**
```json
{
  "landing_copy": {...},
  "vsl_script": {...},
  "email_sequence": [...],
  ...
}
```

---

## 🐛 Solución de Problemas

### Error: "CORS policy blocked"

**Causa:** Intentas acceder a la API de OpenAI directamente desde el navegador.

**Solución:** Usa la Opción 1 (backend) o la Opción 2 (extensión CORS para desarrollo).

### Error: "Invalid API Key"

**Causa:** Tu API key de OpenAI no es válida o no tiene acceso a GPT-4.

**Solución:**
1. Verifica que tu API key esté correcta
2. Asegúrate de tener créditos en tu cuenta de OpenAI
3. Verifica que tu cuenta tenga acceso a GPT-4

### Error: "Insufficient quota"

**Causa:** Has agotado tus créditos de OpenAI.

**Solución:** Agrega más créditos a tu cuenta de OpenAI.

---

## 🔐 Seguridad

- ⚠️ **NUNCA** expongas tu API key de OpenAI en el código del cliente
- ⚠️ **NUNCA** subas tu archivo `.env` a repositorios públicos
- ✅ Usa variables de entorno para almacenar secretos
- ✅ Implementa rate limiting en producción
- ✅ Valida y sanitiza todos los inputs del usuario

---

## 📝 Notas de Desarrollo

Este proyecto fue creado como un MVP (Minimum Viable Product) para demostrar la generación de copy con IA.

**Limitaciones conocidas:**
- Las llamadas a la API de OpenAI son costosas (GPT-4)
- No hay sistema de autenticación de usuarios
- No hay persistencia de datos (base de datos)
- No hay sistema de caché para respuestas

**Mejoras futuras:**
- [ ] Sistema de autenticación
- [ ] Base de datos para guardar funnels generados
- [ ] Cache de respuestas
- [ ] Rate limiting
- [ ] Soporte para múltiples idiomas
- [ ] Editor visual de templates
- [ ] Integración con plataformas de email marketing

---

## 📄 Licencia

Este proyecto es propiedad de MKTN.es - 2025

---

## 🤝 Soporte

Para reportar problemas o solicitar ayuda, contacta a: [tu-email@ejemplo.com]

---

**Creado con ❤️ por MKTN.es**
