import {Client} from "@upstash/qstash";

export const qstash = new Client({
  token: process.env.UPSTASH_QUEUE_TOKEN!,
});
