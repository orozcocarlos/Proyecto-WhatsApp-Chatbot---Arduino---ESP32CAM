const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const axios = require("axios");
const shelljs = require("shelljs");
const shellExec = require("shell-exec");
const { exec } = require("child_process");
var base64Img = require("base64-img");
const ngrok = require("ngrok");
var SerialPort = require("serialport");
var MiPuerto = new SerialPort("COM3", {
  baudRate: 9600,
  autoOpen: true,
});

const PiCamera = require("pi-camera");
const myCamera = new PiCamera({
  mode: "photo",
  output: "d:/VCS/NODEJS/whatsapp-node-api/imagenes/test.jpg",
  width: 640,
  height: 480,
  nopreview: true,
});
const config = require("./config.json");
const { Client, MessageMedia } = require("whatsapp-web.js");
const SESSION_FILE_PATH = "./session.json";
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionCfg = require(SESSION_FILE_PATH);
}
process.title = "whatsapp-node-api";
global.client = new Client({
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--unhandled-rejections=strict",
    ],
  },
  session: sessionCfg,
});
global.authed = false;
const app = express();

const port = process.env.PORT || config.port;
//Set Request Size Limit 50 MB
app.use(bodyParser.json({ limit: "50mb" }));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

client.on("qr", (qr) => {
  fs.writeFileSync("./components/last.qr", qr);
});

client.on("authenticated", (session) => {
  console.log("AUTH!");
  sessionCfg = session;
  fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
    if (err) {
      console.error(err);
    }
    authed = true;
  });
  try {
    fs.unlinkSync("./components/last.qr");
  } catch (err) {}
});

client.on("auth_failure", () => {
  console.log("AUTH Failed !");
  sessionCfg = "";
  process.exit();
});

var lastmessage = 0;
var kam = "";

/*
Configuracion
SEND_TO: Se debe ingresar su numero telefonico de whatsapp, (ej 5491158877445)

STREAM_KEY: Se debe ingresar su stream key de youtube (opcional, solo si se desea stremear)

CAMLIST: Se debe crear un array con las camaras, para agregar una camara 
se debe agregar en forma de array [] donde el primer valor sea 
la ip de la camara, el segundo si se deja vacio indicara que se
cree una URL aleatoria a la misma, si no se deja vacio se podra
especificar una url personalizada (Ej: camara-01) (funcion actualmente 
desactivada ya que hay que pagar)
El tercer valor se debe especificar como true o false, true para
encender el detector de movimiento, false para que no funcione el 
detector de movimiento
*/

var SEND_TO = "593982564896";
var STREAM_KEY = "";
//var CAMLIST = [["192.168.1.141", "espcam-0", true], ["192.168.1.211", "espcam-1", true], ["192.168.1.139", "espcam-2", true]];
var CAMLIST = [["192.168.1.141", "espcam-0", true]];

fs.writeFile("cams.json", JSON.stringify(CAMLIST), function (err) {
  if (err) return console.log(err);
});

function updatecams() {
  rawcams = fs.readFileSync("cams.json");
  kam = JSON.parse(rawcams);
}

var lastalert = 0;

MiPuerto.setEncoding("utf8");

MiPuerto.on("data", function (data) {
  console.log("Lo que entro es " + data);
  if (data[0] == "H") {
    updatecams();
    console.log("Boton Precionado");
    client.sendMessage(
      SEND_TO + "@c.us",
      unescape("\uD83D\uDEA8") +
        " Hola Carlos \n" +
        unescape("\uD83D\uDC6E") +
        "Mi nombre es: BotDuino,Te muestro la lista de comandos que puedo reconocer:\n" +
        unescape("%uD83D%uDD13") +
        " Desactivar\n" +
        unescape("%uD83D%uDD0A") +
        " Encender ahora\n" +
        unescape("\uD83D\uDD25") +
        " Temperatura\n" +
        unescape("\uD83D\uDCF9") +
        " Video\n" +
        unescape("%uD83D%uDCF7") +
        " Foto\n" +
        unescape("%uD83D%uDD17") +
        " Enlace\n" +
        unescape("\uD83D\uDD34") +
        " Encender LED\n" +
        unescape("\u26AB") +
        " Apagar LED"
    );
    let rawdata = fs.readFileSync("cams.json");
    let cams = JSON.parse(rawdata);
    cam = 0;
    base64Img.requestBase64(
      "http://" + cams[cam][0] + "/jpg",
      function (err, res, body) {
        if (!err) {
          axios
            .post("http://127.0.0.1:5000/chat/sendimage/" + SEND_TO, {
              image: body.replace("data:image/jpeg;base64,", ""),
              caption: unescape("%uD83D%uDCF7") + " Camara " + cam,
            })
            .then((res) => {})
            .catch((error) => {});
        }
      }
    );
  }
});

client.on("ready", () => {
  console.log("Client is ready!");
  client.sendMessage(
    SEND_TO + "@c.us",
    unescape("%u203C%uFE0F") + "Servicio iniciado" + unescape("%u203C%uFE0F")
  );
  date = new Date().getHours() + ":" + new Date().getMinutes();
  client.sendMessage(
    SEND_TO + "@c.us",
    unescape("%uD83D%uDD14") + " TIMBRE - " + date + "hs"
  );
});

