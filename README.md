# Documentación del Proyecto

## Enlace a la Aplicación Desplegada
Actualmente, la aplicación no está desplegada en un entorno público.  
Puedes consultar el código fuente en el siguiente repositorio:  
[Repositorio GitHub](https://github.com/osoluche/coally-test-v1.git)

---

## Descripción
Esta es una API REST diseñada para gestionar tareas. Sus principales características incluyen:

- **Autenticación segura** mediante tokens JWT.
- Funcionalidad de **login y registro** para usuarios.
- Separación de datos para que cada usuario acceda únicamente a sus registros.
- Conexión con la base de datos en la nube a través de **MongoDB Atlas**.

El proyecto está desarrollado en **Node.js** utilizando el framework **Express**.

## Requisitos Previos

Antes de instalar el proyecto, asegúrate de tener instalados los siguientes programas/tecnologías:

- [Node.js](https://nodejs.org) (versión 23.4.0 o superior)
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)
- Opcional: [Docker](https://www.docker.com/) si utilizas contenedores

---

## Estructura del proyecto

src/
   ├── models/        # Definición de modelos de datos
   ├── routes/        # Rutas de la API
   ├── middlewares/   # Middlewares personalizados
   ├── app.js         # Lanzador de app


## Instalación

Sigue estos pasos para clonar e instalar el proyecto localmente:

1. Clona el repositorio:
   git clone https://github.com/osoluche/coally-test-v1.git

2.- Cambiate al directorio
   cd coally-test-v1

3.- Instala las dependencias necesarias
   npm i

4.- Crea un archivo .env para configurar las variables de entorno:
   PORT= 0000
   DBO=_URL_MONGO_DB_
   JWT_SECRET=_TU_CLAVE_SECRETA_

## Ejectuar la aplicación

npm run start

## Licencia
Este proyecto está licenciado bajo la MIT License.