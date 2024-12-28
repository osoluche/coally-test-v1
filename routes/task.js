const express = require('express');
const router = express.Router();

const { body, validationResult } = require('express-validator');
const Task = require('../models/task');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management operations
 */

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Crear una nueva tarea
 *     tags: [Tasks]
 *     security:
 *       - JwtAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: El título de la tarea (obligatorio)
 *               description:
 *                 type: string
 *                 description: La descripción de la tarea (opcional)
 *               completed:
 *                 type: boolean
 *                 description: Estado de completado de la tarea (opcional)
 *     responses:
 *       201:
 *         description: Tarea creada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 completed:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Error de validación o de creación de tarea
 */
router.post('/tasks', auth, [body('title').notEmpty().withMessage('El nombre es obligatorio.')], async (req, res) => {
    const body = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        body.owner = req.user.id;

        const task = new Task(body);

        await task.save();

        res.status(201).send(task);

    } catch (error) {
        res.status(400).send(error);
    }
});

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Obtener todas las tareas del usuario
 *     tags: [Tasks]
 *     security:
 *       - JwtAuth: []
 *     parameters:
 *       - in: query
 *         name: completed
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Filtrar tareas por estado de completado (true o false)
 *     responses:
 *       200:
 *         description: Lista de tareas obtenidas con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   completed:
 *                     type: boolean
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Error del servidor
 */
router.get('/tasks', auth, async (req, res) => {
    try {
        const user = req.user.id;
        const { completed } = req.query;
        const query = { owner: user };

        if (completed !== undefined) {
            query.completed = completed === 'true'; // Convertir cadena a booleano
        }

        const tasks = await Task.find(query).select('-owner');
        res.status(200).send(tasks);
    } catch (error) {
        res.status(500).send(error);
    }
});

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Obtener una tarea específica por ID
 *     tags: [Tasks]
 *     security:
 *       - JwtAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la tarea que deseas obtener
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tarea obtenida con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 completed:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: La tarea no existe
 *       500:
 *         description: Error del servidor
 */
router.get('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).send({
                error: true,
                msg: "La tarea no existe"
            });
        }

        const { _id, owner, ...taskData } = task.toObject();
        res.status(200).send(taskData);
    } catch (error) {
        res.status(500).send(error);
    }
});

/**
 * @swagger
 * /tasks/{id}:
 *   patch:
 *     summary: Actualizar una tarea por ID
 *     tags: [Tasks]
 *     security:
 *       - JwtAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la tarea que deseas actualizar
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Tarea actualizada con éxito
 *       404:
 *         description: La tarea no existe
 *       400:
 *         description: Error de validación
 */
router.patch('/tasks/:id', auth, async (req, res) => {
    try {
        const { title, description, completed } = req.body;
        const updates = {};

        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (completed !== undefined) updates.completed = completed;

        updates.updatedAt = Date.now();

        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, owner: req.user.id },
            updates,
            { new: true, runValidators: true }
        );
        if (!task) {
            return res.status(404).send({
                error: true,
                msg: "La tarea no existe"
            });
        }

        res.status(200).send(task);
    } catch (error) {
        res.status(400).send({
            error: true,
            msg: "Error al actualizar la tarea",
            data: error.message
        });
    }
});

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Eliminar una tarea por ID
 *     tags: [Tasks]
 *     security:
 *       - JwtAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la tarea que deseas eliminar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tarea eliminada con éxito
 *       404:
 *         description: La tarea no existe
 *       500:
 *         description: Error del servidor
 */
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete({ _id: req.params.id, owner: req.user.id });

        if (!task) {
            return res.status(404).send({
                error: true,
                msg: "La tarea ya fue eliminada"
            });
        }

        res.status(200).send(task);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
