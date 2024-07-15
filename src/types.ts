export type XummTransactionType =
  | "Payment"
  | "SignIn"
  | "PaymentChannelAuthorize"
  | "AccountDelete"
  | "AccountSet"
  | "CheckCancel"
  | "CheckCash"
  | "CheckCreate"
  | "ClaimReward"
  | "DepositPreauth"
  | "EscrowCancel"
  | "EscrowCreate"
  | "EscrowFinish"
  | "OfferCancel"
  | "OfferCreate"
  | "PaymentChannelClaim"
  | "PaymentChannelCreate"
  | "PaymentChannelFund"
  | "SetRegularKey"
  | "SignerListSet"
  | "TicketCreate"
  | "TrustSet"
  | "URITokenBurn"
  | "URITokenCreate"
  | "URITokenMint"
  | "URITokenCreateSellOffer";

export interface XummMemo {
  Memo: {
    MemoType?: string;
    MemoData?: string;
  };
}

export interface XummPostPayloadBody {
  TransactionType: XummTransactionType;
  Destination: string;
  Amount: string;
  DestinationTag?: string;
  Memos?: XummMemo[];
}

// src/types.ts
export interface PaymentStatusResponse {
  input: {
    uuid: string;
  };
  result: {
    context: {
      response: object;
      responseJSON: Array<{
        result: {
          data: {
            json: {
              payload: Payload;
              isSigned: boolean;
              isCancelled: boolean;
              transactionHash: string;
            };
          };
        };
      }>;
    };
    data: {
      payload: Payload;
      isSigned: boolean;
      isCancelled: boolean;
      transactionHash: string;
    };
    type: string;
  };
  elapsedMs: number;
  context: object;
}

export interface Payload {
  meta: {
    exists: boolean;
    uuid: string;
    multisign: boolean;
    submit: boolean;
    pathfinding: boolean;
    pathfinding_fallback: boolean;
    force_network: string | null;
    destination: string;
    resolved_destination: string;
    resolved: boolean;
    signed: boolean;
    cancelled: boolean;
    expired: boolean;
    pushed: boolean;
    app_opened: boolean;
    opened_by_deeplink: boolean;
    return_url_app: string | null;
    return_url_web: string | null;
    is_xapp: boolean;
    signers: string | null;
  };
  application: {
    name: string;
    description: string;
    disabled: number;
    uuidv4: string;
    icon_url: string;
    issued_user_token: string;
  };
  payload: {
    tx_type: string;
    tx_destination: string;
    tx_destination_tag: string | null;
    request_json: {
      TransactionType: string;
      Amount: string;
      Destination: string;
    };
    origintype: string;
    signmethod: string;
    created_at: string;
    expires_at: string;
    expires_in_seconds: number;
  };
  response: {
    hex: string;
    txid: string;
    resolved_at: string;
    dispatched_to: string;
    dispatched_nodetype: string;
    dispatched_result: string;
    dispatched_to_node: boolean;
    environment_nodeuri: string;
    environment_nodetype: string;
    multisign_account: string;
    account: string;
    signer: string;
    user: string;
    environment_networkid: number;
  };
  custom_meta: {
    identifier: string | null;
    blob: string | null;
    instruction: string | null;
  };
}
