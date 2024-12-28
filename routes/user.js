const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { body, validationResult } = require('express-validator');

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     description: Este endpoint permite registrar un nuevo usuario proporcionando nombre, correo electrónico y contraseña.
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Datos del usuario a registrar.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             password:
 *               type: string
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente.
 *         schema:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *       400:
 *         description: error de validación o usuario ya existe.
 *         schema:
 *           type: object
 *           properties:
 *             errors:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   msg:
 *                     type: string
 *                   param:
 *                     type: string
 *                   location:
 *                     type: string
 */
router.post('/register', [
    body('name').notEmpty().withMessage('El nombre es obligatorio.'),
    body('email').isEmail().withMessage('Debes proporcionar un correo electrónico válido.'),
    body('password').isLength({ min: 5 }).withMessage('La contraseña debe tener al menos 5 caracteres.')
], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, email, password } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Usuario ya existe' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ name, email, password: hashedPassword });
        const savedUser = await user.save();

        res.status(201).json(savedUser);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }

});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Inicia sesión de un usuario
 *     description: Este endpoint permite iniciar sesión utilizando correo electrónico y contraseña.
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Datos de inicio de sesión.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *             password:
 *               type: string
 *     responses:
 *       200:
 *         description: Ingreso exitoso, devuelve el token de autenticación.
 *         schema:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *       400:
 *         description: error de validación o usuario no encontrado, o contraseña incorrecta.
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 */
router.post('/login', [
    body('email').isEmail().withMessage('Debes proporcionar un correo electrónico válido.'),
    body('password').isLength({ min: 5 }).withMessage('Debes ingresar la contraseña')
], async (req, res) => {
    
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Usuario no encontrado' });

        // Verificar la contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Contraseña incorrecta' });

        // Crear y firmar el token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;