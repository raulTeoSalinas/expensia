# Documentación de Builds - Expensia

## Tabla de Contenido

- [Requisitos Previos](#requisitos-previos)
- [Versionamiento](#️-versionamiento-importante-antes-de-subir-a-tiendas)
- [Desarrollo](#desarrollo)
- [Producción](#producción)

---

## Requisitos Previos

- **EAS CLI instalado globalmente**: `npm install -g eas-cli`
- **Estar loggeado en EAS**: `eas login`
- Para iOS en dispositivo físico: cuenta de Apple Developer activa

---

## ⚠️ Versionamiento (IMPORTANTE antes de subir a tiendas)

Antes de crear un build de producción, **actualiza los números de versión**:

### Version (visible para usuarios)

Actualiza el `version` en `app.json` (línea 4):

```json
"version": "1.0.0"
```

### Build Number / Version Code

Cada vez que subas un nuevo build, **incrementa en 1**:

- **`app.json`** → `ios.buildNumber` y `android.versionCode`

### 📋 Checklist de Versionamiento

- [ ] Actualizar `version` en `app.json`
- [ ] Incrementar `ios.buildNumber` en `app.json`
- [ ] Incrementar `android.versionCode` en `app.json`

---

## Desarrollo

### Expo Go (más rápido)

```bash
npm start
```

Escanea el QR con la app Expo Go. Recomendado para desarrollo del día a día.

### Simulador iOS (sin dispositivo físico)

Genera un build para el simulador de Xcode — no requiere cuenta de Apple Developer.

```bash
eas build --profile simulator --platform ios
```

Descarga el `.app` resultante e instálalo arrastrándolo al simulador abierto en Xcode.

### Dispositivo Físico (development client)

Requiere cuenta de Apple Developer. EAS creará un perfil ad-hoc con tu dispositivo.

```bash
# Registrar el dispositivo primero (solo la primera vez)
eas device:create

# Luego lanzar el build
eas build --profile development --platform ios
```

Instala el `.ipa` descargado vía link de EAS o usando Apple Configurator.

---

## Producción

> ⚠️ Actualiza los números de versión antes de continuar.

### iOS

```bash
# 1. Construir
eas build --profile production --platform ios

# 2. Subir a App Store Connect
eas submit --platform ios
```

### Android

```bash
eas build --profile production --platform android
```

Descarga el `.aab` y súbelo manualmente a Google Play Console.

---

## Troubleshooting

### "Not logged in to EAS"
```bash
eas login
```

### "EAS CLI not found"
```bash
npm install -g eas-cli
```

### Build falla por `bundleIdentifier` faltante

Agrega esto en `app.json` dentro de `"ios"`:
```json
"bundleIdentifier": "com.tudominio.expensia"
```

### Error: "Version code already exists"

Incrementa `ios.buildNumber` o `android.versionCode` en `app.json`.

---

## Referencias

- [Documentación de EAS Build](https://docs.expo.dev/build/introduction/)
- [Registrar dispositivos para development builds](https://docs.expo.dev/build/internal-distribution/)
