const request = require('supertest');
const app = require('../app');
let server;


describe('GET /', () => {

    let server;
    let token;
    let taskId;

    beforeAll(async () => {
        server = app.listen(3000);
    })

    afterAll(async () => {
        await server.close();
    })

    it('debería devolver un JSON con el nombre del proyecto', async () => {
        const response = await request(server).get('/');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([{ name: 'Coally Test v1' }]);
    });

    it('Valida token de get-tasks', async () => {

        const response = await request(server).get('/tasks');

        expect(response.status).toBe(401);

        expect(response.body).toHaveProperty('message', 'No autorizado');
    });

    it('valida token de post-tasks', async () => {

        const response = await request(server).post('/tasks');

        expect(response.status).toBe(401);

        expect(response.body).toHaveProperty('message', 'No autorizado');
    });

    it('valida token de patch-tasks', async () => {

        const response = await request(server).patch('/tasks/1');

        expect(response.status).toBe(401);

        expect(response.body).toHaveProperty('message', 'No autorizado');
    });

    it('valida token en delete-tasks', async () => {

        const response = await request(server).delete('/tasks/1');

        expect(response.status).toBe(401);

        expect(response.body).toHaveProperty('message', 'No autorizado');
    });


    it('debería devolver un error para credenciales inválidas', async () => {
        const response = await request(server)
            .post('/login')
            .send({ email: 'usuario@ejemplo.com', password: 'contraseñaIncorrecta' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Usuario no encontrado');
    });

    it('deberia iniciar sesion y devolver token', async () => {

        const response = await request(server).post('/login').send({ email: 'test@user.com', password: '4dm1n' });

        expect(response.status).toBe(200);

        expect(response.body).toHaveProperty('token');

        token = response.body.token;

    });

    it('debería devolver un array de tareas', async () => {

        const response = await request(server).get('/tasks').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);

        expect(Array.isArray(response.body)).toBe(true);
    });

    it('debería crear una tarea nueva', async () => {

        const response = await request(server)
            .post('/tasks')
            .send({ title: 'TestWork', description: 'Tarea de prueba' })
            .set('Authorization', `Bearer ${token}`)
            .set('Content-type', 'application/json');

        expect(response.status).toBe(201);

        expect(response.body).toHaveProperty('_id');

        taskId = response.body._id;

    });

    it('debería generar un error al crear una tarea nueva', async () => {

        const response = await request(server)
            .post('/tasks')
            .send({ description: 'Tarea de prueba' })
            .set('Authorization', `Bearer ${token}`)
            .set('Content-type', 'application/json');

        expect(response.status).toBe(400);

        expect(response.body).toHaveProperty('errors');

    });

    it('debería actualizar la tarea creada', async () => {

        const response = await request(server).patch('/tasks/' + taskId)
            .set('Authorization', `Bearer ${token}`)
            .send({ description: 'Tarea de prueba modificada' });

        expect(response.status).toBe(200);

        expect(response.body).toHaveProperty('_id');

    });

    it('debería mandar un error de que no existe la tarea', async () => {

        const response = await request(server).patch('/tasks/0x' + taskId)
            .set('Authorization', `Bearer ${token}`)
            .send({ description: 'Tarea de prueba modificada' });

        expect(response.status).toBe(400);

        expect(response.body).toHaveProperty('msg', "Error al actualizar la tarea");

    });

    it('debería eliminar la tarea definitivamente', async () => {

        const response = await request(server).delete('/tasks/' + taskId)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);

    });

    it('debería mandar un error de que la tarea no existe', async () => {

        const response = await request(server).delete('/tasks/' + taskId)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(404);

        expect(response.body).toHaveProperty('msg', 'La tarea ya fue eliminada');
    });

})