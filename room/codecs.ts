import { types } from 'mediasoup'

const mediaCodecs: types.RtpCodecCapability[] =
[
  {
    kind        : "audio",
    mimeType    : "audio/opus",
    clockRate   : 48000,
    channels    : 2
  },
  {
    kind       : "video",
    mimeType   : "video/VP8",
    clockRate  : 90000,
  }
];

export default mediaCodecs