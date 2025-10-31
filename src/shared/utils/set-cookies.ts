import { Response } from "express";

interface ICookie {
  res: Response;
  accessToken: string;
  refreshToken: string;
  accessTTL: number;    // in seconds
  refreshTTL: number;   // in seconds
}

const setTokenCookies = ({
  res,
  accessToken,
  refreshToken,
  accessTTL,
  refreshTTL,
}: ICookie): void => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
  };

  const accessExpires = new Date(Date.now() + accessTTL * 1000);
  const refreshExpires = new Date(Date.now() + refreshTTL * 1000);

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: accessTTL * 1000,
    expires: accessExpires, // ✅ Explicit expiry timestamp
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: refreshTTL * 1000,
    expires: refreshExpires, // ✅ Explicit expiry timestamp
  });
};

export default setTokenCookies;
