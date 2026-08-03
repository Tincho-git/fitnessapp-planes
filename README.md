# Fitnessapp planes

Aplicación de planes de entrenamiento con React/Vite, Spring Boot, PostgreSQL y Cloudinary (para gestion de imagenes y videos).


Tecnologias:

Base de Datos: PostgreSQL 16 junto a Docker.

Backend: JAVA 17 con Spring Boot junto a Cloudinary y Docker.

Frontend: HTML, CSS, JS con React/Vite.


Funciones:

- Permite crear usuarios tipo clientes o profesores. Estos últimos deben ser verificados y activados por un administrador.
- Permite al profesor crear ejercicios junto con un video y una imagen para que el cliente pueda verlo perfectamente.
- Permite al profesor asignar planes de entrenamiento a los clientes vinculados a él.
- Permite al cliente conectarse con un profesor y que este le asigne planes de ejercicio.
- Permite al cliente registrar sus avances, que también el profesor puede monitorizar.




## Roles y altas de cuenta

- `ADMIN`: se crea inicialmente con `BOOTSTRAP_ADMIN_*`. Revisa y aprueba o rechaza las solicitudes de profesores.
- `PROFESOR`: se registra desde la web y queda en estado `PENDING` hasta que un administrador lo aprueba. Una vez activo accede a su panel de clientes, ejercicios y planes.
- `CLIENT`: se registra indicando el email de un profesor activo. Accede a su plan y métricas.