client.on("message", async (msg) => {
  if (msg.body === "!ping") {
    // Send a new message to the same chat
    client.sendMessage(msg.from, "pong");
  } else if (msg.body === unescape("%uD83D%uDD14")) {
    client.sendMessage(
      SEND_TO + "@c.us",
      unescape("\uD83D\uDEA8") +
        " Hola Carlos \n" +
        unescape("\uD83D\uDC6E") +
        "Mi nombre es: BotDuino,Te muestro la lista de comandos que puedo reconocer:\n" +
        unescape("%uD83D%uDD13") +
        " Desactivar\n" +
        unescape("%uD83D%uDD0A") +
        " Encender ahora\n" +
        unescape("\uD83D\uDD25") +
        " Temperatura\n" +
        unescape("\uD83D\uDCF9") +
        " Video\n" +
        unescape("%uD83D%uDCF7") +
        " Foto\n" +
        unescape("%uD83D%uDD17") +
        " Enlace\n" +
        unescape("\uD83D\uDD34") +
        " Encender LED\n" +
        unescape("\u26AB") +
        " Apagar LED"
    );
  } else if (msg.body === unescape("\uD83D\uDD25")) {
    MiPuerto.write("T");
    client.sendMessage(msg.from, "Temperatura!!!!!");
    MiPuerto.on("data", function (data) {
      console.log("Lo que entro es " + data);

      client.sendMessage(msg.from, data + "°C");
    });
  } else if (msg.body.slice(0, 2) == "G ") {
    let rawdata = fs.readFileSync("cams.json");
    let cams = JSON.parse(rawdata);
    cam = msg.body.split(" ")[1];
    seg = msg.body.split(" ")[2];

    client.sendMessage(
      msg.from,
      unescape("%u23FA%uFE0F") +
        " Grabando camara " +
        cam +
        " por " +
        seg +
        " segundos"
    );

    exec(
      "ffmpeg -y -i http://" +
        cams[cam][0] +
        "/mjpeg/1 -an -vcodec mjpeg -t " +
        seg +
        " CAM-" +
        cam +
        ".mp4",
      (error, stdout, stderr) => {
        if (error) {
          client.sendMessage(msg.from, "Error guardando el video");
          console.log(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          const media = MessageMedia.fromFilePath("CAM-" + cam + ".mp4");
          client.sendMessage(msg.from, media, { sendMediaAsDocument: true });
        }
      }
    );
  } else if (msg.body === unescape("%uD83D%uDCF7")) {
    let rawdata = fs.readFileSync("cams.json");
    let cams = JSON.parse(rawdata);
    cam = 0;
    console.log(cam);

    base64Img.requestBase64(
      "http://" + cams[cam][0] + "/jpg",
      function (err, res, body) {
        if (!err) {
          axios
            .post("http://127.0.0.1:5000/chat/sendimage/" + SEND_TO, {
              image: body.replace("data:image/jpeg;base64,", ""),
              caption: unescape("%uD83D%uDCF7") + " Camara " + cam,
            })
            .then((res) => {})
            .catch((error) => {});
        }
      }
    );
  } else if (msg.body.slice(0, 2) == "V ") {
    let rawdata = fs.readFileSync("cams.json");
    let cams = JSON.parse(rawdata);
    //let cams = "http://192.168.1.141";
    cam = msg.body.split(" ")[0];
    tunnel = await ngrok.connect({ addr: cams[cam][0], bind_tls: true });

    client.sendMessage(msg.from, unescape("%uD83D%uDD17") + " " + tunnel);
  } else if (msg.hasMedia) {
  } else if (msg.body === unescape("%uD83D%uDD13")) {
  } else if (msg.body === unescape("\uD83D\uDCF9")) {
    link = "http://192.168.1.141/mjpeg/1";
    client.sendMessage(
      msg.from,
      "Check this site!" + "http://192.168.1.141/mjpeg/1"
    );
  } else if (msg.body === unescape("\uD83D\uDD34")) {
    MiPuerto.write("H");
    client.sendMessage(msg.from, "LED ENCENDIDO!!!!!!!!!");
  } else if (msg.body === unescape("\u26AB")) {
    console.log(msg.body);
    MiPuerto.write("L");
    client.sendMessage(msg.from, "LED APAGADO!!!!!!!!!");
  } else if (msg.body === unescape("%uD83D%uDD0A")) {
    MiPuerto.write("M");
    client.sendMessage(msg.from, "ALARMA ACTIVADA!!!!!!");
    client.sendMessage(
      msg.from,
      unescape("%uD83D%uDD0A") +
        unescape("%uD83D%uDD0A") +
        unescape("%uD83D%uDD0A")
    );
  } else if (msg.body === unescape("%uD83D%uDCFA")) {
  } else {
    client.sendMessage(msg.from, "NOse recnococe el comando!!!!!!!!!");
    console.log(msg.body);
  }
});
client.initialize();

const chatRoute = require("./components/chatting");
const groupRoute = require("./components/group");
const authRoute = require("./components/auth");
const contactRoute = require("./components/contact");

app.use(function (req, res, next) {
  console.log(req.method + " : " + req.path);
  next();
});
app.use("/chat", chatRoute);
app.use("/group", groupRoute);
app.use("/auth", authRoute);
app.use("/contact", contactRoute);

app.listen(port, () => {
  console.log("Server Running Live on Port : " + port);
});
