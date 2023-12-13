const express = require('express');
const router = express.Router();
const { connection } = require('../../conexion/inventarioDB');

// Obtener todos los usuarios
router.get('/', (req, res) => {
    const query = 'SELECT * FROM usuario';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error al obtener usuarios:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        } else {
            res.json(results);
        }
    });
});

// Obtener un usuario por ID
router.get('/:id', (req, res) => {
    const query = 'SELECT * FROM usuario WHERE id = ?';
    connection.query(query, [req.params.id], (error, results) => {
        if (error) {
            console.error('Error al obtener usuario por ID:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        } else if (results.length === 0) {
            res.status(404).json({ error: 'Usuario no encontrado' });
        } else {
            res.json(results[0]);
        }
    });
});

// Crear usuario
router.post('/', (req, res) => {
    const { dni, nombres, cod_proyecto } = req.body;
    const query = 'CALL crear_usuario(?, ?, ?)';
    connection.query(query, [dni, nombres, cod_proyecto], (error) => {
        if (error) {
            console.error('Error al crear usuario:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        } else {
            res.status(201).json({ message: 'Usuario creado correctamente' });
        }
    });
});

// Modificar usuario por ID
router.put('/:id', (req, res) => {
    const { dni, nombres, cod_proyecto } = req.body;
    const query = 'CALL modificar_usuario(?, ?, ?, ?)';
    connection.query(query, [req.params.id, dni, nombres, cod_proyecto], (error) => {
        if (error) {
            console.error('Error al modificar usuario por ID:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        } else {
            res.status(200).json({ message: 'Usuario modificado correctamente' });
        }
    });
});

// Borrar usuario por ID
router.delete('/:id', (req, res) => {
    const query = 'CALL borrar_usuario(?)';
    connection.query(query, [req.params.id], (error) => {
        if (error) {
            console.error('Error al borrar usuario por ID:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        } else {
            res.status(200).json({ message: 'Usuario borrado correctamente' });
        }
    });
});

module.exports = router;
