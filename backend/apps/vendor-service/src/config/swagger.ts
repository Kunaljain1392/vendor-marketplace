import path from "node:path";
import { fileURLToPath } from "node:url";

import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerDocument = YAML.load(
  path.resolve(__dirname, "../docs/swagger.yaml"),
);

export {
  swaggerUi,
  swaggerDocument,
};