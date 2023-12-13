const express = require('express');
const router = express.Router();
const { connection } = require('../../conexion/inventarioDB');

// Obtener todos los movimientos
router.get('/', (req, res) => {
    const query = 'SELECT * FROM movimiento';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error al obtener movimientos:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        } else {
            res.json(results);
        }
    });
});

// Obtener un movimiento por ID
router.get('/:id', (req, res) => {
    const query = 'SELECT * FROM movimiento WHERE id = ?';
    connection.query(query, [req.params.id], (error, results) => {
        if (error) {
            console.error('Error al obtener movimiento por ID:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        } else if (results.length === 0) {
            res.status(404).json({ error: 'Movimiento no encontrado' });
        } else {
            res.json(results[0]);
        }
    });
});

// Crear movimiento
router.post('/', (req, res) => {
    // Desestructura los datos del cuerpo de la solicitud
    const { tipo, fecha, usuario, ticket, motivo, observacion, inconveniente, activo } = req.body;

    // Define la consulta SQL utilizando un procedimiento almacenado
    const query = 'CALL crear_movimiento(?, ?, ?, ?, ?, ?, ?, ?)';

    // Ejecuta la consulta con los parámetros
    connection.query(query, [tipo, fecha, usuario, ticket, motivo, observacion, inconveniente, activo], (error) => {
        if (error) {
            console.error('Error al crear movimiento:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        } else {
            res.status(201).json({ message: 'Movimiento creado correctamente' });
        }
    });
});

// Modificar movimiento por ID
router.put('/:id', (req, res) => {
    const { tipo, fecha, usuario, ticket, motivo, observacion, inconveniente, activo } = req.body;
    const query = 'CALL modificar_movimiento(?, ?, ?, ?, ?, ?, ?, ?, ?)';
    connection.query(query, [req.params.id, tipo, fecha, usuario, ticket, motivo, observacion, inconveniente, activo], (error) => {
        if (error) {
            console.error('Error al modificar movimiento por ID:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        } else {
            res.status(200).json({ message: 'Movimiento modificado correctamente' });
        }
    });
});

// Borrar movimiento por ID
router.delete('/:id', (req, res) => {
    const query = 'CALL borrar_movimiento(?)';
    connection.query(query, [req.params.id], (error) => {
        if (error) {
            console.error('Error al borrar movimiento por ID:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        } else {
            res.status(200).json({ message: 'Movimiento borrado correctamente' });
        }
    });
});

module.exports = router;
