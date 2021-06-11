import getSchema from "../libs/schema";

export const createRoomSchema = getSchema({
  properties: {
    userId: { type: "string" }
  }
})

export const paramsRoomSchema = getSchema({
  properties: {
    room_id: { type: "string" }
  },
  required: [ "room_id" ]
}, 'params')

export const paramsSchema = getSchema ({
  properties: {
    room_id: { type: "string" },
    user_id: { type: "string" },
  },
  required: [ "room_id", "user_id" ]
}, 'params')