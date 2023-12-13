const express = require('express');
const router = express.Router();
const { connection, conectar } = require('../conexion/inventarioDB');
const ubicacion = require('./inventario/ubicacion');
const movimiento = require('./inventario/movimiento');
const equipo = require('./inventario/equipo');
const usuario = require('./inventario/usuario');

router.use('/equipo', equipo);
router.use('/usuario', usuario);
router.use('/ubicacion', ubicacion);
router.use('/movimiento', movimiento);

router.get('/', (req, res) => {
    const query = 'SELECT * FROM vista_equipo';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error al obtener ubicaciones:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        } else {
            res.json(results);
        }
    });
});

module.exports = router;