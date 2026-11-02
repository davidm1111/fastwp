<div align="center">

# ⚡ FastWP

### Ultra-Fast, Zero-Overhead Local WordPress Development for Windows

[![Windows Support](https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011-0078D6?logo=windows&logoColor=white)](https://github.com)
[![PHP Portable](https://img.shields.io/badge/PHP-8.2%20Portable-777BB4?logo=php&logoColor=white)](https://php.net)
[![WordPress](https://img.shields.io/badge/WordPress-7.1%2B%20SQLite-21759B?logo=wordpress&logoColor=white)](https://wordpress.org)
[![Electron](https://img.shields.io/badge/Electron-Desktop%20%2B%20Web-47848F?logo=electron&logoColor=white)](https://electronjs.org)
[![React](https://img.shields.io/badge/React-19%20%2B%20Tailwind%204-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

<br/>

**[🇪🇸 Leer este Manual en Español](README.es.md)** | **[🇬🇧 Read in English](README.md)**

<br/>

*A modern, lightweight alternative to LocalWP built specifically to solve sluggish boot times, heavy memory hogs, and virtualization lag on Windows machines.*

</div>

---

## ⚡ FastWP vs LocalWP

| Metric / Feature | LocalWP (Flywheel) | ⚡ FastWP |
| :--- | :--- | :--- |
| **Site Startup Time** | 15 – 35 seconds | **< 0.5 seconds** |
| **RAM Footprint (Idle)** | 600 MB – 1.4 GB | **~65 MB – 95 MB** |
| **New Site Creation** | 2 – 4 minutes | **Instant (< 2 seconds)** |
| **Site Cloning** | 1 – 3 minutes | **Instant (1.2 seconds)** |
| **Database Architecture** | Heavy background MySQL server daemon | **Ultra-Fast SQLite** (zero-process at rest) + MySQL |
| **System Prerequisites** | Visual C++, system proxies, port locks | **Zero dependencies** (Bundled Portable PHP 8.2) |
| **Portability** | Hard to move between computers | **Copy & Run anywhere** (Flash drive friendly) |
| **Mail Catcher** | Separate heavy process (MailHog) | **Built-in FastWP Mail Catcher** |

---

## ✨ Key Features

* **⚡ Sub-Second Site Provisioning:** Instant cloning and pre-cached WordPress engine with official SQLite driver.
* **📦 Blueprints / Templates Engine:** Save any configured WordPress site (themes, plugins, Elementor, WooCommerce) as a reusable Blueprint. Create new sites from templates in 1 click.
* **📝 Per-Site Sticky Notes:** Built-in notes tab to store credentials, client instructions, plugin license keys, and to-do lists directly inside each project.
* **📬 Built-in Mail Catcher:** Intercepts `wp_mail()` outgoing emails automatically without setting up SMTP or spamming real inboxes.
* **📂 Smart Explorer & PowerShell Integrations:** Native Windows Explorer folder opener and dedicated PowerShell launcher with working directory auto-configured.
* **💻 Dual Mode (Desktop App & Web Dashboard):** Run as a sleek desktop window via Electron or manage sites headlessly via Web browser (`http://127.0.0.1:4173`).
* **🌐 Production-Ready Deployment:** Effortlessly push sites to any standard cPanel/PaaS hosting or modern container platforms like **Coolify**.

---

## 🚀 Quick Start Guide

### 1. Requirements
* Windows 10 or 11 (64-bit).
* Node.js 18+ (only if running from source; pre-bundled binary requires zero runtime).

### 2. Launching FastWP
Double-click **`FastWP`** on your Desktop or run:

```bash
# Start desktop app
npm start

# Or run the lightweight web server
node server.js
```
The interface is also accessible via your favorite browser at `http://127.0.0.1:4173`.

---

## 📖 User Manual

### 1. Creating a New WordPress Site
1. Click **"+ Nuevo Sitio"** in the sidebar.
2. Enter your project name (e.g. `Mi Tienda`).
3. Select whether to use a blank installation or apply a saved **Blueprint**.
4. Click **Crear**. Within **2 seconds**, your WordPress environment is live and running.

### 2. Accessing WP Admin & Front-end
* **Open Site:** Click the **"Abrir Sitio"** button to view the public front-end.
* **WP Admin:** Click **"WP Admin"** to open `/wp-admin`.
* Default credentials:
  * **User:** `admin`
  * **Password:** `admin` (or auto-generated)

### 3. Cloning a Site in 1 Second
* In the left sidebar, hover over any site and click the **Clone** icon (or use the *Clonar Sitio* button inside Site Overview).
* A complete duplicate is created instantly with an isolated database and an incremented port.

### 4. Creating & Managing Blueprints (Templates)
* Build your ideal WordPress base (install your favorite theme like Astra/Kadence and plugins like Yoast, ACF, Elementor).
* In Site Overview, click **"Guardar como Plantilla"** (Save as Blueprint).
* You can manage, apply, or delete Blueprints anytime from the top bar modal.

### 5. Using the Per-Site Notes Section
* Click on any site and navigate to the **"Notas"** tab.
* Jot down client requirements, staging credentials, or plugin keys.
* Click **Guardar Notas** to store them permanently.

### 6. Built-in Web Terminal & File Explorer
* **Archivos Tab:** Browse project directories, preview config files, and inspect uploads directly in FastWP.
* **Terminal Tab:** Execute PHP commands and WP-CLI directly inside `app/public` without opening external terminals.

---

## 🚢 Deploying to Production Web Hosting

### Method A: 1-Click Universal Migration (Recommended for All Hostings & Coolify)
This is the cleanest, bulletproof method. It automatically converts your local SQLite database to MySQL/MariaDB:

1. In your local FastWP site, log into `WP Admin`.
2. Install the free plugin **All-in-One WP Migration** (or **Duplicator**).
3. Go to **All-in-One WP Migration → Export → File** and download the `.wpress` file.
4. On your production hosting or **Coolify** instance (with a fresh WordPress container/install), install the same plugin.
5. Go to **Import** and upload your file.
6. Done! All URLs, databases, themes, and uploads are migrated transparently.

### Method B: Direct FTP Upload (Retaining SQLite)
1. Connect via FTP (FileZilla) to your hosting server.
2. Navigate to your local site folder: `C:\Users\<User>\Documents\FastWP Sites\<SiteName>\app\public\`.
3. Upload all contents to `public_html/`.
4. The SQLite database is already included in `wp-content/database/.ht.sqlite`.
5. Update `wp-config.php` with your live domain:
   ```php
   define('WP_HOME', 'https://yourdomain.com');
   define('WP_SITEURL', 'https://yourdomain.com');
   ```

---

## 🏗️ Architecture & Technology Stack

```
fastwp/
├── bin/
│   ├── php/                 # Portable PHP 8.2 x64 (zero system install)
│   ├── open-folder.bat      # Native Windows Explorer protocol bridge
│   └── open-folder.ps1      # Path normalization & COM shell activator
├── electron/
│   ├── main.js              # Electron lifecycle & framed desktop window
│   ├── preload.js           # Secure IPC bridge
│   └── siteManager.js       # Fast process manager, cloning & SQLite templates
├── templates/
│   ├── wordpress-sqlite/    # Pre-configured WordPress + db.php integration
│   └── blueprints/          # User-saved site templates
├── src/                     # React 19 + Tailwind CSS v4 UI
│   ├── Sidebar.jsx          # Site navigation, cloning, mass controls
│   ├── SiteDetails.jsx      # Overview, Notes, Files, Terminal, Logs
│   ├── BlueprintsModal.jsx  # Template manager
│   └── WebTerminal.jsx      # Integrated browser terminal
├── server.js                # Lightweight Node.js REST API + static server
└── FastWP.bat               # 1-click Windows portable launcher
```

---

## 📄 License

FastWP is open-source software licensed under the **MIT License**.
WordPress is a trademark of the WordPress Foundation.
