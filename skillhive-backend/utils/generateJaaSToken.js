import jwt from "jsonwebtoken";

export const generateJaaSToken = (user, roomName) => {
  const payload = {
    aud: "jitsi",
    iss: process.env.JAAS_APP_ID, // From your JaaS Dev portal
    sub: "8x8.vc",
    room: roomName,
    exp: Math.floor(Date.now() / 1000) + (2 * 60 * 60), // 2 hours limit
    context: {
      user: {
        name: user?.name || "SkillHive User",
        email: user?.email || "guest@skillhive.com",
      },
      features: {
        livestreaming: false,
        recording: false,
        transcription: false,
      },
    },
  };

  return jwt.sign(payload, process.env.JAAS_API_KEY, { algorithm: "HS256" });
};
