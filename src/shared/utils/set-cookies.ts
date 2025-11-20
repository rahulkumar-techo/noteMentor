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

  const isProd = process.env.NODE_ENV === "production";
  const sameSite: "none" | "lax" = isProd ? "none" : "lax";
  const cookieDomain = process.env.NODE_ENV === "production"
  ? "notementor.onrender.com"
  : undefined;

  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite,
    path: "/",
    domain:cookieDomain,
  };



  const accessExpires = new Date(Date.now() + accessTTL * 1000);
  const refreshExpires = new Date(Date.now() + refreshTTL * 1000);
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: accessTTL * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: refreshTTL * 1000,
  });

};

export default setTokenCookies;
