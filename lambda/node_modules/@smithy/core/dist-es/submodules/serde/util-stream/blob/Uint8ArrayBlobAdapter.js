import { fromBase64 } from "../../util-base64/fromBase64";
import { toBase64 } from "../../util-base64/toBase64";
import { fromUtf8 } from "../../util-utf8/fromUtf8";
import { toUtf8 } from "../../util-utf8/toUtf8";
export class Uint8ArrayBlobAdapter extends Uint8Array {
    static fromString(source, encoding = "utf-8") {
        if (typeof source === "string") {
            if (encoding === "base64") {
                return Uint8ArrayBlobAdapter.mutate(fromBase64(source));
            }
            return Uint8ArrayBlobAdapter.mutate(fromUtf8(source));
        }
        throw new Error(`Unsupported conversion from ${typeof source} to Uint8ArrayBlobAdapter.`);
    }
    static mutate(source) {
        Object.setPrototypeOf(source, Uint8ArrayBlobAdapter.prototype);
        return source;
    }
    transformToString(encoding = "utf-8") {
        if (encoding === "base64") {
            return toBase64(this);
        }
        return toUtf8(this);
    }
}
