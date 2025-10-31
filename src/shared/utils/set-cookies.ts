import { Response } from "express";

interface ICookie {
  res: Response;
  accessToken: string;
  refreshToken: string;
  accessTTL: number;    // ✅ TTL in seconds for Redis
  refreshTTL: number;   // ✅ TTL in seconds for Redis
}

const setTokenCookies = ({ res, accessToken, refreshToken,accessTTL,refreshTTL }: ICookie): void => {
  // Secure production cookie settings
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
  };

  res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: accessTTL* 1000 }); // 15m
  res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge:refreshTTL* 1000 }); // 7d
};

export default setTokenCookies;