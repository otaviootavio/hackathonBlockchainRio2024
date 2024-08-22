export class OwnerWalletNotFoundError extends Error {
  constructor(message = "Owner wallet not found") {
    super(message);
    this.name = "OwnerWalletNotFoundError";
  }
}
