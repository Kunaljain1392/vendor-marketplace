import path from "node:path";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

const swaggerDocument = YAML.load(
  path.resolve(process.cwd(), "src/docs/openapi.yaml"),
);

export const swaggerMiddleware = [
  swaggerUi.serve as any,
  swaggerUi.setup(swaggerDocument) as any,
];