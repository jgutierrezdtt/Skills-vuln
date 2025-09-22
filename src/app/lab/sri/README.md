# Subresource Integrity (SRI)

## Descripción

Subresource Integrity (SRI) es una característica de seguridad que permite a los navegadores verificar que los recursos cargados desde CDN (Content Delivery Networks) u otros orígenes externos no han sido manipulados. Cuando se omite esta verificación, un sitio web queda vulnerable a ataques si el CDN es comprometido o modificado maliciosamente.

## Concepto

La integridad de subrecursos funciona añadiendo un hash criptográfico del recurso externo (como un archivo JavaScript o CSS) a los elementos HTML `<script>` o `<link>`. El navegador calcula el hash del recurso después de descargarlo y verifica que coincide con el hash proporcionado. Si no coinciden, el navegador bloquea la carga del recurso.

## Ejemplo Vulnerable

```html
<!-- Sin SRI - vulnerable si el CDN es comprometido -->
<script src="https://cdn.example.com/jquery.min.js"></script>

<!-- Sin SRI - stylesheet vulnerable -->
<link rel="stylesheet" href="https://cdn.example.com/bootstrap.min.css">
```

## Ejemplo Seguro

```html
<!-- Con SRI - seguro aunque el CDN sea comprometido -->
<script 
  src="https://cdn.example.com/jquery.min.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
  crossorigin="anonymous">
</script>

<!-- Con SRI - stylesheet seguro -->
<link 
  rel="stylesheet" 
  href="https://cdn.example.com/bootstrap.min.css"
  integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN"
  crossorigin="anonymous">
```

## Vectores de Ataque

1. **Compromiso del CDN**: Un atacante que compromete un CDN puede modificar los archivos servidos para incluir código malicioso.
2. **Inyección en la red**: Ataques MITM (Man-in-the-Middle) donde el tráfico es interceptado y modificado.
3. **DNS hijacking**: Redirección del tráfico a un servidor malicioso que imita al CDN original.
4. **Compromiso de cuenta**: Si un atacante obtiene acceso a las credenciales de administración del CDN.

## Impacto

- Ejecución de código JavaScript malicioso en el contexto del sitio web
- Robo de cookies de sesión y tokens de autenticación
- Keylogging
- Modificación del contenido de la página
- Redirecciones a sitios maliciosos
- Ataques de XSS a gran escala

## Generación de Hashes SRI

Los hashes SRI se pueden generar usando diversos métodos:

### Línea de comandos:

```bash
cat FILENAME.js | openssl dgst -sha384 -binary | openssl base64 -A
```

### Herramientas online:

- [SRI Hash Generator](https://www.srihash.org/)

## Limitaciones y Consideraciones

1. **Solo funciona con recursos externos**: SRI solo se aplica a elementos `<script>` y `<link>` con atributo `src` o `href`.
2. **Requiere CORS**: Los recursos deben servirse con cabeceras CORS apropiadas y usar el atributo `crossorigin`.
3. **Actualización de recursos**: Cuando el recurso se actualiza, el hash SRI también debe actualizarse.
4. **Algoritmos de hash**: Se recomienda usar algoritmos fuertes como SHA-384 o SHA-512.

## Buenas Prácticas

1. Usar SRI para todos los recursos de CDN de terceros
2. Incluir siempre el atributo `crossorigin="anonymous"`
3. Preferir SHA-384 sobre hashes más débiles
4. Actualizar los hashes cuando se actualicen los recursos
5. Considerar el autoalojamiento para recursos críticos

## Referencias

1. [MDN: Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)
2. [Content Security Policy: Hashes](https://content-security-policy.com/hashes/)
3. [W3C: Subresource Integrity](https://www.w3.org/TR/SRI/)
4. [OWASP: Third Party JavaScript Management](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/12-Client-side_Testing/13-Testing_for_Third_Party_JavaScript_Management)