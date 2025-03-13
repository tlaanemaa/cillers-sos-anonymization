import { Redaction } from "./schemas";
import { getCache } from "@/app/actions/load_and_redact";

export async function callPiiAgent(): Promise<Redaction[]> {
    console.debug("Fetching BART redactions");
    const cache = await getCache();
    console.log("This is the cache", cache)
    const response = cache[cache.length - 1].redactions;
    console.debug("BART response:", response);
    return response;
}
