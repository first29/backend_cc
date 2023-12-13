const express = require('express');
const router = express.Router();
const { connection, conectar } = require('../conexion/conection');
const fs = require('fs');
const multer = require('multer');
const upload = multer({ dest: 'src/' });
const { guardarAudio, obtenerNombreUsuario, enviarCompromiso } = require('../Funciones/funciones');

router.post('/', upload.single('audio'), async (req, res, next) => {
    const { file, body } = req
    const parametros = Object.keys(body).map(key => body[key]);
    const parametros_formateado = parametros.map(param => `'${param}'`);
    const parametrosNombres = Object.keys(body);
    const query = `CALL crear_datos_evaluacion(${parametros_formateado.join(', ')})`;
    connection.query(query, parametros, (error) => {
        if (error) {
            fs.unlink(file.path, (err) => {
                if (err) {
                    console.error('Error al borrar el archivo:', err);
                    return;
                }
            });
            console.error('Error post: ', error);
            res.status(500).json({ error });
            
        } else {
            guardarAudio(file);
            res.json({ message: 'Registro Creado Correctamente' });
            console.log('Registro Creado Correctamente');
        }
    });

    const { nombres, correo } = await obtenerNombreUsuario(parametros_formateado[1]);
    let texto = "<p>Buen dia " + nombres + "</p>" +
        `<p>El presente correo es para formalizar los compromisos asumidos por tu persona luego del feedback sostenido este mes.</p><br/>
                <table style="border-collapse: collapse; max-width: 400px; width: 40%;">
                    <thead>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 6px;">Cumple Procedimientos</th>
                            <th style="border: 1px solid #ddd; padding: 6px;">Validacion</th>
                            <th style="border: 1px solid #ddd; padding: 6px;">Registro de ticket</th>
                            <th style="border: 1px solid #ddd; padding: 6px;">Respeto al usuario</th>
                            <th style="border: 1px solid #ddd; padding: 6px;">Actitud de servicio</th>
                            <th style="border: 1px solid #ddd; padding: 6px;">Gestión de tiempos</th>
                            <th style="border: 1px solid #ddd; padding: 6px;">Información brindada</th>
                            <th style="border: 1px solid #ddd; padding: 6px;">Protocolos e Imagen</th>
                            <th style="border: 1px solid #ddd; padding: 6px;">Proactividad</th>
                            <th style="border: 1px solid #ddd; padding: 6px;">Personalizacion</th>
                            <th style="border: 1px solid #ddd; padding: 6px;">Comunicación</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                      `;
    const cc = "jvgarciac@"
    for (let i = 8; i < parametros_formateado.length - 2; i++) {
        texto += `<td style="border: 1px solid #ddd; padding: 6px;">${parametros[i]}</th>
        `;
    }
    texto += `<tr>
        <tbody>
        </table>
        <p>Quedamos atentos a tu confirmación u observacion por este medio.</p>
        <p>Saludos.</p>`;
    let asunto = "Compromisos Feedback - " + nombres;
    const cc1 = "jbgarciac@canvia.com; jruizc@canvia.com; ehuamanih@canvia.com;";
    enviarCompromiso(correo, asunto, texto, cc1, file.originalname);
})

module.exports = router;