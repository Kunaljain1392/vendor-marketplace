import fs from "node:fs";
import path from "node:path";

import yaml from "yamljs";

const openApiPath = path.resolve(
  process.cwd(),
  "src/docs/openapi.yaml",
);

export const swaggerDocument = yaml.parse(
  fs.readFileSync(openApiPath, "utf-8"),
);