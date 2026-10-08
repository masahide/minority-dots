import QRCode from "qrcode";
import { writeFile } from "node:fs/promises";
const url=process.argv[2];
if(!url?.startsWith("https://"))throw Error("A Sites https URL is required");
await writeFile("public/qr.svg",await QRCode.toString(url,{type:"svg",errorCorrectionLevel:"M",margin:4,width:512}));
await QRCode.toFile("public/qr.png",url,{errorCorrectionLevel:"M",margin:4,width:1024});
console.log(JSON.stringify({url,qr:"public/qr.png"}));
