/**
 * Holds the unlocked vault key in memory only — never in storage. A reload or sign-out
 * drops it, which locks the vault until the password is entered again.
 */
let vaultKey: CryptoKey | null = null;

export function setVaultKey(key: CryptoKey) {
  vaultKey = key;
}

export function getVaultKey(): CryptoKey | null {
  return vaultKey;
}

export function clearVaultKey() {
  vaultKey = null;
}
