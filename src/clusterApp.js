import cluster from "cluster";

const cpuCount = 4;

console.info(`The total number of CPUs is ${cpuCount}`);
console.info(`Primary pid=${process.pid}`);
cluster.setupPrimary({
  exec: __dirname + "/index.js",
});

for (let i = 0; i < cpuCount; i++) {
  cluster.fork();
}

process.on('error', (err) => {
  console.error("%cLog Message", err, "color: orange");
});

cluster.on("exit", (worker, code, signal) => {
  console.info(`worker ${worker.process.pid} has been killed`);
  console.info("Starting another worker");
  cluster.fork();
});
