const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const upload = multer({ dest: 'src/' });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

const connection = mysql.createPool({
    maxIdle: 100,
    host: '10.70.131.130',
    port: 3306,
    user: 'R',
    password: '5612633',
    database: 'canvia',
    idleTimeout: Infinity,
    queueLimit: 0,
});

async function obtenerNombreUsuario(id) {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT nombres,correo FROM usuarios WHERE id = ${id}`, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve({
                    nombres: results[0]?.nombres || '',
                    correo: results[0]?.correo || ''
                });
            }
        });
    });
}

function guardarImagen(file) {
    const newpath = `./src/${file.originalname}`;
    fs.renameSync(file.path, newpath);
    return newpath;
}

app.post('/audio', upload.single('audio'), async (req, res, next) => {
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
            guardarImagen(file);
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

app.post('/login', async (req, res) => {
    const { correo, contraseña } = req.body;

    let contraseñaValida = false;
    try {
        const query = `SELECT * FROM usuarios WHERE correo=?`;
        connection.query(query, [correo], (error, rows) => {
            if (error) {
                console.error('Error en la consulta', error);
                res.status(500).json({ error: 'Error en el servidor' });
            }
            if (rows.length === 0) {
                res.status(401).json({ error: 'Credenciales invalidas' });
            }
            const usuario = rows[0];
            if (contraseña == usuario.contraseña) contraseñaValida = true;
            if (!contraseñaValida) {
                res.status(401).json({ error: 'Credenciales invalidas' });
            }
            const token = jwt.sign({ usuarioId: usuario.id }, 'secreto', { expiresIn: '1h' });
            const usuarioNombre = usuario.nombres;
            console.log("ingreso usuario " + usuarioNombre + " con token: " + token);
            return res.json({ token });
        });

    } catch (error) {
        console.error("Error en la autentificacion", error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

const verificarSesion = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) res.status(401).json({ error: 'Acceso no autorizado' });
    try {
        const { usuarioId } = jwt.verify(token, 'secreto');
        req.user = { id: usuarioId };
        next();
    } catch (error) {
        console.error("Error al verificar sesion: ", error);
        res.status(401).json({ error: 'Acceso no autorizado' });
    }

};

app.post('/relevos', verificarSesion, (req, res) => {
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

app.get('/relevos/:id', verificarSesion, (req, res) => {
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

app.put('/relevos/:id', verificarSesion, (req, res) => {
    const id = req.params.id;
    const newData = req.body;

    // Realiza la consulta SQL para actualizar los datos de relevos según el ID
    const query = 'UPDATE relevos SET ? WHERE id = ?';
    connection.query(query, [newData, id], (error, results) => {
        if (error) {
            console.error('Error en la modificar relevos: ', error);
            res.status(500).json({ error: 'Error en el servidor' });
        } else {
            res.json(results);
        }
    });
});

app.delete('/relevos/:id', verificarSesion, (req, res) => {
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

app.post('/Correo', verificarSesion, (req, res) => {
    const usuarioId = req.user.id;
    const { proyecto, sede, remitente, asunto, fecha, tipo_gestion, ticket } = req.body;
    const query = `INSERT INTO correos (proyecto, sede, remitente, asunto, fecha, tipo_gestion,ticket,usuario_id) VALUES (?,?,?,?,?,?,?,?)`; query
    connection.query(query, [proyecto, sede, remitente, asunto, fecha, tipo_gestion, ticket, usuarioId], (error) => {
        if (error) {
            console.error('Error en la correo post', error);
            res.status(500).json({ error: 'Error en el servidor' });
        } else {
            res.json({ message: 'correo Creado Correctamente' })
        }
    });
});

app.get('/Correo/:id', verificarSesion, (req, res) => {
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

app.put('/Correo/:id', verificarSesion, (req, res) => {
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

app.delete('/Correo/:id', verificarSesion, (req, res) => {
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

app.get('/Correo/:fecha_inicio/:fecha_fin', verificarSesion, (req, res) => {
    const fecha_inicio = req.params.fecha_inicio;
    const fecha_fin = req.params.fecha_fin;

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

const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    proxy: process.env.http_proxy,
    timeout: 10000,
    auth: {
        user: "servicioextendido@canvia.com",
        pass: "Cambio#2025",
        sendImmediately: true,
    }
});

async function enviarCorreo(destinatario, asunto, contenido, cc) {
    console.log("se envia el correo " + asunto);
    const info = await transporter.sendMail({
        from: "servicioextendido@canvia.com",
        to: destinatario,
        cc: cc,
        subject: asunto,
        html: contenido,
        attachments: [
            {
                filename: 'logo_canvia.png',
                path: './src/logo_canvia.png',
                cid: 'logo'
            }
        ]
    });
    console.log("Message sent: %s", info.messageId);
};

const firma = `
                </table>
                <br/>
                <p>Saludos Cordiales.</p>
                <p>servicioextendido@canvia.com – www.canvia.com<p>
                <p>Jirón Chota 998, Cercado de Lima<p>
                </tbody>
                <img src="cid:logo" />
                `;

const generarTablaRelevos = (relevos) => {
    let tabla = `
                    <p>Se envían los tickets que se han relevado durante el turno:</p>
                    <table style="border-collapse: collapse; max-width: 600px; width: 100%;">
                      <colgroup>
                        <col style="width: 2%;">
                        <col style="width: 20%;">
                        <col style="width: 30%;">
                        <col style="width: 40%;">
                      </colgroup>
                      <thead>
                        <tr>
                          <th style="border: 1px solid #ddd; padding: 8px;">Fecha</th>
                          <th style="border: 1px solid #ddd; padding: 8px;">Ticket</th>
                          <th style="border: 1px solid #ddd; padding: 8px;">Especialista</th>
                          <th style="border: 1px solid #ddd; padding: 8px;">Resumen de Ticket</th>
                        </tr>
                      </thead>
                      <tbody>
                  `;

    relevos.forEach((relevo) => {
        const fecha = new Date(relevo.fecha).toLocaleString();
        tabla += `
                                    <tr>
                                        <td style="border: 1px solid #ddd; padding: 8px;">${fecha}</td>
                                        <td style="border: 1px solid #ddd; padding: 8px;">${relevo.ticket}</td>
                                        <td style="border: 1px solid #ddd; padding: 8px;">${relevo.Especialista}</td>
                                        <td style="border: 1px solid #ddd; padding: 8px;">${relevo.Resumen}</td>
                                    </tr>
                                    `;
    });

    tabla += firma;

    return tabla;
};

const enviarCompromiso = async (destinatario, asunto, contenido, cc, filename) => {
    const ubicacion = './src/' + filename;
    const info = await transporter.sendMail({
        from: "servicioextendido@canvia.com",
        to: destinatario,
        cc: cc,
        subject: asunto,
        html: contenido,
        attachments: [
            {
                filename: filename,
                path: ubicacion,
            }
        ]
    });
    console.log("Message sent: %s", info.messageId);
}

const proyectos = [
    { nombre: 'UNIQUE', destinatario: 'mesadeayuda@yanbal.com, kmatienzo@canvia.com', cc: 'ajhusey@canvia.com, jbgarciac@canvia.com, jruizc@canvia.com, ntorresl@canvia.com', desde: "19:30", horaEnvio: "10 07 * * *" },
    { nombre: 'VOLCAN', destinatario: 'mesadeayuda@volcan.com.pe', cc: "jbgarciac@canvia.com, zhuanayque@canvia.com, jruizc@canvia.com, supervisorhelpdesk@volcan.com.pe, jchuquijajas@canvia.com", desde: "19:00", horaEnvio: "10 07 * * *" },
    { nombre: 'CANVIA', destinatario: 'jchoquehuanca@canvia.com, einga@canvia.com, efarfan@canvia.com, kacuna@canvia.com', cc: 'jbgarciac@canvia.com, jruizc@canvia.com', desde: "18:30", horaEnvio: "10 08 * * *" },
    { nombre: 'HABITAT', destinatario: 'wrazuri@canvia.com, kyriarte@canvia.com, asaldanaa@canvia.com', cc: 'jbgarciac@canvia.com, jruizc@canvia.com, casca@canvia.com', desde: "08:00", horaEnvio: "10 22 * * *" },
];
const dias = [
    'domingo',
    'lunes',
    'martes',
    'miércoles',
    'jueves',
    'viernes',
    'sábado',
];

const enviarProyecto = (proyecto) => {

    console.log(`Se ejecuta el envío de correos para ${proyecto.nombre}`);
    const FechaActual = new Date();
    const dia = dias[FechaActual.getDay()];
    let hora = proyecto.desde;
    const diaActual = FechaActual.getDate();
    let diaAnterior = diaActual - 1;
    const meses = ["1", "3", "5", "7", "8", "10", "12"];
    const mes = FechaActual.toLocaleString('default', { month: 'long' });
    let mesN = FechaActual.toLocaleString('default', { month: 'numeric' });
    const anio = FechaActual.getFullYear();

    if (diaAnterior === 0) {
        mesN -= 1;
        if (meses.includes(mes)) diaAnterior = 31;
        else if (mesN === 2) diaAnterior = 28;
        else diaAnterior = 30
    }

    let asunto = `SD SE: Check List del Servicio SD ${proyecto.nombre} del ${diaAnterior} de ${mes} al ${diaActual} de ${mes} del ${anio}`;

    if (proyecto.nombre === "CANVIA") {
        if (dia === "sábado" || dia === "domingo") {
            const fin = "sabado y domingo no se envian correos de canvia";
            console.log(fin);
            return fin;
        } else if (dia == "lunes") {
            diaAnterior -= 2;
        }
    }
    if (proyecto.nombre === "UNIQUE") {
        if (dia === "sábado" || dia === "domingo") {
            const fin = "sabado y domingo no se envian correos de unique";
            console.log(fin);
            return fin;
        } else if (dia == "lunes") {
            diaAnterior -= 2;
        }
    }
    if (proyecto.nombre === "VOLCAN") {
        if (dia === "sábado" || dia === "domingo") {
            const fin = "sábado ni domingo se envían correos de volcan";
            console.log(fin);
            return fin;
        } else if (dia === "lunes") {
            diaAnterior -= 2;
        }
    }

    let query = `SELECT * FROM relevos WHERE fecha>="${anio}-${mesN}-${diaAnterior} ${hora}"`;

    if (proyecto.nombre === "HABITAT") {
        if (dia === 'sábado' || dia === 'domingo') {
            query = `SELECT * FROM relevos WHERE fecha>="${anio}-${mesN}-${diaActual} ${hora}"`;
            asunto = `SD SE: Check List del Servicio SD ${proyecto.nombre} del ${diaActual} de ${mes} del ${anio}`
        } else {
            const fin = "solo sábado y domingo se envían correos";
            console.log(fin);
            return fin;
        }
    }
    connection.query(query, async (error, results) => {
        if (error) {
            console.error('Error en la consulta', error);
        } else {
            const relevosPorProyecto = {};
            relevosPorProyecto[proyecto.nombre] = [];

            for (const result of results) {
                if (result.proyecto in relevosPorProyecto) {
                    relevosPorProyecto[result.proyecto].push(result);
                }
            }
            const relevosFiltrados = relevosPorProyecto[proyecto.nombre];
            if (relevosFiltrados.length === 0) {
                const contenidoProyecto = "Estimados,<br/>Buenos días, no se registraron eventos hasta el cierre de turno de madrugada." + firma;
                try {
                    await enviarCorreo(proyecto.destinatario, asunto, contenidoProyecto, proyecto.cc);
                    console.log(`Correo a ${proyecto.nombre} enviado exitosamente`);
                } catch (error) {
                    console.error(`Error al enviar el correo a ${proyecto.nombre}`, error);
                }
            } else {
                const contenidoProyecto = generarTablaRelevos(relevosFiltrados);
                try {
                    await enviarCorreo(proyecto.destinatario, asunto, contenidoProyecto, proyecto.cc);
                    console.log(`Correo a ${proyecto.nombre} enviado exitosamente`);
                } catch (error) {
                    console.error(`Error al enviar el correo a ${proyecto.nombre}`, error);
                }
            }
        }
    });
};

for (const proyecto of proyectos) {
    let horaEnvio = proyecto.horaEnvio;
    cron.schedule(horaEnvio, () => {
        enviarProyecto(proyecto);
    });
}

function realizarPeticionPrueba() {
    // Realizar una consulta de prueba para mantener la conexión activa
    connection.query('SELECT 1', (error, results) => {
        if (error) {
            console.error('Error al realizar la petición de prueba:', error);
        } else {
            console.log('Petición de prueba exitosa. Resultado:', results);
        }
    });
}

// Ejecutar la petición de prueba cada 4 horas (en milisegundos)
const intervalo = 4 * 60 * 60 * 1000;
setInterval(realizarPeticionPrueba, intervalo);

const port = 3000;
app.listen(port, () => { console.log('listening on port:', port); });

