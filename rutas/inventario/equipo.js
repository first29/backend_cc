const express = require('express');
const router = express.Router();
const { connection } = require('../../conexion/inventarioDB');

// Obtener todos los equipos
router.get('/', (req, res) => {
    const query = 'SELECT * FROM equipo';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error al obtener equipos:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        } else {
            res.json(results);
        }
    });
});

// Obtener un equipo por ID
router.get('/:id', (req, res) => {
    const query = 'SELECT * FROM equipo WHERE id = ?';
    connection.query(query, [req.params.id], (error, results) => {
        if (error) {
            console.error('Error al obtener equipo por ID:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        } else if (results.length === 0) {
            res.status(404).json({ error: 'Equipo no encontrado' });
        } else {
            res.json(results[0]);
        }
    });
});

// Crear equipo
router.post('/', (req, res) => {
    // Desestructura los datos del cuerpo de la solicitud
    const { activo, f_adquisicion, depreciacion, tipo, marca, modelo, serie, ct_cargador, etiqueta, caracteristicas, operatividad, estado, ubicacion, est_garantia, pago_mensual } = req.body;

    // Define la consulta SQL utilizando un procedimiento almacenado
    const query = 'CALL crear_equipo(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

    // Ejecuta la consulta con los parámetros
    connection.query(query, [activo, f_adquisicion, depreciacion, tipo, marca, modelo, serie, ct_cargador, etiqueta, caracteristicas, operatividad, estado, ubicacion, est_garantia, pago_mensual], (error) => {
        if (error) {
            console.error('Error al crear equipo:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        } else {
            res.status(201).json({ message: 'Equipo creado correctamente' });
        }
    });
});

// Modificar equipo por ID
router.put('/:id', (req, res) => {
    const { activo, f_adquisicion, depreciacion, tipo, marca, modelo, serie, ct_cargador, etiqueta, caracteristicas, operatividad, estado, ubicacion, est_garantia, pago_mensual } = req.body;
    const query = 'CALL modificar_equipo(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    connection.query(query, [req.params.id, activo, f_adquisicion, depreciacion, tipo, marca, modelo, serie, ct_cargador, etiqueta, caracteristicas, operatividad, estado, ubicacion, est_garantia, pago_mensual], (error) => {
        if (error) {
            console.error('Error al modificar equipo por ID:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        } else {
            res.status(200).json({ message: 'Equipo modificado correctamente' });
        }
    });
});

// Borrar equipo por ID
router.delete('/:id', (req, res) => {
    const query = 'CALL borrar_equipo(?)';
    connection.query(query, [req.params.id], (error) => {
        if (error) {
            console.error('Error al borrar equipo por ID:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        } else {
            res.status(200).json({ message: 'Equipo borrado correctamente' });
        }
    });
});

module.exports = router;
