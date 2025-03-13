import { Redaction } from "./schemas";
import { LOAD_AND_REDACT_STORAGE } from "@/app/actions/load_and_redact";

export async function callPiiAgent(): Promise<Redaction[]> {
    console.debug("Fetching BART redactions");
    const response = LOAD_AND_REDACT_STORAGE[LOAD_AND_REDACT_STORAGE.length - 1].redactions;
    console.debug("BART response:", response);
    return response;
}
