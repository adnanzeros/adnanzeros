import contactHandler from "../../../../../api/contact.js";
import { invokeLegacyHandler } from "../../../../lib/legacy-api";

export async function POST(request) {
  return invokeLegacyHandler(contactHandler, request);
}
