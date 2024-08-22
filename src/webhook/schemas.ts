import { z } from "zod";

export const webhookPayloadSchema = z.object({
  meta: z.object({
    url: z.string(),
    application_uuidv4: z.string(),
    payload_uuidv4: z.string(),
    opened_by_deeplink: z.boolean(),
  }),
  custom_meta: z.object({
    identifier: z.string().nullable(),
    blob: z.string().nullable(),
    instruction: z.string().nullable(),
  }),
  payloadResponse: z.object({
    payload_uuidv4: z.string(),
    reference_call_uuidv4: z.string(),
    signed: z.boolean(),
    user_token: z.boolean(),
    return_url: z.object({
      app: z.string().nullable(),
      web: z.string().nullable(),
    }),
    txid: z.string().nullable(),
  }),
  userToken: z.object({
    user_token: z.string(),
    token_issued: z.number(),
    token_expiration: z.number(),
  }),
});

export const xummPayloadDetailsSchema = z.object({
  meta: z.object({
    exists: z.boolean(),
    uuid: z.string().uuid(),
    multisign: z.boolean(),
    submit: z.boolean(),
    pathfinding: z.boolean(),
    pathfinding_fallback: z.boolean(),
    force_network: z.null(),
    destination: z.string(),
    resolved_destination: z.string(),
    resolved: z.boolean(),
    signed: z.boolean(),
    cancelled: z.boolean(),
    expired: z.boolean(),
    pushed: z.boolean(),
    app_opened: z.boolean(),
    opened_by_deeplink: z.boolean(),
    return_url_app: z.string().url(),
    return_url_web: z.string().url(),
    is_xapp: z.boolean(),
    signers: z.null(),
  }),
  application: z.object({
    name: z.string(),
    description: z.string(),
    disabled: z.number().int(),
    uuidv4: z.string().uuid(),
    icon_url: z.string().url(),
    issued_user_token: z.string().uuid(),
  }),
  payload: z.object({
    tx_type: z.string(),
    tx_destination: z.string(),
    tx_destination_tag: z.null(),
    request_json: z.object({
      TransactionType: z.string(),
      Memos: z.array(
        z.object({
          Memo: z.object({
            MemoType: z.string(),
            MemoData: z.string(),
          }),
        }),
      ),
      SignIn: z.boolean(),
    }),
    origintype: z.string(),
    signmethod: z.string(),
    created_at: z.string().datetime(),
    expires_at: z.string().datetime(),
    expires_in_seconds: z.number().int(),
    computed: z.object({
      Memos: z.array(
        z.object({
          Memo: z.object({
            MemoType: z.string(),
            MemoData: z.string(),
          }),
        }),
      ),
    }),
  }),
  response: z.object({
    hex: z.string(),
    txid: z.string(),
    resolved_at: z.string().datetime(),
    dispatched_to: z.string(),
    dispatched_nodetype: z.string(),
    dispatched_result: z.string(),
    dispatched_to_node: z.boolean(),
    environment_nodeuri: z.string().url(),
    environment_nodetype: z.string(),
    multisign_account: z.string(),
    account: z.string(),
    signer: z.string(),
    user: z.string().uuid(),
    environment_networkid: z.number().int(),
  }),
  custom_meta: z.object({
    identifier: z.null(),
    blob: z.null(),
    instruction: z.null(),
  }),
});
