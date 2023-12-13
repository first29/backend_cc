const express = require('express');
const cors = require('cors');
const app = express();
const cron = require('node-cron');

const {enviarProyecto} = require('./Funciones/funciones')
const { conectar } = require('./conexion/conection');
const Correo = require('./rutas/correo');
const relevos = require('./rutas/relevos');
const login = require('./rutas/login');
const audio = require('./rutas/audio');
const inventario = require('./rutas/inventario');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
//app.use(cors({origin: 'http://localhost' }));


app.use('/login', login);
app.use('/Correo', Correo);
app.use('/relevos', relevos);
app.use('/audio', audio);
app.use('/inventario', inventario);


const proyectos = [
    { nombre: 'VOLCAN', destinatario: 'mesadeayuda@volcan.com.pe', cc: "jbgarciac@canvia.com, zhuanayque@canvia.com, jruizc@canvia.com, supervisorhelpdesk@volcan.com.pe, jchuquijajas@canvia.com", desde: "19:10", horaEnvio: "10 07 * * *" },
    { nombre: 'UNIQUE', destinatario: 'mesadeayuda@yanbal.com, kmatienzo@canvia.com', cc: 'ajhusey@canvia.com, jbgarciac@canvia.com, jruizc@canvia.com, ntorresl@canvia.com', desde: "19:30", horaEnvio: "11 07 * * *" },
    { nombre: 'CANVIA', destinatario: 'jchoquehuanca@canvia.com, einga@canvia.com, efarfan@canvia.com, kacuna@canvia.com', cc: 'jbgarciac@canvia.com, jruizc@canvia.com', desde: "18:30", horaEnvio: "10 08 * * *" },
    { nombre: 'HABITAT', destinatario: 'wrazuri@canvia.com, kyriarte@canvia.com, asaldanaa@canvia.com', cc: 'jbgarciac@canvia.com, jruizc@canvia.com, casca@canvia.com', desde: "08:00", horaEnvio: "10 22 * * *" },
];

for (const proyecto of proyectos) {
    let horaEnvio = proyecto.horaEnvio;
    cron.schedule(horaEnvio, () => {
        console.log(`Se ejecuta el envío de correos para ${proyecto.nombre}`);
        enviarProyecto(proyecto);
    });
}

const port = 3000;
app.listen(port, () => { console.log('listening on port:', port); });

