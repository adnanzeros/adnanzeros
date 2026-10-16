import cvHandler from "../../../../../api/cv.js";
import { invokeLegacyHandler } from "../../../../lib/legacy-api";

export async function GET(request) {
  return invokeLegacyHandler(cvHandler, request);
}

export async function HEAD(request) {
  return invokeLegacyHandler(cvHandler, request);
}
