# 🚀 INSTRUCCIONES RÁPIDAS - GenioVSL

## ⚠️ PROBLEMA IDENTIFICADO

Tu aplicación **NO FUNCIONA** porque intenta llamar directamente a la API de OpenAI desde el navegador, lo cual está bloqueado por **CORS (Cross-Origin Resource Sharing)**.

## ✅ SOLUCIÓN IMPLEMENTADA

He creado un servidor backend en Node.js que maneja las llamadas a OpenAI de forma segura.

---

## 📝 PASOS PARA HACER FUNCIONAR LA APP

### 1️⃣ Instalar dependencias (solo la primera vez)

Abre tu terminal y ejecuta:

```bash
cd "/Users/javiermarcilla/Documents/Apps Vibe Code/GenioVSL"
npm install
```

### 2️⃣ Configurar tu API Key de OpenAI

**Opción A: Usando archivo .env (RECOMENDADO)**

1. Crea un archivo llamado `.env` en la carpeta del proyecto
2. Añade tu API key:

```
OPENAI_API_KEY=sk-tu-api-key-de-openai
PORT=3000
```

**Opción B: Sin archivo .env**

Puedes ingresar tu API key directamente en el formulario de la aplicación (paso 5).

### 3️⃣ Iniciar el servidor

```bash
npm start
```

Deberías ver este mensaje:

```
╔══════════════════════════════════════════╗
║   GenioVSL Backend Server               ║
║   🚀 Servidor iniciado correctamente    ║
╚══════════════════════════════════════════╝

🌐 Servidor corriendo en: http://localhost:3000
```

### 4️⃣ Abrir la aplicación en el navegador

Abre tu navegador y ve a:

```
http://localhost:3000
```

### 5️⃣ Usar la aplicación

1. Completa el formulario de 5 pasos
2. En el paso 5, ingresa tu API key de OpenAI (si no la pusiste en el .env)
3. Haz clic en "Generar mi copy"
4. ¡Espera a que la IA genere todo tu funnel!
5. Descarga el ZIP con todo el contenido

---

## 🐛 Solución de Problemas

### Error: "Cannot find module 'express'"

**Solución:** Ejecuta `npm install` de nuevo.

### Error: "OPENAI_API_KEY not found"

**Solución:** Asegúrate de haber creado el archivo `.env` con tu API key, o ingresa la API key en el formulario.

### Error: "Port 3000 is already in use"

**Solución:** Cambia el puerto en el archivo `.env`:

```
PORT=3001
```

Y actualiza la URL en `app.js` línea 202:

```javascript
apiUrl = `http://localhost:3001/api/generate`;
```

### La página no carga

**Solución:** Asegúrate de que el servidor esté corriendo con `npm start`.

---

## 📋 Archivos Modificados/Creados

### Nuevos archivos:
- ✅ `server.js` - Servidor backend
- ✅ `package.json` - Configuración de Node.js
- ✅ `.env.example` - Ejemplo de configuración
- ✅ `.gitignore` - Ignora archivos sensibles
- ✅ `README.md` - Documentación completa
- ✅ `INSTRUCCIONES-RAPIDAS.md` - Este archivo

### Archivos modificados:
- ✅ `app.js` - Actualizado para usar el backend

---

## 🔐 Seguridad

⚠️ **IMPORTANTE:**

- **NUNCA** compartas tu archivo `.env`
- **NUNCA** subas tu API key a GitHub o repositorios públicos
- El archivo `.gitignore` ya está configurado para proteger tu `.env`

---

## 📞 Ayuda Adicional

Si sigues teniendo problemas:

1. Verifica que Node.js esté instalado: `node --version`
2. Revisa la consola del navegador (F12) para ver errores
3. Revisa la terminal donde corre el servidor para ver logs
4. Lee el archivo `README.md` para más detalles

---

## 🎯 Próximos Pasos (Opcional)

Para desplegar en producción:

1. **Vercel**: Sube el proyecto y añade tu API key en las variables de entorno
2. **Netlify**: Usa Netlify Functions (ver ejemplo en `README.md`)
3. **Heroku**: Despliega el servidor Node.js directamente

---

**¡Listo! Ahora tu aplicación debería funcionar perfectamente. 🎉**

Creado por MKTN.es - 2025
