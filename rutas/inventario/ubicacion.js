const express = require('express');
const router = express.Router();
const { connection, conectar } = require('../../conexion/inventarioDB');
const { verificarSesion } = require('../../Funciones/funciones');

// Crear ubicación
router.get('/', (req, res) => {
    const query = 'SELECT * FROM ubicacion';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error al obtener ubicaciones:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        } else {
            res.json(results);
        }
    });
});

// Obtener una ubicación por ID
router.get('/:id', (req, res) => {
    const query = 'SELECT * FROM ubicacion WHERE id = ?';
    connection.query(query, [req.params.id], (error, results) => {
        if (error) {
            console.error('Error al obtener ubicación por ID:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        } else if (results.length === 0) {
            res.status(404).json({ error: 'Ubicación no encontrada' });
        } else {
            res.json(results[0]);
        }
    });
});

// Crear ubicación
router.post('/', (req, res) => {
    const { empresa, sede, almacen, sub_area, posicion } = req.body;
    const query = 'CALL crear_ubicacion(?, ?, ?, ?, ?)';
    connection.query(query, [empresa, sede, almacen, sub_area, posicion], (error) => {
        if (error) {
            console.error('Error al crear ubicación:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        } else {
            res.status(201).json({ message: 'Ubicación creada correctamente' });
        }
    });
});

// Modificar ubicación por ID
router.put('/:id', (req, res) => {
    const { empresa, sede, almacen, sub_area, posicion } = req.body;
    const query = 'CALL modificar_ubicacion(?, ?, ?, ?, ?, ?)';
    connection.query(query, [req.params.id, empresa, sede, almacen, sub_area, posicion], (error) => {
        if (error) {
            console.error('Error al modificar ubicación por ID:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        } else {
            res.status(200).json({ message: 'Ubicación modificada correctamente' });
        }
    });
});

// Borrar ubicación por ID
router.delete('/:id', (req, res) => {
    const query = 'CALL borrar_ubicacion(?)';
    connection.query(query, [req.params.id], (error) => {
        if (error) {
            console.error('Error al borrar ubicación por ID:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        } else {
            res.status(200).json({ message: 'Ubicación borrada correctamente' });
        }
    });
});

module.exports = router;