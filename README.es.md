<div align="center">

# ⚡ FastWP

### Desarrollo Local de WordPress Ultra Rápido y sin Sobrecarga para Windows

[![Windows Support](https://img.shields.io/badge/Plataforma-Windows%2010%20%7C%2011-0078D6?logo=windows&logoColor=white)](https://github.com)
[![PHP Portable](https://img.shields.io/badge/PHP-8.2%20Portátil-777BB4?logo=php&logoColor=white)](https://php.net)
[![WordPress](https://img.shields.io/badge/WordPress-7.1%2B%20SQLite-21759B?logo=wordpress&logoColor=white)](https://wordpress.org)
[![Electron](https://img.shields.io/badge/Electron-Escritorio%20%2B%20Web-47848F?logo=electron&logoColor=white)](https://electronjs.org)
[![React](https://img.shields.io/badge/React-19%20%2B%20Tailwind%204-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Licencia](https://img.shields.io/badge/Licencia-MIT-green.svg)](LICENSE)

<br/>

**[🇪🇸 Manual en Español](README.es.md)** | **[🇬🇧 Read in English](README.md)**

<br/>

*Una alternativa moderna, ágil y ultra-ligera a LocalWP diseñada específicamente para erradicar la lentitud de arranque, el consumo desmedido de memoria RAM y la pesadez de virtualización en entornos Windows.*

</div>

---

## ⚡ FastWP vs LocalWP (Comparativa)

| Métrica / Función | LocalWP (Flywheel) | ⚡ FastWP |
| :--- | :--- | :--- |
| **Tiempo de arranque del sitio** | 15 – 35 segundos | **< 0.5 segundos** |
| **Consumo de memoria RAM (reposo)**| 600 MB – 1.4 GB | **~65 MB – 95 MB** |
| **Creación de un nuevo sitio** | 2 – 4 minutos | **Instantánea (< 2 segundos)** |
| **Clonación de un sitio** | 1 – 3 minutos | **Instantánea (1.2 segundos)** |
| **Arquitectura de Base de Datos** | Servidor MySQL pesado en segundo plano | **SQLite Ultra-Rápido** (cero consumo en reposo) + MySQL |
| **Requisitos previos del sistema** | Visual C++, proxies, bloqueo de puertos | **Cero dependencias** (PHP 8.2 portátil incluido) |
| **Portabilidad** | Difícil de mover a otro equipo | **Copiar y listo** (Portable en pendrive USB) |
| **Capturador de correos** | Proceso externo pesado (MailHog) | **FastWP Mail Catcher integrado** |

---

## ✨ Características Principales

* **⚡ Aprovisionamiento en Milisegundos:** Plantilla preconfigurada de WordPress con integración oficial de SQLite que permite crear y clonar sitios en menos de 2 segundos.
* **📦 Motor de Plantillas (Blueprints):** Guarda cualquier sitio ya personalizado (con Elementor, WooCommerce, ACF, temas y ajustes) como plantilla reutilizable para futuros proyectos.
* **📝 Pestaña de Notas por Sitio:** Bloc de notas integrado en cada web para almacenar credenciales, tareas pendientes, claves de licencia de plugins o notas de diseño.
* **📬 Capturador de Correos (Mail Catcher):** Intercepta automáticamente los correos enviados por `wp_mail()` para probar formularios de contacto, avisos de pedidos y recuperaciones de contraseña sin enviar emails reales.
* **📂 Integración Nativa con Windows:** Protocolo `fastwp://` para abrir directamente la carpeta del proyecto en el Explorador de Windows o lanzar PowerShell en el directorio exacto.
* **💻 Modo Dual (App de Escritorio & Web):** Úsalo como ventana nativa independiente de Windows con Electron o a través del navegador web en `http://127.0.0.1:4173`.
* **🌐 Compatibilidad de Despliegue:** Preparado para migrar fácilmente a hostings tradicionales (cPanel, Raiola, Hostinger, Siteground) o plataformas modernas como **Coolify**.

---

## 🚀 Guía de Inicio Rápido

### 1. Requisitos
* Windows 10 o Windows 11 (64 bits).
* No requiere instalar PHP ni MySQL en tu sistema (ya vienen incluidos de forma autónoma).

### 2. Iniciar FastWP
Haz doble clic en el acceso directo **`FastWP`** en tu Escritorio, o ejecuta por consola:

```bash
# Iniciar app de escritorio nativa
npm start

# O iniciar únicamente el servidor web ligero
node server.js
```
El panel web también está accesible en cualquier navegador en `http://127.0.0.1:4173`.

---

## 📖 Manual de Usuario Paso a Paso

### 1. Crear un Nuevo Sitio WordPress
1. Haz clic en el botón **"+ Nuevo Sitio"** en la barra lateral izquierda.
2. Escribe el nombre de tu proyecto (ej: `Mi Tienda`).
3. Elige si deseas una instalación limpia o aplicar una **Plantilla (Blueprint)** guardada.
4. Pulsa **Crear**. En menos de **2 segundos**, tu WordPress estará creado, configurado y listo para usar.

### 2. Acceder al Sitio y al Panel de Administración (WP Admin)
* **Abrir Sitio:** Abre la página frontal en tu navegador por defecto.
* **WP Admin:** Accede directamente al panel `/wp-admin`.
* Credenciales de acceso predeterminadas:
  * **Usuario:** `admin`
  * **Contraseña:** `admin`

### 3. Clonar un Sitio en 1 Segundo
* Pasa el ratón sobre cualquier sitio de la lista lateral y pulsa el icono de **Clonar** (o pulsa el botón *Clonar Sitio* en el panel de detalles).
* Se generará una copia exacta e independiente con su propia base de datos y un puerto libre asignado automáticamente.

### 4. Crear y Gestionar Plantillas (Blueprints)
* Configura un WordPress a tu gusto (instala tus plugins habituales, temas como Astra o Kadence, etc.).
* En la pestaña **Visión General**, pulsa el botón **"Guardar como Plantilla"**.
* Podrás reutilizarla para crear nuevos sitios o eliminarla desde el botón **"Plantillas"** de la barra superior.

### 5. Utilizar la Pestaña de Notas
* Selecciona cualquier sitio y abre la pestaña **"Notas"**.
* Escribe cualquier apunte del cliente, claves temporales o recordatorios.
* Pulsa **Guardar Notas** para conservarlas asociadas al sitio.

### 6. Explorador de Archivos y Terminal Web Integrados
* **Pestaña Archivos:** Navega por los archivos de `app/public`, revisa ficheros de configuración o inspecciona las carpetas de subidas sin salir de la app.
* **Pestaña Terminal:** Ejecuta comandos de PHP y WP-CLI directamente en la raíz de la web sin necesidad de abrir ventanas externas.

---

## 🚢 Cómo Subir la Web a un Servidor / Hosting en Producción

### Método 1: Migración en 1 Clic con Plugin (Recomendado para Todo tipo de Hosting y Coolify)
Es la forma más rápida, universal y libre de errores:

1. Entra al **WP Admin** de tu web local en FastWP.
2. Instala el plugin gratuito **All-in-One WP Migration** (o **Duplicator**).
3. Ve a **All-in-One WP Migration → Exportar → Archivo** y descarga el archivo empaquetado `.wpress`.
4. En tu hosting de producción o servidor **Coolify** (con una instalación limpia de WordPress), instala el mismo plugin.
5. Ve a **Importar** y arrastra el archivo `.wpress`.
6. ¡Listo! El plugin convierte automáticamente la base de datos local SQLite a la base de datos MySQL/MariaDB de tu servidor, adapta las URLs del dominio público y ajusta los enlaces permanentes.

### Método 2: Subida Manual por FTP (Conservando SQLite)
1. Conéctate por FTP (FileZilla) a tu servidor.
2. Ve a la carpeta local del sitio: `C:\Users\<Usuario>\Documents\FastWP Sites\<NombreSitio>\app\public\`.
3. Sube todo el contenido a la carpeta `public_html/` de tu hosting.
4. La base de datos SQLite se encuentra en `wp-content/database/.ht.sqlite` y se subirá con el resto de archivos.
5. Edita `wp-config.php` en tu servidor para definir el dominio público:
   ```php
   define('WP_HOME', 'https://tudominio.com');
   define('WP_SITEURL', 'https://tudominio.com');
   ```

---

## 🏗️ Estructura del Proyecto

```
fastwp/
├── bin/
│   ├── php/                 # PHP 8.2 x64 autónomo y portátil (no requiere instalación)
│   ├── open-folder.bat      # Puente para protocolo de Windows Explorer
│   └── open-folder.ps1      # Normalizador de rutas y activador COM Shell
├── electron/
│   ├── main.js              # Ciclo de vida de Electron y ventana nativa
│   ├── preload.js           # Puente IPC seguro
│   └── siteManager.js       # Gestor de procesos, clonado y plantillas SQLite
├── templates/
│   ├── wordpress-sqlite/    # WordPress pre-empaquetado con db.php oficial
│   └── blueprints/          # Plantillas guardadas por el usuario
├── src/                     # Interfaz en React 19 + Tailwind CSS v4
│   ├── Sidebar.jsx          # Lista de sitios, clonado, controles masivos
│   ├── SiteDetails.jsx      # Visión general, Notas, Archivos, Terminal, Logs
│   ├── BlueprintsModal.jsx  # Gestor modal de plantillas
│   └── WebTerminal.jsx      # Consola web interactiva
├── server.js                # Servidor API REST ultraligero y estáticos
└── FastWP.bat               # Lanzador portátil en 1 clic para Windows
```

---

## 📄 Licencia

FastWP es un proyecto de código abierto distribuido bajo la licencia **MIT**.
WordPress es una marca registrada de la WordPress Foundation.
