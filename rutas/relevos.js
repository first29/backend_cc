const express = require('express');
const router = express.Router();
const { connection, conectar } = require('../conexion/conection');
const { verificarSesion } = require('../Funciones/funciones');
;
router.post('/', verificarSesion, (req, res) => {
    const usuarioId = req.user.id;
    const { Fecha, Proyecto, Ticket, Especialista, Resumen } = req.body;
    const query = `INSERT INTO relevos (fecha,proyecto,ticket,Especialista,Resumen,usuario_id) VALUES (?,?,?,?,?,?)`;
    connection.query(query, [Fecha, Proyecto, Ticket, Especialista, Resumen, usuarioId], (error) => {
        if (error) {
            console.error('Error relevos post: ', error);
            res.status(500).json({ error: 'Error en el servidor' });
        } else {
            res.json({ message: 'Relevo Creado Correctamente' })
        }
    });
});

router.get('/:id', verificarSesion, (req, res) => {
    const id = req.params.id;
    // Realiza la consulta SQL para obtener los datos de relevos según el usuarioId
    const query = `SELECT *, DATE_FORMAT(fecha, '%Y-%m-%dT%H:%i') AS fecha_formato FROM relevos WHERE usuario_id = ${id} order by fecha desc`;
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error en relevos get id:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        } else {
            res.json(results);
        }
    });
});

router.put('/:id', verificarSesion, (req, res) => {
    const id = req.params.id;
    const newData = req.body;

    // Realiza la consulta SQL para actualizar los datos de relevos según el ID
    const query = 'UPDATE relevos SET ? WHERE id = ?';
    connection.query(query, [newData, id], (error, results) => {
        if (error) {
            console.error('Error en la modificar relevos: ', error);
            res.status(500).json({ error: 'Error en el servidor' });
        } else {
            console.error('Relevo modificado: ');
            res.json(results);
        }
    });
});

router.delete('/:id', verificarSesion, (req, res) => {
    const id = req.params.id;

    // Realiza la consulta SQL para eliminar el relevo según el ID
    const query = 'DELETE FROM relevos WHERE id = ?';
    connection.query(query, id, (error, results) => {
        if (error) {
            console.error('Error en la eliminar relevos', error);
            res.status(500).json({ error: 'Error en el servidor' });
        } else {
            res.json(results);
        }
    });
});

module.exports = router;