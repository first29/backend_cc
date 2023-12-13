const express = require('express');
const router = express.Router();
const { connection, conectar } = require('../conexion/conection');
const { verificarSesion } = require('../Funciones/funciones');


router.post('/', verificarSesion ,(req, res) => {
    const usuarioId = req.user.id;
    const { proyecto, sede, remitente, asunto, fecha, tipo_gestion, ticket } = req.body;
    const query = `INSERT INTO correos (proyecto, sede, remitente, asunto, fecha, tipo_gestion,ticket,usuario_id) VALUES (?,?,?,?,?,?,?,?)`; query
    connection.query(query, [proyecto, sede, remitente, asunto, fecha, tipo_gestion, ticket, usuarioId], (error) => {
        if (error) {
            console.error('Error en la correo post', error);
            res.status(500).json({ error: 'Error en el servidor' });
            
        }
        res.json({ message: 'correo Creado Correctamente' })
    });
});

router.get('/:id', verificarSesion, (req, res) => {
    const id = req.params.id;
    // Realiza la consulta SQL para obtener los datos de relevos según el usuarioId
    const query = `SELECT *, DATE_FORMAT(fecha, '%Y-%m-%dT%H:%i') AS fecha_formato FROM correos WHERE usuario_id = ${id} order by fecha desc`;
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error en la correo get id: ', error);
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
    const query = 'UPDATE correos SET ? WHERE id = ?';
    connection.query(query, [newData, id], (error, results) => {
        if (error) {
            console.error('Error en la modificar correo', error);
            res.status(500).json({ error: 'Error en el servidor' });
        } else {
            res.json(results);
        }
    });
});

router.delete('/:id', verificarSesion, (req, res) => {
    const id = req.params.id;
    // Realiza la consulta SQL para eliminar el relevo según el ID
    const query = 'DELETE FROM correos WHERE id = ?';
    connection.query(query, id, (error, results) => {
        if (error) {
            console.error('Error en la eliminar correo', error);
            res.status(500).json({ error: 'Error en el servidor' });
        } else {
            res.json(results);
        }
    });
});

router.get('/:fecha_inicio/:fecha_fin', verificarSesion, (req, res) => {
    const fecha_inicio = req.params.fecha_inicio;
    const fecha_fin = req.params.fecha_fin;
    console.log(fecha_inicio, fecha_fin);
    const query = `SELECT c.id, c.proyecto, c.sede, c.remitente, c.asunto,c.fecha,c.tipo_gestion,c.ticket,u.nombres FROM correos as c inner join usuarios as u on c.usuario_id=u.id  WHERE fecha>="${fecha_inicio}" AND fecha<="${fecha_fin}"`;
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error en correos con fechas', error);
            res.status(500).json({ error: 'Error en el servidor' });
        } else {
            res.json(results);
        }
    });
});

module.exports = router ;