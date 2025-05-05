import * as process from "process";
import axios from "axios";

export async function loadJwtSecret(): Promise<string> {
    return process.env.JWT_SECRET || "default-secret";

    const vaultAddr = process.env.VAULT_ADDR;
    const vaultToken = process.env.VAULT_TOKEN;
    const secretPath = process.env.JWT_SECRET_PATH;

    if (!vaultAddr || !vaultToken || !secretPath) {
        throw new Error("vault 환경변수 설정 필수");
    }

    const url = `${vaultAddr}/v1/${secretPath}`;
    const res = await axios.get(url, {
        headers: {
            "X-Vault-Token": vaultToken,
        },
    });

    return res.data.data.data.SECRET_KEY;
}
