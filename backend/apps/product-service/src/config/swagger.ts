import YAML from "yamljs";
import path from "node:path";

export const swaggerSpec = YAML.load(
  path.resolve(process.cwd(), "src/docs/openapi.yaml"),
);