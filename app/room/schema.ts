import getSchema from "../../libs/schema";

export const paramsSchema = getSchema({
  properties: {
    room_id: { type: "string" }
  },
  required: [ "room_id" ]
}, 'params')


export const userParamsSchema = getSchema({
  properties: {
    room_id: { type: "string" },
    user_id: { type: "string" }
  },
})