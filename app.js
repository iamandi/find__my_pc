const fs = require("fs");
const NodeSSH = require("node-ssh");
const ssh = new NodeSSH();
const { exit } = require("process");
const { string } = require("yargs");

function tryLogin(host) {
  ssh
    .connect({
      host,
      username: "andy",
      privateKey: fs.readFileSync("/home/andy/.ssh/id_rsa", "utf8"),
    })
    .then(() => {
      console.log(">>>>>>>>>>>");
      ssh.execCommand("ls", { cwd: "/var/www" }).then(function (result) {
        if (result.stderr) throw result.stderr;
        exit(1);
      });
    })
    .catch((err) => {
      //console.log("STDERR: " + err);
    });
}

async function loopedLogin(subdomain, password) {
  for (let i = 35; i < 255; i++) {
    const host = subdomain + i;

    console.log(`Trying..... ${host}`);
    try {
      await ssh.connect({
        host,
        username: "andy",
        password,
        privateKey: "/home/andy/.ssh/id_rsa",
      });

      const result = await ssh.execCommand("ls", { cwd: "/var/www" });
      if (result.stderr) throw result.stderr;

      if (result) {
        console.log(`\n\nssh andy@${host}`);
        exit(1);
      }
    } catch (err) {
      //console.log("STDERR: " + err);
    }
  }
}

const argv = require("yargs")
  .usage(
    `Usage: $0 -i [IP_subdomain] [-p PASSWORD]
    ex. $0 -i 192.168.1.
        $0 -i 192.168.1. -p "test123"`
  )
  .demandOption(["i"]).argv;

if (argv.p) {
  console.log(argv.p);
  const subdomain = argv.i;
  const password = argv.p;

  loopedLogin(subdomain, password);
} else {
  const subdomain = argv.i;

  loopedLogin(subdomain);
}
