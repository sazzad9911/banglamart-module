import os from "os";
import cp from "child_process";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const init = async (uid) => {
  const randomId = await readFile();
  if (randomId) {
    const res = await axios.post(`${process.env.URL}/auth/visitor`, {
      ip: getIPAddress(),
      deviceName: getComputerName(),
      randomId: randomId,
      uid: uid,
    });
    return res.data;
  } else {
    const randomId = await createFile(makeid(200));
    const res = await axios.post(`${process.env.URL}/auth/visitor`, {
      ip: getIPAddress(),
      deviceName: getComputerName(),
      randomId: randomId,
      uid: uid,
    });
    return res.data;
  }
};
function getIPAddress() {
  var interfaces = os.networkInterfaces();
  for (var devName in interfaces) {
    var iface = interfaces[devName];

    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i];
      if (
        alias.family === "IPv4" &&
        alias.address !== "127.0.0.1" &&
        !alias.internal
      )
        return alias.address;
    }
  }
  return "0.0.0.0";
}
function getComputerName() {
  switch (process.platform) {
    case "win32":
      return process.env.COMPUTERNAME;
    case "darwin":
      return cp.execSync("scutil --get ComputerName").toString().trim();
    case "linux":
      const prettyname = cp.execSync("hostnamectl --pretty").toString().trim();
      return prettyname === "" ? os.hostname() : prettyname;
    default:
      return os.hostname();
  }
}
function makeid(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}
const createFile = async (id) => {
  try {
    await fs.writeFile(path.join(__dirname, "/tmp.txt"), id);
    return id;
  } catch (e) {
    console.error(e.message);
    return null;
  }
};
const readFile = async () => {
  try {
    const data = await fs.readFile(path.join(__dirname, "/tmp.txt"));
    return data.toString();
  } catch (e) {
    console.error(e.message);
    return null;
  }
};
