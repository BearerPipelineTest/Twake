/** This too will clean up the languages keys if they are not used anywhere in the code */

const fs = require("fs");
const path = require("path");
const cp = require("child_process");

function exec(command, args) {
  return new Promise(done => {
    const cmd = cp.spawn(command, args);

    let data = "";
    let error = "";

    cmd.stdout.on("data", function (data) {
      data += data.toString() + "\n";
    });

    cmd.stderr.on("data", function (data) {
      error += data.toString() + "\n";
    });

    cmd.on("exit", function (code) {
      cmd.kill(9);
      done({ code, data, error });
    });
  });
}

let srcFiles = [];
let srcPath = __dirname;
function throughDirectory(directory) {
  fs.readdirSync(directory).forEach(file => {
    const abs = path.join(directory, file);
    if (fs.statSync(abs).isDirectory()) return throughDirectory(abs);
    else return srcFiles.push(abs);
  });
}
throughDirectory(srcPath);

srcFiles = srcFiles.filter(p => p.indexOf(".spec.ts") >= 0 || p.indexOf(".test.ts") >= 0);

(async () => {
  let failed = 0;
  let passed = 0;

  for (const path of srcFiles) {
    const testName = `test/e2e/${path.split("test/e2e/")[1]}`;
    const args = `${testName} --forceExit --coverage --detectOpenHandles --runInBand --testTimeout=60000 --verbose`;
    try {
      const out = await exec("jest", args.split(" "));
      if (out.code !== 0) {
        console.log(`FAIL ${testName}`);
        console.log(`-- Data\n ${out.data}`);
        console.log(`-- Error\n ${out.error || "(no error)"}`);
        failed++;
      } else {
        passed++;
        console.log(`PASS ${testName}`);
      }
    } catch (err) {
      console.log(`ERROR ${testName}`);
      console.log(`-- Error\n ${err}`);
      failed++;
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed, total ${failed + passed}`);

  process.exit(failed > 0 ? 1 : 0);
})();