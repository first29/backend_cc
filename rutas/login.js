const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const { connection, conectar } = require('../conexion/conection');



router.post('/', async (req, res) => {
    const { correo, contraseña } = req.body;
    try {
        const query = `SELECT * FROM usuarios WHERE correo=?`;
        const rows = await new Promise((resolve, reject) => {
            connection.query(query, [correo], (error, rows) => {
                if (error) {
                    console.error('Error en la consulta', error);
                    reject(error);
                } else {
                    resolve(rows);
                }
            });
        });

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const usuario = rows[0];
        const contraseñaValida = contraseña === usuario.contraseña;

        if (!contraseñaValida) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign({ usuarioId: usuario.id }, 'secreto', { expiresIn: '1h' });
        const usuarioNombre = usuario.nombres;

        console.log("Ingreso usuario " + usuarioNombre + " con token: " + token);
        return res.json({ token });
    } catch (error) {
        console.error("Error en la autenticación", error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});

module.exports =  router;